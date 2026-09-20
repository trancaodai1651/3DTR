import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const required = [
  "index.html", "styles.css", "app.js", "config.js", "manifest.webmanifest",
  "apps-script/Code.gs", "apps-script/appsscript.json", ".github/workflows/deploy-pages.yml",
  "downloads/3DTR_Quan_Ly_Kinh_Doanh_Thong_Minh.xlsx",
];
for (const file of required) {
  if (!fs.existsSync(path.join(root, file))) throw new Error(`Missing required file: ${file}`);
}

const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const js = fs.readFileSync(path.join(root, "app.js"), "utf8");
const api = fs.readFileSync(path.join(root, "apps-script/Code.gs"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");

for (const id of ["welcomeView", "appView", "entryForm", "recordsBody", "googleSignIn"]) {
  if (!html.includes(`id="${id}"`)) throw new Error(`Missing UI target: ${id}`);
}
for (const entity of ["order", "customer", "product", "purchase", "filament", "investment", "withdrawal"]) {
  if (!js.includes(`${entity}: {`)) throw new Error(`Missing frontend entity: ${entity}`);
  if (!api.includes(`${entity}: {`)) throw new Error(`Missing API entity: ${entity}`);
}
if (!api.includes('role !== "editor"')) throw new Error("Backend editor enforcement is missing.");
if (!api.includes("verifyGoogleToken_")) throw new Error("Google token verification is missing.");
if (!js.includes('field("color", "Màu nhựa"')) throw new Error("Purchase color field is missing.");
if (!api.includes('[12,"color","text"]')) throw new Error("Purchase color column mapping is missing.");
if (!css.includes("@media (max-width: 760px)")) throw new Error("Mobile breakpoint is missing.");
console.log("3DTR static site and Apps Script structure validated.");
