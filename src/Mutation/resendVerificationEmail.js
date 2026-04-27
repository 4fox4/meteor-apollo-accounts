import { Accounts } from "meteor/accounts-base";

export default async function (root, { email }, { userId }) {
  await Accounts.sendVerificationEmail(userId, email);
  return {
    success: true,
  };
}
