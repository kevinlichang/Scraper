$(document).ready(function() {

  //get articles from mongodb
  $.ajax({
  method: "GET",
  url: "/articles"
  }).then(function(data) {
    console.log(data);

    data.forEach((result) => {
      let newCard = $("<div>").addClass("card m-3");

      let newTitle = $("<div>").addClass("card-header").html(`<h5><strong>Headline: </strong>${result.title}</h5>`);

      let articleLink = $("<a>").addClass("btn btn-outline-info m-1").attr({"href": result.link, "target": "_blank"}).text(`Click Here for Article Page`);

      let comments = $("<button>").addClass("btn btn-outline-info m-1 comment-btn").attr("data-id", result._id).text("Comments");

      if (result.blurb == "") {
        var newBlurb = $("<div>").addClass("card-body text-center").text("No Blurb Available");
      } else {
        var newBlurb = $("<div>").addClass("card-body").text(result.blurb);
      }

      newCard.append(newTitle, newBlurb, articleLink, comments);

      $("#articles").append(newCard);
    })
        
  }).catch(function(err) {
      console.log(err);
  })

  // scrape articles on button click
  $(document).on("click", "#get-btn", function() {
   
    $.ajax({
      method: "GET",
      url: "/scrape"
    }).then(function(data) {
      location.reload(true);
      
    })

  });

  // remove all articles from Articles collection
  $(document).on("click", "#clear-btn", function() {
    $.ajax({
      method: "DELETE",
      url: "/api/delete"
    })
      .then(function(data) {
        location.reload(true);
      })
      .catch(function(err) {
        console.log(err);
      })
  })
  

  // add notes
  $(document).on("click", ".comment-btn", function() {
    $("#notes").empty();

    let thisId = $(this).attr("data-id");

    $.ajax({
      method: "GET",
      url: `/articles/${thisId}`
    })
      .then(function(data) {
        console.log(data);
        var cardBody = $("<div>").addClass("card-body");

        if (data.notes.length === 0) {
          cardBody.append(`<h5>No Comments Yet</h5>`)
        } else {
          data.notes.forEach((result) => {
            let commentCard = $("<div>").addClass("card");
            var commentName = $("<h5>").addClass("card-title").text(result.name).append("<hr>");
            var commentBody = $("<p>").addClass("card-text").text(result.body);
            var deleteComm = $("<button>").addClass("delete-comment btn btn-outline-info m-1").attr("data-id", result._id).text("Delete Comment");

            commentCard.append(commentName, commentBody, deleteComm).appendTo(cardBody); 
          })
        }

        let newCard = $("<div>").addClass("card m-3");
        let title = $("<div>").addClass("card-header").html(`<h5>${data.title}</h5>`);

        newCard.append(title).append(cardBody);
 
        
        $("#notes")
          .append(newCard)
          .append('<input type="text" class="form-control" id="nameinput">')
          .append("<textarea class='form-control' id='bodyinput' name='body'></textarea>")
          .append(`<button data-id="${data._id}" class="btn btn-outline-success" id='post-comment'>Post Comment</button>`);

        
      })
  })

  $(document).on("click", "#post-comment", function() {
    let thisId = $(this).attr("data-id");

    $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        name: $("#nameinput").val().trim(),
        body: $("#bodyinput").val()
      }
    })
      .then(function(data) {
        console.log(data);      
        $("#notes").empty();
      })
      .catch(function(err) {
        console.log(err);
      });

    $("#nameinput").val("");
    $("#bodyinput").val("");
  });

  //remove comment
  $(document).on("click", ".delete-comment", function() {

    let thisId = $(this).attr("data-id");

    $.ajax({
      method: "DELETE",
      url: `/api/delete-comment/${thisId}`
    })
      .then(function(data) {
        console.log(data);      
        $("#notes").empty();
      })
      .catch(function(err) {
        console.log(err);
      })
  })
  

})