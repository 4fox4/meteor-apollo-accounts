import callMethod from "../callMethod";

export default async function (root, { token }, context) {
  return await callMethod(context, "verifyEmail", token);
}
