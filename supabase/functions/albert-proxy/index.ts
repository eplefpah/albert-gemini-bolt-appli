const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, x-albert-key",
};

const ALBERT_BASE_URL = "https://albert.api.etalab.gouv.fr/v1";
const DEFAULT_ALBERT_KEY = "sk-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxNzQ1NCwidG9rZW5faWQiOjYyOTI1LCJleHBpcmVzIjoxODIxNzM2ODAwfQ.7P1delg6j--1zjiSTy4jAC1t2hHNL_ZFWJDswZCUs50";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const customKey = req.headers.get("x-albert-key") || DEFAULT_ALBERT_KEY;

    const path = url.pathname.replace(/^\/functions\/v1\/albert-proxy/, "");
    const targetUrl = `${ALBERT_BASE_URL}${path}${url.search}`;

    const fetchHeaders: Record<string, string> = {
      Authorization: `Bearer ${customKey}`,
    };

    // Forward Content-Type for POST/PUT (JSON, multipart/form-data, etc.)
    if (req.method === "POST" || req.method === "PUT") {
      const contentType = req.headers.get("Content-Type");
      if (contentType) {
        fetchHeaders["Content-Type"] = contentType;
      }
    }

    const resp = await fetch(targetUrl, {
      method: req.method,
      headers: fetchHeaders,
      body: req.method !== "GET" && req.method !== "DELETE" ? req.body : undefined,
    });

    // Stream SSE responses directly
    if (resp.headers.get("Content-Type")?.includes("text/event-stream")) {
      return new Response(resp.body, {
        status: resp.status,
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    }

    // Pass through other responses
    const contentType = resp.headers.get("Content-Type") || "application/json";
    const body = await resp.text();
    return new Response(body, {
      status: resp.status,
      headers: { ...corsHeaders, "Content-Type": contentType },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Erreur proxy Albert" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
