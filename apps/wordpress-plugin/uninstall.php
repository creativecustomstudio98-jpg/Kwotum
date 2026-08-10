<?php

declare(strict_types=1);

if (! defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

delete_option('wyceno_connector_credential');
delete_option('wyceno_connector_connection');
delete_option('wyceno_connector_flows');
delete_transient('wyceno_connector_diagnostics');
