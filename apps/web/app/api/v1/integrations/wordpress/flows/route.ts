import { wordpressFlowsResponseSchema } from "../../../../../../lib/wordpress/contracts";
import {
  connectorCredential,
  mapWordpressDatabaseError,
  wordpressError,
  wordpressJson,
  wordpressRequestId,
} from "../../../../../../lib/wordpress/http";
import { createPublicClient } from "../../../../../../lib/supabase/public";

export async function GET(request: Request): Promise<Response> {
  const requestId = wordpressRequestId(request);
  const credential = connectorCredential(request);
  if (!credential) return wordpressError("NOT_CONNECTED", "Brak połączenia.", 401, requestId);
  const { data, error } = await createPublicClient().rpc("get_wordpress_flows", {
    connector_credential: credential,
  });
  if (error) return mapWordpressDatabaseError(error, requestId);
  const response = wordpressFlowsResponseSchema.safeParse(data);
  if (!response.success) {
    return wordpressError("UNAVAILABLE", "Serwer zwrócił nieprawidłową listę.", 503, requestId);
  }
  return wordpressJson(response.data, 200, requestId);
}
