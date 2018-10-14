$(document).ready(function () {
  //on scrape press, hit the scrape get route, on success reload the page
  $(".scrape-btn").on("click", function () {
    $.get("/scrape", function (data) {
      window.location.href = data;
    })
  })
  $(".clear-btn").on("click", function() {
    $.get("/clear", function(data) {
      window.location.href = data;
    })
  })
  // Grab the articles in JSON to add a card for each entry
  $.getJSON("/articles", function (data) {
    articleCardGenerator(data);
  });
  //clicking the add a note button animates the notes input
  $("div").on("click", ".dropBtn", function (event) {
    const btnID = $(this).data("id");
    $(`#note-${btnID}`).empty();
    console.log(btnID);
    $('#' + btnID).toggle("medium");
    event.stopPropagation();
    $.ajax({
      method: "GET",
      url: "/articles/" + btnID
    }).then(function(data) {
      console.log(data);
      if (data.note) {
        $(`#note-${btnID}`).append(
          `<div class="card my-2">
            <div class="card-body pb-0">
               ${data.note.body}
            </div>
            <div class="text-right text-muted m-2">${data.note.date}</div>
          </div>`
        )
      }
     
    })
  })
  //
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
    if ($(this).attr("fav-saved") === "false") {
      $(this).attr("fav-saved", "true");
      $(this).empty().html('<i class="fas fa-star mx-auto fav btn"></i>');
    }
    else if ($(this).attr("fav-saved") === "true") {
      $(this).attr("fav-saved", "false");
      $(this).empty().html('<i class="far fa-star mx-auto fav btn"></i>');
    }
  });
  //path for displaying only our favorited articles
  $(".favorites-btn").on("click", function() {
    $("#articles").empty();
    $.getJSON("/favorites", function (data) {
      articleCardGenerator(data);
    })
  })

})
$("body").on("click", ".create-note", function () {
  const noteID = $(this).attr("data-id");
  //this makes sure we only grab the text data from the specific article
  const noteText = $(`.note-text#text-${noteID}`).val();
  console.log(noteID);
  console.log(noteText);
  $.ajax({
    method: "POST",
    url: `/create-note/${noteID}`,
    data: {
      body: noteText
    }
  }).then(function(err, data) {
    if (err) console.log(err);
    console.log(data);
  })
})
const articleCardGenerator = (object) => {
  let savedCheck;
    for (var i = 0; i < object.length; i++) {
      //display a hollow star if unsaved and appropriate fav-saved info
      if (object[i].saved === false) {
        savedCheck = `fav-saved=false><i class="far fa-star mx-auto fav btn"></i></span>`
      }
      //solid star displayed if the article is saved
      else {
        savedCheck = `fav-saved=true><i class="fas fa-star mx-auto fav btn"></i></span>`
      }
      //card displayed for each article in the database, loads it up with data from the database for quick responsive actions
      $("#articles").append(
        `<div class="col-sm-12">
          <div class="card my-1">
            <div class="card-body py-1 row">
              <div class="col-md-3 text-center">
                <img class="img-thumbnail" src="${object[i].img}">
                <div href="#" data-id="${object[i]._id}" class="btn btn-primary dropBtn">
                  Add a note!</div>
                  <span class="fav-div" data-id="${object[i]._id}" ${savedCheck}
              </div>
              <div class="col-md-9">
                <h3 class="card-title"><a href="${object[i].link}">${object[i].title}</a></h3>
                <div class="card-text p-0 excerpt">${object[i].excerpt}</div>
                <div id="${object[i]._id}" class="hidden" style="display: none;">
                  <div id="note-${object[i]._id}"></div>
                  <div class="input-group">
                    <div class="input-group-prepend">
                      <span class="input-group-text">Notes:</span>
                    </div>
                    <textarea class="form-control note-text" id="text-${object[i]._id}" placeholder="add notes here!"></textarea>
                    <div class="input-group-append">
                    <button class="btn btn-outline-success create-note" data-id="${object[i]._id}" type="button" id="button-addon2">Submit</button>
                  </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>`);
    }
}

// // Whenever someone clicks a p tag
// $(document).on("click", "p", function() {
//   // Empty the notes from the note section
//   $("#notes").empty();
//   // Save the id from the p tag
//   var thisId = $(this).attr("data-id");

//   // Now make an ajax call for the Article
//   $.ajax({
//     method: "GET",
//     url: "/articles/" + thisId
//   })
//     // With that done, add the note information to the page
//     .then(function(data) {
//       console.log(data);
//       // The title of the article
//       $("#notes").append("<h2>" + data.title + "</h2>");
//       // An input to enter a new title
//       $("#notes").append("<input id='titleinput' name='title' >");
//       // A textarea to add a new note body
//       $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
//       // A button to submit a new note, with the id of the article saved to it
//       $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

//       // If there's a note in the article
//       if (data.note) {
//         // Place the title of the note in the title input
//         $("#titleinput").val(data.note.title);
//         // Place the body of the note in the body textarea
//         $("#bodyinput").val(data.note.body);
//       }
//     });
// });

// // When you click the savenote button
// $(document).on("click", "#savenote", function() {
//   // Grab the id associated with the article from the submit button
//   var thisId = $(this).attr("data-id");

//   // Run a POST request to change the note, using what's entered in the inputs
//   $.ajax({
//     method: "POST",
//     url: "/articles/" + thisId,
//     data: {
//       // Value taken from title input
//       title: $("#titleinput").val(),
//       // Value taken from note textarea
//       body: $("#bodyinput").val()
//     }
//   })
//     // With that done
//     .then(function(data) {
//       // Log the response
//       console.log(data);
//       // Empty the notes section
//       $("#notes").empty();
//     });

//   // Also, remove the values entered in the input and textarea for note entry
//   $("#titleinput").val("");
//   $("#bodyinput").val("");
// });
