const fs = require('fs');

let js = fs.readFileSync('public/js/admin.js', 'utf8');

// Replace localStorage logic to make it always ask for password
js = js.replace(
  /let adminPass = localStorage\.getItem\('adminPass'\) \|\| '';/,
  "let adminPass = '';"
);
js = js.replace(
  /localStorage\.setItem\('adminPass', pass\);/,
  "// No guardamos la contraseña para que siempre la pida"
);
js = js.replace(
  /localStorage\.removeItem\('adminPass'\);/,
  ""
);

fs.writeFileSync('public/js/admin.js', js);
