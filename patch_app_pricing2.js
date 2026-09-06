const fs = require('fs');
let appJs = fs.readFileSync('public/js/app.js', 'utf8');

const regex = /const PRICING = \{[\s\S]*?Pro:\s*\{\s*annual:\s*449\.99\s*\}\s*\};/;
const newPricing = `const PRICING = {
    Basic: { initial: 99.99, annual: 49.99 },
    Starter: { initial: 179.99, annual: 99.99 },
    Business: { initial: 269.99, annual: 129.99 },
    Pro: { initial: 449.99, annual: 159.99 }
};`;

if (regex.test(appJs)) {
    appJs = appJs.replace(regex, newPricing);
    fs.writeFileSync('public/js/app.js', appJs);
    console.log("app.js successfully patched");
} else {
    console.log("Regex didn't match.");
}
