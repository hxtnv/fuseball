// Custom Google OAuth 2.0 (Authorization Code flow). The central server is the
// only place that talks to Google — it exchanges the code and reads the profile,
// then issues our own JWT. No third-party auth SDK.

const GOOGLE_AUTH = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO = "https://openidconnect.googleapis.com/v1/userinfo";

export interface GoogleProfile {
  googleId: string;
  email?: string;
  name?: string;
}

const config = () => ({
  clientId: process.env.GOOGLE_CLIENT_ID ?? "",
  clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  redirectUri:
    process.env.GOOGLE_REDIRECT_URI ??
    "http://localhost:3001/auth/google/callback",
});

export const googleConfigured = (): boolean => {
  const c = config();
  return Boolean(c.clientId && c.clientSecret);
};

// URL to send the browser to for the Google consent screen. `state` round-trips
// back to the callback (we pass the anonymous token so we can link the account).
export const googleAuthUrl = (state: string): string => {
  const c = config();
  const params = new URLSearchParams({
    client_id: c.clientId,
    redirect_uri: c.redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
  });
  return `${GOOGLE_AUTH}?${params}`;
};

// Exchange the auth code for tokens and read the user's Google profile.
export const exchangeGoogleCode = async (
  code: string,
): Promise<GoogleProfile | null> => {
  const c = config();
  const tokenRes = await fetch(GOOGLE_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: c.clientId,
      client_secret: c.clientSecret,
      redirect_uri: c.redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) return null;

  const { access_token } = (await tokenRes.json()) as { access_token?: string };
  if (!access_token) return null;

  const infoRes = await fetch(GOOGLE_USERINFO, {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  if (!infoRes.ok) return null;

  const info = (await infoRes.json()) as {
    sub: string;
    email?: string;
    name?: string;
  };
  return { googleId: info.sub, email: info.email, name: info.name };
};
