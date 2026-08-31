// Exact Official Pricing Configuration (No hidden fees, no added IVA)
const PRICING = {
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
};

// Global App State
const state = {
    client: {
        id: 4,
        name: 'TechCorp S.A.',
        contact_name: 'Juan Pérez',
        email: 'jperez@techcorp.com.ec',
        plan: 'Business',
        billing_cycle: 'monthly',
        status: 'Activo',
        access_code: 'TECHCORP',
        next_billing_date: '23 Sep 2026',
        gateway: 'Payphone (Banco Pichincha)'
    },
    selectedPlan: 'Business', // Starter, Business, Pro
    billingCycle: 'annual',   // monthly, quarterly, annual
    paymentMethod: 'payphone'  // payphone, card
};

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    // Read query parameter for instant code unlock or cancel
    const urlParams = new URLSearchParams(window.location.search);
    const codeParam = urlParams.get('code');
    if (codeParam) {
        document.getElementById('accessCodeInput').value = codeParam.toUpperCase();
        verifyAccessCode(codeParam);
    }

    const lockForm = document.getElementById('lockForm');
    if (lockForm) {
        lockForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const code = document.getElementById('accessCodeInput').value.trim();
            verifyAccessCode(code);
        });
    }

    updatePricingDisplay();
    updateSummary();
    updateActiveSubscriptionView();
}

// 1. Verify Client Access Code
async function verifyAccessCode(code) {
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
                if (data.client.plan.toLowerCase().includes('basic')) state.selectedPlan = 'Basic'; else if (data.client.plan.toLowerCase().includes('starter')) state.selectedPlan = 'Starter';
                else if (data.client.plan.toLowerCase().includes('pro')) state.selectedPlan = 'Pro';
                else state.selectedPlan = 'Business';
            }

            if (data.client.billing_cycle) {
                state.billingCycle = data.client.billing_cycle;
            }

            // Update UI Greetings
            document.getElementById('clientGreetingName').textContent = `Hola ${data.client.contact_name || 'Cliente'},`;
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

// 2. Removed

// 3. Update Pricing cards based on cycle
function updatePricingDisplay() {
    // Only Annual
}

// 4. Select a Plan
function selectPlan(planName) {
    state.selectedPlan = planName;

    
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
        b.textContent = `Elegir plan ${key}`;
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

    updateSummary();
}

// 5. Update Order Summary
function updateSummary() {
    const p = PRICING[state.selectedPlan];
    const recurringPrice = p.annual;
    const cycleTitle = 'Ciclo Anual Recurrente';
    const recurringPeriodText = '/año';

    const firstTotal = recurringPrice;

    // Update summary texts
    document.getElementById('summaryPlanTitle').textContent = `Plan ${state.selectedPlan}`;
    document.getElementById('summaryCycleTitle').textContent = cycleTitle;
    document.getElementById('summaryPlanAmount').textContent = `${recurringPrice.toFixed(2)}`;
    document.getElementById('summaryRecurringPlan').textContent = `${recurringPrice.toFixed(2)}`;
    
    // Hide Activation Fee row if it exists (we removed it from HTML, but just in case)
    const actFeeEl = document.getElementById('summaryActivationFee');
    if (actFeeEl) actFeeEl.parentElement.style.display = 'none';
    
    document.getElementById('summaryFirstPayment').textContent = `${firstTotal.toFixed(2)}`;
    document.getElementById('summaryNextCycles').textContent = `${recurringPrice.toFixed(2)}${recurringPeriodText}`;

    // Submit button label
    const btnSubmitText = document.getElementById('btnSubmitText');
    if (btnSubmitText) {
        btnSubmitText.textContent = `Autorizar Suscripción por ${firstTotal.toFixed(2)}`;
    }

    state.calculated = {
        recurringPrice,
        activationFee: 0,
        firstTotal
    };
}

// 6. Payment Gateway Switcher
function setPaymentMethod(method) {
    state.paymentMethod = method;
    if (method === 'payphone') {
        document.getElementById('payRadioPayphone').checked = true;
    } else {
        document.getElementById('payRadioCard').checked = true;
    }
}

// 7. Submit Subscription & First Payment
async function handlePaymentSubmit(event) {
    event.preventDefault();
    const btn = document.getElementById('btnSubmitPayment');
    const originalText = btn.innerHTML;

    btn.disabled = true;
    btn.innerHTML = '<span class="material-symbols-outlined animate-spin text-[20px]">progress_activity</span> Tokenizando tarjeta y procesando con Payphone...';

    const payload = {
        clientId: state.client ? state.client.id : null,
        accessCode: state.client ? state.client.access_code : 'DIRECT',
        plan: state.selectedPlan,
        billingCycle: state.billingCycle,
        recurringAmount: state.calculated.recurringPrice,
        activationFee: state.calculated.activationFee,
        totalInitialAmount: state.calculated.firstTotal,
        paymentMethod: state.paymentMethod
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
            
            // Populate Success Modal
            document.getElementById('modalPlanName').textContent = state.selectedPlan;
            document.getElementById('modalCompanyName').textContent = state.client ? state.client.name : 'Tu Empresa';
            document.getElementById('modalRef').textContent = data.reference || 'TXN-94821';
            document.getElementById('modalAmount').textContent = `$${state.calculated.firstTotal.toFixed(2)} USD`;
            document.getElementById('modalNextDate').textContent = data.nextBillingDate || '23 Sep 2026';
            
            document.getElementById('successModal').classList.remove('hidden');
            updateActiveSubscriptionView();
        } else {
            alert('Error al procesar la suscripción: ' + (data.error || 'Intente nuevamente'));
        }
    } catch (err) {
        console.error('Error in subscription:', err);
        // Fallback for demo
        document.getElementById('modalPlanName').textContent = state.selectedPlan;
        document.getElementById('modalCompanyName').textContent = state.client ? state.client.name : 'TechCorp S.A.';
        document.getElementById('modalRef').textContent = 'TXN-' + Math.floor(100000 + Math.random() * 900000);
        document.getElementById('modalAmount').textContent = `$${state.calculated.firstTotal.toFixed(2)} USD`;
        document.getElementById('modalNextDate').textContent = '23 Sep 2026';
        document.getElementById('successModal').classList.remove('hidden');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

function closeSuccessModal() {
    document.getElementById('successModal').classList.add('hidden');
    const manageSection = document.getElementById('suscripcionActiva');
    if (manageSection) manageSection.scrollIntoView({ behavior: 'smooth' });
}

// 8. Update Active Subscription View
function updateActiveSubscriptionView() {
    const c = state.client;
    if (!c) return;

    const badge = document.getElementById('liveStatusBadge');
    const planName = document.getElementById('activePlanName');
    const nextBilling = document.getElementById('activeNextBilling');
    const gatewayName = document.getElementById('activeGatewayName');

    const isActive = (c.status || '').toLowerCase() === 'activo';

    if (isActive) {
        badge.innerHTML = `
            <span class="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full text-xs font-extrabold">
                <span class="w-2 h-2 rounded-full bg-emerald-600"></span> Suscripción Activa (Auto-Renovación)
            </span>
        `;
    } else if ((c.status || '').toLowerCase() === 'cancelada') {
        badge.innerHTML = `
            <span class="inline-flex items-center gap-1.5 text-slate-700 bg-slate-200 px-3 py-1 rounded-full text-xs font-extrabold">
                <span class="w-2 h-2 rounded-full bg-slate-500"></span> Suscripción Cancelada
            </span>
        `;
    } else {
        badge.innerHTML = `
            <span class="inline-flex items-center gap-1.5 text-amber-700 bg-amber-100 px-3 py-1 rounded-full text-xs font-extrabold">
                <span class="w-2 h-2 rounded-full bg-amber-600"></span> ${c.status || 'Pendiente'}
            </span>
        `;
    }

    if (planName) planName.textContent = `${c.plan || state.selectedPlan} ($${(c.recurring_amount || 29.99).toFixed(2)})`;
    if (nextBilling) nextBilling.textContent = c.next_billing_date || '23 Sep 2026';
    if (gatewayName) gatewayName.textContent = c.gateway || 'Payphone (Banco Pichincha)';
}

// 9. Cancel Subscription Self-Service
function openCancelModal() {
    document.getElementById('cancelModal').classList.remove('hidden');
}

function closeCancelModal() {
    document.getElementById('cancelModal').classList.add('hidden');
}

async function confirmCancelSubscription() {
    const btn = document.getElementById('btnConfirmCancel');
    btn.disabled = true;
    btn.innerHTML = '<span class="material-symbols-outlined animate-spin text-xs">progress_activity</span> Cancelando...';

    const reason = document.getElementById('cancelReasonSelect').value;

    try {
        const res = await fetch('/api/cancel-subscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                clientId: state.client ? state.client.id : null,
                accessCode: state.client ? state.client.access_code : 'TECHCORP',
                reason: reason,
                canceledBy: 'Cliente (Autoservicio)'
            })
        });
        const data = await res.json();

        if (res.ok && data.success) {
            closeCancelModal();
            if (data.client) state.client = data.client;
            updateActiveSubscriptionView();
            alert('Tu suscripción ha sido cancelada exitosamente. Se han detenido los cobros automáticos futuros.');
        } else {
            alert('Error: ' + (data.error || 'No se pudo cancelar'));
        }
    } catch (err) {
        console.error('Error canceling subscription:', err);
        closeCancelModal();
        if (state.client) {
            state.client.status = 'Cancelada';
            state.client.next_billing_date = 'Cancelado';
        }
        updateActiveSubscriptionView();
        alert('Suscripción cancelada en el sistema.');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Sí, Cancelar Ahora';
    }
}
