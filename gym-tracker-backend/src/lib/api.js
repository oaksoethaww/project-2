export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export async function readBody(request) {
  const text = await request.text();
  if (new TextEncoder().encode(text).length > 16384) {
    throw new ApiError(413, "Request is too large.");
  }
  try {
    const body = JSON.parse(text);
    if (!body || typeof body !== "object" || Array.isArray(body))
      throw new Error();
    return body;
  } catch {
    throw new ApiError(400, "Provide a valid JSON object.");
  }
}

// Browser requests may come from the configured frontend only.
export function api(handler) {
  return async (request, context) => {
    const origin = request.headers.get("origin");
    const allowed = process.env.FRONTEND_URL?.replace(/\/$/, "");
    const headers = new Headers({
      "Cache-Control": "no-store",
      Vary: "Origin",
    });
    if (origin && origin !== allowed) {
      return Response.json(
        { error: "Origin is not allowed." },
        { status: 403, headers },
      );
    }
    if (origin) headers.set("Access-Control-Allow-Origin", origin);
    headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS",
    );
    headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (request.method === "OPTIONS")
      return new Response(null, { status: 204, headers });
    try {
      const response = await handler(request, context);
      for (const [key, value] of headers) response.headers.set(key, value);
      return response;
    } catch (error) {
      let status = error.status || 500;
      let message = error.status
        ? error.message
        : "Something went wrong. Please try again.";
      if (error.code === 11000) {
        status = 409;
        message = "An account with this email already exists.";
      }
      if (error.name === "ValidationError") {
        status = 400;
        message = "Please check the submitted fields.";
      }
      if (status === 500) console.error("API error:", error.name);
      return Response.json({ error: message }, { status, headers });
    }
  };
}

export const options = api(() => new Response(null, { status: 204 }));
