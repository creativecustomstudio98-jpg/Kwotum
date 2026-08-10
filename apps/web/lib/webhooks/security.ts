import { lookup as nodeLookup } from "node:dns/promises";
import { isIP } from "node:net";

type ResolvedAddress = Readonly<{ address: string; family: 4 | 6 }>;

export type WebhookNetworkTarget = Readonly<{
  address: string;
  family: 4 | 6;
  url: URL;
}>;

export type WebhookLookup = (hostname: string) => Promise<readonly ResolvedAddress[]>;

const DNS_LOOKUP_TIMEOUT_MS = 2_000;

export class WebhookTargetError extends Error {
  readonly code: "dns_resolution" | "unsafe_target";

  constructor(code: "dns_resolution" | "unsafe_target", message: string) {
    super(message);
    this.code = code;
    this.name = "WebhookTargetError";
  }
}

function ipv4Number(address: string): number | null {
  if (isIP(address) !== 4) return null;
  return (
    address
      .split(".")
      .map(Number)
      .reduce((value, octet) => (value << 8) + octet, 0) >>> 0
  );
}

function inIpv4Range(value: number, base: string, prefix: number): boolean {
  const baseNumber = ipv4Number(base);
  if (baseNumber === null) return false;
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  return (value & mask) === (baseNumber & mask);
}

function normalizeEmbeddedIpv4(address: string): string {
  const lastColon = address.lastIndexOf(":");
  const ipv4 = address.slice(lastColon + 1);
  const value = ipv4Number(ipv4);
  if (value === null) return address;
  const high = ((value >>> 16) & 0xffff).toString(16);
  const low = (value & 0xffff).toString(16);
  return `${address.slice(0, lastColon)}:${high}:${low}`;
}

function ipv6Number(address: string): bigint | null {
  if (isIP(address) !== 6) return null;
  const normalized = normalizeEmbeddedIpv4(address.toLowerCase().split("%")[0] ?? address);
  const halves = normalized.split("::");
  if (halves.length > 2) return null;
  const left = halves[0] ? halves[0].split(":") : [];
  const right = halves[1] ? halves[1].split(":") : [];
  const missing = 8 - left.length - right.length;
  if ((halves.length === 1 && missing !== 0) || missing < 0) return null;
  const parts = [...left, ...Array.from({ length: missing }, () => "0"), ...right];
  if (parts.length !== 8 || parts.some((part) => !/^[0-9a-f]{1,4}$/.test(part))) return null;
  return parts.reduce((value, part) => (value << 16n) + BigInt(`0x${part}`), 0n);
}

function inIpv6Range(value: bigint, base: string, prefix: number): boolean {
  const baseNumber = ipv6Number(base);
  if (baseNumber === null) return false;
  const shift = BigInt(128 - prefix);
  return value >> shift === baseNumber >> shift;
}

export function isPublicWebhookAddress(address: string): boolean {
  const v4 = ipv4Number(address);
  if (v4 !== null) {
    const blocked = [
      ["0.0.0.0", 8],
      ["10.0.0.0", 8],
      ["100.64.0.0", 10],
      ["127.0.0.0", 8],
      ["169.254.0.0", 16],
      ["172.16.0.0", 12],
      ["192.0.0.0", 24],
      ["192.0.2.0", 24],
      ["192.88.99.0", 24],
      ["192.168.0.0", 16],
      ["198.18.0.0", 15],
      ["198.51.100.0", 24],
      ["203.0.113.0", 24],
      ["224.0.0.0", 4],
      ["240.0.0.0", 4],
    ] as const;
    return !blocked.some(([base, prefix]) => inIpv4Range(v4, base, prefix));
  }

  const v6 = ipv6Number(address);
  if (v6 === null) return false;
  const blocked = [
    ["::", 128],
    ["::1", 128],
    ["::ffff:0:0", 96],
    ["64:ff9b::", 96],
    ["100::", 64],
    ["2001::", 32],
    ["2001:2::", 48],
    ["2001:10::", 28],
    ["2001:20::", 28],
    ["2001:db8::", 32],
    ["2002::", 16],
    ["fc00::", 7],
    ["fe80::", 10],
    ["ff00::", 8],
  ] as const;
  return !blocked.some(([base, prefix]) => inIpv6Range(v6, base, prefix));
}

export function normalizeWebhookUrl(rawUrl: string): string {
  if (rawUrl.length > 2048) throw new WebhookTargetError("unsafe_target", "URL is too long.");
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new WebhookTargetError("unsafe_target", "URL is invalid.");
  }
  const hostname = url.hostname.toLowerCase();
  if (
    url.protocol !== "https:" ||
    (url.port !== "" && url.port !== "443") ||
    url.username !== "" ||
    url.password !== "" ||
    url.hash !== "" ||
    url.search !== "" ||
    hostname.length > 253 ||
    isIP(hostname) !== 0 ||
    !/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(
      hostname,
    ) ||
    [
      ".example",
      ".home.arpa",
      ".internal",
      ".invalid",
      ".local",
      ".localhost",
      ".onion",
      ".test",
    ].some((suffix) => hostname === suffix.slice(1) || hostname.endsWith(suffix))
  ) {
    throw new WebhookTargetError("unsafe_target", "Webhook URL is not allowed.");
  }
  url.hostname = hostname;
  url.port = "";
  return url.href;
}

const defaultLookup: WebhookLookup = async (hostname) => {
  try {
    const addresses = await nodeLookup(hostname, { all: true, verbatim: true });
    return addresses.flatMap((entry): ResolvedAddress[] =>
      entry.family === 4 || entry.family === 6
        ? [{ address: entry.address, family: entry.family }]
        : [],
    );
  } catch {
    throw new WebhookTargetError("dns_resolution", "Webhook hostname could not be resolved.");
  }
};

export async function resolveWebhookTarget(
  rawUrl: string,
  lookup: WebhookLookup = defaultLookup,
  lookupTimeoutMs = DNS_LOOKUP_TIMEOUT_MS,
): Promise<WebhookNetworkTarget> {
  const url = new URL(normalizeWebhookUrl(rawUrl));
  let addresses: readonly ResolvedAddress[];
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    addresses = await Promise.race([
      lookup(url.hostname),
      new Promise<never>((_resolve, reject) => {
        timeout = setTimeout(() => {
          reject(
            new WebhookTargetError("dns_resolution", "Webhook hostname resolution timed out."),
          );
        }, lookupTimeoutMs);
        timeout.unref();
      }),
    ]);
  } catch (error) {
    if (error instanceof WebhookTargetError) throw error;
    throw new WebhookTargetError("dns_resolution", "Webhook hostname could not be resolved.");
  } finally {
    if (timeout) clearTimeout(timeout);
  }
  const unique = [
    ...new Map(addresses.map((entry) => [`${entry.family}:${entry.address}`, entry])).values(),
  ];
  if (unique.length === 0 || unique.length > 16) {
    throw new WebhookTargetError("dns_resolution", "Webhook hostname returned no usable address.");
  }
  if (unique.some((entry) => !isPublicWebhookAddress(entry.address))) {
    throw new WebhookTargetError(
      "unsafe_target",
      "Webhook hostname resolves to a blocked address.",
    );
  }
  const target = unique.sort(
    (a, b) => a.family - b.family || a.address.localeCompare(b.address),
  )[0];
  if (!target) throw new WebhookTargetError("dns_resolution", "Webhook target is unavailable.");
  return { address: target.address, family: target.family, url };
}
