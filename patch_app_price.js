const fs = require('fs');

let appJs = fs.readFileSync('public/js/app.js', 'utf8');

const replacement = `
                    const priceEl = card.querySelector('.text-4xl');
                    if (priceEl) {
                        const hasActivation = data.client.activation_fee && parseFloat(data.client.activation_fee) > 0;
                        if (hasActivation) {
                            priceEl.textContent = '$' + parseFloat(data.client.activation_fee).toFixed(2);
                            const suffixEl = priceEl.nextElementSibling;
                            if (suffixEl) suffixEl.textContent = '/pago inicial';
                        } else if (data.client.recurring_amount !== undefined) {
                            priceEl.textContent = '$' + parseFloat(data.client.recurring_amount).toFixed(2);
                            const suffixEl = priceEl.nextElementSibling;
                            if (suffixEl) suffixEl.textContent = '/año';
                        }
                    }
`;

appJs = appJs.replace(
    /const priceEl = card\.querySelector\('\.text-4xl'\);[\s\S]*?priceEl\.textContent = '\$' \+ parseFloat\(data\.client\.recurring_amount\)\.toFixed\(2\);\s*\}/,
    replacement.trim()
);

fs.writeFileSync('public/js/app.js', appJs, 'utf8');
console.log('app.js price logic updated.');
