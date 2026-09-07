const fs = require('fs');
const version = Date.now();
let indexHtml = fs.readFileSync('public/index.html', 'utf8');
indexHtml = indexHtml.replace(/<script src="\/js\/app\.js\?v=\d+"\><\/script>/, `<script src="/js/app.js?v=${version}"></script>`);
fs.writeFileSync('public/index.html', indexHtml, 'utf8');
console.log('Cache bumped for app.js');
