const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');
code = code.replace(
  /'Access-Control-Allow-Headers': 'Content-Type, Authorization'/,
  "'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-password'"
);
fs.writeFileSync('server.js', code);
