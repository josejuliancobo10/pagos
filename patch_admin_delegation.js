const fs = require('fs');
let adminJs = fs.readFileSync('public/js/admin.js', 'utf8');

adminJs = adminJs.replace(/onclick="copyClientLink\(this\)" data-code="\$\{client.access_code\}" data-name="\$\{escapeHtml\(client.name\)\}" class="/g, 'data-code="${client.access_code}" data-name="${escapeHtml(client.name)}" class="btn-copy ');

adminJs = adminJs.replace(/onclick="retryPayment\(\$\{client\.id\}, '\$\{escapeHtml\(client\.name\)\}'\)" class="/g, 'data-id="${client.id}" data-name="${escapeHtml(client.name)}" class="btn-retry ');

adminJs = adminJs.replace(/onclick="cancelSubscriptionAdmin\(\$\{client\.id\}, '\$\{escapeHtml\(client\.name\)\}'\)" class="/g, 'data-id="${client.id}" data-name="${escapeHtml(client.name)}" class="btn-cancel ');

adminJs = adminJs.replace(/onclick="openEditModal\(\$\{client\.id\}\)" class="/g, 'data-id="${client.id}" class="btn-edit ');

// Add event listener delegation to tbody
const delegationLogic = `
  document.addEventListener('DOMContentLoaded', () => {
      initCalendar();
      fetchMetrics();
      fetchClients();

      // Event Delegation for table buttons
      document.getElementById('clientsTableBody').addEventListener('click', (e) => {
          const btnCopy = e.target.closest('.btn-copy');
          if (btnCopy) return copyClientLink(btnCopy);

          const btnRetry = e.target.closest('.btn-retry');
          if (btnRetry) return retryPayment(btnRetry.getAttribute('data-id'), btnRetry.getAttribute('data-name'));

          const btnCancel = e.target.closest('.btn-cancel');
          if (btnCancel) return cancelSubscriptionAdmin(btnCancel.getAttribute('data-id'), btnCancel.getAttribute('data-name'));

          const btnEdit = e.target.closest('.btn-edit');
          if (btnEdit) return openEditModal(btnEdit.getAttribute('data-id'));
      });
  });
`;

// Replace the DOMContentLoaded block
adminJs = adminJs.replace(/document\.addEventListener\('DOMContentLoaded', \(\) => \{\s*initCalendar\(\);\s*fetchMetrics\(\);\s*fetchClients\(\);\s*\}\);/, delegationLogic.trim());

fs.writeFileSync('public/js/admin.js', adminJs, 'utf8');
console.log('Event delegation implemented.');
