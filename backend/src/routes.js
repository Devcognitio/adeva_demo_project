const express = require('express');
const bcrypt = require('bcryptjs');
const { poolPromise, sql } = require('./db');
const router = express.Router();

const BCRYPT_ROUNDS = 10;

// Registra el detalle del error en el servidor y responde con un mensaje genérico
function handleServerError(res, err) {
    console.error(err);
    res.status(500).send('Error interno del servidor');
}

// Nunca exponer el hash de la contraseña en las respuestas
function withoutPassword({ Password, ...user }) {
    return user;
}

// Users Endpoints
router.get('/users', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Users');
        res.json(result.recordset.map(withoutPassword));
    } catch (err) {
        handleServerError(res, err);
    }
});

router.post('/users', async (req, res) => {
    const body = req.body ?? {};
    const fullName = body.fullName || body.FullName || '';
    const email = body.email || body.Email || '';
    const password = body.password || body.Password || '';
    const phone = body.phone || body.Phone || '';

    const ageRaw = body.age ?? body.Age;
    let age = null;
    if (ageRaw !== undefined && ageRaw !== null && ageRaw !== '') {
        age = Number(ageRaw);
        if (!Number.isInteger(age) || age < 0 || age > 150) {
            return res.status(400).send('La edad debe ser un número entero entre 0 y 150');
        }
    }

    const country = body.country || body.Country || '';
    const gender = body.gender || body.Gender || '';

    let interests = body.interests || body.Interests || '';
    if (Array.isArray(interests)) {
        interests = interests.join(', ');
    }

    const comments = body.comments || body.Comments || '';

    const termsRaw = body.terms !== undefined ? body.terms : body.Terms;
    const terms = [true, 'true', 1, '1'].includes(termsRaw);

    try {
        const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
        const pool = await poolPromise;
        const result = await pool.request()
            .input('FullName', sql.NVarChar, fullName)
            .input('Email', sql.NVarChar, email)
            .input('Password', sql.NVarChar, passwordHash)
            .input('Phone', sql.NVarChar, phone)
            .input('Age', sql.Int, age)
            .input('Country', sql.NVarChar, country)
            .input('Gender', sql.NVarChar, gender)
            .input('Interests', sql.NVarChar, interests)
            .input('Comments', sql.NVarChar, comments)
            .input('Terms', sql.Bit, terms)
            .query('INSERT INTO Users (FullName, Email, Password, Phone, Age, Country, Gender, Interests, Comments, Terms) OUTPUT INSERTED.* VALUES (@FullName, @Email, @Password, @Phone, @Age, @Country, @Gender, @Interests, @Comments, @Terms)');
        res.status(201).json(withoutPassword(result.recordset[0]));
    } catch (err) {
        handleServerError(res, err);
    }
});

// Transactions Endpoint (Simulated Payment)
router.post('/transactions', async (req, res) => {
    const { amount, cardNumber } = req.body ?? {};

    // Simular que sacamos los últimos 4 dígitos
    const cardLastFour = cardNumber ? String(cardNumber).slice(-4) : '0000';

    const amountVal = Number(amount);
    if (amount === undefined || amount === null || amount === '' || !Number.isFinite(amountVal) || amountVal <= 0) {
        return res.status(400).send('El monto debe ser un número mayor que 0');
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Amount', sql.Decimal(18, 2), amountVal)
            .input('CardLastFour', sql.NVarChar, cardLastFour)
            .input('Status', sql.NVarChar, 'Success')
            .query('INSERT INTO Transactions (Amount, CardLastFour, Status) OUTPUT INSERTED.* VALUES (@Amount, @CardLastFour, @Status)');
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        handleServerError(res, err);
    }
});

module.exports = router;
