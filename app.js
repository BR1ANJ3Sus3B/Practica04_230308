// Exportación de librerías necesarias
import express from 'express';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';
import os from 'os';

const app = express();
const PORT = 3000;

// Sesiones almacenadas en memoria (RAM)
const sessions = {};

// Configuración del servidor
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
});

// Ruta principal
app.get('/', (req, res) => {
    return res.status(200).json({
        message: "Bienvenid@ al API de Control de Sesiones",
        author: "Brian Jesus Mendoza Marquez.",
    });
});

// Función de utilidad para obtener la IP local
const getLocalIp = () => {
    const networkInterfaces = os.networkInterfaces();
    for (const interfaceName in networkInterfaces) {
        const interfaces = networkInterfaces[interfaceName];
        for (const iface of interfaces) {
            // IPv4 y no interna (no localhost)
            if (iface.family === "IPv4" && !iface.internal) {
                return iface.address;
            }
        }
    }
    return null; // Retorna null si no encuentra una IP válida
};

// Endpoint para iniciar sesión
app.post('/login', (req, res) => {
    const { email, nickname, macAddress } = req.body;
    if (!email || !nickname || !macAddress) {
        return res.status(400).json({ message: "Se esperan campos requeridos" });
    }

    const sessionId = uuidv4();
    const now = new Date();

    sessions[sessionId] = {
        sessionId,
        email,
        nickname,
        macAddress,
        ip: getLocalIp(),
        createdAt: now,
        lastAccess: now,
    };

    res.status(200).json({
        message: "Se ha logeado de manera exitosa",
        sessionId,
    });
});

// Endpoint para cerrar sesión
app.post('/logout', (req, res) => {
    const { sessionId } = req.body;
    if (!sessionId || !sessions[sessionId]) {
        return res.status(404).json({ message: "No se ha encontrado una sesión activa" });
    }

    delete sessions[sessionId];
    res.status(200).json({ message: "Logout successful" });
});

// Endpoint para actualizar datos de sesión
app.post('/update', (req, res) => {
    const { sessionId, email, nickname } = req.body;

    if (!sessionId || !sessions[sessionId]) {
        return res.status(404).json({ message: "No existe una sesión activa" });
    }

    if (email) sessions[sessionId].email = email;
    if (nickname) sessions[sessionId].nickname = nickname;
    sessions[sessionId].lastAccess = new Date();

    res.status(200).json({ message: "Sesión actualizada correctamente" });
});

// Endpoint para verificar el estado de la sesión
app.get('/status', (req, res) => {
    const sessionId = req.query.sessionId;
    if (!sessionId || !sessions[sessionId]) {
        return res.status(404).json({
            message: "No existe una sesión activa",
        });
    }

    res.status(200).json({
        message: 'Sesión activa',
        session: sessions[sessionId],
    });
});
