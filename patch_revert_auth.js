const fs = require('fs');

// Patch server.js: Remove Auth check entirely
let server = fs.readFileSync('server.js', 'utf8');
server = server.replace(
  /\/\/ ADMIN AUTHENTICATION[\s\S]*?if \(pathname === '\/api\/verify-code'/m,
  "if (pathname === '/api/verify-code'"
);
fs.writeFileSync('server.js', server);

// Patch admin.js: Remove adminFetch and auth modal
let admin = fs.readFileSync('public/js/admin.js', 'utf8');

// 1. Remove adminFetch wrapper
admin = admin.replace(
  /async function adminFetch[\s\S]*?return res;\s*\}/m,
  ""
);

// 2. Change adminFetch calls back to fetch
admin = admin.replace(/adminFetch\(/g, "fetch(");

// 3. Remove DOMContentLoaded lock logic and restore simple fetch
admin = admin.replace(
  /document\.addEventListener\('DOMContentLoaded', \(\) => \{[\s\S]*?\}\);/m,
  `document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('adminLockScreen').style.display = 'none';
    fetchMetrics();
    fetchClients();
});`
);

fs.writeFileSync('public/js/admin.js', admin);
