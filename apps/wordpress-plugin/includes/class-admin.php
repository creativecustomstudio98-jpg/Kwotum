<?php

declare(strict_types=1);

namespace Wyceno\Connector;

final class Admin
{
    public static function register(): void
    {
        add_action('admin_menu', [self::class, 'menu']);
        add_action('admin_post_wyceno_connector_connect', [self::class, 'connect']);
        add_action('admin_post_wyceno_connector_refresh', [self::class, 'refresh']);
        add_action('admin_post_wyceno_connector_disconnect', [self::class, 'disconnect']);
        add_action('admin_post_wyceno_connector_diagnose', [self::class, 'diagnose']);
    }

    public static function menu(): void
    {
        add_options_page(
            __('Kwotum Connector', 'wyceno-connector'),
            __('Kwotum', 'wyceno-connector'),
            'manage_options',
            'wyceno-connector',
            [self::class, 'page']
        );
    }

    public static function page(): void
    {
        if (! current_user_can('manage_options')) {
            wp_die(esc_html__('Brak uprawnień.', 'wyceno-connector'));
        }
        $api = new Api();
        $connected = $api->is_connected();
        $flows = Api::cached_flows();
        $connection = Api::connection();
        $diagnostics = get_transient('wyceno_connector_diagnostics');
        ?>
        <div class="wrap">
            <h1><?php echo esc_html__('Kwotum Connector', 'wyceno-connector'); ?></h1>
            <p><?php echo esc_html__('Leady, odpowiedzi, pliki i reguły pozostają w SaaS Kwotum.', 'wyceno-connector'); ?></p>
            <?php self::notice(); ?>
            <?php if (! $connected) : ?>
                <form action="<?php echo esc_url(admin_url('admin-post.php')); ?>" method="post">
                    <input name="action" type="hidden" value="wyceno_connector_connect">
                    <?php wp_nonce_field('wyceno_connector_connect'); ?>
                    <table class="form-table" role="presentation">
                        <tr>
                            <th scope="row"><label for="wyceno-install-token"><?php echo esc_html__('Token instalacyjny', 'wyceno-connector'); ?></label></th>
                            <td><input autocomplete="off" class="regular-text" id="wyceno-install-token" maxlength="64" name="install_token" pattern="[a-f0-9]{64}" required type="password"></td>
                        </tr>
                    </table>
                    <?php submit_button(__('Połącz bezpiecznie', 'wyceno-connector')); ?>
                </form>
            <?php else : ?>
                <p>
                    <strong><?php echo esc_html__('Organizacja:', 'wyceno-connector'); ?></strong>
                    <?php echo esc_html((string) ($connection['organizationName'] ?? '')); ?>
                </p>
                <p>
                    <strong><?php echo esc_html__('Origin:', 'wyceno-connector'); ?></strong>
                    <?php echo esc_html((string) ($connection['siteOrigin'] ?? '')); ?>
                </p>
                <h2><?php echo esc_html__('Opublikowane procesy', 'wyceno-connector'); ?></h2>
                <?php if ($flows === []) : ?>
                    <p><?php echo esc_html__('Brak opublikowanych procesów.', 'wyceno-connector'); ?></p>
                <?php else : ?>
                    <table class="widefat striped">
                        <thead><tr><th><?php echo esc_html__('Nazwa', 'wyceno-connector'); ?></th><th><?php echo esc_html__('Shortcode', 'wyceno-connector'); ?></th><th><?php echo esc_html__('Wersja', 'wyceno-connector'); ?></th></tr></thead>
                        <tbody>
                        <?php foreach ($flows as $flow) : ?>
                            <tr>
                                <td><?php echo esc_html((string) $flow['name']); ?></td>
                                <td><code>[wyceno id="<?php echo esc_attr((string) $flow['publicId']); ?>" mode="inline"]</code></td>
                                <td><?php echo esc_html((string) $flow['version']); ?></td>
                            </tr>
                        <?php endforeach; ?>
                        </tbody>
                    </table>
                <?php endif; ?>
                <p>
                    <?php self::action_form('wyceno_connector_refresh', __('Odśwież listę', 'wyceno-connector')); ?>
                    <?php self::action_form('wyceno_connector_diagnose', __('Uruchom diagnostykę', 'wyceno-connector')); ?>
                    <?php self::action_form('wyceno_connector_disconnect', __('Odłącz i usuń credential', 'wyceno-connector'), 'delete'); ?>
                </p>
            <?php endif; ?>
            <?php self::diagnostics_table(is_array($diagnostics) ? $diagnostics : []); ?>
        </div>
        <?php
    }

    public static function connect(): void
    {
        self::authorize('wyceno_connector_connect');
        $token = isset($_POST['install_token'])
            ? sanitize_text_field(wp_unslash((string) $_POST['install_token']))
            : '';
        if (! preg_match('/^[a-f0-9]{64}$/', $token)) {
            self::redirect('invalid_token');
        }
        try {
            (new Api())->connect($token);
            self::redirect('connected');
        } catch (\Throwable) {
            self::redirect('connection_failed');
        }
    }

    public static function refresh(): void
    {
        self::authorize('wyceno_connector_refresh');
        try {
            (new Api())->refresh_flows();
            self::redirect('refreshed');
        } catch (\Throwable) {
            self::redirect('connection_failed');
        }
    }

    public static function disconnect(): void
    {
        self::authorize('wyceno_connector_disconnect');
        try {
            (new Api())->disconnect();
        } catch (\Throwable) {
            delete_option('wyceno_connector_credential');
            delete_option('wyceno_connector_connection');
            delete_option('wyceno_connector_flows');
        }
        self::redirect('disconnected');
    }

    public static function diagnose(): void
    {
        self::authorize('wyceno_connector_diagnose');
        global $wp_version;
        $checks = [
            'apiOrigin' => self::check_api_origin(),
            'csp' => self::check_csp(),
            'php' => version_compare(PHP_VERSION, '8.3', '>=') ? 'ok' : 'error',
            'rest' => function_exists('register_rest_route') ? 'ok' : 'error',
            'sodium' => Crypto::available() ? 'ok' : 'error',
            'wordpress' => version_compare((string) $wp_version, '6.8', '>=') ? 'ok' : 'error',
        ];
        try {
            (new Api())->remote_diagnostics();
            $checks['saas'] = 'ok';
        } catch (\Throwable) {
            $checks['saas'] = 'error';
        }
        set_transient('wyceno_connector_diagnostics', $checks, HOUR_IN_SECONDS);
        self::redirect('diagnosed');
    }

    private static function authorize(string $action): void
    {
        if (! current_user_can('manage_options')) {
            wp_die(esc_html__('Brak uprawnień.', 'wyceno-connector'));
        }
        check_admin_referer($action);
    }

    private static function redirect(string $status): never
    {
        wp_safe_redirect(
            add_query_arg(
                ['page' => 'wyceno-connector', 'wyceno_status' => sanitize_key($status)],
                admin_url('options-general.php')
            )
        );
        exit;
    }

    private static function notice(): void
    {
        $status = isset($_GET['wyceno_status'])
            ? sanitize_key(wp_unslash((string) $_GET['wyceno_status']))
            : '';
        $messages = [
            'connected' => __('Połączenie zostało zapisane.', 'wyceno-connector'),
            'connection_failed' => __('Połączenie nie powiodło się. Sprawdź token i diagnostykę.', 'wyceno-connector'),
            'diagnosed' => __('Diagnostyka została zaktualizowana.', 'wyceno-connector'),
            'disconnected' => __('Połączenie i lokalny credential zostały usunięte.', 'wyceno-connector'),
            'invalid_token' => __('Token ma nieprawidłowy format.', 'wyceno-connector'),
            'refreshed' => __('Lista procesów została odświeżona.', 'wyceno-connector'),
        ];
        if (isset($messages[$status])) {
            $class = in_array($status, ['connection_failed', 'invalid_token'], true)
                ? 'notice notice-error'
                : 'notice notice-success';
            printf('<div class="%s"><p>%s</p></div>', esc_attr($class), esc_html($messages[$status]));
        }
    }

    private static function action_form(string $action, string $label, string $class = 'secondary'): void
    {
        ?>
        <form action="<?php echo esc_url(admin_url('admin-post.php')); ?>" method="post" style="display:inline-block">
            <input name="action" type="hidden" value="<?php echo esc_attr($action); ?>">
            <?php wp_nonce_field($action); ?>
            <?php submit_button($label, $class, 'submit', false); ?>
        </form>
        <?php
    }

    /** @param array<string, string> $checks */
    private static function diagnostics_table(array $checks): void
    {
        if ($checks === []) {
            return;
        }
        $labels = [
            'apiOrigin' => __('Przypięty origin API HTTPS', 'wyceno-connector'),
            'csp' => __('CSP strony pozwala na loader Kwotum', 'wyceno-connector'),
            'php' => __('PHP 8.3+', 'wyceno-connector'),
            'rest' => __('WordPress REST API', 'wyceno-connector'),
            'saas' => __('Komunikacja serwer-serwer', 'wyceno-connector'),
            'sodium' => __('Authenticated encryption (sodium)', 'wyceno-connector'),
            'wordpress' => __('WordPress 6.8+', 'wyceno-connector'),
        ];
        echo '<h2>' . esc_html__('Diagnostyka', 'wyceno-connector') . '</h2><ul>';
        foreach ($labels as $key => $label) {
            $status = $checks[$key] ?? 'unknown';
            echo '<li><strong>' . esc_html($label) . ':</strong> ' . esc_html($status) . '</li>';
        }
        echo '</ul><p>' . esc_html__('Jeśli CSP jest nierozpoznane, dodaj przypięty origin do script-src, connect-src i frame-src, a następnie sprawdź stronę w przeglądarce.', 'wyceno-connector') . '</p>';
    }

    private static function check_api_origin(): string
    {
        try {
            Api::api_origin();
            return 'ok';
        } catch (\Throwable) {
            return 'error';
        }
    }

    private static function check_csp(): string
    {
        $response = wp_remote_head(home_url('/'), [
            'redirection' => 0,
            'reject_unsafe_urls' => true,
            'sslverify' => true,
            'timeout' => 5,
        ]);
        if (is_wp_error($response)) {
            return 'unknown';
        }
        $header = wp_remote_retrieve_header($response, 'content-security-policy');
        if (! is_string($header) || $header === '') {
            return 'not-set';
        }
        try {
            $host = (string) wp_parse_url(Api::api_origin(), PHP_URL_HOST);
            return str_contains($header, $host) ? 'ok' : 'warning';
        } catch (\Throwable) {
            return 'error';
        }
    }
}
