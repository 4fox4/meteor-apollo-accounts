import { Accounts } from "meteor/accounts-base";

export default async function (email) {
  if (!email) return "unknown";
  const user =
    email.indexOf("@") !== -1
      ? await Accounts.findUserByEmail(email)
      : await Accounts.findUserByUsername(email);
  const { services } = user;
  const list = [];
  for (const key in services) {
    if (key === "email") continue;
    if (key === "resume") continue;
    if (key === "password" && !services.password.bcrypt) {
      list.push("no-password");
    } else {
      list.push(key);
    }
  }
  const allowedServices = [...Accounts.oauth.serviceNames(), "password"];
  return list
    .filter((service) => allowedServices.indexOf(service) !== -1)
    .join(", ");
}
