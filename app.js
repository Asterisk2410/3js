const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the "src" directory
app.use(express.static(path.join(__dirname, 'src')));

// If "application.html" is your main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/application.html'));
});

app.listen(3000, () => {
    console.log('Server is running on http://127.0.0.1:3000');
});
