const fs = require('fs');
let adminJs = fs.readFileSync('public/js/admin.js', 'utf8');

adminJs = adminJs.replace(/window\.calcInitial = function\s*\((.*?)\)\s*\{/, 'function calcInitial($1) {');

fs.writeFileSync('public/js/admin.js', adminJs);
console.log("calcInitial reverted");
