import "server-only";

export type DiditSessionResponse = {
  sessionId: string;
  sessionToken: string;
  url: string;
  status: string;
};

export type DiditApiError = {
  message: string;
};

const DIDIT_API_BASE = "https://verification.didit.me";

export async function createDiditSession(params: {
  workflowId: string;
  vendorData: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
  language?: string;
  portraitImage?: string;
}): Promise<DiditSessionResponse> {
  const apiKey = process.env.DIDIT_API_KEY;
  const workflowId = process.env.DIDIT_WORKFLOW_ID;

  if (!apiKey) {
    throw new Error("DIDIT_API_KEY is not configured.");
  }

  if (!workflowId) {
    throw new Error("DIDIT_WORKFLOW_ID is not configured.");
  }

  const response = await fetch(`${DIDIT_API_BASE}/v3/session/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      workflow_id: params.workflowId,
      vendor_data: params.vendorData,
      callback: params.callbackUrl,
      callback_method: "both",
      metadata: params.metadata ?? {},
      language: params.language ?? "en",

      ...(params.portraitImage
        ? {
            portrait_image: params.portraitImage,
          }
        : {}),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();

    console.error(
      "Didit session creation failed:",
      response.status,
      errorText,
    );

    throw new Error(
      response.status === 401
        ? "Verification service authentication failed."
        : response.status === 429
          ? "Verification service is busy. Please try again later."
          : "Failed to start verification. Please try again.",
    );
  }

  const data = (await response.json()) as {
    session_id: string;
    session_token: string;
    url: string;
    status: string;
  };

  return {
    sessionId: data.session_id,
    sessionToken: data.session_token,
    url: data.url,
    status: data.status,
  };
}