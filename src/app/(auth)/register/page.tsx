import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

export default function RegisterPage() {
  redirect(routes.login);
}
