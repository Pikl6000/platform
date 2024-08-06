const express = require('express');
const mysql = require('mysql2');
const cors = require('cors'); // Pridaj tento riadok pre povolenie CORS
const path = require('path'); // Na správne obsluhovanie statických súborov
const app = express();
const port = 3000;

app.use(cors()); // Pridaj tento riadok pre povolenie CORS

// Nastav, kde sú uložené statické súbory
app.use(express.static(path.join(__dirname, '../public')));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'platform'
});

// Spojenie s databázou
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database.');
});

app.get('/api/users', (req, res) => {
    console.log('Received request for /api/users');
    connection.query('SELECT * FROM users', (err, results) => {
        if (err) {
            console.error('Error querying the database:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        console.log('Query results:', results);
        res.json(results);
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
