async function run() {
  try {
    const res = await fetch('https://pagos-blue.vercel.app/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer admin123' },
      body: JSON.stringify({
        name: 'Tech Test 2',
        contact_name: 'jose',
        email: 'josejuliancobo10@gmail.com',
        plan: 'Business',
        billing_cycle: 'monthly',
        recurring_amount: 314.99
      })
    });
    console.log(res.status);
    console.log(await res.text());
  } catch(e) {
    console.error('FETCH ERROR:', e);
  }
}
run();
