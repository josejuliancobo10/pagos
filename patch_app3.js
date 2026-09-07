const fs = require('fs');
let appJs = fs.readFileSync('public/js/app.js', 'utf8');

const targetStr = `                    const priceEl = card.querySelector('.text-4xl');
                    if (priceEl && data.client.recurring_amount !== undefined) {
                        priceEl.textContent = '$' + parseFloat(data.client.recurring_amount).toFixed(2);
                    }`;

const newStr = `                    const priceEl = card.querySelector('.text-4xl');
                    if (priceEl) {
                        if (data.client.activation_fee !== undefined && data.client.activation_fee !== null && parseFloat(data.client.activation_fee) > 0) {
                            priceEl.textContent = '$' + parseFloat(data.client.activation_fee).toFixed(2);
                        } else if (data.client.recurring_amount !== undefined && data.client.recurring_amount !== null) {
                            priceEl.textContent = '$' + parseFloat(data.client.recurring_amount).toFixed(2);
                        }
                    }

                    // Tambien actualizar el texto chiquito de "Renovacion anual: $X" si existe
                    const renEl = card.querySelector('p.text-\\\\[11px\\\\]');
                    if (renEl && data.client.recurring_amount !== undefined && data.client.recurring_amount !== null) {
                        renEl.textContent = 'Renovación anual: $' + parseFloat(data.client.recurring_amount).toFixed(2);
                    }`;

appJs = appJs.replace(targetStr, () => newStr); // using function avoids $ replacement rules!

fs.writeFileSync('public/js/app.js', appJs);
console.log('App.js patched safely.');
