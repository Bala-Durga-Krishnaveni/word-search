// Builds one self-contained index.html (React + app code + CSS inlined) using esbuild.
import { build } from "esbuild";
import fs from "fs";

const out = await build({
  entryPoints: ["src/main.jsx"],
  bundle: true, minify: true, format: "iife", jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' },
  outdir: "dist", write: false, target: "es2018",
});
let js = "", css = "";
for (const f of out.outputFiles) {
  if (f.path.endsWith(".js")) js = f.text;
  if (f.path.endsWith(".css")) css = f.text;
}
js = js.replace(/<\/script/gi, "<\\/script");
const CFG = `<script>
/* ===== SETTINGS - edit these two lines ===================================
   scoreApiUrl   : paste your Google Apps Script web-app URL here (ends with /exec).
                   Leave it empty to keep scores on each device only.
   requireRollNo : true = students must type a roll number
   ======================================================================== */
window.WORDSEARCH_CONFIG = {
  scoreApiUrl: "",
  requireRollNo: false
};
</script>
`;
const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Data Science with Python - Word Search Challenge</title>
<style>${css}</style>
</head>
<body>
<div id="root"><p id="boot" style="font-family:sans-serif;color:#6B7280;text-align:center;margin-top:80px">Loading word search&hellip;</p></div>
${CFG}<noscript><p style="font-family:sans-serif;text-align:center;margin-top:80px">This puzzle needs JavaScript. Please enable it in your browser.</p></noscript>
<script>
/* If the app cannot start, say why instead of leaving a blank page. */
(function () {
  function fail(msg) {
    var r = document.getElementById('root');
    if (!r || !document.getElementById('boot')) return;
    r.innerHTML = '<div style="font-family:sans-serif;max-width:480px;margin:60px auto;padding:20px;border:2px solid #FCA5A5;border-radius:12px;background:#FEF2F2;color:#7F1D1D">' +
      '<b>The puzzle could not start.</b><p style="font-size:14px">Please open this file in an up-to-date Chrome, Edge, Firefox or Safari, and make sure the whole file was copied or uploaded.</p>' +
      '<p style="font-size:12px;color:#991B1B">Details: ' + String(msg).replace(/</g, '&lt;') + '</p></div>';
  }
  window.addEventListener('error', function (e) { fail(e.message || 'script error'); });
  setTimeout(function () { fail('the app did not load (script blocked or incomplete)'); }, 4000);
})();
</script>
<script>${js}</script>
</body>
</html>
`;
fs.mkdirSync("dist", { recursive: true });
fs.writeFileSync("dist/index.html", html);
console.log("built", (html.length / 1024).toFixed(0) + " KB");
