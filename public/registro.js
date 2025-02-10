document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (password !== confirmPassword) {
    alert('Las contraseñas no coinciden');
    return;
  }

  try {
    const response = await fetch('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (response.ok) {
      alert('Registro exitoso, ahora puedes iniciar sesión.');
      window.location.href = '/login.html';
    } else {
      alert(data.message || 'Error en el registro');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error en el registro');
  }
});