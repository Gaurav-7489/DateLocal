import { redirect } from "next/navigation";

export default function LoginPage() {
  const extrovert = (process.env.EXTROVERT_URL || "http://localhost:3000").replace(/\/$/, "");
  const datebuOrigin = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001").replace(/\/$/, "");
  const returnTo = `${datebuOrigin}/auth/callback`;
  redirect(`${extrovert}/auth/datebu?returnTo=${encodeURIComponent(returnTo)}`);
}
