const fs = require('fs');

let adminHtml = fs.readFileSync('public/admin.html', 'utf8');

// Add timestamp to admin.js to break cache
const timestamp = Date.now();
adminHtml = adminHtml.replace(/<script src="\/js\/admin\.js(\?v=\d+)?"\><\/script>/, `<script src="/js/admin.js?v=${timestamp}"></script>`);

fs.writeFileSync('public/admin.html', adminHtml);
console.log("admin.html patched with cache buster");
