require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const apiRoutes = require('./routes');

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

app.use(morgan('dev'));
app.use(express.json());

// Main route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the Test API',
        endpoints: [
            '/api/users',
            '/api/accounts',
            '/api/transactions'
        ]
    });
});

// API routes
app.use('/api', apiRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
