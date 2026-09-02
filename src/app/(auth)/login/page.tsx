import { redirect } from "next/navigation";

export default function LoginPage() {
  const extrovert = (process.env.EXTROVERT_URL || "http://localhost:3000").replace(/\/$/, "");
  const datelocalOrigin = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001").replace(/\/$/, "");
  const returnTo = `${datelocalOrigin}/auth/callback`;
  redirect(`${extrovert}/auth/datelocal?returnTo=${encodeURIComponent(returnTo)}`);
}
