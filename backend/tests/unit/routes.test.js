// Pruebas unitarias de backend/src/routes.js (generadas con ADEVA DEV - adeva-test-generator)
// La capa de datos (./db) se mockea: no se requiere SQL Server para ejecutarlas.
const express = require('express');
const request = require('supertest');
const bcrypt = require('bcryptjs');

const mockQuery = jest.fn();
const mockInput = jest.fn();
const mockRequest = { input: mockInput, query: mockQuery };
const mockPool = { request: jest.fn(() => mockRequest) };

jest.mock('../../src/db', () => ({
    poolPromise: Promise.resolve(mockPool),
    sql: {
        NVarChar: 'NVarChar',
        Int: 'Int',
        Bit: 'Bit',
        Decimal: jest.fn((p, s) => `Decimal(${p},${s})`),
    },
}));

const router = require('../../src/routes');

function buildApp() {
    const app = express();
    app.use(express.json());
    app.use('/api', router);
    return app;
}

// Devuelve los parámetros enviados con .input(name, type, value) como { name: { type, value } }
function inputs() {
    return Object.fromEntries(mockInput.mock.calls.map(([name, type, value]) => [name, { type, value }]));
}

const GENERIC_ERROR = 'Error interno del servidor';

let app;

beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockInput.mockReturnValue(mockRequest);
    app = buildApp();
});

afterEach(() => {
    console.error.mockRestore();
});

describe('GET /api/users', () => {
    test('normal: devuelve 200 con la lista de usuarios sin la contraseña', async () => {
        mockQuery.mockResolvedValue({
            recordset: [
                { Id: 1, FullName: 'Ana', Password: '$2b$10$hash1' },
                { Id: 2, FullName: 'Luis', Password: '$2b$10$hash2' },
            ],
        });

        const res = await request(app).get('/api/users');

        expect(res.status).toBe(200);
        expect(res.body).toEqual([{ Id: 1, FullName: 'Ana' }, { Id: 2, FullName: 'Luis' }]);
        expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM Users');
    });

    test('edge: tabla vacía devuelve 200 con arreglo vacío', async () => {
        mockQuery.mockResolvedValue({ recordset: [] });

        const res = await request(app).get('/api/users');

        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
    });

    test('error: fallo de base de datos devuelve 500 genérico y registra el detalle', async () => {
        const err = new Error('Login failed for user sa');
        mockQuery.mockRejectedValue(err);

        const res = await request(app).get('/api/users');

        expect(res.status).toBe(500);
        expect(res.text).toBe(GENERIC_ERROR);
        expect(res.text).not.toContain('Login failed');
        expect(console.error).toHaveBeenCalledWith(err);
    });
});

describe('POST /api/users', () => {
    const inserted = { Id: 10, FullName: 'Ana Pérez', Password: '$2b$10$hash' };

    beforeEach(() => {
        mockQuery.mockResolvedValue({ recordset: [inserted] });
    });

    test('normal: crea usuario con campos camelCase y devuelve 201 sin la contraseña', async () => {
        const res = await request(app).post('/api/users').send({
            fullName: 'Ana Pérez',
            email: 'ana@test.com',
            password: 'Secreta123',
            phone: '3001234567',
            age: 30,
            country: 'CO',
            gender: 'F',
            interests: 'música',
            comments: 'hola',
            terms: true,
        });

        expect(res.status).toBe(201);
        expect(res.body).toEqual({ Id: 10, FullName: 'Ana Pérez' });
        const { Password, ...rest } = inputs();
        expect(rest).toEqual({
            FullName: { type: 'NVarChar', value: 'Ana Pérez' },
            Email: { type: 'NVarChar', value: 'ana@test.com' },
            Phone: { type: 'NVarChar', value: '3001234567' },
            Age: { type: 'Int', value: 30 },
            Country: { type: 'NVarChar', value: 'CO' },
            Gender: { type: 'NVarChar', value: 'F' },
            Interests: { type: 'NVarChar', value: 'música' },
            Comments: { type: 'NVarChar', value: 'hola' },
            Terms: { type: 'Bit', value: true },
        });
        expect(Password.type).toBe('NVarChar');
        expect(mockQuery.mock.calls[0][0]).toMatch(/^INSERT INTO Users .* OUTPUT INSERTED\.\*/);
    });

    test('normal: la contraseña se guarda con hash bcrypt, nunca en texto plano', async () => {
        await request(app).post('/api/users').send({ email: 'a@x.com', password: 'Secreta123' });

        const stored = inputs().Password.value;
        expect(stored).not.toBe('Secreta123');
        expect(stored).toMatch(/^\$2[aby]\$10\$/);
        expect(bcrypt.compareSync('Secreta123', stored)).toBe(true);
    });

    test('normal: acepta campos PascalCase', async () => {
        await request(app).post('/api/users').send({
            FullName: 'Luis', Email: 'luis@test.com', Password: 'x', Phone: '1',
            Age: '25', Country: 'MX', Gender: 'M', Interests: 'cine', Comments: 'c', Terms: 'true',
        });

        const i = inputs();
        expect(i.FullName.value).toBe('Luis');
        expect(i.Email.value).toBe('luis@test.com');
        expect(i.Age.value).toBe(25);
        expect(i.Country.value).toBe('MX');
        expect(i.Terms.value).toBe(true);
    });

    test('normal: camelCase tiene prioridad sobre PascalCase', async () => {
        await request(app).post('/api/users').send({ email: 'a@x.com', Email: 'b@x.com' });

        expect(inputs().Email.value).toBe('a@x.com');
    });

    test('edge: interests como arreglo se une con ", "', async () => {
        await request(app).post('/api/users').send({ interests: ['música', 'deporte', 'cine'] });

        expect(inputs().Interests.value).toBe('música, deporte, cine');
    });

    test('edge: body vacío usa valores por defecto', async () => {
        const res = await request(app).post('/api/users').send({});

        expect(res.status).toBe(201);
        const i = inputs();
        ['FullName', 'Email', 'Phone', 'Country', 'Gender', 'Interests', 'Comments']
            .forEach(k => expect(i[k].value).toBe(''));
        expect(i.Age.value).toBeNull();
        expect(i.Terms.value).toBe(false);
    });

    test('edge: petición sin body JSON se trata como body vacío (201)', async () => {
        const res = await request(app).post('/api/users');

        expect(res.status).toBe(201);
        expect(inputs().Email.value).toBe('');
    });

    test.each([
        [true, true],
        ['true', true],
        [1, true],
        ['1', true],
        [false, false],
        ['false', false],
        [0, false],
        ['0', false],
        ['yes', false],
    ])('edge: terms=%p se mapea a %p', async (terms, expected) => {
        await request(app).post('/api/users').send({ terms });

        expect(inputs().Terms.value).toBe(expected);
    });

    test('edge: terms=false explícito no cae al valor de Terms', async () => {
        await request(app).post('/api/users').send({ terms: false, Terms: true });

        expect(inputs().Terms.value).toBe(false);
    });

    test.each([
        ['42', 42],
        [0, 0],
        ['0', 0],
        [150, 150],
        ['', null],
        [null, null],
    ])('edge: age=%p se convierte a %p', async (age, expected) => {
        const res = await request(app).post('/api/users').send({ age });

        expect(res.status).toBe(201);
        expect(inputs().Age.value).toBe(expected);
    });

    test.each(['abc', '30.9', -1, 151, '12abc'])('error: age=%p inválida responde 400 sin tocar la BD', async (age) => {
        const res = await request(app).post('/api/users').send({ age });

        expect(res.status).toBe(400);
        expect(res.text).toMatch(/edad/);
        expect(mockQuery).not.toHaveBeenCalled();
    });

    test('error: fallo al insertar devuelve 500 genérico', async () => {
        mockQuery.mockRejectedValue(new Error('Violation of UNIQUE KEY constraint'));

        const res = await request(app).post('/api/users').send({ email: 'dup@test.com' });

        expect(res.status).toBe(500);
        expect(res.text).toBe(GENERIC_ERROR);
    });
});

describe('POST /api/transactions', () => {
    const inserted = { Id: 5, Amount: 150.5, CardLastFour: '1111', Status: 'Success' };

    beforeEach(() => {
        mockQuery.mockResolvedValue({ recordset: [inserted] });
    });

    test('normal: registra la transacción y devuelve 201', async () => {
        const res = await request(app).post('/api/transactions')
            .send({ amount: '150.50', cardNumber: '4111111111111111' });

        expect(res.status).toBe(201);
        expect(res.body).toEqual(inserted);
        expect(inputs()).toEqual({
            Amount: { type: 'Decimal(18,2)', value: 150.5 },
            CardLastFour: { type: 'NVarChar', value: '1111' },
            Status: { type: 'NVarChar', value: 'Success' },
        });
    });

    test('normal: solo se envían los últimos 4 dígitos, nunca el número completo', async () => {
        await request(app).post('/api/transactions')
            .send({ amount: 10, cardNumber: '5500000000000004' });

        const values = mockInput.mock.calls.map(c => c[2]);
        expect(values).not.toContain('5500000000000004');
        expect(inputs().CardLastFour.value).toBe('0004');
    });

    test('edge: sin cardNumber usa "0000"', async () => {
        await request(app).post('/api/transactions').send({ amount: 10 });

        expect(inputs().CardLastFour.value).toBe('0000');
    });

    test('edge: cardNumber de menos de 4 caracteres se usa completo', async () => {
        await request(app).post('/api/transactions').send({ amount: 10, cardNumber: '12' });

        expect(inputs().CardLastFour.value).toBe('12');
    });

    test('edge: cardNumber numérico (no string) se acepta y se toman sus últimos 4 dígitos', async () => {
        const res = await request(app).post('/api/transactions')
            .send({ amount: 10, cardNumber: 4111111111111234 });

        expect(res.status).toBe(201);
        expect(inputs().CardLastFour.value).toBe('1234');
    });

    test.each([
        ['0.01', 0.01],
        [99.99, 99.99],
        ['1000', 1000],
    ])('edge: amount=%p válido se convierte a %p', async (amount, expected) => {
        const res = await request(app).post('/api/transactions').send({ amount, cardNumber: '4111' });

        expect(res.status).toBe(201);
        expect(inputs().Amount.value).toBe(expected);
    });

    test.each([undefined, null, '', 'abc', '-20', 0, '0'])(
        'error: amount=%p inválido responde 400 sin tocar la BD',
        async (amount) => {
            const res = await request(app).post('/api/transactions').send({ amount, cardNumber: '4111' });

            expect(res.status).toBe(400);
            expect(res.text).toMatch(/monto/);
            expect(mockQuery).not.toHaveBeenCalled();
        },
    );

    test('error: petición sin body JSON responde 400 (sin monto)', async () => {
        const res = await request(app).post('/api/transactions');

        expect(res.status).toBe(400);
        expect(mockQuery).not.toHaveBeenCalled();
    });

    test('error: fallo de base de datos devuelve 500 genérico', async () => {
        mockQuery.mockRejectedValue(new Error('Timeout: Request failed to complete in 15000ms'));

        const res = await request(app).post('/api/transactions')
            .send({ amount: 10, cardNumber: '4111111111111111' });

        expect(res.status).toBe(500);
        expect(res.text).toBe(GENERIC_ERROR);
    });
});
