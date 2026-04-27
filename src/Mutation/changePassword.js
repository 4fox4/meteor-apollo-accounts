import callMethod from "../callMethod";

export default async function (root, { oldPassword, newPassword }, context) {
  return await callMethod(context, "changePassword", oldPassword, newPassword);
}
