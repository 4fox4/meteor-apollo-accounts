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

  if (!res.ok) {
    throw new Error(
      data?.error_description ||
        data?.error ||
        `Failed to fetch access token from LinkedIn (status ${res.status})`
    );
  }

  if (typeof data?.access_token !== "string" || data.access_token.length === 0) {
    throw new Error("LinkedIn access token response did not include a valid access_token");
  }

  return data.access_token;
};

const getIdentity = async function (accessToken) {
  const url = `https://www.linkedin.com/v1/people/~:(id,email-address,first-name,last-name,headline)?oauth2_access_token=${encodeURIComponent(accessToken)}&format=json`;
  const res = await fetch(url);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(`Failed to fetch identity from LinkedIn (status ${res.status}${data?.message ? `: ${data.message}` : ""})`);
  }
  return res.json();
};

export default resolver(handleAuthFromAccessToken);
