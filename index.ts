import express from 'express';
import path from 'path';

const app = express();
const port = 8080;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (_req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
});
