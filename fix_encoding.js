const fs = require('fs');
let content = fs.readFileSync('public/js/admin.js', 'utf8');

// If there's a BOM, remove it
if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
}

fs.writeFileSync('public/js/admin.js', content, 'utf8');
console.log('UTF-8 without BOM written');
