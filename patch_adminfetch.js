const fs = require('fs');

let adminJs = fs.readFileSync('public/js/admin.js', 'utf8');

// Replace adminFetch with standard fetch and headers where necessary
adminJs = adminJs.replace(/const res = await adminFetch\('\/api\/calendar'\);/g, `const res = await fetch('/api/calendar');`);

adminJs = adminJs.replace(/await adminFetch\(\`\/api\/calendar\/\$\{id\}\`, \{\s*method: 'PATCH',\s*body: JSON\.stringify\(payload\)\s*\}\);/g, `await fetch(\`/api/calendar/\${id}\`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });`);

adminJs = adminJs.replace(/await adminFetch\('\/api\/calendar', \{\s*method: 'POST',\s*body: JSON\.stringify\(payload\)\s*\}\);/g, `await fetch('/api/calendar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });`);

adminJs = adminJs.replace(/await adminFetch\(\`\/api\/calendar\/\$\{id\}\`, \{ method: 'DELETE' \}\);/g, `await fetch(\`/api/calendar/\${id}\`, { method: 'DELETE' });`);

fs.writeFileSync('public/js/admin.js', adminJs, 'utf8');
console.log('adminFetch replaced with fetch in admin.js');
