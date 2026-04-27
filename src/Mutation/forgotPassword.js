import callMethod from "../callMethod";

export default async function (root, { email }, context) {
  await callMethod(context, "forgotPassword", { email });
  return {
    success: true,
  };
}
