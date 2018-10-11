var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models (inside models is code to manually require Articles and Notes)
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB - if deployed, use the deployed db, if not use the local mongoUnchained db
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoUnchained";
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

// Routes

// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with axios
  axios.get("https://www.clickhole.com/c/news").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $("div.item__content").each(function(i, element) {
      // Save an empty result object
      var result = {};
      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .find("h1.headline")
        .children("a")
        .children("div")
        .text();
      result.link = $(this)
        .find("a.js_link")
        .attr("href");
      result.img = $(this)
        .find("img")
        .attr("src")
         console.log(result);
      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, send it to the client
          return res.json(err);
        });
    });
    // If we were able to successfully scrape and save an Article, send a message to the client
    res.send("Scrape Complete");
  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // TODO: Finish the route so it grabs all of the articles
  db.Article.find({}, function(err, data) {
    if (err) {
      console.log (err);
      res.end();
    } else {
      res.json(data);
    }
  })
});

// Route for grabbing a specific Article by id, populate it with it's note
// app.get("/articles/:id", function(req, res) {
//   // TODO
//   // ====
//   // Finish the route so it finds one article using the req.params.id,
//   // and run the populate method with "note",
//   // then responds with the article with the note included
//   db.Article.findOne(
//     {_id: req.params.id})
//     .populate("note")
//     .then(function(article) {
//       res.json(article);
//     })
//     .catch(function(err) {
//       // If an error occurs, send the error back to the client
//       res.json(err);
//     });
// });

// Route for saving/updating an Article's associated Note
// app.post("/articles/:id", function(req, res) {
//   db.Note.create(req.body, function(err, data) {
//     if (err) {
//       console.log(err)
//     } else(
//       res.json(data)
//     )
//   }
//   .then(db.Articles.update({note}, {$set: {}})
//   // TODO
//   // ====
//   // save the new note that gets posted to the Notes collection
//   // then find an article from the req.params.id
//   // and update it's "note" property with the _id of the new note
  
// });

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
