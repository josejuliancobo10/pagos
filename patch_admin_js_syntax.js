const fs = require('fs');
let js = fs.readFileSync('public/js/admin.js', 'utf8');

js = js.replace(/function updateNewClientAmounts\(\) \{[\s\S]*?async function handleCreateClient/m, 
`function updateNewClientAmounts() {
    const planSelect = document.getElementById('ncPlan');
    const selectedOption = planSelect.options[planSelect.selectedIndex];
    const price = selectedOption.getAttribute('data-price');
    
    if (price) {
        document.getElementById('ncAmount').value = price;
    } else {
        document.getElementById('ncAmount').value = '';
        document.getElementById('ncAmount').focus();
    }
}

async function handleCreateClient`);

fs.writeFileSync('public/js/admin.js', js);
