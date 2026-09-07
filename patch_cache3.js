const fs = require('fs');

let adminHtml = fs.readFileSync('public/admin.html', 'utf8');
const version = Date.now();
adminHtml = adminHtml.replace(/<script src="\/js\/admin\.js\?v=\d+"\><\/script>/, `<script src="/js/admin.js?v=${version}"></script>`);
fs.writeFileSync('public/admin.html', adminHtml);
console.log("Cache buster applied to reverted admin.html");
