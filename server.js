require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static('public'));

// Redirigir a login al acceder a "/"
app.get('/', (req, res) => {
    res.redirect('/login.html');
});

// Conectar con MongoDB
mongoose.connect(process.env.MONGO_URI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})
.then(() => console.log("✅ Conectado a MongoDB"))
.catch(err => console.error("❌ Error al conectar a MongoDB:", err));

// Ruta de registro
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validaciones
        if (!username || !password) {
            return res.status(400).json({ 
                message: 'Usuario y contraseña son requeridos' 
            });
        }

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ 
                message: 'El usuario ya existe' 
            });
        }

        // Crear nuevo usuario
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ 
            username, 
            password: hashedPassword 
        });
        
        await newUser.save();
        console.log("✅ Usuario registrado:", username);
        
        res.status(201).json({ 
            message: 'Usuario registrado exitosamente' 
        });
    } catch (error) {
        console.error("❌ Error al registrar usuario:", error);
        res.status(500).json({ 
            message: 'Error al registrar el usuario' 
        });
    }
});

// Ruta de login
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validaciones
        if (!username || !password) {
            return res.status(400).json({ 
                message: 'Usuario y contraseña son requeridos' 
            });
        }

        // Buscar usuario
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ 
                message: 'Usuario no encontrado' 
            });
        }

        // Verificar contraseña usando el método del modelo
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ 
                message: 'Contraseña incorrecta' 
            });
        }

        console.log("✅ Login exitoso:", username);
        res.status(200).json({ 
            message: 'Inicio de sesión exitoso' 
        });
    } catch (error) {
        console.error("❌ Error en login:", error);
        res.status(500).json({ 
            message: 'Error en el inicio de sesión' 
        });
    }
});

// Gestión de conexiones de sockets
let listaUsuarios = {};

io.on('connection', (socket) => {
    console.log('Un cliente se ha conectado:', socket.id);
    listaUsuarios[socket.id] = `Usuario-${socket.id.substring(0, 4)}`;
    io.emit('update user list', listaUsuarios);

    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });

    socket.on('private message', ({ destinatario, message }) => {
        io.to(destinatario).emit('private message', {
            emisor: listaUsuarios[socket.id],
            message
        });
    });

   // Modificar el evento disconnect en la sección de Socket.IO
socket.on('disconnect', () => {
    if (listaUsuarios[socket.id]) {
        const username = listaUsuarios[socket.id];
        console.log('Usuario desconectado:', username);
        
        // Eliminar usuario de la lista
        delete listaUsuarios[socket.id];
        
        // Notificar a todos los usuarios
        io.emit('update user list', listaUsuarios);
        io.emit('chat message', `${username} ha salido del chat`);
    }
});
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
