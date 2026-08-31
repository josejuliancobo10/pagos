const fs = require('fs');
let js = fs.readFileSync('public/js/app.js', 'utf8');

const newPricing = `const PRICING = {
    Basic: {
        annual: 99.99
    },
    Starter: {
        annual: 179.99
    },
    Business: {
        annual: 269.99
    },
    Pro: {
        annual: 449.99
    }
};`;

js = js.replace(/const PRICING = \{[\s\S]*?\};/, newPricing);

// Update init state to have annual billing cycle default
js = js.replace(/billingCycle: 'monthly'/g, "billingCycle: 'annual'");
js = js.replace(/state\.billingCycle === 'monthly'/g, "false");
js = js.replace(/state\.billingCycle === 'quarterly'/g, "false");
js = js.replace(/if \(data\.client\.plan\.toLowerCase\(\)\.includes\('starter'\)\) state\.selectedPlan = 'Starter';/g, "if (data.client.plan.toLowerCase().includes('basic')) state.selectedPlan = 'Basic'; else if (data.client.plan.toLowerCase().includes('starter')) state.selectedPlan = 'Starter';");


// Replace updatePricingDisplay completely
const newUpdatePricingDisplay = `function updatePricingDisplay() {
    // Only Annual
}`;
js = js.replace(/function updatePricingDisplay\(\) \{[\s\S]*?\}\n\n\/\/ 4\./, newUpdatePricingDisplay + "\n\n// 4.");

// Replace updateSummary completely
const newUpdateSummary = `// 5. Update Order Summary
function updateSummary() {
    const p = PRICING[state.selectedPlan];
    const recurringPrice = p.annual;
    const cycleTitle = 'Ciclo Anual Recurrente';
    const recurringPeriodText = '/año';

    const firstTotal = recurringPrice;

    // Update summary texts
    document.getElementById('summaryPlanTitle').textContent = \`Plan \${state.selectedPlan}\`;
    document.getElementById('summaryCycleTitle').textContent = cycleTitle;
    document.getElementById('summaryPlanAmount').textContent = \`$\${recurringPrice.toFixed(2)}\`;
    document.getElementById('summaryRecurringPlan').textContent = \`$\${recurringPrice.toFixed(2)}\`;
    
    // Hide Activation Fee row if it exists (we removed it from HTML, but just in case)
    const actFeeEl = document.getElementById('summaryActivationFee');
    if (actFeeEl) actFeeEl.parentElement.style.display = 'none';
    
    document.getElementById('summaryFirstPayment').textContent = \`$\${firstTotal.toFixed(2)}\`;
    document.getElementById('summaryNextCycles').textContent = \`$\${recurringPrice.toFixed(2)}\${recurringPeriodText}\`;

    // Submit button label
    const btnSubmitText = document.getElementById('btnSubmitText');
    if (btnSubmitText) {
        btnSubmitText.textContent = \`Autorizar Suscripción por $\${firstTotal.toFixed(2)}\`;
    }

    state.calculated = {
        recurringPrice,
        activationFee: 0,
        firstTotal
    };
}`;

js = js.replace(/\/\/ 5\. Update Order Summary[\s\S]*?\}\n\n\/\/ 6\./, newUpdateSummary + "\n\n// 6.");

// Remove setBillingCycle function
js = js.replace(/\/\/ 2\. Billing Cycle Switcher[\s\S]*?\}\n\n\/\/ 3\./, "// 2. Removed\n\n// 3.");
js = js.replace(/setBillingCycle\(state.billingCycle\);/, "");


// Fix selectPlan active cards
const newSelectPlanLogic = `
    const cards = {
        'Basic': document.getElementById('cardBasic'),
        'Starter': document.getElementById('cardStarter'),
        'Business': document.getElementById('cardBusiness'),
        'Pro': document.getElementById('cardPro')
    };

    const buttons = {
        'Basic': document.getElementById('btnSelectBasic'),
        'Starter': document.getElementById('btnSelectStarter'),
        'Business': document.getElementById('btnSelectBusiness'),
        'Pro': document.getElementById('btnSelectPro')
    };

    // Reset styles
    Object.keys(cards).forEach(key => {
        const c = cards[key];
        const b = buttons[key];
        if (!c || !b) return;

        c.classList.remove('ring-4', 'ring-purple-200', 'ring-blue-200', 'ring-emerald-200', 'ring-green-200', 'border-primary', 'lg:-translate-y-2', 'shadow-2xl');
        c.classList.add('border-outline-variant');
        b.textContent = \`Elegir plan \${key}\`;
    });

    // Highlight selected
    const activeCard = cards[planName];
    const activeBtn = buttons[planName];
    if (activeCard && activeBtn) {
        activeCard.classList.remove('border-outline-variant');
        activeCard.classList.add('shadow-2xl', 'lg:-translate-y-2');
        
        if (planName === 'Business') {
            activeCard.classList.add('ring-4', 'ring-purple-200', 'border-[#4e03b8]');
            activeBtn.innerHTML = '<span class="material-symbols-outlined text-sm">verified</span> Plan Seleccionado';
        } else if (planName === 'Starter') {
            activeCard.classList.add('ring-4', 'ring-blue-200', 'border-[#0058be]');
            activeBtn.textContent = 'Plan Seleccionado';
        } else if (planName === 'Pro') {
            activeCard.classList.add('ring-4', 'ring-emerald-200', 'border-[#15803d]');
            activeBtn.textContent = 'Plan Seleccionado';
        } else if (planName === 'Basic') {
            activeCard.classList.add('ring-4', 'ring-green-200', 'border-[#166534]');
            activeBtn.textContent = 'Plan Seleccionado';
        }
    }
`;
js = js.replace(/const cards = \{[\s\S]*?\}\n\n    updateSummary\(\);/m, newSelectPlanLogic + "\n    updateSummary();");

fs.writeFileSync('public/js/app.js', js);
