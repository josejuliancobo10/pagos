const fs = require('fs');
let adminHtml = fs.readFileSync('public/admin.html', 'utf8');
const version = 'reflow_fix_' + Date.now();
adminHtml = adminHtml.replace(/<script src="\/js\/admin\.js\?v=.*?"><\/script>/, `<script src="/js/admin.js?v=${version}"></script>`);
fs.writeFileSync('public/admin.html', adminHtml, 'utf8');
console.log('Cache bumped 17');
