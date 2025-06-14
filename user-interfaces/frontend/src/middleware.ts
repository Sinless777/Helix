import { cookieMiddleware } from "@middlewares/cookie";

import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Apply the cookie middleware
  return cookieMiddleware(request);
}
