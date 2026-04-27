import resolver from "./resolver";
import { ServiceConfiguration } from "meteor/service-configuration";

const handleAuthFromAccessToken = async function ({ code, redirectUri }) {
  const accessToken = await getAccessToken(code, redirectUri);
  const identity = await getIdentity(accessToken);

  const serviceData = {
    ...identity,
    accessToken,
  };

  return {
    serviceName: "linkedin",
    serviceData,
    options: {
      profile: { name: `${identity.firstName} ${identity.lastName}` },
    },
  };
};

const getTokens = function () {
  const result = ServiceConfiguration.configurations.findOne({
    service: "linkedin",
  });
  return {
    client_id: result.clientId,
    client_secret: result.secret,
  };
};

const getAccessToken = async function (code, redirectUri) {
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    ...getTokens(),
  });

  const res = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  const data = await res.json();
  return data.access_token;
};

const getIdentity = async function (accessToken) {
  try {
    const url = `https://www.linkedin.com/v1/people/~:(id,email-address,first-name,last-name,headline)?oauth2_access_token=${encodeURIComponent(accessToken)}&format=json`;
    const res = await fetch(url);
    return res.json();
  } catch (err) {
    throw new Error("Failed to fetch identity from LinkedIn. " + err.message);
  }
};

export default resolver(handleAuthFromAccessToken);
