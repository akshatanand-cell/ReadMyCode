const express = require("express");
const router = express.Router();

function escapeXml(unsafe) {
  return String(unsafe || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

router.get("/", (req, res) => {
  const label = escapeXml(req.query.label || "documented with");
  const status = escapeXml(req.query.status || "ReadMyCode");
  const color = (req.query.color || "10b981").replace(/[^a-zA-Z0-9#]/g, "");
  const colorHex = color.startsWith("#") ? color : `#${color}`;

  const labelLength = Math.max(label.length * 6.8 + 12, 40);
  const statusLength = Math.max(status.length * 7.2 + 12, 40);
  const totalWidth = Math.round(labelLength + statusLength);

  const labelTextX = Math.round((labelLength / 2) * 10);
  const statusTextX = Math.round((labelLength + statusLength / 2) * 10);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20" role="img" aria-label="${label}: ${status}">
  <title>${label}: ${status}</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r">
    <rect width="${totalWidth}" height="20" rx="3" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="${Math.round(labelLength)}" height="20" fill="#1e232a"/>
    <rect x="${Math.round(labelLength)}" width="${Math.round(statusLength)}" height="20" fill="${colorHex}"/>
    <rect width="${totalWidth}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="110">
    <text aria-hidden="true" x="${labelTextX}" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)">${label}</text>
    <text x="${labelTextX}" y="140" transform="scale(.1)" fill="#fff">${label}</text>
    <text aria-hidden="true" x="${statusTextX}" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)">${status}</text>
    <text x="${statusTextX}" y="140" transform="scale(.1)" fill="#fff">${status}</text>
  </g>
</svg>`;

  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400");
  res.setHeader("Access-Control-Allow-Origin", "*");
  return res.send(svg);
});

module.exports = router;
