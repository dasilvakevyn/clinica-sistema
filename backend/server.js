require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

const auth = require('./middleware/auth');
const adminAuth = require('./middleware/adminAuth');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

pool.connect((err, client, release) => {
    if (err) {
        return console.error('Erro de conexão com o Banco de Dados:', err.stack);
    }
    client.release();
    console.log('Conexão com o Banco de Dados Estabelecida!');
});

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Servidor backend funcionando!');
});

app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length > 0) {
            return res.status(400).send('Este e-mail já está cadastrado!');
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        await pool.query(
            'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3)', [name, email, password_hash]
        );

        console.log('Novo usuário cadastrado:', email);
        res.status(201).send('Usuário cadastrado com sucesso!');
    } catch (error) {
        console.error('Erro no cadastro do usuário:', error);
        res.status(500).send('Erro no servidor ao cadastrar o usuário.');
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(400).send('E-mail ou senha inválidos.');
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(400).send('E-mail ou senha inválidos.');
        }

        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).send('Erro ao fazer login.');
    }
});

app.get('/api/appointments/occupied/:date', async (req, res) => {
    const { date } = req.params;

    try {
        const result = await pool.query('SELECT appointment_time FROM appointments WHERE appointment_date = $1', [date]);
        const occupiedTimes = result.rows.map(row => row.appointment_time);
        res.json(occupiedTimes);
    } catch (error) {
        console.error('Erro ao buscar horários agendados:', error);
        res.status(500).send('Erro no servidor ao buscar horários agendados.');
    }
});

app.post('/api/appointments', auth, async (req, res) => {
const { patientName, appointmentDate, appointmentTime } = req.body;
const userid = req.user;

try {
const checkResult = await pool.query('SELECT * FROM appointments WHERE appointment_date = $1 AND appointment_time = $2', [appointmentDate, appointmentTime]);

if (checkResult.rows.length > 0) {
return res.status(400).send('Este horário já está agendado. Por favor, escolha outro.');
}

await pool.query(
'INSERT INTO appointments (patient_name, appointment_date, appointment_time, user_id) VALUES ($1, $2, $3, $4)',
[patientName, appointmentDate, appointmentTime, userid]
);

res.status(201).send('Agendamento criado com sucesso!');
} catch (error) {
console.error('Erro ao criar agendamento:', error);
res.status(500).send('Erro no servidor ao criar agendamento.');
}
});

app.get('/api/admin/appointments', auth, adminAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM appointments ORDER BY appointment_date, appointment_time');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar todos os agendamentos:', error);
    res.status(500).send('Erro no servidor ao buscar agendamentos.');
  }
});

app.put('/api/admin/appointments/:id', auth, adminAuth, async (req, res) => {
  const { id } = req.params;
  const { patientName, appointmentDate, appointmentTime, status } = req.body;

  try {
    await pool.query(
      'UPDATE appointments SET patient_name = $1, appointment_date = $2, appointment_time = $3, status = $4 WHERE id = $5',
      [patientName, appointmentDate, appointmentTime, status, id]
    );
    res.status(200).send('Agendamento atualizado com sucesso!');
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    res.status(500).send('Erro no servidor ao atualizar agendamento.');
  }
});

app.delete('/api/admin/appointments/:id', auth, adminAuth, async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM appointments WHERE id = $1', [id]);
    res.status(200).send('Agendamento excluído com sucesso!');
  } catch (error) {
    console.error('Erro ao excluir agendamento:', error);
    res.status(500).send('Erro no servidor ao excluir agendamento.');
  }
});

app.get('/api/weather', async (req, res) => {
    const { lat, lon } = req.query;
    const apiKey = process.env.WEATHER_API_KEY;

    if (!lat || !lon) {
        return res.status(400).send('Coordenadas (lat e lon) são necessárias.');
    }

     try {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=pt_br`;
    const weatherResponse = await axios.get(weatherUrl);
    const weatherData = weatherResponse.data;

    const isRainy = weatherData.weather.some(condition => condition.main.toLowerCase().includes('rain') || condition.main.toLowerCase().includes('drizzle'));
    const isCloudy = weatherData.weather.some(condition => condition.main.toLowerCase().includes('clouds'));

    res.json({
      description: weatherData.weather[0].description,
      temp: weatherData.main.temp,
      willRain: isRainy || isCloudy,
    });
} catch (error) {
    console.error('Erro ao buscar clima:', error);
    res.status(500).send('Erro no servidor ao buscar informações do clima.');
  }
});

app.get('/api/me', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, role FROM users WHERE id = $1', [req.user]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).send('Usuário não encontrado.');
    }

    res.json({ user });
  } catch (error) {
    console.error('Erro ao buscar perfil do usuário:', error);
    res.status(500).send('Erro no servidor ao buscar perfil do usuário.');
  }
});

app.get('/api/protected', auth, (req, res) => {
    res.json({ msg: `Oi, usuário ${req.user}, você acessou uma rota protegida.`});
});

app.listen(PORT, () => {
    console.log(`O servidor está rodando na porta ${PORT}`);
});