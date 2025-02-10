document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  console.log('📤 Datos enviados:', { username, password });

  const response = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
  });

  const data = await response.json();
  console.log('📥 Respuesta del servidor:', data);

  if (response.ok) {
      alert('✅ Inicio de sesión exitoso');
      window.location.href = '/index.html'; // Redirigir al chat
  } else {
      alert('❌ ' + data.message);
  }
});

