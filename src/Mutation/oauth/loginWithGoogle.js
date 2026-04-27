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
  try {
    const url = `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${encodeURIComponent(accessToken)}`;
    const res = await fetch(url);
    return res.json();
  } catch (err) {
    throw new Error("Failed to fetch identity from Google. " + err.message);
  }
};

const getScopes = async function (accessToken) {
  try {
    const url = `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${encodeURIComponent(accessToken)}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.scope.split(" ");
  } catch (err) {
    throw new Error("Failed to fetch tokeninfo from Google. " + err.message);
  }
};

export default resolver(handleAuthFromAccessToken);
