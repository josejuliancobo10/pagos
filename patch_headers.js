const fs = require('fs');

// Patch admin.js
let js = fs.readFileSync('public/js/admin.js', 'utf8');
js = js.replace(
  /options\.headers\['x-admin-password'\] = adminPass;/,
  "options.headers['Authorization'] = 'Bearer ' + adminPass;"
);
fs.writeFileSync('public/js/admin.js', js);

// Patch server.js
let server = fs.readFileSync('server.js', 'utf8');
server = server.replace(
  /const authHeader = req\.headers\['x-admin-password'\];/,
  "const authHeader = req.headers['authorization'] ? req.headers['authorization'].replace('Bearer ', '') : null;"
);
server = server.replace(
  /'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-password'/,
  "'Access-Control-Allow-Headers': 'Content-Type, Authorization'"
);
fs.writeFileSync('server.js', server);
