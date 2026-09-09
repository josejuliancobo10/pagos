const fs = require('fs');

let adminJs = fs.readFileSync('public/js/admin.js', 'utf8');

// Replace the actual DOMContentLoaded block
const oldBlock = `
document.addEventListener('DOMContentLoaded', () => {
    const lock = document.getElementById('adminLockScreen'); if(lock) lock.style.display = 'none';
    fetchMetrics();
    fetchClients();
});
`.trim();

const newBlock = `
document.addEventListener('DOMContentLoaded', () => {
    const lock = document.getElementById('adminLockScreen'); if(lock) lock.style.display = 'none';
    fetchMetrics();
    fetchClients();

    // Event Delegation for table buttons
    document.getElementById('clientsTableBody').addEventListener('click', (e) => {
        const btnCopy = e.target.closest('.btn-copy');
        if (btnCopy) {
            e.preventDefault();
            e.stopPropagation();
            return copyClientLink(btnCopy);
        }

        const btnRetry = e.target.closest('.btn-retry');
        if (btnRetry) {
            e.preventDefault();
            e.stopPropagation();
            return retryPayment(btnRetry.getAttribute('data-id'), btnRetry.getAttribute('data-name'));
        }

        const btnCancel = e.target.closest('.btn-cancel');
        if (btnCancel) {
            e.preventDefault();
            e.stopPropagation();
            return cancelSubscriptionAdmin(btnCancel.getAttribute('data-id'), btnCancel.getAttribute('data-name'));
        }

        const btnEdit = e.target.closest('.btn-edit');
        if (btnEdit) {
            e.preventDefault();
            e.stopPropagation();
            return openEditModal(btnEdit.getAttribute('data-id'));
        }
    });
});
`.trim();

// Because there are minor spacing differences, I'll use regex to be safe
adminJs = adminJs.replace(/document\.addEventListener\('DOMContentLoaded', \(\) => \{\s*const lock = document\.getElementById\('adminLockScreen'\); if\(lock\) lock\.style\.display = 'none';\s*fetchMetrics\(\);\s*fetchClients\(\);\s*\}\);/, newBlock);

fs.writeFileSync('public/js/admin.js', adminJs, 'utf8');
console.log('Delegation fixed');
