<?php

declare(strict_types=1);

namespace Wyceno\Connector;

final class Api
{
    private const OPTION_CREDENTIAL = 'wyceno_connector_credential';
    private const OPTION_CONNECTION = 'wyceno_connector_connection';
    private const OPTION_FLOWS = 'wyceno_connector_flows';

    /** @return array<string, mixed> */
    public function connect(string $install_token): array
    {
        global $wp_version;
        $response = $this->request(
            '/api/v1/integrations/wordpress/connect',
            'POST',
            [
                'installToken' => $install_token,
                'phpVersion' => PHP_MAJOR_VERSION . '.' . PHP_MINOR_VERSION . '.' . PHP_RELEASE_VERSION,
                'pluginVersion' => WYCENO_CONNECTOR_VERSION,
                'siteOrigin' => $this->site_origin(),
                'wordpressVersion' => (string) $wp_version,
            ],
            null
        );
        $credential = isset($response['credential']) ? (string) $response['credential'] : '';
        if (! preg_match('/^[a-f0-9]{64}$/', $credential)) {
            throw new \RuntimeException('SaaS nie zwrócił prawidłowego credentialu.');
        }
        $connection = [
            'connectionId' => sanitize_text_field((string) ($response['connectionId'] ?? '')),
            'organizationName' => sanitize_text_field((string) ($response['organizationName'] ?? '')),
            'siteOrigin' => esc_url_raw((string) ($response['siteOrigin'] ?? '')),
        ];
        update_option(self::OPTION_CREDENTIAL, Crypto::encrypt($credential), false);
        update_option(self::OPTION_CONNECTION, $connection, false);
        $this->refresh_flows();
        return $connection;
    }

    /** @return list<array{name: string, publicId: string, version: int}> */
    public function refresh_flows(): array
    {
        $response = $this->request(
            '/api/v1/integrations/wordpress/flows',
            'GET',
            null,
            $this->credential()
        );
        $flows = [];
        foreach (($response['flows'] ?? []) as $flow) {
            if (
                ! is_array($flow)
                || ! isset($flow['publicId'], $flow['name'], $flow['version'])
                || ! preg_match(
                    '/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i',
                    (string) $flow['publicId']
                )
            ) {
                continue;
            }
            $flows[] = [
                'name' => sanitize_text_field((string) $flow['name']),
                'publicId' => strtolower((string) $flow['publicId']),
                'version' => max(1, (int) $flow['version']),
            ];
        }
        update_option(self::OPTION_FLOWS, $flows, false);
        return $flows;
    }

    /** @return array<string, mixed> */
    public function remote_diagnostics(): array
    {
        return $this->request(
            '/api/v1/integrations/wordpress/diagnostics',
            'GET',
            null,
            $this->credential()
        );
    }

    public function disconnect(): void
    {
        try {
            $this->request(
                '/api/v1/integrations/wordpress/connection',
                'DELETE',
                null,
                $this->credential(),
                true
            );
        } finally {
            delete_option(self::OPTION_CREDENTIAL);
            delete_option(self::OPTION_CONNECTION);
            delete_option(self::OPTION_FLOWS);
        }
    }

    public function is_connected(): bool
    {
        try {
            return $this->credential() !== '';
        } catch (\RuntimeException) {
            return false;
        }
    }

    /** @return list<array{name: string, publicId: string, version: int}> */
    public static function cached_flows(): array
    {
        $value = get_option(self::OPTION_FLOWS, []);
        return is_array($value) ? $value : [];
    }

    /** @return array<string, string> */
    public static function connection(): array
    {
        $value = get_option(self::OPTION_CONNECTION, []);
        return is_array($value) ? $value : [];
    }

    public static function api_origin(): string
    {
        if (! defined('WYCENO_CONNECTOR_API_ORIGIN')) {
            throw new \RuntimeException('WYCENO_CONNECTOR_API_ORIGIN nie jest skonfigurowany.');
        }
        $origin = strtolower(rtrim((string) WYCENO_CONNECTOR_API_ORIGIN, '/'));
        if (! preg_match('/^https:\/\/[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?(?::[0-9]{1,5})?$/', $origin)) {
            throw new \RuntimeException('Origin API musi być przypiętym originem HTTPS bez ścieżki.');
        }
        return $origin;
    }

    public function site_origin(): string
    {
        $parts = wp_parse_url(home_url('/'));
        if (
            ! is_array($parts)
            || ($parts['scheme'] ?? '') !== 'https'
            || empty($parts['host'])
        ) {
            throw new \RuntimeException('Strona WordPress musi działać pod HTTPS.');
        }
        $origin = 'https://' . strtolower((string) $parts['host']);
        if (isset($parts['port'])) {
            $origin .= ':' . (int) $parts['port'];
        }
        return $origin;
    }

    private function credential(): string
    {
        $encrypted = get_option(self::OPTION_CREDENTIAL, '');
        if (! is_string($encrypted) || $encrypted === '') {
            throw new \RuntimeException('WordPress nie jest połączony z Kwotum.');
        }
        return Crypto::decrypt($encrypted);
    }

    /**
     * @param array<string, mixed>|null $body
     * @return array<string, mixed>
     */
    private function request(
        string $path,
        string $method,
        ?array $body,
        ?string $credential,
        bool $allow_empty = false
    ): array {
        $headers = [
            'Accept' => 'application/json',
            'Content-Type' => 'application/json',
            'User-Agent' => 'Wyceno-Connector/' . WYCENO_CONNECTOR_VERSION,
        ];
        if (is_string($credential) && $credential !== '') {
            $headers['Authorization'] = 'Bearer ' . $credential;
        }
        $arguments = [
            'body' => $body === null ? null : wp_json_encode($body),
            'headers' => $headers,
            'method' => $method,
            'redirection' => 0,
            'reject_unsafe_urls' => true,
            'sslverify' => true,
            'timeout' => 10,
        ];
        $response = wp_remote_request(self::api_origin() . $path, $arguments);
        if (is_wp_error($response)) {
            throw new \RuntimeException('Nie udało się połączyć z API Kwotum.');
        }
        $status = wp_remote_retrieve_response_code($response);
        $raw_body = wp_remote_retrieve_body($response);
        if ($allow_empty && $status === 204) {
            return [];
        }
        $decoded = json_decode($raw_body, true, 32, JSON_THROW_ON_ERROR);
        if ($status < 200 || $status >= 300 || ! is_array($decoded)) {
            throw new \RuntimeException('API Kwotum odrzuciło żądanie.');
        }
        return $decoded;
    }
}
