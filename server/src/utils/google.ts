import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function verifyGoogleIDToken(idToken: string) {
  const audience = process.env.GOOGLE_CLIENT_ID;
  if (!audience) throw new Error("Missing GOOGLE_CLIENT_ID environment variable");

  const ticket = await client.verifyIdToken({
    idToken,
    audience,
  });

  return ticket.getPayload();
}
