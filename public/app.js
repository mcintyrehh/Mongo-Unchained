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
      noteCardGenerator(data);     
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
  }).then(function(data) {
    $(`#time-${data._id}`).text(`${data.note.date}`);
    $(`#body-${data._id}`).text(data.note.body);
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
const noteCardGenerator = (noteObj) => {
  if (noteObj.note) {
    $(`#note-${noteObj._id}`).append(
      `<div class="card my-2">
        <div class="card-body pb-0" id="body-${noteObj._id}">
           ${noteObj.note.body}
        </div>
        <div class="text-right text-muted m-2" id="time-${noteObj._id}">${noteObj.note.date}</div>
      </div>`
    )
  }
}