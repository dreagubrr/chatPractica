const socket = io(); // Conectar al servidor de Socket.io
const form = document.getElementById('form'); // Formulario de envío de mensajes
const input = document.getElementById('input'); // Campo de entrada de mensajes
const messages = document.getElementById('messages'); // Contenedor de mensajes
const userList = document.getElementById('userList'); // Lista de usuarios conectados
const notificationSound = document.getElementById('notificationSound'); // Sonido de notificación
const logoutBtn = document.getElementById('logoutBtn');

let destinatario = "Mensaje público"; // Destinatario actual (público o privado)

// Función para agregar un mensaje al chat
function agregarMensaje(mensaje, esPrivado = false, emisor = null) {
    const item = document.createElement('li'); // Crear un nuevo elemento de lista
    item.textContent = esPrivado ? `Privado de ${emisor}: ${mensaje}` : mensaje; // Formatear el mensaje
    item.style.color = esPrivado ? 'red' : 'inherit'; // Cambiar color si es privado
    messages.appendChild(item); // Agregar el mensaje al contenedor
    window.scrollTo(0, document.body.scrollHeight); // Desplazarse al final del chat

    // Reproducir sonido de notificación
    notificationSound.play();
}

// Función para actualizar la lista de usuarios conectados
function actualizarListaUsuarios(usuarios) {
    userList.innerHTML = ''; // Limpiar la lista actual

    // Agregar la opción de mensaje público
    const opcionPublico = document.createElement('option');
    opcionPublico.textContent = "Mensaje público";
    opcionPublico.value = "";
    userList.appendChild(opcionPublico);

    // Agregar cada usuario a la lista
    Object.entries(usuarios).forEach(([id, nombre]) => {
        const opcion = document.createElement('option');
        opcion.value = id;
        opcion.textContent = nombre;
        userList.appendChild(opcion);
    });
}

// Enviar mensaje al servidor
form.addEventListener('submit', (event) => {
    event.preventDefault(); // Evitar que el formulario se envíe

    if (input.value.trim()) { // Verificar que el mensaje no esté vacío
        if (destinatario === "Mensaje público") {
            // Enviar mensaje público
            socket.emit('chat message', input.value.trim());
        } else {
            // Enviar mensaje privado
            socket.emit('private message', { destinatario, message: input.value.trim() });
        }
        input.value = ''; // Limpiar el campo de entrada
    }
});

// Cambiar el destinatario actual
userList.addEventListener('change', (event) => {
    destinatario = event.target.value || "Mensaje público";
});

// Escuchar mensajes públicos del servidor
socket.on('chat message', (mensaje) => {
    agregarMensaje(mensaje); // Agregar mensaje público al chat
});

// Escuchar mensajes privados del servidor
socket.on('private message', ({ emisor, message }) => {
    agregarMensaje(message, true, emisor); // Agregar mensaje privado al chat
});

// Escuchar actualizaciones de la lista de usuarios
socket.on('update user list', (usuarios) => {
    actualizarListaUsuarios(usuarios); // Actualizar la lista de usuarios
});

function cerrarSesion() {
    // Desconectar el socket
    socket.disconnect();
    
    // Limpiar cualquier dato de sesión si existe
    localStorage.removeItem('username');
    sessionStorage.clear();
    
    // Redirigir al login
    window.location.href = '/login.html';
}

// Agregar el event listener para el botón de cerrar sesión
logoutBtn.addEventListener('click', cerrarSesion);

// Opcional: Manejar el evento beforeunload para limpiar la sesión si el usuario cierra la ventana
window.addEventListener('beforeunload', () => {
    socket.disconnect();
});

