const fs = require('fs');
let indexHtml = fs.readFileSync('public/index.html', 'utf8');
indexHtml = indexHtml.replace(/src="js\/app\.js[^"]*"/, 'src="js/app.js?v=' + Date.now() + '"');
fs.writeFileSync('public/index.html', indexHtml);
