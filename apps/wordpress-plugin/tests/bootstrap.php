<?php

declare(strict_types=1);

define('ABSPATH', __DIR__ . '/fake-wordpress/');
define('AUTH_KEY', 'test-auth-key-with-enough-entropy');
define('SECURE_AUTH_KEY', 'test-secure-auth-key-with-enough-entropy');
define('WYCENO_CONNECTOR_API_ORIGIN', 'https://api.wyceno.test');

$wp_version = getenv('WYCENO_TEST_WP_VERSION') ?: '7.0.2';
$wyceno_test_options = [];
$wyceno_test_hooks = [];
$wyceno_test_remote_responses = [];
$wyceno_test_last_request = [];
$wyceno_test_enqueued_scripts = [];

function plugin_dir_path(string $file): string
{
    return dirname($file) . '/';
}

function plugin_dir_url(string $file): string
{
    return 'https://wordpress.test/wp-content/plugins/wyceno-connector/';
}

function add_action(string $hook, callable $callback): void
{
    global $wyceno_test_hooks;
    $wyceno_test_hooks[$hook][] = $callback;
}

function add_shortcode(string $tag, callable $callback): void
{
    global $wyceno_test_hooks;
    $wyceno_test_hooks['shortcode:' . $tag][] = $callback;
}

function is_admin(): bool
{
    return true;
}

function sanitize_text_field(string $value): string
{
    return trim(strip_tags($value));
}

function sanitize_key(string $value): string
{
    return preg_replace('/[^a-z0-9_-]/', '', strtolower($value)) ?? '';
}

function esc_url_raw(string $value): string
{
    return filter_var($value, FILTER_SANITIZE_URL) ?: '';
}

function get_option(string $key, mixed $default = false): mixed
{
    global $wyceno_test_options;
    return $wyceno_test_options[$key] ?? $default;
}

function update_option(string $key, mixed $value, bool $autoload = true): bool
{
    global $wyceno_test_options;
    $wyceno_test_options[$key] = $value;
    return true;
}

function delete_option(string $key): bool
{
    global $wyceno_test_options;
    unset($wyceno_test_options[$key]);
    return true;
}

function wp_parse_url(string $url, int $component = -1): mixed
{
    return parse_url($url, $component);
}

function home_url(string $path = ''): string
{
    return 'https://wordpress.test' . $path;
}

function wp_json_encode(mixed $value): string|false
{
    return json_encode($value, JSON_THROW_ON_ERROR);
}

function wp_remote_request(string $url, array $arguments): array
{
    global $wyceno_test_last_request, $wyceno_test_remote_responses;
    $wyceno_test_last_request = ['arguments' => $arguments, 'url' => $url];
    if ($wyceno_test_remote_responses === []) {
        return ['body' => '{}', 'response' => ['code' => 503]];
    }
    return array_shift($wyceno_test_remote_responses);
}

function is_wp_error(mixed $value): bool
{
    return $value instanceof WP_Error;
}

function wp_remote_retrieve_response_code(array $response): int
{
    return (int) ($response['response']['code'] ?? 0);
}

function wp_remote_retrieve_body(array $response): string
{
    return (string) ($response['body'] ?? '');
}

function shortcode_atts(array $defaults, array $attributes, string $shortcode = ''): array
{
    return array_merge($defaults, array_intersect_key($attributes, $defaults));
}

function wp_enqueue_script(
    string $handle,
    string $source = '',
    array $dependencies = [],
    string|bool|null $version = false,
    bool $footer = false
): void {
    global $wyceno_test_enqueued_scripts;
    $wyceno_test_enqueued_scripts[$handle] = compact('source', 'dependencies', 'version', 'footer');
}

function esc_attr(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function esc_html__(string $value, string $domain): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

class WP_Error
{
}

require dirname(__DIR__) . '/wyceno-connector.php';

function wyceno_test_response(int $status, array $body = []): array
{
    return ['body' => json_encode($body, JSON_THROW_ON_ERROR), 'response' => ['code' => $status]];
}

function wyceno_assert(bool $condition, string $message): void
{
    if (! $condition) {
        throw new RuntimeException($message);
    }
}
