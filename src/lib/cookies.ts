export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure:
    process.env.VERCEL === "1" || process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};
