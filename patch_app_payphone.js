const fs = require('fs');

let appJs = fs.readFileSync('public/js/app.js', 'utf8');

const initPayphone = `
// PAYPHONE BUTTON INITIALIZATION
let payphoneInitialized = false;

function setupPayphone() {
    if (payphoneInitialized) return;
    const container = document.getElementById('pp-button');
    if (!container) return;
    
    // Check if payphone is loaded
    if (typeof payphone === 'undefined') {
        setTimeout(setupPayphone, 200);
        return;
    }

    try {
        payphone.Button({
            token: "GYqlpKNsWPBpp2T0Vqocc1Ql7mcUFVDUgN-XQuEhNOq_xzLW4AZlO32NYPUpMQ9Ow0bhwQOsPN7Mxlb4Q1awqQKBbkpDNUfFbw65MqpXOkj8G9qnWQSsVJbjQGnIgFBCBee79Zso08jaoVbRDewOXq8D46Y1SKlJxJHQwYwaK9iv3uaF6geZG0ds6HKl7M9GhKQ8pUbipPBpasHTY3ALAQIbIEWDeryiB-pfMuPSZnp83r0DWoXzeD0lMzutYWPlptLfTNfDROsEBKQwitXYYNni-9aGsIlSJP9DVbK_Y6pYZOG8PRxjbSF3kH3RbIRU6hK5wA",
            btnHorizontal: true,
            btnCard: true,
            createOrder: function(actions) {
                const amount = Math.round(state.calculated.firstTotal * 100);
                return actions.prepare({
                    amount: amount,
                    amountWithoutTax: amount,
                    amountWithTax: 0,
                    tax: 0,
                    service: 0,
                    tip: 0,
                    currency: "USD",
                    clientTransactionId: "txn-" + Date.now()
                });
            },
            onComplete: function(model, actions) {
                // The payment was successful
                processBackendSubscription(model);
            }
        }).render("#pp-button");
        payphoneInitialized = true;
    } catch(err) {
        console.error("Payphone Init Error", err);
    }
}

async function processBackendSubscription(payphoneModel) {
    // Show loading state
    const container = document.getElementById('pp-button');
    container.innerHTML = '<div class="text-center text-primary font-bold"><span class="material-symbols-outlined animate-spin">progress_activity</span> Procesando tu suscripción...</div>';
    
    const payload = {
        clientId: state.client ? state.client.id : null,
        accessCode: state.client ? state.client.access_code : 'DIRECT',
        plan: state.selectedPlan,
        billingCycle: state.billingCycle,
        recurringAmount: state.calculated.recurringPrice,
        activationFee: state.calculated.activationFee,
        totalInitialAmount: state.calculated.firstTotal,
        paymentMethod: 'payphone',
        payphoneTransaction: payphoneModel.transactionId
    };

    try {
        const res = await fetch('/api/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (res.ok && data.success) {
            if (data.client) state.client = data.client;
            
            document.getElementById('modalPlanName').textContent = state.selectedPlan;
            document.getElementById('modalCompanyName').textContent = state.client ? state.client.name : 'Tu Empresa';
            document.getElementById('modalRef').textContent = payphoneModel.transactionId || data.reference || 'TXN-94821';
            document.getElementById('modalAmount').textContent = \`$\${state.calculated.firstTotal.toFixed(2)} USD\`;
            document.getElementById('modalNextDate').textContent = data.nextBillingDate || 'Proximo Cobro';
            
            document.getElementById('successModal').classList.remove('hidden');
            updateActiveSubscriptionView();
        } else {
            alert('Error al activar suscripción en el servidor: ' + (data.error || 'Contacte soporte'));
        }
    } catch (err) {
        console.error('Error:', err);
        alert('Error de conexión al procesar suscripción');
    }
}

// Call setupPayphone after initialization
setTimeout(setupPayphone, 1000);
`;

appJs = appJs + '\n\n' + initPayphone;

fs.writeFileSync('public/js/app.js', appJs, 'utf8');
console.log('app.js patched with Payphone!');
