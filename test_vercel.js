async function run() {
  const res = await fetch('https://pagos-blue.vercel.app/api/clients', {
    method: 'OPTIONS'
  });
  console.log(res.status);
  console.log([...res.headers.entries()]);
}
run();
