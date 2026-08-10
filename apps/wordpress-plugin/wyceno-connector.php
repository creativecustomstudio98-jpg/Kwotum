<?php
/**
 * Plugin Name: Kwotum Connector
 * Description: Bezpiecznie osadza opublikowane procesy Kwotum bez przechowywania leadów w WordPressie.
 * Version: 1.0.0
 * Requires at least: 6.8
 * Requires PHP: 8.3
 * Author: Kwotum
 * License: GPL-2.0-or-later
 * Text Domain: wyceno-connector
 */

declare(strict_types=1);

if (! defined('ABSPATH')) {
    exit;
}

define('WYCENO_CONNECTOR_VERSION', '1.0.0');
define('WYCENO_CONNECTOR_FILE', __FILE__);
define('WYCENO_CONNECTOR_DIR', plugin_dir_path(__FILE__));
define('WYCENO_CONNECTOR_URL', plugin_dir_url(__FILE__));

require_once WYCENO_CONNECTOR_DIR . 'includes/class-crypto.php';
require_once WYCENO_CONNECTOR_DIR . 'includes/class-api.php';
require_once WYCENO_CONNECTOR_DIR . 'includes/class-embed.php';
require_once WYCENO_CONNECTOR_DIR . 'includes/class-admin.php';
require_once WYCENO_CONNECTOR_DIR . 'includes/class-plugin.php';

\Wyceno\Connector\Plugin::boot();
