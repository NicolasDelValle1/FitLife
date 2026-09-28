
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/database");

const register = async (req, res) => {
    try {
        const {
            nombre,
            email,
            password
        } = req.body || {};

        if (!nombre || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Nombre, email y contraseña son obligatorios"
            });
        }

        const [existingUser] = await db.query(
            "SELECT id FROM usuarios WHERE email = ?",
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(409).json({
                success: false,
                message: "El correo ya está registrado"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.query(
            `INSERT INTO usuarios 
            (nombre, email, password)
            VALUES (?, ?, ?)`,
            [nombre, email, hashedPassword]
        );

        res.status(201).json({
            success: true,
            message: "Usuario registrado correctamente",
            userId: result.insertId
        });

    } catch (error) {
        console.error("Error en registro:", error);

        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
};


const login = async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body || {};

        // Validar campos
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Correo y contraseña son obligatorios"
            });
        }

        // Buscar usuario
        const [users] = await db.query(
            `SELECT id, nombre, email, password
             FROM usuarios
             WHERE email = ?`,
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Correo o contraseña incorrectos"
            });
        }

        const user = users[0];

        // Comparar contraseña
        const passwordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Correo o contraseña incorrectos"
            });
        }

        // Crear token
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.json({
            success: true,
            message: "Inicio de sesión exitoso",
            token,
            user: {
                id: user.id,
                nombre: user.nombre,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Error en login:", error);

        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
};


module.exports = {
    register,
    login
};

