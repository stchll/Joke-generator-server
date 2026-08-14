const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const dns = require("dns");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const {swaggerUi,swaggerSpec} = require("./swagger");

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use("/api-docs",swaggerUi.serve,swaggerUi.setup(swaggerSpec));

dns.setServers([
    "1.1.1.1",
    "8.8.8.8"
])

mongoose.connect(`${process.env.DATABASE_LINK}`)
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
    verified: Boolean,
    likes: {type: [String],default: []}
})

const Joke = mongoose.model("Joke", JokeSchema);

app.get("/get-ip", (req,res) => {
    const ip = req.ip

    console.log(ip);

    res.status(200).json(ip)
})

/**
 * @swagger
 * /jokes:
 *   get:
 *    summary: "Get all of jokes or by params"
 *    response:
 *      200:
 *       description: "Sucsessfully gets users!"    
 */

app.get("/jokes", async (req, res) => {
    try {
        const jokes = await Joke.find(req.query);

        res.status(200).json(jokes);
    } catch (error) {
        res.status(500).json({ message: "Error with getting data!" })
    }
});

/**
 * @swagger
 * /joke/:id:
 *   delete:
 *    summary: "Delete a joke by id"
 *    response:
 *      200:
 *       description: "Deleted sucsess!"    
 */

app.delete("/joke/:id", async (req, res) => {
    await Joke.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Deleted!" })
})

/**
 * @swagger
 * /joke:
 *   post:
 *    summary: "Post joke to database (required params: content,author)"
 *    response:
 *      200:
 *       description: "A new joke already added to database (requre verify)"    
 */

app.post("/joke", async (req, res) => {
    const { content, author } = req.body;

    if (!content || !author) {
        return res.status(400).json({ message: "content і author requied!" });
    }

    try {
        const newJoke = new Joke({
            content,
            author,
            date: new Date(),
            verified: false,
        });

        const savedJoke = await newJoke.save();

        res.status(200).json(savedJoke);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Can't save a joke!" });
    }
});

/**
 * @swagger
 * /random-joke:
 *   get:
 *    summary: "Get random one joke between all jokes in database"
 *    response:
 *      200:
 *       description: "A joke is already getted!"    
 */

app.get("/random-joke", async (req, res) => {
    try {
        const count = await Joke.countDocuments();

        if (count === 0) {
            return res.status(404).json({ message: "No jokes found!" });
        }

        const rng = Math.floor(Math.random() * count);

        const joke = await Joke.findOne().skip(rng);

        res.status(200).json(joke);
    } catch (error) {
        res.status(400).json({ message: "Server can't return random joke!" });
    }
});

/**
 * @swagger
 * /update-joke:/id:
 *   put:
 *    summary: "Joke data has been updated!"
 *    response:
 *      200:
 *       description: "Ooops , data can't be updates!"    
 */

app.put("/update-joke/:id", async(req,res) => {
    try {
        const updatedJoke = await Joke.findByIdAndUpdate(req.params.id,req.body);

        if (!updatedJoke) {
            return res.status(400).json({message: "Joke hasn't be founded!"})
        }

        res.json(updatedJoke)
    } catch(eroor) {
        res.status(400).json({message: "Can't update a joke data!"})
    }
})

/**
 * @swagger
 * /verify-joke:/id:
 *   put:
 *    summary: "Verify joke by administrator!"
 *    response:
 *      200:
 *       description: "Joke is already verified!"    
 */

app.put("/verify-joke/:id", async (req,res) => {
    try {
        const verifiedJoke = await Joke.findByIdAndUpdate(
            req.params.id,
            {verified: true}
        );
        

        if (!verifiedJoke) {
            return res.status(400).json({message: "Joke hasn't be founded!"})
        }

        res.json(verifiedJoke)
    } catch(error) {
        res.status(400).json({message: "Can't verify message!"})
    }
})

/**
 * @swagger
 * /health:
 *   get:
 *    summary: "Check server status!"
 *    response:
 *      200:
 *       description: "Server is live!"    
 */

app.get("/health",(req,res) => {
    try {
        res.status(200).json({message: "Server is awaken!"})
    } catch (error) {
        res.status(400).json({message: "Server is currently selepping!"})
    }
})

app.listen(process.env.PORT, () => {
    console.log(`Server is runinig`);
})