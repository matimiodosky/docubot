const express = require('express');
const config = require("../config.json");
const {Chat} = require("./chat");
const app = express();
const PORT = 3000;

// Define a single endpoint
app.use(express.json());
app.post('/chat', async (req, res) => {

    const chat = new Chat()

    const response = await chat
        .question(req.body.question)
        .catch(e => res.send(500))
    res.send(response);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});