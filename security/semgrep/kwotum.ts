import { createHash } from "node:crypto";
import { exec, spawn } from "node:child_process";

declare const dynamicInput: string;
declare const element: HTMLElement;
declare const error: Error;
declare const NextResponse: {
  json(value: unknown, init?: unknown): unknown;
};

// ruleid: kwotum.dynamic-code-execution
eval(dynamicInput);
// ok: kwotum.dynamic-code-execution
JSON.parse(dynamicInput);

// ruleid: kwotum.dom-html-injection
element.innerHTML = dynamicInput;
// ok: kwotum.dom-html-injection
element.textContent = dynamicInput;

// ruleid: kwotum.child-process-shell
exec(dynamicInput);
// ruleid: kwotum.child-process-shell
spawn("tool", [], { shell: true });
// ok: kwotum.child-process-shell
spawn("tool", ["--version"], { shell: false });

// ruleid: kwotum.weak-cryptographic-hash
createHash("sha1");
// ok: kwotum.weak-cryptographic-hash
createHash("sha256");

// ruleid: kwotum.service-role-outside-adapter
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
// ok: kwotum.service-role-outside-adapter
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// ruleid: kwotum.api-error-message-leak
NextResponse.json({ error: error.message }, { status: 500 });
// ok: kwotum.api-error-message-leak
NextResponse.json({ error: "Wewnętrzny błąd." }, { status: 500 });

// ruleid: kwotum.disabled-tls-verification
const tlsOptions = { rejectUnauthorized: false };
// ok: kwotum.disabled-tls-verification
const secureTlsOptions = { rejectUnauthorized: true };

// ruleid: kwotum.insecure-randomness-in-server-code
const insecureToken = Math.random();
// ok: kwotum.insecure-randomness-in-server-code
const secureToken = crypto.randomUUID();

void serviceRole;
void publishableKey;
void tlsOptions;
void secureTlsOptions;
void insecureToken;
void secureToken;
