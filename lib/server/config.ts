export function enquiryConfig() {
  const configured = [
    "OPERATING_ENTITY_NAME",
    "OPERATING_ENTITY_ADDRESS",
    "PRIVACY_CONTACT",
    "PRIVACY_NOTICE_VERSION",
    "ENQUIRY_OWNER",
    "ENQUIRY_DELIVERY_URL",
    "ENQUIRY_DELIVERY_SECRET",
    "RATE_LIMIT_SECRET",
  ].every((k) => !!process.env[k]?.trim());
  const enabled =
    process.env.ENQUIRIES_ENABLED === "true" &&
    configured &&
    process.env.ENQUIRY_DELIVERY_URL?.startsWith("https://") === true;
  return {
    enabled,
    privacyVersion: enabled
      ? process.env.PRIVACY_NOTICE_VERSION!
      : "preview-not-approved",
    privacyContact: enabled ? process.env.PRIVACY_CONTACT! : "",
  };
}
