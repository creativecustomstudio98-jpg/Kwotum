<?php

declare(strict_types=1);

namespace Wyceno\Connector;

final class Plugin
{
    public static function boot(): void
    {
        Embed::register();
        if (is_admin()) {
            Admin::register();
        }
    }
}
