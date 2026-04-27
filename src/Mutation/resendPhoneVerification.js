import callMethod from "../callMethod";

export default async function (root, options, context) {
  if (!options.phone) {
    throw new Error("Phone number is required");
  }

  await callMethod(context, "requestPhoneVerification", options.phone);

  return {
    success: true,
  };
}
