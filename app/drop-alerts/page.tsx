import { redirect } from "next/navigation";

// The Drop Alerts page lives at /membership; keep /drop-alerts working too.
export default function DropAlertsRedirect() {
  redirect("/membership");
}
