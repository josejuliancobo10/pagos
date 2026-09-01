const fs = require('fs');
let js = fs.readFileSync('public/js/app.js', 'utf8');

const target1 = `            if (data.client.plan) {
                if (data.client.plan.toLowerCase().includes('basic')) state.selectedPlan = 'Basic'; else if (data.client.plan.toLowerCase().includes('starter')) state.selectedPlan = 'Starter';
                else if (data.client.plan.toLowerCase().includes('pro')) state.selectedPlan = 'Pro';
                else state.selectedPlan = 'Business';
            }`;

const replacement1 = `            if (data.client.plan) {
                let rawPlan = data.client.plan;
                if (rawPlan.includes('||')) {
                    const parts = rawPlan.split('||');
                    data.client.planNameClean = parts[0];
                    data.client.customFeatures = parts[1].split('|');
                } else {
                    data.client.planNameClean = rawPlan;
                    data.client.customFeatures = null;
                }

                const pName = data.client.planNameClean.toLowerCase();
                if (pName.includes('basic')) data.client.planGroup = 'Basic';
                else if (pName.includes('starter')) data.client.planGroup = 'Starter';
                else if (pName.includes('pro')) data.client.planGroup = 'Pro';
                else data.client.planGroup = 'Business';

                state.selectedPlan = data.client.planGroup;
                
                // Actualizar la tarjeta del cliente
                const card = document.getElementById('card' + data.client.planGroup);
                if (card) {
                    // Actualizar nombre
                    const titleEl = card.querySelector('h3');
                    if (titleEl) titleEl.textContent = data.client.planNameClean.toUpperCase();
                    
                    // Actualizar precio en la tarjeta SIEMPRE
                    const priceEl = card.querySelector('.text-4xl');
                    if (priceEl && data.client.recurring_amount !== undefined) {
                        priceEl.textContent = '$' + parseFloat(data.client.recurring_amount).toFixed(2);
                    }

                    // Actualizar características si existen
                    if (data.client.customFeatures) {
                        const ul = card.querySelector('ul');
                        if (ul) {
                            ul.innerHTML = '';
                            data.client.customFeatures.forEach(feat => {
                                ul.innerHTML += \`<li class="flex items-start gap-2 text-xs text-slate-600 mb-2">
                                    <span class="material-symbols-outlined text-[16px] text-primary shrink-0">check_circle</span>
                                    <span>\${feat}</span>
                                </li>\`;
                            });
                        }
                    }
                }
            }`;

js = js.replace(target1, () => replacement1);

const replacement2 = `function updateSummary() {
    let p = PRICING[state.selectedPlan];
    let recurringPrice = p ? p.annual : 269.99;
    let displayName = \`Plan \${state.selectedPlan}\`;
    
    // Override if this is the assigned plan
    if (state.client && state.client.planGroup === state.selectedPlan) {
        recurringPrice = state.client.recurring_amount;
        displayName = state.client.planNameClean;
    }

    const cycleTitle = 'Ciclo Anual Recurrente';
    const recurringPeriodText = '/año';
    const firstTotal = recurringPrice;

    // Update summary texts
    document.getElementById('summaryPlanTitle').textContent = displayName;`;

js = js.replace(/function updateSummary\(\) \{[\s\S]*?document\.getElementById\('summaryPlanTitle'\)\.textContent = `Plan \$\{state\.selectedPlan\}`;/, () => replacement2);

js = js.replace(/document\.getElementById\('btnPayNowText'\)\.textContent = `Autorizar Suscripción por \$\{firstTotal\.toFixed\(2\)\}`;/, () => `document.getElementById('btnPayNowText').textContent = \`Autorizar Suscripción por \${firstTotal.toFixed(2)}\`;`);

fs.writeFileSync('public/js/app.js', js);
console.log("App.js patched successfully");
