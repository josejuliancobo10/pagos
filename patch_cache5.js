const fs = require('fs');

let indexHtml = fs.readFileSync('public/index.html', 'utf8');
const version = Date.now();
indexHtml = indexHtml.replace(/<script src="\/js\/app\.js(\?v=\d+)?"\><\/script>/, `<script src="/js/app.js?v=${version}"></script>`);
fs.writeFileSync('public/index.html', indexHtml);
console.log("Cache buster applied to index.html");
