import resolver from "./resolver";

const handleAuthFromAccessToken = async function ({ accessToken }) {
  const identity = await getIdentity(accessToken);

  const serviceData = {
    ...identity,
    accessToken,
  };

  return {
    serviceName: "facebook",
    serviceData,
    options: { profile: { name: identity.name } },
  };
};

const getIdentity = async function (accessToken) {
  const fields = ["id", "email", "name", "first_name", "last_name", "link", "gender", "locale", "age_range"];
  const url = `https://graph.facebook.com/v2.8/me?access_token=${encodeURIComponent(accessToken)}&fields=${fields.join(",")}`;
  const res = await fetch(url);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(`Failed to fetch identity from Facebook (status ${res.status}${data?.error?.message ? `: ${data.error.message}` : ""})`);
  }
  return res.json();
};

export default resolver(handleAuthFromAccessToken);
