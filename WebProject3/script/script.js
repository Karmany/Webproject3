$(function() {
  $('#searchField').val('helse, miljø');
  $("#searchForm").submit();
});

$("#searchForm").submit(function(e) {
  $('.results').html('');
  queryString = $("#searchField").val();
  $('#searchResult').html('');
  queryArr = queryString.split(':');
  if (queryArr.length <= 1) {
    // queryString = "*:" + queryArr;
  } else {
    //
  }
  console.log(queryString);
  $.ajax({
    url: 'http://localhost:8983/solr/web3/select/', //FIX
    data: {
      'wt' : 'json',
      'q' : queryString,
      'hl' : true,
      'hl.snippets' : 5,
      'rows' : 15 // rows=numOfResults, change?
    },
    dataType: 'jsonp',
    contentType: false,
    jsonp: 'json.wrf',
    success: function(data) {
      console.log("success!!");
      var resultsCount = (data.response["numFound"]);
      if (resultsCount == 0) {
        $('#searchResult').text('No results found.');
      } else {
        // FOR EACH (FULL-TEXT) RESULT
        /*
        for (i = 0; i < resultsCount; i++) {
          var results = data.response.docs;
          console.log(data);
          $.each(data.response.docs[i], function(key, value) { // For each metadata
            // Keep newline formatting and remove duplicate newlines
            if (key != "_version_") {
              var valSplit = value.split("\n");
              var output = [];
              for (var i = 0; i < valSplit.length; i++) {
                if (valSplit[i] == '<br/>' || output.indexOf(valSplit[i]) < 0) {
                  output.push(valSplit[i]);
                }
              }
              var newVal = output.join("\n");
              newVal = newVal.replace(/\n/g, "<br/>");

              // Add result to html
              $('#searchResult').append(key + ": " + newVal + "<br/>");
            }
          });
        }
        */
        console.log(data);
        /*
        $.each(data.highlighting, function() { // For each metadata
          var numOfHighlights = this.content.length;
          for (i = 0; i < numOfHighlights; i++) {
            var textFragment = this.content[i];
            $('.results').append('<p>' + this + '<br/>' + textFragment + '<p>');
          }
        });
        */
        var numFound = 0;
        $.each(data.highlighting, function(key, value) { // For each metadata
          key = key.split("/").pop(); // Extract last part of string -> filename
          $('.results').append('<p>' + key + '</p><ul></ul>');
          console.log(numFound);
          var numOfHighlights = value.content.length;
          for (i = 0; i < numOfHighlights; i++) {
            $('.results ul:eq(' + numFound + ')').append('<li>' + value.content[i] + '</li>');
          }
          numFound++;
        });
      }
    }
  });

  e.preventDefault();
});
