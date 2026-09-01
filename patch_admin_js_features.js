const fs = require('fs');
let js = fs.readFileSync('public/js/admin.js', 'utf8');

// Modificar updateNewClientAmounts para mostrar/ocultar el textarea
js = js.replace(/function updateNewClientAmounts\(\) \{[\s\S]*?async function handleCreateClient/m, 
`function updateNewClientAmounts() {
    const planSelect = document.getElementById('ncPlan');
    const selectedOption = planSelect.options[planSelect.selectedIndex];
    const price = selectedOption.getAttribute('data-price');
    const planName = planSelect.value;
    
    if (price) {
        document.getElementById('ncAmount').value = price;
    } else {
        document.getElementById('ncAmount').value = '';
        document.getElementById('ncAmount').focus();
    }

    const customFeaturesDiv = document.getElementById('customFeaturesDiv');
    if (customFeaturesDiv) {
        if (planName.includes('Personalizado')) {
            customFeaturesDiv.classList.remove('hidden');
        } else {
            customFeaturesDiv.classList.add('hidden');
        }
    }
}

async function handleCreateClient`);

// Modificar handleCreateClient para leer el textarea y adjuntarlo al plan
js = js.replace(/const plan = document\.getElementById\('ncPlan'\)\.value;/,
`let plan = document.getElementById('ncPlan').value;
    const customFeaturesInput = document.getElementById('ncCustomFeatures');
    if (plan.includes('Personalizado') && customFeaturesInput && customFeaturesInput.value.trim() !== '') {
        const featureList = customFeaturesInput.value.trim().split('\\n').map(f => f.trim()).filter(f => f).join('|');
        if (featureList) {
            plan = plan + '||' + featureList;
        }
    }`);

// Modificar renderClientsTable para ocultar los features al mostrar el plan en la tabla
js = js.replace(/<span class="font-bold text-slate-800 text-xs">(\$\{client\.plan\})<\/span>/g,
`<span class="font-bold text-slate-800 text-xs">\${client.plan.split('||')[0]}</span>`);

// There might be another place where plan is displayed
js = js.replace(/<span class="inline-flex items-center px-2\.5 py-1 rounded-md text-\[10px\] font-bold bg-purple-100 text-purple-700">(\$\{client\.plan\})<\/span>/g,
`<span class="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold bg-purple-100 text-purple-700">\${client.plan.split('||')[0]}</span>`);

fs.writeFileSync('public/js/admin.js', js);
