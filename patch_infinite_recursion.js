const fs = require('fs');
let js = fs.readFileSync('public/js/admin.js', 'utf8');
js = js.replace(
  "const res = await adminFetch(url, options);",
  "const res = await fetch(url, options);"
);
fs.writeFileSync('public/js/admin.js', js);
