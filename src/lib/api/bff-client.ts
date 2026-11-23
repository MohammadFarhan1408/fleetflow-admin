import { NetworkError, readApiError } from "./errors";

/** POSTs JSON from the browser to a BFF route. Throws ApiError for error statuses and NetworkError when unreachable. */
export const postJson = async (url: string, body: unknown): Promise<Response> => {
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (error) {
    throw new NetworkError(error);
  }
  if (!response.ok) throw await readApiError(response);
  return response;
};
