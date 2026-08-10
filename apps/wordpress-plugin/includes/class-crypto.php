<?php

declare(strict_types=1);

namespace Wyceno\Connector;

final class Crypto
{
    public static function available(): bool
    {
        return function_exists('sodium_crypto_secretbox')
            && defined('AUTH_KEY')
            && defined('SECURE_AUTH_KEY');
    }

    public static function encrypt(string $plaintext): string
    {
        if (! self::available()) {
            throw new \RuntimeException('Sodium lub unikalne salts WordPressa są niedostępne.');
        }
        $nonce = random_bytes(SODIUM_CRYPTO_SECRETBOX_NONCEBYTES);
        $ciphertext = sodium_crypto_secretbox($plaintext, $nonce, self::key());
        return base64_encode($nonce . $ciphertext);
    }

    public static function decrypt(string $payload): string
    {
        if (! self::available()) {
            throw new \RuntimeException('Sodium lub unikalne salts WordPressa są niedostępne.');
        }
        $decoded = base64_decode($payload, true);
        if (! is_string($decoded) || strlen($decoded) <= SODIUM_CRYPTO_SECRETBOX_NONCEBYTES) {
            throw new \RuntimeException('Credential ma nieprawidłowy format.');
        }
        $nonce = substr($decoded, 0, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES);
        $ciphertext = substr($decoded, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES);
        $plaintext = sodium_crypto_secretbox_open($ciphertext, $nonce, self::key());
        if (! is_string($plaintext) || ! preg_match('/^[a-f0-9]{64}$/', $plaintext)) {
            throw new \RuntimeException('Nie udało się odszyfrować credentialu.');
        }
        return $plaintext;
    }

    private static function key(): string
    {
        return hash('sha256', (string) AUTH_KEY . "\0" . (string) SECURE_AUTH_KEY, true);
    }
}
