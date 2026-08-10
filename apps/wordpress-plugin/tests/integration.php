<?php

declare(strict_types=1);

if (! defined('ABSPATH')) {
    exit(1);
}

$flow_id = '123e4567-e89b-42d3-a456-426614174000';
update_option('wyceno_connector_flows', [
    ['name' => 'Test flow', 'publicId' => $flow_id, 'version' => 1],
], false);

if (! shortcode_exists('wyceno')) {
    throw new RuntimeException('Shortcode is not registered.');
}
$html = do_shortcode('[wyceno id="' . $flow_id . '" mode="popup" height="640"]');
if (
    ! str_contains($html, '<wyceno-widget')
    || ! str_contains($html, 'mode="popup"')
    || str_contains($html, 'credential')
) {
    throw new RuntimeException('Shortcode failed actual WordPress integration smoke.');
}
if (! WP_Block_Type_Registry::get_instance()->is_registered('wyceno/flow')) {
    throw new RuntimeException('Gutenberg block is not registered.');
}
$block = render_block([
    'attrs' => ['flowId' => $flow_id, 'height' => 640, 'mode' => 'inline'],
    'blockName' => 'wyceno/flow',
    'innerBlocks' => [],
    'innerContent' => [],
    'innerHTML' => '',
]);
if (! str_contains($block, 'public-id="' . $flow_id . '"')) {
    throw new RuntimeException('Dynamic Gutenberg render failed.');
}
echo 'Actual WordPress integration smoke passed.' . PHP_EOL;
