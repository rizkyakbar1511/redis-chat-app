import { withAuth } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest } from "next/server";

export default async function middleware(req: NextRequest) {
  return withAuth(req, {
    loginPage: "/auth",
  });
}

export const config = {
  matcher: "/",
};
