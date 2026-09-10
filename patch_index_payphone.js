const fs = require('fs');

let html = fs.readFileSync('public/index.html', 'utf8');

// 1. Inject the Payphone Script before </head>
if (!html.includes('payphone.com/api/button/js')) {
    html = html.replace('</head>', '    <script type="module" src="https://pay.payphonetodoesposible.com/api/button/js?appId=Penyb0xb0E6i9mwFuY4h3w"></script>\n</head>');
}

// 2. Replace the Fake form with the Payphone Container
const formStartRegex = /<form id="paymentForm"[^>]*>/;
const formEndRegex = /<\/form>/;

// We need to extract the exact text between form start and form end, which might be tricky with regex if there are nested forms.
// Let's use substring replacement.

const startIndex = html.search(formStartRegex);
if (startIndex !== -1) {
    // Find the closing </form> after the start
    const endIndex = html.indexOf('</form>', startIndex) + 7;
    const oldForm = html.substring(startIndex, endIndex);
    
    const newContainer = `
                    <div id="paymentForm" class="space-y-4">
                        <div class="pt-2 pb-4 text-center">
                            <p class="text-sm font-bold text-on-surface mb-4">Completa tu pago de forma 100% segura:</p>
                            <div id="pp-button" class="w-full min-h-[50px] flex justify-center items-center"></div>
                        </div>
                        <p class="text-center text-[11px] text-outline mt-3 flex items-center justify-center gap-1.5">
                            <span class="material-symbols-outlined text-sm text-emerald-600">verified</span>
                            Procesado de forma segura por Payphone Ecuador
                        </p>
                    </div>
    `.trim();

    html = html.replace(oldForm, newContainer);
}

// Bump cache for app.js
html = html.replace(/<script src="\/js\/app\.js\?v=\d+"><\/script>/, `<script src="/js/app.js?v=${Date.now()}"></script>`);

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('index.html patched with Payphone!');
