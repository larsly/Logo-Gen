const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { readAndAppend } = require('./helpers/fsUtils');

const PORT = process.env.port || 3001;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

app.get('/notes', (req, res) =>
    res.sendFile(path.join(__dirname, '/public/notes.html'))
);

app.get('/api/notes', (req, res) =>
    fs.readFile('./db/db.json', (err, data) => {
        if (err) throw err;
        res.send(data);
    })
);

app.post('/api/notes', (req, res) => {
    console.log(req.body);

    const { title, text } = req.body;

    if (req.body) {
        const newNote = {
            title,
            text,
            id: uuidv4(),
        };

        readAndAppend(newNote, './db/db.json');
        res.json(JSON.stringify(newNote));
    } else {
        res.status(400).send('Error in adding note');
    }
});

app.delete('/api/notes/:id', (req, res) => {
    if (req.params.id) {
        fs.readFile('./db/db.json', 'utf8', (err, data) => {
            if (err) throw err;
            const notes = JSON.parse(data);
            for (let i = 0; i < notes.length; i++) {
                if (notes[i].id === req.params.id) {
                    notes.splice(i, 1);
                    fs.writeFile('./db/db.json', JSON.stringify(notes), (err) => {
                        if (err) throw err;
                        console.log('deleted successfully');
                        res.json('Note deleted successfully');
                    });
                    return;
                }
            }
            res.status(404).send('Error in deleting: ID not found');
        });
    } else {
        res.status(400).send('ID is NULL');
    }
});

app.get('/*', (req, res) =>
    res.sendFile(path.join(__dirname, '/public/index.html'))
);

app.listen(PORT, () =>
    console.log(`App listening at http://localhost:${PORT}`)
);