const fs = require('fs');
let js = fs.readFileSync('public/js/app.js', 'utf8');

js = js.replace(/function updateSummary\(\) \{[\s\S]*?document\.getElementById\('summaryPlanTitle'\)\.textContent = `Plan \$\{state\.selectedPlan\}`;/,
`function updateSummary() {
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
    document.getElementById('summaryPlanTitle').textContent = displayName;`);

js = js.replace(/document\.getElementById\('btnPayNowText'\)\.textContent = `Autorizar Suscripción por \$\{firstTotal\.toFixed\(2\)\}`;/, `document.getElementById('btnPayNowText').textContent = \`Autorizar Suscripción por \${firstTotal.toFixed(2)}\`;`);

fs.writeFileSync('public/js/app.js', js);
