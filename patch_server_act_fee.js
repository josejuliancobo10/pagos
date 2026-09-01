const fs = require('fs');

let serverJs = fs.readFileSync('server.js', 'utf8');

serverJs = serverJs.replace(/recurring_amount: parseFloat\(data\.recurring_amount \|\| 0\),\s*activation_fee: 0,/,
`recurring_amount: parseFloat(data.recurring_amount || 0),
            activation_fee: data.activation_fee !== undefined ? parseFloat(data.activation_fee) : 0,`);

fs.writeFileSync('server.js', serverJs);
console.log("server.js patched");
