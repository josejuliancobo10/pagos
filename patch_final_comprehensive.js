const fs = require('fs');

// --- 1. PATCH ADMIN.HTML ---
let adminHtml = fs.readFileSync('public/admin.html', 'utf8');
adminHtml = adminHtml.replace('<label class="block text-xs font-bold text-on-surface mb-1">Contacto *</label>', '<label class="block text-xs font-bold text-on-surface mb-1">Contacto (Opcional)</label>');
adminHtml = adminHtml.replace('<input type="text" id="ncContact" required placeholder', '<input type="text" id="ncContact" placeholder');
adminHtml = adminHtml.replace('<label class="block text-xs font-bold text-on-surface mb-1">Email</label>', '<label class="block text-xs font-bold text-on-surface mb-1">Email (Opcional)</label>');
fs.writeFileSync('public/admin.html', adminHtml);

// --- 2. PATCH INDEX.HTML ---
let indexHtml = fs.readFileSync('public/index.html', 'utf8');
indexHtml = indexHtml.replace('Ciclo Mensual Recurrente', 'Ciclo Anual Recurrente');
indexHtml = indexHtml.replace('id="summaryNextCycles" class="font-black text-emerald-700 font-mono">$29.99/mes', 'id="summaryNextCycles" class="font-black text-emerald-700 font-mono">$269.99/año');
indexHtml = indexHtml.replace('id="activePlanName" class="text-lg font-black text-on-surface mt-1">Business ($29,99/mes)', 'id="activePlanName" class="text-lg font-black text-on-surface mt-1">Business ($269.99/año)');
indexHtml = indexHtml.replace(/src="js\/app\.js[^"]*"/, 'src="js/app.js?v=' + Date.now() + '"');
fs.writeFileSync('public/index.html', indexHtml);

// --- 3. PATCH APP.JS ---
let js = fs.readFileSync('public/js/app.js', 'utf8');

// Patch verifyAccessCode
const vacTarget = `            if (data.client.plan) {
                if (data.client.plan.toLowerCase().includes('basic')) state.selectedPlan = 'Basic'; else if (data.client.plan.toLowerCase().includes('starter')) state.selectedPlan = 'Starter';
                else if (data.client.plan.toLowerCase().includes('pro')) state.selectedPlan = 'Pro';
                else state.selectedPlan = 'Business';
            }`;
            
const vacReplacement = `            if (data.client.plan) {
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
                    const titleEl = card.querySelector('h3');
                    if (titleEl) titleEl.textContent = data.client.planNameClean.toUpperCase();
                    
                    const priceEl = card.querySelector('.text-4xl');
                    if (priceEl && data.client.recurring_amount !== undefined) {
                        priceEl.textContent = '$' + parseFloat(data.client.recurring_amount).toFixed(2);
                    }

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
js = js.replace(vacTarget, () => vacReplacement);
// Handle CRLF fallback
if (!js.includes('data.client.planNameClean = parts[0]')) {
    js = js.replace(/if \(data\.client\.plan\) \{[\s\S]*?else state\.selectedPlan = 'Business';\s*\}/m, () => vacReplacement);
}


// Patch updateSummary
const sumTarget = `function updateSummary() {
    const p = PRICING[state.selectedPlan];
    const recurringPrice = p.annual;
    const cycleTitle = 'Ciclo Anual Recurrente';
    const recurringPeriodText = '/ao';`;
    
const sumReplacement = `function updateSummary() {
    let p = PRICING[state.selectedPlan];
    let recurringPrice = p ? p.annual : 269.99;
    let displayName = \`Plan \${state.selectedPlan}\`;
    
    if (state.client && state.client.planGroup === state.selectedPlan) {
        recurringPrice = state.client.recurring_amount;
        displayName = state.client.planNameClean;
    }

    const cycleTitle = 'Ciclo Anual Recurrente';
    const recurringPeriodText = '/año';`;
    
js = js.replace(sumTarget, () => sumReplacement);
if (!js.includes('let displayName =')) {
    js = js.replace(/function updateSummary\(\) \{[\s\S]*?const recurringPeriodText = '\/a.*?o';/m, () => sumReplacement);
}

// Fix title display in summary
js = js.replace(/document\.getElementById\('summaryPlanTitle'\)\.textContent = `Plan \$\{state\.selectedPlan\}`;/, () => `document.getElementById('summaryPlanTitle').textContent = displayName;`);

// Fix Next Cycles display in summary
js = js.replace(/document\.getElementById\('summaryNextCycles'\)\.textContent = `\$\{recurringPrice\.toFixed\(2\)\}\$\{recurringPeriodText\}`;/, () => `document.getElementById('summaryNextCycles').textContent = \`$\${recurringPrice.toFixed(2)}\${recurringPeriodText}\`;`);


// Patch updateActiveSubscriptionView
const actTarget = `function updateActiveSubscriptionView() {
    if (!state.client || state.client.status === 'Pendiente') {
        const suscripcionActiva = document.getElementById('suscripcionActiva');
        if(suscripcionActiva) suscripcionActiva.classList.add('hidden');
        return;
    }

    const suscripcionActiva = document.getElementById('suscripcionActiva');
    if(suscripcionActiva) suscripcionActiva.classList.remove('hidden');

    // Update texts
    const p = PRICING[state.selectedPlan] || PRICING['Business'];
    const amount = p.annual;
    document.getElementById('activePlanName').textContent = \`\${state.selectedPlan} ($\${amount.toFixed(2)}/año)\`;`;
    
const actReplacement = `function updateActiveSubscriptionView() {
    if (!state.client || state.client.status === 'Pendiente') {
        const suscripcionActiva = document.getElementById('suscripcionActiva');
        if(suscripcionActiva) suscripcionActiva.classList.add('hidden');
        return;
    }

    const suscripcionActiva = document.getElementById('suscripcionActiva');
    if(suscripcionActiva) suscripcionActiva.classList.remove('hidden');

    let amount = PRICING[state.selectedPlan] ? PRICING[state.selectedPlan].annual : 269.99;
    let name = state.selectedPlan;
    if (state.client) {
        amount = state.client.recurring_amount !== undefined ? state.client.recurring_amount : amount;
        name = state.client.planNameClean || name;
    }
    
    document.getElementById('activePlanName').textContent = \`\${name} ($\${parseFloat(amount).toFixed(2)}/año)\`;`;
    
js = js.replace(actTarget, () => actReplacement);
if (!js.includes('let name = state.selectedPlan;')) {
    js = js.replace(/function updateActiveSubscriptionView\(\) \{[\s\S]*?document\.getElementById\('activePlanName'\)\.textContent =.*?;\s*/m, () => actReplacement);
}

fs.writeFileSync('public/js/app.js', js);
console.log("Everything patched securely.");
