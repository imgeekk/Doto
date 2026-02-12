import {getSessionCookie} from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "./app/lib/auth";
import { headers } from "next/headers";

const protectedRoutes = ["/profile", "/projects", "/new-project"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // const sessionCookie = getSessionCookie(req); // checking just for the existence of a session

  const session = await auth.api.getSession({
    headers: req.headers // you need to pass the headers object.
})
  const res = NextResponse.next();

  const isLoggedIn = !!session;
  const isProtectedRoute = protectedRoutes.includes(pathname);
  const isOnAuthRoute = pathname.startsWith("/api/auth");

  if(isProtectedRoute && !isLoggedIn){
    return NextResponse.redirect(new URL("/signup", req.url));
  }

  if(isOnAuthRoute && isLoggedIn){
    return NextResponse.redirect(new URL("/projects", req.url));
  }

  if(pathname === "/signup" && isLoggedIn){
    return NextResponse.redirect(new URL("/home/projects", req.url));
  }

  // if(pathname === "/" && isLoggedIn){
  //   return NextResponse.redirect(new URL("/projects", req.url));
  // }

  return res;
};

export const config = {
  matcher: ["/", "/profile", "/projects", "/new-project", "/signup"]
}