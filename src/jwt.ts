import { jwtVerify, SignJWT } from "jose";

export const verifyJWT = async <T>(
  token: string | undefined,
  secret: string
) => {
  if (!token) return undefined;
  const data = await jwtVerify(token, new TextEncoder().encode(secret)).catch(
    () => undefined
  );
  return data?.payload.data as T | undefined;
};

export const sighJWT = async <T>(data: T, secret: string) => {
  return await new SignJWT({ data })
    .setProtectedHeader({ alg: "HS256" })
    .sign(new TextEncoder().encode(secret));
};
