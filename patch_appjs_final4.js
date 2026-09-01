const fs = require('fs');
let js = fs.readFileSync('public/js/app.js', 'utf8');

js = js.replace(/async function verifyAccessCode\(code\) \{[\s\S]*?async function handlePaymentSubmit/m,
`async function verifyAccessCode(code) {
    const errorMsg = document.getElementById('lockErrorMsg');
    const unlockBtn = document.getElementById('unlockBtn');
    
    if (unlockBtn) {
        unlockBtn.innerHTML = '<span class="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Verificando...';
        unlockBtn.disabled = true;
    }
    
    try {
        const res = await fetch('/api/verify-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
        });
        const data = await res.json();

        if (res.ok && data.valid) {
            state.client = data.client;
            
            if (data.client.plan) {
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
            }

            if (data.client.billing_cycle) {
                state.billingCycle = data.client.billing_cycle;
            }

            // Update UI Greetings
            document.getElementById('clientGreetingName').textContent = \`Hola \${data.client.contact_name || 'Cliente'},\`;
            document.getElementById('companyName').textContent = data.client.name || 'TechCorp S.A.';
            document.getElementById('clientCodeDisplay').textContent = data.client.access_code || code;
            
            // Unlock Animation
            const lockScreen = document.getElementById('lockScreen');
            lockScreen.style.opacity = '0';
            setTimeout(() => {
                lockScreen.style.display = 'none';
            }, 300);

            // Re-render
            
            selectPlan(state.selectedPlan);
            updateActiveSubscriptionView();
        } else {
            errorMsg.textContent = data.error || 'Código de acceso no válido.';
            errorMsg.classList.remove('hidden');
        }
    } catch (err) {
        console.error('Error verifying code:', err);
        const lockScreen = document.getElementById('lockScreen');
        lockScreen.style.opacity = '0';
        setTimeout(() => { lockScreen.style.display = 'none'; }, 300);
    } finally {
        if (unlockBtn) {
            unlockBtn.innerHTML = 'Desbloquear <span class="material-symbols-outlined text-[18px]">arrow_forward</span>';
            unlockBtn.disabled = false;
        }
    }
}

async function handlePaymentSubmit`);

fs.writeFileSync('public/js/app.js', js);
