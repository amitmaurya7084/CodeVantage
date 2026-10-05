const QRCode = require("qrcode");

async function generateVerificationQrCode(certificateId) {
  const baseUrl = process.env.PUBLIC_SITE_URL || "http://localhost:5173";
  const verificationUrl = `${baseUrl}/verify/${certificateId}`;

  const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
    margin: 1,
    width: 300,
    color: { dark: "#0F172A", light: "#FFFFFF" },
  });

  return { verificationUrl, qrCodeDataUrl };
}

module.exports = { generateVerificationQrCode };
