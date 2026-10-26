
const pool = require('./src/config/db');

async function probarConexion() {
    try {
        const [rows] = await pool.query(
            'SELECT DATABASE() AS base_datos, COUNT(*) AS total_tablas FROM information_schema.tables WHERE table_schema = DATABASE()'
        );

        console.log('¡Conexión exitosa!');
        console.log(rows[0]);
        
        const [tablas] = await pool.query('SHOW TABLES');
        console.log('Tablas encontradas:', tablas.length);
        console.table(tablas);
    } catch (error) {
        console.error('Error de conexión:', error.message);
    } finally {
        await pool.end();
    }
}

probarConexion();
