# Mongo-Unchained
[Heroku link](https://mongo-unchained.herokuapp.com/)

Proof of concept web application that scrapes [ClickHole](www.clickhole.com) for articles using Axios and Cheerio. Article data is stored in MongoDB using Mongoose schemas. 

![Scrape-demo-gif](https://github.com/mcintyrehh/Mongo-Unchained/blob/master/example-gifs/Scrape-demo.gif)

# Favorites

Clicking on the empty star icon sends an update query to the MongoDB database, the click saves the articles database ID, uses a ternary operator to save the opposite of its current saved value, and initiates a POST call that updates the saved status of the article in the Mongo database.
```javascript
$("body").on("click", ".fav-div", function () {
    const articleID = $(this).attr("data-id");
    const favSaved = $.parseJSON($(this).attr("fav-saved"));
    const setOpposite = favSaved ? false:true;
    $.ajax({
      method: "POST",
      url: `/articles/${articleID}`,
      data: {
        saved: setOpposite
      }
    }).then(function (data) {
      console.log(data);
    })
```

Clicking the favorites button sends a query to the database to find all articles where "saved: true". Unclicking the favorites icon doesn't immedietely remove the article card in case it was clicked by accident (although it **is** updated to "saved: false" in the database, until it is re-favorited).

![Favorites-demo-gif](https://github.com/mcintyrehh/Mongo-Unchained/blob/master/example-gifs/Favorited-demo.gif)

# Notes

The user can add a note to an article by dropping down the form with the "add a note!" button. 
```javascript
// Route for saving/updating an Article's associated Note
app.post("/create-note/:id", function(req, res) {
  db.Note.create(req.body)
    .then(function(dbNote) {
      return db.Article.findOneAndUpdate(
      //the article is matched with the id passed in the post :id parameter
        { _id: req.params.id },
        { note: dbNote._id },
        { new: true }
      )
      //the article is then updated to be associated with the new note
        .populate("note");
    })
    .then(function (dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
})
```

The "x" icon stores the note's ID and when clicked deletes the note from the notes database

![Notes-demo-gif](https://github.com/mcintyrehh/Mongo-Unchained/blob/master/example-gifs/Note-demo.gif)
