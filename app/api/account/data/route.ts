import {
  fetchAccountData,
  type AccountOrder,
} from "lib/shopify/customer/account-api";
import { readSession } from "lib/shopify/customer/session";
import { getFreshAccessToken } from "lib/shopify/customer/tokens";
import { NextResponse } from "next/server";

// Account dashboard data: identity from the session + (best-effort) profile and
// orders from the Customer Account API. 401 when signed out so the page can send
// the visitor to log in.
export async function GET() {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  let firstName: string | null = null;
  let lastName: string | null = null;
  let email: string | null = session.email || null;
  let orders: AccountOrder[] = [];

  const token = await getFreshAccessToken();
  if (token) {
    const data = await fetchAccountData(token);
    if (data) {
      firstName = data.firstName;
      lastName = data.lastName;
      email = data.email || email;
      orders = data.orders;
    }
  }

  return NextResponse.json({
    loggedIn: true,
    firstName,
    lastName,
    email,
    orders,
  });
}
