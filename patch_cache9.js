const fs = require('fs');
const version = Date.now();

let adminHtml = fs.readFileSync('public/admin.html', 'utf8');
adminHtml = adminHtml.replace(/<script src="\/js\/admin\.js\?v=\d+"\><\/script>/, `<script src="/js/admin.js?v=${version}"></script>`);
fs.writeFileSync('public/admin.html', adminHtml, 'utf8');

let indexHtml = fs.readFileSync('public/index.html', 'utf8');
indexHtml = indexHtml.replace(/<script src="\/js\/app\.js\?v=\d+"\><\/script>/, `<script src="/js/app.js?v=${version}"></script>`);
fs.writeFileSync('public/index.html', indexHtml, 'utf8');

console.log('Cache bumped for rebranding');
