const fs = require('fs');

let indexHtml = fs.readFileSync('public/index.html', 'utf8');

// Fix Business block: it currently has the button inside it
// We need to replace the malformed text back to just "$129,99"
indexHtml = indexHtml.replace(/Renovacin anual: <button id="btnSelectBusiness"[\s\S]*?Elegir plan Business\s*<\/button>29,99/g, 'Renovación anual: $129,99');

// Fix Pro block
indexHtml = indexHtml.replace(/Renovacin anual: <button id="btnSelectPro"[\s\S]*?Elegir plan Pro\s*<\/button>59,99/g, 'Renovación anual: $159,99');

// Just to be sure, do it without the broken character in case of encoding issues
indexHtml = indexHtml.replace(/anual: <button id="btnSelectBusiness"[\s\S]*?Elegir plan Business\s*<\/button>29,99/g, 'anual: $129,99');
indexHtml = indexHtml.replace(/anual: <button id="btnSelectPro"[\s\S]*?Elegir plan Pro\s*<\/button>59,99/g, 'anual: $159,99');

// And add a cache buster to index.html for index.html itself? We can't cache bust the root, but we can bust app.js if needed.
const version = Date.now();
indexHtml = indexHtml.replace(/<script src="\/js\/app\.js(\?v=\d+)?"\><\/script>/, `<script src="/js/app.js?v=${version}"></script>`);

fs.writeFileSync('public/index.html', indexHtml);
console.log("index.html fixed the regex $1 capture group bug");
