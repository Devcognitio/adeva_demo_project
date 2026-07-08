const express = require('express');
const { poolPromise, sql } = require('./db');
const router = express.Router();

// Users Endpoints
router.get('/users', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Users');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.post('/users', async (req, res) => {
    const fullName = req.body.fullName || req.body.FullName || '';
    const email = req.body.email || req.body.Email || '';
    const password = req.body.password || req.body.Password || '';
    const phone = req.body.phone || req.body.Phone || '';
    const ageRaw = req.body.age || req.body.Age;
    const age = ageRaw ? parseInt(ageRaw, 10) : null;
    const country = req.body.country || req.body.Country || '';
    const gender = req.body.gender || req.body.Gender || '';
    
    let interests = req.body.interests || req.body.Interests || '';
    if (Array.isArray(interests)) {
        interests = interests.join(', ');
    }
    
    const comments = req.body.comments || req.body.Comments || '';
    
    const termsRaw = req.body.terms !== undefined ? req.body.terms : req.body.Terms;
    const terms = termsRaw === true || termsRaw === 'true' || termsRaw === 1;

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('FullName', sql.NVarChar, fullName)
            .input('Email', sql.NVarChar, email)
            .input('Password', sql.NVarChar, password)
            .input('Phone', sql.NVarChar, phone)
            .input('Age', sql.Int, age)
            .input('Country', sql.NVarChar, country)
            .input('Gender', sql.NVarChar, gender)
            .input('Interests', sql.NVarChar, interests)
            .input('Comments', sql.NVarChar, comments)
            .input('Terms', sql.Bit, terms)
            .query('INSERT INTO Users (FullName, Email, Password, Phone, Age, Country, Gender, Interests, Comments, Terms) OUTPUT INSERTED.* VALUES (@FullName, @Email, @Password, @Phone, @Age, @Country, @Gender, @Interests, @Comments, @Terms)');
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Transactions Endpoint (Simulated Payment)
router.post('/transactions', async (req, res) => {
    const { amount, cardNumber } = req.body;
    
    // Simular que sacamos los últimos 4 dígitos
    const cardLastFour = cardNumber ? cardNumber.slice(-4) : '0000';
    const amountVal = parseFloat(amount) || 0;

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Amount', sql.Decimal(18, 2), amountVal)
            .input('CardLastFour', sql.NVarChar, cardLastFour)
            .input('Status', sql.NVarChar, 'Success')
            .query('INSERT INTO Transactions (Amount, CardLastFour, Status) OUTPUT INSERTED.* VALUES (@Amount, @CardLastFour, @Status)');
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;
