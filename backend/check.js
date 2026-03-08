const mysql = require('mysql2/promise');
require('dotenv').config();

const checkInfo = async () => {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
        });
        const [databases] = await connection.query('SHOW DATABASES LIKE "' + process.env.DB_NAME + '"');
        console.log("Databases:", databases);

        await connection.query('USE ' + process.env.DB_NAME);
        const [tables] = await connection.query('SHOW TABLES');
        console.log("Tables in " + process.env.DB_NAME + ":", tables.map(t => Object.values(t)[0]));
        await connection.end();
    } catch (error) {
        console.error("Error:", error.message);
    }
};

checkInfo();
