import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify, SignJWT } from "jose";

const COOKIE_NAME = "ddm_povuci_admin_session";
const SESSION_DURATION_SECONDS = 24 * 60 * 60; // 24 sata

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Missing ADMIN_SESSION_SECRET environment variable in production.");
    }
    return new TextEncoder().encode("dev_local_fallback_session_secret_32_chars!");
  }
  return new TextEncoder().encode(secret);
}

async function createToken() {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("ddm-povuci-admin")
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSessionSecret());
}

async function verifyToken(token?: string) {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, getSessionSecret(), {
      algorithms: ["HS256"],
      subject: "ddm-povuci-admin",
    });
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export async function createAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, await createToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION_SECONDS,
    path: "/",
    priority: "high",
  });
}

export async function deleteAdminSession() {
  (await cookies()).delete(COOKIE_NAME);
}

export const hasAdminSession = cache(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return verifyToken(token);
});

export async function requireAdmin() {
  const isAuth = await hasAdminSession();
  if (!isAuth) {
    redirect("/admin/login");
  }
  return { role: "admin" as const };
}
