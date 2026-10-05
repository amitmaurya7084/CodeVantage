const REQUIRED_VARS = ["MONGO_URI", "JWT_SECRET", "ADMIN_JWT_SECRET"];

const RECOMMENDED_VARS = [
  "BREVO_API_KEY",
  "MAIL_FROM_EMAIL",
  "PUBLIC_SITE_URL",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

/**
 * Checks required env vars on boot. Missing required vars stop the server
 * immediately with a clear message — far easier to debug than a cryptic
 * runtime error the first time a route touches the DB or signs a token.
 * Missing recommended vars only warn, since those features (payments, email)
 * degrade gracefully instead of crashing.
 */
function validateEnv() {
  const missingRequired = REQUIRED_VARS.filter((key) => !process.env[key]);

  if (missingRequired.length > 0) {
    console.error("Missing required environment variables:", missingRequired.join(", "));
    console.error("Copy server/.env.example to server/.env and fill these in before starting.");
    process.exit(1);
  }

  const missingRecommended = RECOMMENDED_VARS.filter((key) => !process.env[key]);
  if (missingRecommended.length > 0) {
    console.warn(
      `Note: ${missingRecommended.join(", ")} not set — related features (email/uploads) will be skipped.`
    );
  }
}

module.exports = validateEnv;
