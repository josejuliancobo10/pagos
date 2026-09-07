const fs = require('fs');

let appJs = fs.readFileSync('public/js/app.js', 'utf8');

appJs = appJs.replace(
    /const priceEl = card\.querySelector\('\.text-4xl'\);\s*if \(priceEl && data\.client\.recurring_amount !== undefined\) \{\s*priceEl\.textContent = '\\$' \+ parseFloat\(data\.client\.recurring_amount\)\.toFixed\(2\);\s*\}/,
    `const priceEl = card.querySelector('.text-4xl');
                    if (priceEl) {
                        if (data.client.activation_fee !== undefined && data.client.activation_fee !== null && parseFloat(data.client.activation_fee) > 0) {
                            priceEl.textContent = '$' + parseFloat(data.client.activation_fee).toFixed(2);
                        } else if (data.client.recurring_amount !== undefined && data.client.recurring_amount !== null) {
                            priceEl.textContent = '$' + parseFloat(data.client.recurring_amount).toFixed(2);
                        }
                    }`
);

fs.writeFileSync('public/js/app.js', appJs);
console.log("app.js patched to show initial price instead of recurring price on cards");
