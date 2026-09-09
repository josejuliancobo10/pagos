const fs = require('fs');
let adminHtml = fs.readFileSync('public/admin.html', 'utf8');

// Remove blur-backdrop
adminHtml = adminHtml.replace(/blur-backdrop/g, '');

const version = Date.now();
adminHtml = adminHtml.replace(/<script src="\/js\/admin\.js\?v=\d+"\><\/script>/, `<script src="/js/admin.js?v=${version}"></script>`);

fs.writeFileSync('public/admin.html', adminHtml, 'utf8');
console.log('Removed blur-backdrop and bumped cache');
