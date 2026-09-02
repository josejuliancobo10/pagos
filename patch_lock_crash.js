const fs = require('fs');

let adminJs = fs.readFileSync('public/js/admin.js', 'utf8');

adminJs = adminJs.replace(/document\.getElementById\('adminLockScreen'\)\.style\.display = 'none';/g,
`const lock = document.getElementById('adminLockScreen'); if(lock) lock.style.display = 'none';`);

fs.writeFileSync('public/js/admin.js', adminJs);
console.log("Fixed adminLockScreen crash");
