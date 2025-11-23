import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 *
 * @param request
 */
export function middleware(request: NextRequest) {
  // Just allow all requests to pass through
  return NextResponse.next();
}

// Only apply to specific routes if needed
export const config = {
  matcher: [],
};
