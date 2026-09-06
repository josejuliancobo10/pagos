const fs = require('fs');
let appJs = fs.readFileSync('public/js/app.js', 'utf8');

// Replace everything from 'const PRICING =' to the closing '};'
appJs = appJs.replace(/const PRICING = \{[\s\S]*?\};\n/, 
`const PRICING = {
    Basic: { initial: 99.99, annual: 49.99 },
    Starter: { initial: 179.99, annual: 99.99 },
    Business: { initial: 269.99, annual: 129.99 },
    Pro: { initial: 449.99, annual: 159.99 }
};\n`);

// Update logic in updateSummary
// Currently: let recurringPrice = p ? p.annual : 29.99;
// Let's make sure it still pulls the right things.
// In updateSummary, firstTotal uses activation_fee if present. Otherwise it uses recurringPrice.
// If activation_fee is 0, it uses 0.
// But we want it to default to `p.initial` if the client doesn't have an activation_fee defined?
// The backend sets `activation_fee: 0` for active clients, but for PENDING clients it has the value from the form.
// Actually, `admin.js` sends `activation_fee` explicitly from the form. So we don't NEED `p.initial` in `app.js` if the DB handles it!
// But just in case, I'll update it.

fs.writeFileSync('public/js/app.js', appJs);
console.log("app.js repatched");
