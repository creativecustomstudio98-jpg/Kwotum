import {
  wordpressConnectRequestSchema,
  wordpressConnectResponseSchema,
} from "../../../../../../lib/wordpress/contracts";
import {
  mapWordpressDatabaseError,
  readWordpressJson,
  wordpressError,
  wordpressJson,
  wordpressRequestId,
} from "../../../../../../lib/wordpress/http";
import { createPublicClient } from "../../../../../../lib/supabase/public";

export async function POST(request: Request): Promise<Response> {
  const requestId = wordpressRequestId(request);
  try {
    const body = wordpressConnectRequestSchema.safeParse(await readWordpressJson(request));
    if (!body.success) {
      return wordpressError("INVALID_REQUEST", "Dane połączenia są nieprawidłowe.", 422, requestId);
    }
    const { data, error } = await createPublicClient().rpc("exchange_wordpress_install_token", {
      install_token: body.data.installToken,
      target_php_version: body.data.phpVersion,
      target_plugin_version: body.data.pluginVersion,
      target_site_origin: body.data.siteOrigin,
      target_wordpress_version: body.data.wordpressVersion,
    });
    if (error) return mapWordpressDatabaseError(error, requestId);
    const response = wordpressConnectResponseSchema.safeParse(data);
    if (!response.success) {
      return wordpressError(
        "UNAVAILABLE",
        "Serwer zwrócił nieprawidłową odpowiedź.",
        503,
        requestId,
      );
    }
    return wordpressJson(response.data, 201, requestId);
  } catch {
    return wordpressError("INVALID_REQUEST", "Dane połączenia są nieprawidłowe.", 400, requestId);
  }
}
