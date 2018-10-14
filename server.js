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
app.get("/scrape", function (req, res) {
  // First, we grab the body of the html with axios
  axios.get("https://www.clickhole.com/c/news").then(function (response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $("div.item__content").each(function (i, element) {
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
        .attr("src");
      result.excerpt = $(this)
        .find("div.excerpt")
        .children("p")
        .text()
      result.saved = false;
      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function (dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function (err) {
          // If an error occurred, send it to the client
          console.log(err);
          // return res.json(err);
        });
    });
    // If we were able to successfully scrape and save an Article, send a message to the client
    res.send("/");
  });
});

// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
  // TODO: Finish the route so it grabs all of the articles
  db.Article.find({}, function (err, data) {
    if (err) {
      console.log(err);
      res.end();
    } else {
      res.json(data);
    }
  })
});
//get route for saving our articles
//if it
app.post("/articles/:id", function (req, res) {
  db.Article.update(
    { _id: req.params.id },
    { $set: { saved: req.body.saved } }, function(err, data) {
      if (err) console.log(err);
      console.log(data);
    }
  )
})
app.get("/favorites", function(req, res) {
  db.Article.find({saved: true}, function(err, data) {
    if (err) {
      console.log(err);
    } else {
      res.json(data);
    }
  })
})
app.get("/clear", function(req, res) {
  db.Article.remove({}, function(err, data) {
    if (err) console.log(err);
    res.json("/")
  })
})
// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/create-note/:id", function(req, res) {
  db.Note.create(req.body)
  .then(function(dbNote) {
    // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
    // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
    // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
    return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true }).populate("note");
  })
  .then(function(dbArticle) {
    // If we were able to successfully update an Article, send it back to the client
    res.json(dbArticle);
  })
  .catch(function(err) {
    // If an error occurred, send it to the client
    res.json(err);
  });
})

// Start the server
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});
