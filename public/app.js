$(document).on("click", "#get-btn", function() {
  $("#articles").empty();





  $.ajax({
    method: "GET",
    url: "/articles"
  })
    .then(function(data) {
      console.log(data);

       data.forEach((result) => {
         let newCard = $("<div>").addClass("card");
         let newTitle = $("<div>").addClass("card-header").text(result.title);
         let newBlurb = $("<div>").addClass("card-body").text(result.blurb);
         let articleLink = $("<a>").addClass("btn btn-outline-info").attr("href", result.link).text(`Click Here for Article Page`);

         newBlurb.append(articleLink);

         newCard.append(newTitle).append(newBlurb);

         $("#articles").append(newCard);
       })
        
    })
    .catch(function(err) {
      console.log(err);
    })
});


$(document).on("click", "#clear-btn", function() {
  $.ajax({
    method:"DELETE",
    url: "/api/delete"
  })
    .then(function(data) {
      location.reload(true);
    })
    .catch(function(err) {
      console.log(err);
    })

  
})