import { Accounts } from "meteor/accounts-base";

export default async function (root, options, context) {
  if (!options.phone) {
    throw new Error("Phone number is required");
  }

  const userId = await Accounts.createUserWithPhone(options);
  if (userId) {
    await Accounts.sendPhoneVerificationCode(userId, options.phone);
  }
  return { success: !!userId };
}
