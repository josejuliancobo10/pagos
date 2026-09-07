const fs = require('fs');

let indexHtml = fs.readFileSync('public/index.html', 'utf8');

const heroReplace = `
            <!-- Hero & Title (From Official Graphic) -->
            <section class="text-center space-y-6 max-w-4xl mx-auto">
                <img src="/images/parvis-logo.png" alt="Parvis - Presencia Digital" class="h-20 md:h-28 mx-auto object-contain drop-shadow-sm">
                <div class="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold border border-primary/20 shadow-sm">
                    <span class="material-symbols-outlined text-[16px] text-primary" style="font-variation-settings: 'FILL' 1;">bolt</span>
                    Pago Recurrente Automático &bull; Sin Contratos Forzosos
                </div>
                <h1 class="text-3xl md:text-5xl font-black text-on-surface tracking-tight leading-tight">
                    Elige el plan ideal para tu negocio
                </h1>
                <p class="text-base md:text-lg text-on-surface-variant font-medium">
                    Pequeños comienzos. Grandes posibilidades.
                </p>
`;

indexHtml = indexHtml.replace(/<!-- Hero & Title \(From Official Graphic\) -->[\s\S]*?Pequeños comienzos\. Grandes posibilidades\.\s*<\/p>/, heroReplace.trim());

fs.writeFileSync('public/index.html', indexHtml, 'utf8');
console.log('Logo added to hero section');
