const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const dns = require("dns");
require("dotenv").config()

const app = express();

app.use(express.json());
app.use(bodyParser.json());

const PORT = 3000;

dns.setServers([
    "1.1.1.1",
    "8.8.8.8"
])

mongoose.connect(process.env.DATABASE_LINK)
.then(()=> {
    console.log("Mongo DB Connected!");
})
.catch((err)=>{
    console.log("Error while connecting: " , err);
})

const JokeSchema = new mongoose.Schema({
    author: String,
    content: String,
    date: Date,
    verified: Boolean
})

const Joke = mongoose.model("Joke",JokeSchema);

app.get("/jokes",async (req,res) => {
    try {
        const jokes = await Joke.find(req.query);

        res.status(200).json(jokes);
    } catch(error) {
        res.status(500).json({message: "Error with getting data!"})
    }
});

app.post("/joke", async (req,res) => {
    try {
        const { content, author } = req.body;

        const newJoke = new Joke ({
            content: content,
            author: author,
            date: new Date(),
            verified: false,
        });

        const savedJoke = await newJoke.save();
        res.status(200).json(savedJoke);
    } catch (error) {
        res.status(400).json({message: "Joke doesn't be saved!"})
    }
})

app.get("/hello",(req,res) => {
    res.json({message: "Hello world"})
})

app.listen(PORT, () => {
    console.log(`Server runinig on: ${PORT}`);
})