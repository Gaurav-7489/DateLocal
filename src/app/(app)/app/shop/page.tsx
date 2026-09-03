import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

export const metadata = { title: "Beyond | Extrovert" };
export const dynamic = "force-dynamic";

export default function ShopPage() {
  redirect(routes.extrovert);
}
