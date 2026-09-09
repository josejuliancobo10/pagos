const fs = require('fs');
let adminJs = fs.readFileSync('public/js/admin.js', 'utf8');

// 1. Bulletproof openEventModal
adminJs = adminJs.replace(/if \(calEvent\) \{/, `if (calEvent && calEvent.id) {`);

// 2. Add gotoDate logic to filterCalendar
const gotoDateLogic = `
  function filterCalendar(clientId) {
      activeCalendarClient = clientId.toString();
      renderCalendarClientList();
      if (calendar) {
          calendar.refetchEvents();
          
          // Jump to the closest event for this client
          if (activeCalendarClient !== 'all' && typeof currentEvents !== 'undefined') {
              const clientEvents = currentEvents.filter(e => e.client_id && e.client_id.toString() === activeCalendarClient);
              if (clientEvents.length > 0) {
                  // Sort chronologically
                  clientEvents.sort((a,b) => new Date(a.event_date) - new Date(b.event_date));
                  // Try to find the first event >= today
                  const today = new Date();
                  today.setHours(0,0,0,0);
                  const upcoming = clientEvents.find(e => new Date(e.event_date) >= today);
                  const targetEvent = upcoming || clientEvents[0]; // fallback to oldest if all are in the past
                  
                  // Jump the calendar to that date!
                  calendar.gotoDate(targetEvent.event_date);
              }
          }
      }
      
      // Auto-select client in modal if a specific client is selected
      const evClientSelect = document.getElementById('evClient');
`;

adminJs = adminJs.replace(/function filterCalendar\(clientId\) \{[\s\S]*?const evClientSelect = document\.getElementById\('evClient'\);/, gotoDateLogic.trim());

fs.writeFileSync('public/js/admin.js', adminJs, 'utf8');
console.log('Patched admin.js with gotoDate and robust modal checks');
