const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const dns = require("dns");
const axios = require("axios");
require("dotenv").config();

const { count } = require("console");

const app = express();

app.use(bodyParser.json());

const PORT = 3000;

dns.setServers([
    "1.1.1.1",
    "8.8.8.8"
])

mongoose.connect("mongodb+srv://chepillstepan11_db_user:kGvv6ZljvnTZaEwV@cluster0.pdannxb.mongodb.net/?appName=Cluster0")
    .then(() => {
        console.log("Mongo DB Connected!");
    })
    .catch((err) => {
        console.log("Error while connecting: ", err);
    })

const JokeSchema = new mongoose.Schema({
    author: String,
    content: String,
    date: Date,
    verified: Boolean
})

const Joke = mongoose.model("Joke", JokeSchema);

app.get("/jokes", async (req, res) => {
    try {
        const jokes = await Joke.find(req.query);

        res.status(200).json(jokes);
    } catch (error) {
        res.status(500).json({ message: "Error with getting data!" })
    }
});

app.delete("/joke/:id", async (req, res) => {
    await Joke.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Deleted!" })
})

app.post("/joke", async (req, res) => {
    const { content, author } = req.body;

    console.log(content, author);

    const newJoke = new Joke({
        content: content,
        author: author,
        date: new Date(),
        verified: false,
    });

    const savedJoke = await newJoke.save();

    res.status(200).json(savedJoke);

    // try {
    //     



    //     const newJoke = new Joke({
    //         content: content,
    //         author: author,
    //         date: new Date(),
    //         verified: false,
    //     });

    //     const savedJoke = await newJoke.save();

    //     bot.api.sendMessage(5430823037, `A new joke was offered: \n Author: ${author} \n Joke: ${content}`,
    //         {
    //             reply_markup: {
    //                 inline_keyboard: [
    //                     [
    //                         { text: "🗑 Видалити", callback_data: delete_joke }
    //                     ]
    //                 ]
    //             }
    //         }
    //     );

    //     res.status(200).json(savedJoke);
    // } catch (error) {
    //     res.status(400).json({ message: "Joke doesn't be saved!" })
    // }
})

// app.get("/random-joke", async (req,res) => {
//     try {
//         const jokes = await Joke.countDocuments();
//         if (count == 0 ) return null;

//         const rng = Math.random() * jokes

//         const joke = await Joke.findOne().skip(rng)

//         res.status(200).json(joke)
//     } catch (error) {
//         res.status(400).json({message: "Server cann't return random joke!"})
//     }
// })

app.listen(PORT, () => {
    console.log(`Server runinig on: ${PORT}`);
})