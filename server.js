const express = require("express");

const mongoose = require("mongoose");

const axios = require("axios");
const cheerio = require("cheerio");

// Require all models
const db = require("./models");

const PORT = process.env.PORT || 3000;

// Initialize Express
const app = express();

// Configure middleware


// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

const databaseUri = "mongodb://localhost/mongoHeadlines";


// Connect to the Mongo DB
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });
} else {
  mongoose.connect(databaseUri, { useNewUrlParser: true });
}

//scrape articles and save to database
app.get("/scrape", function(req, res) {
  axios.get("https://www.washingtonpost.com/").then(function(response) {
    const $ = cheerio.load(response.data);

    $("div.headline").each(function(i, element) {
      var result = {}
      result.title = $(element).children("a").text();
      result.link = $(element).children("a").attr("href");
      result.blurb = $(element).parent("div").children(".blurb").text();

      // if (result.title && result.link && result.blurb !== "") {

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
  db.Article
    .findOne({ _id: req.params.id })

    .populate("notes")
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

app.delete("/api/delete", (req, res) => {
  // delete all articles from db
  db.Article
    .remove({})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      console.log(err);
      res.status(500).json(err);
    });
});

app.delete("/api/delete-comment/:id", (req, res) => {
  // delete all articles from db
  db.Note
    .deleteOne({_id: req.params.id})
    .then(function(dbNote) {
      res.json(dbNote);
    })
    .catch(function(err) {
      console.log(err);
      res.status(500).json(err);
    });
});

app.listen(PORT, function() {
  console.log(`App running on port ${PORT}!`);
})
