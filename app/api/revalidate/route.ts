import { revalidate } from "lib/shopify";
import { NextRequest, NextResponse } from "next/server";

// The debounced revalidate leader sleeps ~50s inside after() before calling
// revalidateTag; keep the function alive long enough (Hobby max = 60s).
export const maxDuration = 60;

export async function POST(req: NextRequest): Promise<NextResponse> {
  return revalidate(req);
}
