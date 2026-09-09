const fs = require('fs');

let serverJs = fs.readFileSync('server.js', 'utf8');

serverJs = serverJs.replace(/throw new Error\(\`DB Error: \$\{res\.statusText\}\`\);/, `throw new Error(\`DB Error: \${res.statusText} - \${errText}\`);`);

fs.writeFileSync('server.js', serverJs, 'utf8');
console.log('Added errText to DB Error');
