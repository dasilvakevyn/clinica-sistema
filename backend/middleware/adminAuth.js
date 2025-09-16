const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

const adminAuth = async (req, res, next) => {
    try {
        const userId = req.user;
        const result = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
        const user = result.rows[0];

        if (!user || user.role !== 'admin') {
            return res.status(403).json({ msg: 'Acesso negado. Apenas administradores podem acessar esta rota.' });
        }

        next();
    } catch (error) {
        console.error('Erro na autorização do administrador:', error);
        res.status(500).json({ msg: 'Erro interno do servidor.' });
    }
};

module.exports = adminAuth;