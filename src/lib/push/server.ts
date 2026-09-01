import "server-only";

export type PushNotification = {
  title: string;
  body: string;
  url?: string;
  tag?: string;
};

export async function sendPushToUser(
  userId: string,
  notification: PushNotification,
): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!baseUrl || !serviceKey) {
    console.warn("[DateBu] Push skipped: Supabase service credentials are missing.");
    return;
  }

  try {
    const response = await fetch(`${baseUrl}/functions/v1/datebu-push/send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        title: notification.title,
        body: notification.body,
        url: notification.url ?? "/app",
        tag: notification.tag,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      console.warn("[DateBu] Push send failed", response.status, await response.text());
    }
  } catch (error) {
    console.warn("[DateBu] Push send request failed", error);
  }
}
