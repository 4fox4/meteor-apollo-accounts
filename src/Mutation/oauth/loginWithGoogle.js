import resolver from "./resolver";

const handleAuthFromAccessToken = async function ({ accessToken }) {
  const [identity, scopes] = await Promise.all([
    getIdentity(accessToken),
    getScopes(accessToken),
  ]);

  const serviceData = {
    ...identity,
    accessToken,
    scopes,
  };

  return {
    serviceName: "google",
    serviceData,
    options: { profile: { name: identity.name } },
  };
};

const getIdentity = async function (accessToken) {
  const url = `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${encodeURIComponent(accessToken)}`;
  const res = await fetch(url);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(`Google userinfo request failed with status ${res.status}${data?.error ? `: ${data.error}` : ""}`);
  }
  return res.json();
};

const getScopes = async function (accessToken) {
  const url = `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${encodeURIComponent(accessToken)}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Google tokeninfo request failed with status ${res.status}${data?.error ? `: ${data.error}` : ""}`);
  }
  if (typeof data.scope !== "string") {
    throw new Error("Google tokeninfo response did not include a valid scope string.");
  }
  return data.scope.split(" ");
};

export default resolver(handleAuthFromAccessToken);
