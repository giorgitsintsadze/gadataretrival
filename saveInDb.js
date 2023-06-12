// const mysql = require('mysql')
const mysql = require('mysql2');


const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'data_analytics',
    port: '3306'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        throw err;
    }
    console.log('Connected to MySQL server');
});

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS analytics_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE,
    sessions INT,
    newUsers INT,
    totalRevenue DECIMAL(10, 2),
    transactions INT,
    checkouts INT
  )
`;

connection.query(createTableQuery, (err, result) => {
    if (err) {
        console.error('Error creating table:', err);
        throw err;
    }
    console.log('Table created successfully');
});

function saveInDb(params, callback) {
    const insertQuery = `
    INSERT INTO analytics_data (date, sessions, newUsers, totalRevenue, transactions, checkouts)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

    connection.query(insertQuery, params, callback);
}

module.exports = saveInDb;
