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
  navyMid: "#0F2A66",
  navyDeep: "#0A1F4D",
  blue: "#2563EB",
  gold: "#C9962B",
  goldLight: "#E4B95B",
  goldPale: "#F3D58A",
  goldDark: "#8F6A1B",
  slate: "#5B6472",
  slateLight: "#94A3B8",
  text: "#1E293B",
  hairline: "#E2E8F0",
  mountain1: "#C9D8EC",
  mountain2: "#DCE7F5",
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

/**
 * Returns the largest font size (<= startSize, >= minSize) at which `text` fits
 * inside `maxWidth`. Long student names / program names would otherwise wrap onto
 * a second line and collide with the seal badge and the text below them.
 */
function fitFontSize(doc, text, fontName, startSize, minSize, maxWidth) {
  let size = startSize;
  doc.font(fontName);
  while (size > minSize) {
    doc.fontSize(size);
    if (doc.widthOfString(text) <= maxWidth) break;
    size -= 0.5;
  }
  return size;
}

/* ---------------------------------------------------------------------------
   Small text helpers
   Every line is drawn WITHOUT a `width` option (so pdfkit never wraps it) and
   positioned by hand — in this pdfkit version `lineBreak: false` does not stop
   wrapping when a width is given.
   --------------------------------------------------------------------------- */

function ascenderOf(doc) {
  return (doc._font && doc._font.ascender) || 718;
}

/** One line of text whose visual centre sits on `cy`. `align`: center | left | right (around / from `x`). */
function drawText(doc, text, x, cy, { font, size, color, spacing = 0, align = "center", lift = 0.36 }) {
  doc.font(font).fontSize(size).fillColor(color);
  const w = doc.widthOfString(text, { characterSpacing: spacing });
  const left = align === "center" ? x - w / 2 : align === "right" ? x - w : x;
  doc.text(text, left, cy - size * lift, { lineBreak: false, characterSpacing: spacing });
  return w;
}

/** One line of text whose baseline sits on `baseline` (used for the script text and the seal). */
function drawTextOnBaseline(doc, text, x, baseline, { font, size, color, spacing = 0, align = "center" }) {
  doc.font(font).fontSize(size).fillColor(color);
  const w = doc.widthOfString(text, { characterSpacing: spacing });
  const left = align === "center" ? x - w / 2 : align === "right" ? x - w : x;
  doc.text(text, left, baseline - (ascenderOf(doc) / 1000) * size, { lineBreak: false, characterSpacing: spacing });
  return w;
}

/** Greedy word-wrap using the current font/size. */
function wrapLines(doc, text, maxWidth, spacing = 0) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  words.forEach((word) => {
    const test = line ? `${line} ${word}` : word;
    if (line && doc.widthOfString(test, { characterSpacing: spacing }) > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  });
  if (line) lines.push(line);
  return lines;
}

/** "LEARN | BUILD | GROW" -> "Learn | Build | Grow" (the header lock-up uses mixed case). */
function toTitleCase(text) {
  return String(text)
    .toLowerCase()
    .replace(/(^|[\s|])([a-z])/g, (m, pre, ch) => pre + ch.toUpperCase());
}

/* ---------------------------------------------------------------------------
   Fixed artwork
   --------------------------------------------------------------------------- */

function cornerRibbon(doc, W, H) {
  // Blue gradient band with a fine gold edge, top-left and (rotated) bottom-right.
  // Sized to stay clear of the logo (top-left) and the verify/certificate-ID
  // text block (bottom-right).
  const S = W * 0.168;
  const draw = () => {
    doc.polygon([0, 0], [S, 0], [0, S]).fill(COLORS.gold);
    doc.polygon([0, 0], [S * 0.97, 0], [0, S * 0.97]).fill("#FFFFFF");
    const band = doc.linearGradient(0, 0, S * 0.77, S * 0.77);
    band.stop(0, "#0A2259").stop(0.6, "#1740A8").stop(1, "#2563EB");
    doc.polygon([0, 0], [S * 0.77, 0], [0, S * 0.77]).fill(band);
    doc
      .polygon([0, S * 0.8], [S * 0.8, 0], [S * 0.85, 0], [0, S * 0.85])
      .fill(COLORS.gold);
  };

  doc.save();
  draw();
  doc.restore();

  doc.save();
  doc.translate(W, H);
  doc.rotate(180);
  draw();
  doc.restore();
}

function doubleBorder(doc, W, H) {
  // Thin navy line outside, fine gold line inside.
  const o = 8.5;
  doc.lineWidth(1.3).strokeColor(COLORS.navy).rect(o, o, W - o * 2, H - o * 2).stroke();
  const i = 18.5;
  doc.lineWidth(0.8).strokeColor(COLORS.goldLight).rect(i, i, W - i * 2, H - i * 2).stroke();
}

/** Faint two-peak mountain range (bottom-left). Drawn inside a 400x180 box scaled to `w`. */
function mountains(doc, x, y, w) {
  doc.save();
  doc.translate(x, y);
  doc.scale(w / 400);
  doc.opacity(0.6);
  doc.polygon([0, 180], [110, 30], [250, 180]).fill(COLORS.mountain1);
  doc.polygon([110, 30], [82, 72], [104, 64], [126, 78]).fill("#FFFFFF");
  doc.polygon([130, 180], [255, 62], [400, 180]).fill(COLORS.mountain2);
  doc.polygon([255, 62], [232, 96], [252, 90], [272, 100]).fill("#FFFFFF");
  doc.restore();
}

/** Very faint leaf watermark (bottom-right). Drawn inside an 80x120 box scaled to `w`. */
function leafWatermark(doc, x, y, w) {
  doc.save();
  doc.translate(x, y);
  doc.scale(w / 80);
  doc.opacity(0.4);
  [
    [42, 30, 16, 28, 20],
    [22, 72, 13, 24, -25],
    [54, 84, 12, 22, 25],
  ].forEach(([cx, cy, rx, ry, rot]) => {
    doc.save();
    doc.rotate(rot, { origin: [cx, cy] });
    doc.ellipse(cx, cy, rx, ry).fill(COLORS.mountain2);
    doc.restore();
  });
  doc.restore();
}

function star(doc, cx, cy, r, color) {
  const spikes = 5;
  const outerR = r;
  const innerR = r * 0.45;
  let rot = (Math.PI / 2) * 3;
  const step = Math.PI / spikes;
  const pts = [];
  for (let i = 0; i < spikes; i++) {
    pts.push([cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR]);
    rot += step;
    pts.push([cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR]);
    rot += step;
  }
  doc.polygon(...pts).fill(color);
}

/**
 * Seal badge: gold scalloped rim, navy medal, laurel wreath, diamond mark,
 * three short text lines, stars and two ribbon tails. Drawn in a local
 * coordinate system centred on the medal (outer rim radius = 54 units) and
 * scaled so that the rim has radius `r` on the page.
 */
function sealBadge(doc, cx, cy, r, content) {
  doc.save();
  doc.translate(cx, cy);
  doc.scale(r / 54);

  // Ribbon tails (behind the medal)
  doc
    .lineWidth(1.2)
    .polygon([-16, 37], [4, 43], [-6, 85], [-17, 74], [-28, 95])
    .fillAndStroke(COLORS.navyMid, COLORS.gold);
  doc
    .lineWidth(1.2)
    .polygon([16, 37], [-4, 43], [6, 85], [17, 74], [28, 95])
    .fillAndStroke(COLORS.navyDeep, COLORS.gold);

  // Scalloped gold rim
  const rim = doc.linearGradient(-54, -54, 54, 54);
  rim.stop(0, COLORS.goldPale).stop(0.5, COLORS.gold).stop(1, COLORS.goldDark);
  const spikes = 30;
  const rimPts = [];
  for (let i = 0; i < spikes * 2; i++) {
    const rad = i % 2 === 0 ? 54 : 48;
    const angle = (Math.PI / spikes) * i - Math.PI / 2;
    rimPts.push([Math.cos(angle) * rad, Math.sin(angle) * rad]);
  }
  doc.polygon(...rimPts).fill(rim);
  doc.lineWidth(1).strokeColor(COLORS.goldPale).circle(0, 0, 43).stroke();

  // Navy medal
  doc.lineWidth(2).circle(0, 0, 40).fillAndStroke(COLORS.navy, COLORS.goldLight);

  // Laurel wreath: two branches of small leaves following the medal edge
  const laurel = (from, to, count) => {
    for (let i = 0; i < count; i++) {
      const t = from + ((to - from) * i) / (count - 1);
      const rad = (t * Math.PI) / 180;
      doc.save();
      doc.translate(Math.cos(rad) * 34, Math.sin(rad) * 34);
      doc.rotate(t);
      doc.ellipse(0, 0, 1.5, 3.6).fill(COLORS.goldLight);
      doc.restore();
    }
  };
  laurel(105, 255, 8);
  laurel(75, -75, 8);

  // Diamond mark
  doc.polygon([0, -35], [10, -25], [0, -15], [-10, -25]).fill(COLORS.blue);
  doc.save();
  doc.opacity(0.9);
  doc.polygon([0, -30], [5, -25], [0, -20], [-5, -25]).fill("#FFFFFF");
  doc.restore();

  // Text lines (shrunk if an admin enters something long)
  const nameSize = fitFontSize(doc, content.sealBadgeText, "Helvetica-Bold", 9, 5, 62);
  drawTextOnBaseline(doc, content.sealBadgeText, 0, -3, {
    font: "Helvetica-Bold",
    size: nameSize,
    color: "#FFFFFF",
  });
  const sub1 = fitFontSize(doc, content.sealSubText1, "Helvetica", 5, 3, 58);
  drawTextOnBaseline(doc, content.sealSubText1, 0, 8, { font: "Helvetica", size: sub1, color: "#F1F5FF" });
  const sub2 = fitFontSize(doc, content.sealSubText2, "Helvetica", 5, 3, 58);
  drawTextOnBaseline(doc, content.sealSubText2, 0, 15.5, { font: "Helvetica", size: sub2, color: "#F1F5FF" });

  // Stars
  for (let i = -1; i <= 1; i++) {
    star(doc, i * 9, 24, 2.4, COLORS.goldLight);
  }

  doc.restore();
}

/** Small calendar glyph (navy), drawn inside a 20x20 box scaled to `size`. */
function calendarIcon(doc, x, y, size) {
  doc.save();
  doc.translate(x, y);
  doc.scale(size / 20);
  doc.roundedRect(2, 4, 16, 14, 1.8).fill(COLORS.navyMid);
  doc.roundedRect(2, 7.5, 16, 10.5, 1.2).fill("#FFFFFF");
  doc.lineWidth(1.6).lineCap("round").strokeColor(COLORS.navyMid);
  doc.moveTo(6, 2).lineTo(6, 5.5).stroke();
  doc.moveTo(14, 2).lineTo(14, 5.5).stroke();
  [4.5, 8, 11.5].forEach((cx) => {
    [9.5, 13].forEach((cy) => {
      doc.rect(cx, cy, 2, 1.8).fill(COLORS.navyMid);
    });
  });
  doc.restore();
}

/** Stand-in wordmark, only used if assets/logo.png is missing. Returns the height it used. */
function fallbackLogo(doc, x, y) {
  const s = 15;
  doc.polygon([x + s, y], [x + s * 2, y + s], [x + s, y + s * 2], [x, y + s]).fill(COLORS.navyMid);
  doc.polygon([x + s, y + 6], [x + s + 9, y + s], [x + s, y + s * 2 - 6], [x + s - 9, y + s]).fill(COLORS.blue);
  doc.font("Helvetica-Bold").fontSize(26);
  const codeW = doc.widthOfString("Code");
  doc.fillColor(COLORS.navy).text("Code", x + s * 2 + 8, y + 5, { lineBreak: false });
  doc.fillColor(COLORS.blue).text("Vantage", x + s * 2 + 8 + codeW, y + 5, { lineBreak: false });
  return s * 2;
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
    doc.circle(cx, cy, r * 0.2).fill(color);
    doc.lineWidth(Math.max(0.8, r * 0.11)).strokeColor(color);
    for (let i = 0; i < 3; i++) {
      doc.save();
      doc.rotate(60 * i, { origin: [cx, cy] });
      doc.ellipse(cx, cy, r, r * 0.4).stroke();
      doc.restore();
    }
  } else if (type === "hexagon") {
    // Node.js: hexagon outline with "JS" inside.
    const pts = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      pts.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
    }
    doc.lineWidth(r * 0.2).polygon(...pts).fillAndStroke("#FFFFFF", color);
    doc.font("Helvetica-Bold").fontSize(r * 0.78).fillColor(color);
    const jsW = doc.widthOfString("JS");
    doc.text("JS", cx - jsW / 2, cy - r * 0.78 * 0.36, { lineBreak: false });
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
    doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(r * 0.95);
    const exW = doc.widthOfString("ex");
    doc.text("ex", cx - exW / 2, cy - r * 0.95 * 0.46, { lineBreak: false });
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
    // Git & GitHub: a rotated square with a small branch mark inside.
    doc.save();
    doc.rotate(45, { origin: [cx, cy] });
    doc.rect(cx - r * 0.7, cy - r * 0.7, r * 1.4, r * 1.4).fill(color);
    doc.restore();
    doc.circle(cx, cy - r * 0.32, r * 0.14).fill("#FFFFFF");
    doc.circle(cx, cy + r * 0.32, r * 0.14).fill("#FFFFFF");
    doc.lineWidth(r * 0.1).strokeColor("#FFFFFF").moveTo(cx, cy - r * 0.32).lineTo(cx, cy + r * 0.32).stroke();
  } else {
    doc.circle(cx, cy, r * 0.9).fill(color);
  }
  doc.restore();
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
    const cx = W / 2;
    // The layout below was measured on a 1536 x 1024 reference image;
    // X() / Y() convert those pixel positions to page points.
    const X = (px) => (px / 1536) * W;
    const Y = (py) => (py / 1024) * H;

    // Background (white to pale blue) + faint artwork
    const bg = doc.linearGradient(0, 0, 0, H);
    bg.stop(0, "#FFFFFF").stop(1, "#F4F8FF");
    doc.rect(0, 0, W, H).fill(bg);
    mountains(doc, X(23), Y(502), W * 0.27);
    leafWatermark(doc, W * 0.929, H * 0.56, W * 0.055);

    // Frame + corner ribbons
    doubleBorder(doc, W, H);
    cornerRibbon(doc, W, H);

    // Header — logo + fixed tagline (branding: never editable)
    const logoX = X(178);
    const logoY = Y(65);
    const logoW = W * 0.28;
    let logoBottom;
    if (fs.existsSync(LOGO_PATH)) {
      const logoImg = doc.openImage(LOGO_PATH);
      logoBottom = logoY + (logoImg.height / logoImg.width) * logoW;
      doc.image(logoImg, logoX, logoY, { width: logoW });
    } else {
      logoBottom = logoY + fallbackLogo(doc, logoX, logoY);
    }
    drawText(doc, toTitleCase(content.learnBuildGrowText), logoX + logoW * 0.255, logoBottom - 3, {
      font: "Helvetica",
      size: 9.5,
      color: COLORS.navy,
      spacing: 4.2,
      align: "left",
    });

    // Top-right slogan (blue, tracked) with a gold rule under it
    doc.font("Helvetica").fontSize(8);
    const sloganLines = [content.skillsTodayLine1, content.skillsTodayLine2].flatMap((t) =>
      wrapLines(doc, t, X(158), 2)
    );
    sloganLines.forEach((line, idx) => {
      drawText(doc, line, X(1387), Y(70) + idx * 13.9, {
        font: "Helvetica",
        size: 8,
        color: "#1D4ED8",
        spacing: 2,
      });
    });
    const sloganRuleY = Y(70) + sloganLines.length * 13.9;
    doc
      .moveTo(X(1387) - 32, sloganRuleY)
      .lineTo(X(1387) + 32, sloganRuleY)
      .strokeColor(COLORS.gold)
      .lineWidth(1)
      .stroke();

    // Title
    const headingSize = fitFontSize(doc, content.heading, "Times-Bold", 33, 14, W * 0.64);
    drawText(doc, content.heading, cx, Y(230), {
      font: "Times-Bold",
      size: headingSize,
      color: COLORS.navy,
      lift: 0.34,
    });

    // "THIS IS TO CERTIFY THAT" with gold rules either side
    const certifyY = Y(294);
    const certifyW = drawText(doc, content.certifyLabel, cx, certifyY, {
      font: "Helvetica",
      size: 11.5,
      color: COLORS.navy,
      spacing: 3.5,
    });
    doc.lineWidth(1).strokeColor(COLORS.gold);
    doc.moveTo(cx - certifyW / 2 - 11, certifyY).lineTo(cx - certifyW / 2 - 86, certifyY).stroke();
    doc.moveTo(cx + certifyW / 2 + 11, certifyY).lineTo(cx + certifyW / 2 + 86, certifyY).stroke();

    // Candidate name (dynamic, per-certificate)
    // Text area stops short of the seal badge on the right (its left edge is ~W-200).
    const textMaxWidth = 400;
    const nameSize = fitFontSize(doc, studentName, "Times-Bold", 39, 12, textMaxWidth);
    drawText(doc, studentName, cx, Y(362), {
      font: "Times-Bold",
      size: nameSize,
      color: COLORS.navy,
      lift: 0.34,
    });
    doc.moveTo(X(465), Y(408)).lineTo(X(1072), Y(408)).strokeColor(COLORS.gold).lineWidth(1.2).stroke();

    // Program (dynamic)
    drawText(doc, "has successfully completed the", cx, Y(450), {
      font: "Helvetica",
      size: 16,
      color: COLORS.navy,
    });
    // Matches the reference design's phrasing ("Web Development Internship
    // Program") — no duration prefix. `durationLabel` is still accepted and
    // stored on the certificate record, just not shown in this sentence.
    const programLine = `${programName} Internship Program`;
    const programSize = fitFontSize(doc, programLine, "Helvetica-Bold", 22.4, 9, textMaxWidth + 10);
    drawText(doc, programLine, cx, Y(492), {
      font: "Helvetica-Bold",
      size: programSize,
      color: COLORS.blue,
    });
    drawText(doc, "at CodeVantage", cx, Y(541), {
      font: "Helvetica-Bold",
      size: 18.5,
      color: COLORS.navy,
    });

    // Completion description (admin content)
    doc.font("Helvetica").fontSize(12.5);
    wrapLines(doc, content.completionDescription, 392).forEach((line, idx) => {
      drawText(doc, line, cx, Y(589) + idx * 17, {
        font: "Helvetica",
        size: 12.5,
        color: COLORS.text,
      });
    });

    // Script tagline (admin content) + blue swoosh
    if (fs.existsSync(SCRIPT_FONT_PATH)) {
      const lines = content.taglineScript.split(" ");
      // Wrap into up to 3 short stacked lines for the available space.
      const l1 = lines.slice(0, 1).join(" ");
      const l2 = lines.slice(1, lines.length - 1).join(" ");
      const l3 = lines.slice(lines.length - 1).join(" ");
      const tx = X(76);
      const ty = Y(310);
      doc.save();
      doc.rotate(-14, { origin: [tx, ty] });
      doc.font("Script").fontSize(27).fillColor(COLORS.navy);
      doc.text(l1, tx, ty, { lineBreak: false });
      if (l2) doc.text(l2, tx + 12, ty + 24, { lineBreak: false });
      doc.text(l3, tx + 28, ty + (l2 ? 48 : 24), { lineBreak: false });
      doc.restore();
    }
    doc.save();
    doc
      .lineWidth(2.3)
      .lineCap("round")
      .strokeColor(COLORS.blue)
      .moveTo(X(150), Y(453))
      .bezierCurveTo(X(185), Y(437), X(225), Y(416), X(262), Y(402))
      .stroke();
    doc.restore();

    // Fixed tagline stack (branding: never editable) over the mountains
    const lbg = content.learnBuildGrowText.split("|").map((s) => s.trim());
    lbg.slice(0, 3).forEach((word, idx) => {
      drawText(doc, word, X(75), Y(652) + idx * 14.5, {
        font: "Helvetica",
        size: 8.5,
        color: COLORS.navy,
        spacing: 3.1,
        align: "left",
      });
    });
    doc.moveTo(X(75), Y(722)).lineTo(X(147), Y(722)).strokeColor(COLORS.gold).lineWidth(1).stroke();

    // Issue date (dynamic)
    calendarIcon(doc, X(138), Y(767), 24.5);
    drawText(doc, "Issue Date", X(203), Y(777), {
      font: "Helvetica",
      size: 9.9,
      color: COLORS.navy,
      align: "left",
    });
    const issueDate = new Date(completionDate).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    drawText(doc, issueDate, X(203), Y(803), {
      font: "Helvetica-Bold",
      size: 11.6,
      color: COLORS.navy,
      align: "left",
    });

    // Signature (admin content — who signs every certificate)
    if (fs.existsSync(SCRIPT_FONT_PATH)) {
      const sigSize = fitFontSize(doc, content.signatureScriptText, "Script", 48, 18, 150);
      drawTextOnBaseline(doc, content.signatureScriptText, cx + 6, Y(766), {
        font: "Script",
        size: sigSize,
        color: COLORS.navy,
      });
    }
    doc.moveTo(X(627), Y(773)).lineTo(X(909), Y(773)).strokeColor(COLORS.navyMid).lineWidth(0.9).stroke();
    drawText(doc, content.signatureFullName, cx, Y(793), {
      font: "Helvetica-Bold",
      size: 12.8,
      color: COLORS.navy,
    });
    drawText(doc, content.signatureTitle, cx, Y(818), {
      font: "Helvetica",
      size: 9.4,
      color: COLORS.navy,
    });

    // Seal badge (branding: never editable, except its 3 short text lines)
    sealBadge(doc, X(1368), Y(362), W * 0.0815, content);

    // Verify box (admin content + dynamic certificate ID / QR)
    const cardX = X(1104);
    const cardY = Y(678);
    const cardW = X(136);
    const cardH = Y(818) - Y(678);
    const panelX = cardX + cardW;
    const panelW = X(1442) - panelX;
    const panel = doc.linearGradient(panelX, 0, panelX + panelW, 0);
    panel.stop(0, "#FFFFFF").stop(1, "#F1F5FB");
    doc.roundedRect(panelX - 4, cardY, panelW + 4, cardH, 4).fill(panel);
    doc.save();
    doc.opacity(0.1);
    doc.roundedRect(cardX, cardY + 1.2, cardW, cardH, 5).fill(COLORS.navy);
    doc.restore();
    doc.lineWidth(0.7).roundedRect(cardX, cardY, cardW, cardH, 5).fillAndStroke("#FFFFFF", COLORS.hairline);
    if (qrCodeDataUrl) {
      const qrSize = 63;
      const base64 = qrCodeDataUrl.replace(/^data:image\/png;base64,/, "");
      doc.image(Buffer.from(base64, "base64"), cardX + (cardW - qrSize) / 2, cardY + (cardH - qrSize) / 2, {
        width: qrSize,
      });
    }
    const vx = X(1256);
    drawText(doc, content.verifyHeading, vx, Y(694), {
      font: "Helvetica-Bold",
      size: 9.4,
      color: COLORS.navy,
      align: "left",
    });
    drawText(doc, content.verifyInstructions, vx, Y(717), {
      font: "Helvetica",
      size: 8.7,
      color: COLORS.navy,
      align: "left",
    });
    drawText(doc, content.verifyUrl, vx, Y(740), {
      font: "Helvetica-Bold",
      size: 9,
      color: COLORS.navy,
      align: "left",
    });
    doc.moveTo(vx, Y(760)).lineTo(X(1440), Y(760)).strokeColor(COLORS.hairline).lineWidth(0.7).stroke();
    drawText(doc, "Certificate ID", vx, Y(779), {
      font: "Helvetica",
      size: 10,
      color: COLORS.navy,
      align: "left",
    });
    drawText(doc, certificateId, vx, Y(803), {
      font: "Helvetica-Bold",
      size: 10.2,
      color: COLORS.navy,
      align: "left",
    });

    // Tech stack badges (admin content — falls back to the program's own
    // technologies list if the caller doesn't override it; see certificateController)
    // One white strip, items spread evenly with a divider between them.
    const stripX = X(131);
    const stripY = Y(850);
    const stripW = X(1402) - stripX;
    const stripH = Y(928) - stripY;
    doc.save();
    doc.opacity(0.08);
    doc.roundedRect(stripX, stripY + 1.5, stripW, stripH, 9).fill(COLORS.navy);
    doc.restore();
    doc.lineWidth(0.7).roundedRect(stripX, stripY, stripW, stripH, 9).fillAndStroke("#FFFFFF", COLORS.hairline);

    const techs = content.techStack || [];
    const iconR = 8.6;
    const iconGap = 7.5;
    let labelSize = 7.7;
    const itemWidths = () => {
      doc.font("Helvetica-Bold").fontSize(labelSize);
      return techs.map((t) => iconR * 2 + iconGap + doc.widthOfString(t.label));
    };
    let widths = itemWidths();
    // Shrink the labels a little if an admin adds many / long badges.
    while (techs.length && labelSize > 5 && (stripW - widths.reduce((a, b) => a + b, 0)) / techs.length < 10) {
      labelSize -= 0.2;
      widths = itemWidths();
    }
    if (techs.length) {
      const space = (stripW - widths.reduce((a, b) => a + b, 0)) / techs.length;
      const midY = stripY + stripH / 2;
      let tx = stripX + space / 2;
      techs.forEach((t, i) => {
        if (i > 0) {
          doc
            .moveTo(tx - space / 2, midY - stripH * 0.275)
            .lineTo(tx - space / 2, midY + stripH * 0.275)
            .strokeColor(COLORS.hairline)
            .lineWidth(0.7)
            .stroke();
        }
        techIcon(doc, techIconType(t.label), tx + iconR, midY, iconR, t.color);
        drawText(doc, t.label, tx + iconR * 2 + iconGap, midY, {
          font: "Helvetica-Bold",
          size: labelSize,
          color: COLORS.navy,
          align: "left",
        });
        tx += widths[i] + space;
      });
    }

    // Footer tagline (admin content) with gold rules either side
    const footerY = Y(964);
    const footerW = drawText(doc, content.footerTagline, cx, footerY, {
      font: "Helvetica",
      size: 8,
      color: COLORS.navy,
      spacing: 1.2,
    });
    doc.lineWidth(1).strokeColor(COLORS.gold);
    doc.moveTo(cx - footerW / 2 - 21, footerY).lineTo(cx - footerW / 2 - 141, footerY).stroke();
    doc.moveTo(cx + footerW / 2 + 21, footerY).lineTo(cx + footerW / 2 + 141, footerY).stroke();

    doc.end();
    stream.on("finish", () => resolve(filePath));
    stream.on("error", reject);
  });
}

module.exports = { generateCertificatePdf, DEFAULT_TEMPLATE_CONTENT, OUTPUT_DIR };
