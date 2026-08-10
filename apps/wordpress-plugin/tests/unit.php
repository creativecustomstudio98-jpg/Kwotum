<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

use Wyceno\Connector\Api;
use Wyceno\Connector\Crypto;
use Wyceno\Connector\Embed;

$credential = str_repeat('a', 64);
$encrypted = Crypto::encrypt($credential);
wyceno_assert($encrypted !== $credential, 'Credential was stored as plaintext.');
wyceno_assert(Crypto::decrypt($encrypted) === $credential, 'Credential encryption did not round-trip.');

$flow_id = '123e4567-e89b-42d3-a456-426614174000';
$wyceno_test_remote_responses = [
    wyceno_test_response(201, [
        'connectionId' => '123e4567-e89b-42d3-a456-426614174001',
        'credential' => $credential,
        'organizationName' => 'Firma testowa',
        'siteOrigin' => 'https://wordpress.test',
    ]),
    wyceno_test_response(200, [
        'flows' => [['name' => 'Wycena kuchni', 'publicId' => $flow_id, 'version' => 2]],
    ]),
];
$api = new Api();
$api->connect(str_repeat('b', 64));
wyceno_assert($api->is_connected(), 'Connection was not persisted.');
wyceno_assert(count(Api::cached_flows()) === 1, 'Published flows were not cached.');
wyceno_assert(
    ($wyceno_test_last_request['arguments']['redirection'] ?? null) === 0
    && ($wyceno_test_last_request['arguments']['sslverify'] ?? null) === true
    && ($wyceno_test_last_request['arguments']['reject_unsafe_urls'] ?? null) === true,
    'Remote request security flags are incomplete.'
);

$html = Embed::shortcode(['height' => '9999', 'id' => $flow_id, 'mode' => 'popup']);
wyceno_assert(str_contains($html, 'public-id="' . $flow_id . '"'), 'Shortcode lost the public flow ID.');
wyceno_assert(str_contains($html, 'mode="popup"'), 'Popup mode was not rendered.');
wyceno_assert(str_contains($html, 'min-height:1600px'), 'Height was not clamped.');
wyceno_assert(! str_contains($html, $credential), 'Credential leaked into frontend HTML.');
wyceno_assert(
    ($wyceno_test_enqueued_scripts['wyceno-connector-widget']['source'] ?? '')
        === 'https://api.wyceno.test/widget/v1/loader.js',
    'Loader does not use the pinned origin.'
);

$invalid_html = Embed::shortcode([
    'id' => '"><script>alert(1)</script>',
    'mode' => 'bad-mode',
]);
wyceno_assert(! str_contains($invalid_html, '<script>'), 'Invalid shortcode input reached HTML.');
wyceno_assert(str_contains($invalid_html, 'role="status"'), 'Unavailable flow has no accessible state.');

$wyceno_test_remote_responses = [wyceno_test_response(204)];
$api->disconnect();
wyceno_assert(! $api->is_connected(), 'Disconnect did not remove local credential.');
wyceno_assert(Api::cached_flows() === [], 'Disconnect did not remove cached flows.');

echo 'WordPress connector unit checks passed for WP ' . $wp_version . ' / PHP ' . PHP_VERSION . PHP_EOL;
