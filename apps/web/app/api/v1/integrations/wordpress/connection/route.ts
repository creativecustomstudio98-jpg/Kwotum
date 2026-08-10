import {
  connectorCredential,
  mapWordpressDatabaseError,
  wordpressError,
  wordpressRequestId,
} from "../../../../../../lib/wordpress/http";
import { createPublicClient } from "../../../../../../lib/supabase/public";

export async function DELETE(request: Request): Promise<Response> {
  const requestId = wordpressRequestId(request);
  const credential = connectorCredential(request);
  if (!credential) return wordpressError("NOT_CONNECTED", "Brak połączenia.", 401, requestId);
  const { data, error } = await createPublicClient().rpc("disconnect_wordpress", {
    connector_credential: credential,
  });
  if (error) return mapWordpressDatabaseError(error, requestId);
  if (!data) return wordpressError("NOT_CONNECTED", "Połączenie jest nieważne.", 401, requestId);
  return new Response(null, {
    headers: {
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "X-Request-Id": requestId,
    },
    status: 204,
  });
}
