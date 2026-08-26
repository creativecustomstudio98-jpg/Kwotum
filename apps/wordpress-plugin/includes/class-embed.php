<?php

declare(strict_types=1);

namespace Wyceno\Connector;

final class Embed
{
    public static function register(): void
    {
        add_shortcode('wyceno', [self::class, 'shortcode']);
        add_action('init', [self::class, 'register_block']);
        add_action('rest_api_init', [self::class, 'register_rest']);
    }

    /** @param array<string, mixed> $attributes */
    public static function shortcode(array $attributes = []): string
    {
        $attributes = shortcode_atts(
            ['context' => '', 'height' => '720', 'id' => '', 'mode' => 'inline'],
            $attributes,
            'wyceno'
        );
        return self::render([
            'flowId' => sanitize_text_field((string) $attributes['id']),
            'contextValues' => (string) $attributes['context'],
            'height' => (int) $attributes['height'],
            'mode' => sanitize_key((string) $attributes['mode']),
        ]);
    }

    public static function register_block(): void
    {
        wp_register_script(
            'wyceno-connector-editor',
            WYCENO_CONNECTOR_URL . 'assets/editor.js',
            ['wp-api-fetch', 'wp-block-editor', 'wp-blocks', 'wp-components', 'wp-element'],
            WYCENO_CONNECTOR_VERSION,
            true
        );
        register_block_type(WYCENO_CONNECTOR_DIR . 'block.json', [
            'render_callback' => [self::class, 'render'],
        ]);
    }

    public static function register_rest(): void
    {
        register_rest_route('wyceno-connector/v1', '/flows', [
            'callback' => static fn (): \WP_REST_Response => rest_ensure_response([
                'flows' => Api::cached_flows(),
            ]),
            'methods' => \WP_REST_Server::READABLE,
            'permission_callback' => static fn (): bool => current_user_can('edit_posts'),
        ]);
    }

    /** @param array<string, mixed> $attributes */
    public static function render(array $attributes): string
    {
        $flow_id = strtolower(sanitize_text_field((string) ($attributes['flowId'] ?? '')));
        $mode = sanitize_key((string) ($attributes['mode'] ?? 'inline'));
        $height = min(1600, max(320, (int) ($attributes['height'] ?? 720)));
        $context_json = self::safe_context_json((string) ($attributes['contextValues'] ?? ''));
        if (! in_array($mode, ['inline', 'popup', 'fullscreen'], true)) {
            $mode = 'inline';
        }
        $known_flow = false;
        foreach (Api::cached_flows() as $flow) {
            if (($flow['publicId'] ?? '') === $flow_id) {
                $known_flow = true;
                break;
            }
        }
        if (
            ! $known_flow
            || ! preg_match(
                '/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/',
                $flow_id
            )
        ) {
            return '<p class="wyceno-connector-error" role="status">'
                . esc_html__('Ten proces Kwotum jest obecnie niedostępny.', 'wyceno-connector')
                . '</p>';
        }
        try {
            wp_enqueue_script(
                'wyceno-connector-widget',
                Api::api_origin() . '/widget/v1/loader.js',
                [],
                WYCENO_CONNECTOR_VERSION,
                true
            );
        } catch (\RuntimeException) {
            return '<p class="wyceno-connector-error" role="status">'
                . esc_html__('Integracja Kwotum wymaga konfiguracji.', 'wyceno-connector')
                . '</p>';
        }
        $context_attribute = $context_json === null
            ? ''
            : ' context-values="' . esc_attr($context_json) . '"';
        return sprintf(
            '<div class="wyceno-connector-embed" style="min-height:%dpx"><wyceno-widget public-id="%s" mode="%s"%s></wyceno-widget></div>',
            $height,
            esc_attr($flow_id),
            esc_attr($mode),
            $context_attribute
        );
    }

    private static function safe_context_json(string $candidate): ?string
    {
        if (trim($candidate) === '') {
            return null;
        }
        $decoded = json_decode($candidate, true);
        if (! is_array($decoded) || array_is_list($decoded) || count($decoded) > 8) {
            return null;
        }
        $safe = [];
        foreach ($decoded as $key => $value) {
            if (
                ! is_string($key)
                || ! preg_match('/^[a-z][a-z0-9_]{0,63}$/', $key)
                || preg_match('/^(consent|organization|price|routing|score|tenant)(_|$)/', $key)
                || ! is_string($value)
            ) {
                return null;
            }
            $value = trim($value);
            if (
                $value === ''
                || mb_strlen($value) > 120
                || preg_match('/[[:cntrl:]]/', $value)
                || filter_var($value, FILTER_VALIDATE_EMAIL)
                || preg_match('/(^|\s)(https?:\/\/|www\.)/i', $value)
                || preg_match('/^\+?[0-9 ()-]{7,}$/', $value)
            ) {
                return null;
            }
            $safe[$key] = $value;
        }
        return wp_json_encode($safe, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?: null;
    }
}
