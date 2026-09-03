import { redirect } from "next/navigation";

function getExtrovertOrigin(datelocalOrigin: string) {
  const configured = (process.env.EXTROVERT_URL || "http://localhost:3000")
    .split(",")
    .map((value) => value.trim().replace(/\/$/, ""))
    .filter(Boolean);
  const isLocal = ["localhost", "127.0.0.1"].includes(new URL(datelocalOrigin).hostname);
  const preferred = configured.find((value) => {
    try {
      const hostname = new URL(value).hostname;
      return isLocal ? ["localhost", "127.0.0.1"].includes(hostname) : !["localhost", "127.0.0.1"].includes(hostname);
    } catch {
      return false;
    }
  });
  return preferred || configured[0] || "http://localhost:3000";
}

export default function RegisterPage() {
  const datelocalOrigin = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001").replace(/\/$/, "");
  const extrovert = getExtrovertOrigin(datelocalOrigin);
  const returnTo = `${datelocalOrigin}/auth/callback`;
  redirect(`${extrovert}/auth/datelocal?returnTo=${encodeURIComponent(returnTo)}`);
}
