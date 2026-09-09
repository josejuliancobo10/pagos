const fs = require('fs');

let adminJs = fs.readFileSync('public/js/admin.js', 'utf8');

const patchCode = `
          let res;
          if (id) {
              res = await fetch(\`/api/calendar/\${id}\`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload)
              });
          } else {
              res = await fetch('/api/calendar', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload)
              });
          }
          if (!res.ok) throw new Error('Error en el servidor');
          closeEventModal();
          if(calendar) calendar.refetchEvents();
`;

adminJs = adminJs.replace(/if \(id\) \{[\s\S]*?if\(calendar\) calendar\.refetchEvents\(\);/, patchCode.trim());

fs.writeFileSync('public/js/admin.js', adminJs, 'utf8');
console.log('Fixed silent fail in admin.js');
