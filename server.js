const express = require("express");

const mongoose = require("mongoose");

const axios = require("axios");
const cheerio = require("cheerio");

// Require all models
const db = require("./models");

const PORT = 3000;

// Initialize Express
const app = express();

// Configure middleware


// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";


// Connect to the Mongo DB
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

app.get("/scrape", function(req, res) {
  axios.get("https://www.washingtonpost.com/").then(function(response) {
    const $ = cheerio.load(response.data);

    $("div.headline").each(function(i, element) {
      var result = {}
      result.title = $(element).children("a").text();
      result.link = $(element).children("a").attr("href");
      result.blurb = $(element).parent("div").children(".blurb").text();

      db.Article
        .create(result)
        .then(function(dbArticle) {
          res.json(dbArticle);
        })
        .catch(function(err) {
          console.log(err);
          res.status(500).json(err);
        })
    });

    res.send("Scrape Complete");
  });
});

// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
  db.Article
  .find({})
  .then(function(dbArticle) {
    res.json(dbArticle);
  })
  .catch(function(err) {
    console.log(err);
    res.status(500).json(err);
  });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", (req, res) => {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })

    .populate("note")
    .then(function(dbArticle) {

      res.json(dbArticle);
    })
    .catch(function(err) {
      console.log(err);
      res.status(500).json(err);
    });
});

app.post("/articles/:id", (req, res) => {
  db.Note
    .create(req.body)
    .then(function(dbNote) {
      return db.Article.findByIdAndUpdate((req.params.id), {$push: {notes: dbNote._id}}, {new: true});
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      console.log(err);
      res.status(500).json(err);
    });

});

app.listen(PORT, function() {
  console.log(`App running on port ${PORT}!`);
})
