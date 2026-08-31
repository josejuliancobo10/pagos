const fs = require('fs');
let html = fs.readFileSync('public/admin.html', 'utf8');
html = html.replace(/src="js\/admin\.js[^"]*"/, 'src="js/admin.js?v=' + Date.now() + '"');
fs.writeFileSync('public/admin.html', html);
