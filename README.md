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

Clicking the favorites button sends a query to the database to find all articles where "saved: true"

![Favorites-demo-gif](https://github.com/mcintyrehh/Mongo-Unchained/blob/master/example-gifs/Favorited-demo.gif)
