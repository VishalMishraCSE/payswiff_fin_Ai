import { redirect } from "next/navigation";

export default function DashboardRedirect() {
  redirect("/merchant/dashboard");
}
