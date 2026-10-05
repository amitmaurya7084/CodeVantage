const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const OUTPUT_DIR = path.join(__dirname, "..", "uploads", "certificates");
const LOGO_PATH = path.join(__dirname, "..", "assets", "logo.png");
const SCRIPT_FONT_PATH = path.join(__dirname, "..", "assets", "fonts", "GreatVibes-Regular.ttf");

function ensureOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

const COLORS = {
  navy: "#0F172A",
  blue: "#2563EB",
  gold: "#C9962B",
  goldLight: "#E4B95B",
  goldDark: "#8F6A1B",
  slate: "#5B6472",
  slateLight: "#94A3B8",
  mountain1: "#B9CBE0",
  mountain2: "#8CA6C4",
};

/**
 * All the TEXT on the certificate that is NOT specific to one candidate.
 * This is the "admin-managed content" half of the template — the Certificate
 * Template Content Management feature reads/writes exactly these fields from
 * the database and passes them in as `content`. Anything left out of a call
 * falls back to these defaults, so the template always renders correctly
 * even before that content has been customized.
 *
 * Everything else about the certificate (border, logo, seal, mountains,
 * corner ribbons, colors, layout, positions) is FIXED — it is drawn by this
 * file's code, not stored as editable content, and is intentionally not
 * exposed to the admin content API.
 */
const DEFAULT_TEMPLATE_CONTENT = {
  heading: "CERTIFICATE OF COMPLETION",
  certifyLabel: "THIS IS TO CERTIFY THAT",
  completionDescription:
    "During this internship, the candidate has worked on real-world projects, demonstrated practical skills, and shown commitment to learning and professional growth.",
  taglineScript: "Turning Ideas into Impact",
  learnBuildGrowText: "LEARN | BUILD | GROW",
  skillsTodayLine1: "SKILLS TODAY",
  skillsTodayLine2: "A BETTER TOMORROW",
  signatureScriptText: "Amit",
  signatureFullName: "Amit Maurya",
  signatureTitle: "Founder, CodeVantage",
  sealBadgeText: "CodeVantage",
  sealSubText1: "LEARN TODAY",
  sealSubText2: "BUILD TOMORROW",
  verifyHeading: "Verify Certificate",
  verifyInstructions: "Scan the QR code or visit",
  verifyUrl: "codevantage.in/verify",
  footerTagline: "REAL PROJECTS  |  REAL SKILLS  |  BRIGHTER TOMORROW",
  techStack: [
    { label: "React", color: "#149ECA" },
    { label: "Node.js", color: "#3C873A" },
    { label: "MongoDB", color: "#13AA52" },
    { label: "Express.js", color: "#5B6472" },
    { label: "Tailwind CSS", color: "#38BDF8" },
    { label: "Git & GitHub", color: "#E24329" },
  ],
};

function letterSpaced(text) {
  return text.split("").join(" ");
}

function cornerRibbon(doc, W, H) {
  // Sized to stay clear of the logo (top-left) and the verify/certificate-ID
  // text block (bottom-right) — checked against their actual positions below.
  doc.save();
  doc.polygon([0, 0], [108, 0], [0, 108]).fill(COLORS.navy);
  doc.polygon([0, 0], [82, 0], [0, 82]).fill(COLORS.gold);
  doc.polygon([0, 0], [55, 0], [0, 55]).fill(COLORS.navy);
  doc.restore();

  doc.save();
  doc.polygon([W, H], [W - 108, H], [W, H - 108]).fill(COLORS.navy);
  doc.polygon([W, H], [W - 82, H], [W, H - 82]).fill(COLORS.gold);
  doc.polygon([W, H], [W - 55, H], [W, H - 55]).fill(COLORS.navy);
  doc.restore();
}

function doubleBorder(doc, W, H) {
  const o = 18;
  doc.lineWidth(1.4).strokeColor(COLORS.gold).rect(o, o, W - o * 2, H - o * 2).stroke();
  const i = 25;
  doc.lineWidth(0.8).strokeColor(COLORS.navy).rect(i, i, W - i * 2, H - i * 2).stroke();
}

function mountains(doc, x, y) {
  doc.save();
  doc.opacity(0.55);
  doc.polygon([x, y], [x + 70, y - 60], [x + 140, y]).fill(COLORS.mountain2);
  doc.polygon([x + 45, y], [x + 105, y - 85], [x + 175, y]).fill(COLORS.mountain1);
  doc.opacity(0.9);
  doc.polygon([x + 60, y - 45], [x + 70, y - 60], [x + 80, y - 45], [x + 70, y - 50]).fill("#FFFFFF");
  doc.polygon([x + 95, y - 70], [x + 105, y - 85], [x + 115, y - 70], [x + 105, y - 75]).fill("#FFFFFF");
  doc.opacity(1);
  doc.restore();
}

function star(doc, r) {
  const spikes = 5;
  const outerR = r;
  const innerR = r * 0.45;
  let rot = (Math.PI / 2) * 3;
  const step = Math.PI / spikes;
  const pts = [];
  for (let i = 0; i < spikes; i++) {
    pts.push([Math.cos(rot) * outerR, Math.sin(rot) * outerR]);
    rot += step;
    pts.push([Math.cos(rot) * innerR, Math.sin(rot) * innerR]);
    rot += step;
  }
  doc.polygon(...pts).fill(COLORS.goldLight);
}

function sealBadge(doc, cx, cy, r, content) {
  doc.save();
  doc.translate(cx, cy);
  const points = 18;
  const outerR = r;
  const innerR = r - 7;
  const pts = [];
  for (let i = 0; i < points * 2; i++) {
    const rad = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI * i) / points;
    pts.push([Math.cos(angle) * rad, Math.sin(angle) * rad]);
  }
  doc.polygon(...pts).fill(COLORS.gold);
  doc.restore();

  doc.circle(cx, cy, r - 13).fill(COLORS.navy);
  doc.circle(cx, cy, r - 13).lineWidth(1.5).strokeColor(COLORS.goldLight).stroke();

  doc.save();
  doc.translate(cx, cy - 20);
  const s = 8;
  doc.polygon([0, -s], [s, 0], [0, s], [-s, 0]).fill(COLORS.goldLight);
  doc.restore();

  doc.font("Helvetica-Bold").fontSize(11).fillColor("#FFFFFF").text(content.sealBadgeText, cx - 45, cy - 5, { width: 90, align: "center" });
  doc.font("Helvetica").fontSize(5.5).fillColor(COLORS.goldLight);
  doc.text(content.sealSubText1, cx - 45, cy + 10, { width: 90, align: "center" });
  doc.text(content.sealSubText2, cx - 45, cy + 18, { width: 90, align: "center" });

  for (let i = -1; i <= 1; i++) {
    doc.save();
    doc.translate(cx + i * 12, cy + 30);
    star(doc, 3.2);
    doc.restore();
  }

  doc.moveTo(cx - 14, cy + r - 16).lineTo(cx - 22, cy + r + 46).lineTo(cx - 3, cy + r + 28).closePath().fill(COLORS.navy);
  doc.moveTo(cx + 14, cy + r - 16).lineTo(cx + 22, cy + r + 46).lineTo(cx + 3, cy + r + 28).closePath().fill(COLORS.goldDark);
}

/**
 * Maps a tech-badge label to a hand-drawn icon "shape" — matches the icon
 * style used on the reference certificate design (React's atom, Node's
 * hexagon, MongoDB's leaf, etc.) instead of a plain dot. Matching is by
 * substring so admin-renamed labels still resolve (e.g. "ReactJS"). Any
 * label that doesn't match a known tech falls back to a plain colored dot
 * — this keeps badges working for any custom tech an admin adds later.
 */
function techIconType(label) {
  const l = label.toLowerCase();
  if (l.includes("react")) return "react";
  if (l.includes("node")) return "hexagon";
  if (l.includes("mongo")) return "leaf";
  if (l.includes("express")) return "monogram";
  if (l.includes("tailwind")) return "wave";
  if (l.includes("git")) return "diamond";
  return null;
}

/** Draws one small tech-badge icon, centered at (cx, cy), roughly r in size. */
function techIcon(doc, type, cx, cy, r, color) {
  doc.save();
  if (type === "react") {
    // Atom symbol: a small nucleus dot + 3 elliptical orbits rotated 60° apart.
    doc.circle(cx, cy, r * 0.28).fill(color);
    doc.lineWidth(0.9).strokeColor(color);
    for (let i = 0; i < 3; i++) {
      doc.save();
      doc.rotate(60 * i, { origin: [cx, cy] });
      doc.ellipse(cx, cy, r, r * 0.4).stroke();
      doc.restore();
    }
  } else if (type === "hexagon") {
    // Node.js: a simple filled hexagon silhouette.
    const pts = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      pts.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
    }
    doc.polygon(...pts).fill(color);
  } else if (type === "leaf") {
    // MongoDB: a leaf/droplet shape with a center vein line.
    doc
      .moveTo(cx, cy - r)
      .bezierCurveTo(cx + r * 0.85, cy - r * 0.35, cx + r * 0.85, cy + r * 0.35, cx, cy + r)
      .bezierCurveTo(cx - r * 0.85, cy + r * 0.35, cx - r * 0.85, cy - r * 0.35, cx, cy - r)
      .closePath()
      .fill(color);
    doc.strokeColor("#FFFFFF").lineWidth(0.6).moveTo(cx, cy - r * 0.75).lineTo(cx, cy + r * 0.8).stroke();
  } else if (type === "monogram") {
    // Express.js: lowercase monogram in a filled circle (matches the
    // reference design, since Express's own mark is a plain wordmark).
    doc.circle(cx, cy, r).fill(color);
    doc
      .fillColor("#FFFFFF")
      .font("Helvetica-Bold")
      .fontSize(r * 1.05)
      .text("ex", cx - r, cy - r * 0.52, { width: r * 2, align: "center" });
  } else if (type === "wave") {
    // Tailwind CSS: two stacked interlocking wave shapes.
    const w = r * 1.9;
    doc.save();
    doc.translate(cx - w / 2, cy - r * 0.35);
    doc
      .moveTo(0, r * 0.35)
      .bezierCurveTo(w * 0.1, -r * 0.3, w * 0.4, -r * 0.3, w * 0.5, r * 0.05)
      .bezierCurveTo(w * 0.6, r * 0.35, w * 0.9, r * 0.35, w, -r * 0.05)
      .bezierCurveTo(w * 0.9, r * 0.5, w * 0.6, r * 0.5, w * 0.5, r * 0.2)
      .bezierCurveTo(w * 0.4, -r * 0.1, w * 0.1, -r * 0.1, 0, r * 0.35)
      .closePath()
      .fill(color);
    doc.restore();
    doc.save();
    doc.translate(cx - w / 2, cy + r * 0.35);
    doc
      .moveTo(0, r * 0.35)
      .bezierCurveTo(w * 0.1, -r * 0.3, w * 0.4, -r * 0.3, w * 0.5, r * 0.05)
      .bezierCurveTo(w * 0.6, r * 0.35, w * 0.9, r * 0.35, w, -r * 0.05)
      .bezierCurveTo(w * 0.9, r * 0.5, w * 0.6, r * 0.5, w * 0.5, r * 0.2)
      .bezierCurveTo(w * 0.4, -r * 0.1, w * 0.1, -r * 0.1, 0, r * 0.35)
      .closePath()
      .fillOpacity(0.6)
      .fill(color);
    doc.fillOpacity(1);
    doc.restore();
  } else if (type === "diamond") {
    // Git & GitHub: a rotated square (matches the reference design's mark).
    doc.save();
    doc.rotate(45, { origin: [cx, cy] });
    doc.rect(cx - r * 0.7, cy - r * 0.7, r * 1.4, r * 1.4).fill(color);
    doc.restore();
  } else {
    doc.circle(cx, cy, r * 0.9).fill(color);
  }
  doc.restore();
}

function techBadge(doc, x, y, label, color) {
  doc.font("Helvetica-Bold").fontSize(8.5);
  const textW = doc.widthOfString(label);
  const w = textW + 8 * 2 + 16;
  doc.roundedRect(x, y, w, 22, 11).fillOpacity(0.08).fillAndStroke(color, color);
  doc.fillOpacity(1);
  techIcon(doc, techIconType(label), x + 14, y + 11, 5.5, color);
  doc.fillColor(COLORS.navy).text(label, x + 22, y + 6.5, { width: textW + 10 });
  return w;
}

/**
 * Renders the certificate PDF to disk and returns its file path.
 *
 * `content` carries the admin-editable text (see DEFAULT_TEMPLATE_CONTENT);
 * any field left out uses its default, so this always renders correctly on
 * its own. Everything else (candidateData below) is per-certificate data
 * that is never stored as "content" — it comes from the student/payment
 * records at generation time.
 *
 * No government/ISO/accreditation logos are ever added — CodeVantage holds
 * no such accreditation, per the platform's own content policy.
 */
function generateCertificatePdf({
  certificateId,
  studentName,
  programName,
  durationLabel,
  completionDate,
  qrCodeDataUrl,
  content: contentOverrides,
  outputPath,
}) {
  ensureOutputDir();
  const content = { ...DEFAULT_TEMPLATE_CONTENT, ...contentOverrides };
  const filePath = outputPath || path.join(OUTPUT_DIR, `${certificateId}.pdf`);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ layout: "landscape", size: "A4", margin: 0 });
    if (fs.existsSync(SCRIPT_FONT_PATH)) {
      doc.registerFont("Script", SCRIPT_FONT_PATH);
    }
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const W = doc.page.width;
    const H = doc.page.height;

    doc.rect(0, 0, W, H).fill("#FFFFFF");
    cornerRibbon(doc, W, H);
    doubleBorder(doc, W, H);

    // Header — logo + fixed tagline (branding: never editable)
    if (fs.existsSync(LOGO_PATH)) {
      doc.image(LOGO_PATH, 66, 48, { width: 175 });
    } else {
      doc.font("Helvetica-Bold").fontSize(22).fillColor(COLORS.navy).text("CodeVantage", 66, 55);
    }
    doc.font("Helvetica").fontSize(9).fillColor(COLORS.navy).text(letterSpaced(content.learnBuildGrowText), 68, 90);

    doc.font("Helvetica-Bold").fontSize(9).fillColor(COLORS.navy);
    doc.text(content.skillsTodayLine1, W - 260, 48, { width: 196, align: "right" });
    doc.text(content.skillsTodayLine2, W - 260, 60, { width: 196, align: "right" });
    doc.moveTo(W - 130, 76).lineTo(W - 64, 76).strokeColor(COLORS.gold).lineWidth(1).stroke();

    // Title
    doc.font("Times-Bold").fontSize(34).fillColor(COLORS.navy).text(content.heading, 0, 110, { align: "center" });

    const certifyText = letterSpaced(content.certifyLabel);
    doc.font("Helvetica").fontSize(10).fillColor(COLORS.slate);
    const certifyW = doc.widthOfString(certifyText);
    doc.text(certifyText, 0, 158, { align: "center" });
    doc.moveTo(W / 2 - certifyW / 2 - 60, 163).lineTo(W / 2 - certifyW / 2 - 15, 163).strokeColor(COLORS.gold).lineWidth(1).stroke();
    doc.moveTo(W / 2 + certifyW / 2 + 15, 163).lineTo(W / 2 + certifyW / 2 + 60, 163).strokeColor(COLORS.gold).lineWidth(1).stroke();

    // Candidate name (dynamic, per-certificate)
    doc.font("Times-Bold").fontSize(36).fillColor(COLORS.navy).text(studentName, 0, 178, { align: "center" });
    doc.moveTo(W / 2 - 110, 228).lineTo(W / 2 + 110, 228).strokeColor(COLORS.gold).lineWidth(1).stroke();

    // Program (dynamic)
    doc.font("Helvetica").fontSize(12).fillColor(COLORS.slate).text("has successfully completed the", 0, 240, { align: "center" });
    // Matches the reference design's phrasing ("Web Development Internship
    // Program") — no duration prefix. `durationLabel` is still accepted and
    // stored on the certificate record, just not shown in this sentence.
    doc
      .font("Helvetica-Bold")
      .fontSize(19)
      .fillColor(COLORS.blue)
      .text(`${programName} Internship Program`, 0, 259, { align: "center" });
    doc.font("Helvetica-Bold").fontSize(12).fillColor(COLORS.navy).text("at CodeVantage", 0, 283, { align: "center" });

    // Completion description (admin content)
    doc
      .font("Helvetica")
      .fontSize(10.5)
      .fillColor(COLORS.slate)
      .text(content.completionDescription, 190, 308, { align: "center", width: W - 380, lineGap: 3 });

    // Script tagline (admin content)
    doc.save();
    doc.rotate(-8, { origin: [155, 320] });
    if (fs.existsSync(SCRIPT_FONT_PATH)) {
      doc.font("Script").fontSize(26).fillColor(COLORS.navy);
      const lines = content.taglineScript.split(" ");
      // Wrap into up to 3 short stacked lines for the available space.
      const mid = Math.ceil(lines.length / 2);
      const l1 = lines.slice(0, 1).join(" ");
      const l2 = lines.slice(1, lines.length - 1).join(" ");
      const l3 = lines.slice(lines.length - 1).join(" ");
      doc.text(l1, 90, 290);
      if (l2) doc.text(l2, 90, 315);
      doc.text(l3, 100, l2 ? 345 : 315);
    }
    doc.moveTo(95, 385).lineTo(210, 375).strokeColor(COLORS.blue).lineWidth(1.3).stroke();
    doc.restore();

    // Mountains + fixed tagline (branding: never editable)
    mountains(doc, 70, H - 130);
    doc.font("Helvetica-Bold").fontSize(8).fillColor(COLORS.navy);
    const lbg = content.learnBuildGrowText.split("|").map((s) => s.trim());
    lbg.slice(0, 3).forEach((word, idx) => {
      doc.text(letterSpaced(word), 68, H - 108 + idx * 12);
    });

    // Issue date (dynamic)
    doc.font("Helvetica").fontSize(8.5).fillColor(COLORS.slate).text("Issue Date", 68, H - 62);
    doc
      .font("Helvetica-Bold")
      .fontSize(10.5)
      .fillColor(COLORS.navy)
      .text(new Date(completionDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }), 68, H - 50);

    // Signature (admin content — who signs every certificate)
    const sigX = W / 2 - 90;
    if (fs.existsSync(SCRIPT_FONT_PATH)) {
      doc.font("Script").fontSize(30).fillColor(COLORS.navy).text(content.signatureScriptText, sigX, H - 145, { width: 180, align: "center" });
    }
    doc.moveTo(sigX + 15, H - 100).lineTo(sigX + 165, H - 100).strokeColor(COLORS.slateLight).lineWidth(1).stroke();
    doc.font("Helvetica-Bold").fontSize(10).fillColor(COLORS.navy).text(content.signatureFullName, sigX, H - 92, { width: 180, align: "center" });
    doc.font("Helvetica").fontSize(8.5).fillColor(COLORS.slate).text(content.signatureTitle, sigX, H - 78, { width: 180, align: "center" });

    // Seal badge (branding: never editable, except its 3 short text lines above)
    // r=72 (was 58) for closer visual weight to the reference design — still
    // clears the inner border on the right and the verify box below it.
    sealBadge(doc, W - 128, 250, 72, content);

    // Verify box (admin content + dynamic certificate ID / QR)
    const qrSize = 68;
    const qrX = W - 250;
    const qrY = H - 165;
    if (qrCodeDataUrl) {
      const base64 = qrCodeDataUrl.replace(/^data:image\/png;base64,/, "");
      doc.image(Buffer.from(base64, "base64"), qrX, qrY, { width: qrSize });
    }
    doc.font("Helvetica-Bold").fontSize(9.5).fillColor(COLORS.navy).text(content.verifyHeading, qrX + qrSize + 12, qrY);
    doc.font("Helvetica").fontSize(7.5).fillColor(COLORS.slate).text(content.verifyInstructions, qrX + qrSize + 12, qrY + 14, { width: 120 });
    doc.text(content.verifyUrl, qrX + qrSize + 12, qrY + 24, { width: 120 });
    doc.font("Helvetica").fontSize(7.5).fillColor(COLORS.slate).text("Certificate ID", qrX + qrSize + 12, qrY + 42);
    doc.font("Helvetica-Bold").fontSize(9.5).fillColor(COLORS.navy).text(certificateId, qrX + qrSize + 12, qrY + 52);

    // Tech stack badges (admin content — falls back to the program's own
    // technologies list if the caller doesn't override it; see certificateController)
    const techs = content.techStack || [];
    doc.font("Helvetica-Bold").fontSize(8.5);
    const widths = techs.map((t) => doc.widthOfString(t.label) + 8 * 2 + 16);
    const totalW = widths.reduce((a, b) => a + b, 0) + Math.max(0, techs.length - 1) * 14;
    let tx = (W - totalW) / 2;
    const badgeY = H - 60;
    techs.forEach((t) => {
      const w = techBadge(doc, tx, badgeY, t.label, t.color);
      tx += w + 14;
    });

    // Footer tagline (admin content)
    doc.font("Helvetica-Bold").fontSize(8).fillColor(COLORS.navy);
    doc.text(letterSpaced(content.footerTagline), 0, H - 20, { align: "center" });

    doc.end();
    stream.on("finish", () => resolve(filePath));
    stream.on("error", reject);
  });
}

module.exports = { generateCertificatePdf, DEFAULT_TEMPLATE_CONTENT, OUTPUT_DIR };
