$(function() {
  //TODO SESSIONID

  if (window.location.pathname == '/dashboard.html') {
    getDocuments('*');
    if(!loggedIn()) {
      window.location.replace('index.html');
    }
  }

  //admin logged in stuffs
  if(loggedIn()) {
    showAdminPage();
  }
});


function loggedIn(bool) {
  var sessionToken = sessionStorage.getItem('token');
  if (sessionToken == 'admin') {
    bool = true;
  } else {
    bool = false;
  }

  return bool;
}

function showAdminPage() {
  $('<a href="dashboard.html" id="admin_dashboard">Dashboard</a>').insertBefore('.login_modal #input_toggle');
  if (window.location.pathname == '/dashboard.html') {
    $('#admin_dashboard').addClass('active');
  }
  $('#input_toggle').text('Logout');
  $('#input_toggle').css({
    'background-color' : '#FC4349',
    'color' : '#fff'
  });
}

$("#searchForm").submit(function(e) {
  $('.result_item').remove();
  queryString = $("#searchField").val();
  $('.results .items').html('');
  $('.results .found_results').html('');
  $('.keyword_toggle').html('');
  queryArr = queryString.split(':');
  if (queryArr.length <= 1) {
    // queryString = "*:" + queryArr;
  } else {
    //
  }

  searchDocuments(queryString);

  e.preventDefault();
});



function searchDocuments(searchQuery) {
  var keywordToggleArr = [];
  queryString = searchQuery;
  $.ajax({
    url: 'http://130.211.71.115/solr/ptil9/select/', //FIX
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
      var resultsCount = (data.response["numFound"]); // Documents found
      var highlightCount = 0; // Total highlights found
      if (resultsCount == 0) {
        $('.found_results').text('No results found.');
        $('.keyword_toggle').hide();
      } else {
        // FOR EACH (FULL-TEXT) RESULT
        for (i = 0; i < resultsCount; i++) {
          var results = data.response.docs;
          var resultTitle = results[i]["id"];
          var resultUrl = results[i]["subject"];
          var resultLastModified = Date.parse(results[i]["modified"]).toString('MMMM dS, yyyy HH:mm:ss');
          var resultKeyword = results[i]["keywords"];
          $('.keyword_toggle').show();

          // Loop each document full text
          $.each(data.response.docs[i], function(key, value) { // For each metadata
            // Append doc title to result highlights
            if (key == "title") {
              $('.results .items').append(
                '<div class="result_item" keyword=\"' + resultKeyword + '\">' +
                '<p class="keyword_category">' + resultKeyword + '</p>' +
                '<a href=' + resultUrl + ' target="_blank">' + value + '</a>' +
                '<p class="date_modified">Last modified: ' + resultLastModified + '</p>' +
                '<ul></ul></div>');


              if (jQuery.inArray(resultKeyword, keywordToggleArr) == -1) {
                keywordToggleArr.push(resultKeyword);
              }
            }

            // Keep newline formatting and remove duplicate newlines
            if (key != "_version_") {
              var valSplit = value.split("\n");
              var output = [];
              for (cnt = 0; cnt < valSplit.length; cnt++) {
                if (valSplit[cnt] == '<br/>' || output.indexOf(valSplit[cnt]) < 0) {
                  output.push(valSplit[cnt]);
                }
              }
              var newVal = output.join("\n");
              newVal = newVal.replace(/\n/g, "<br/>");

              // Add result to html
              // $('#searchResult').append(key + ": " + newVal + "<br/>");
            }
          });

          // Loop each highlight for current docID
          $.each(data.highlighting[resultTitle].content, function(key, value) { // For each metadata
            $('.result_item:eq(' + i + ') ul').append('<li>' + value + '</li>');
            highlightCount++;
          });
        }

        $.each(keywordToggleArr, function(key, val) {
          $('.results .keyword_toggle').append('<input type="checkbox" id=' + '\"' + val + '\" value=' + '\"' + val + '\" checked/>');
          $('.results .keyword_toggle').append('<label for=' + '\"' + val + '\">' + val + '</label><br/>');
        });


        var resultSuffix = '';
        var documentSuffix = '';
        if (highlightCount > 1) {
          resultSuffix = 's';
        }
        if (resultsCount > 1) {
          documentSuffix = 's';
        }
        $('.found_results').text('Found ' + highlightCount + ' result' + resultSuffix + ' in ' + resultsCount + ' document' + documentSuffix + '.');
      }
    }
  });
}

var keywordArr = [];
function getDocuments(searchQuery) {
  query = searchQuery;
  $.ajax({
    url: 'http://130.211.71.115/solr/ptil9/select/',
    data: {
      'wt' : 'json',
      'q' : query,
      'rows' : 15 // rows=numOfResults, change?
    },
    dataType: 'jsonp',
    contentType: false,
    jsonp: 'json.wrf',
    success: function(data) {
      var resultsCount = (data.response["numFound"]);
      if (resultsCount == 0) {
        $('.found_results').text('No results found.'); // CHANGE
      } else {
        // FOR EACH (FULL-TEXT) RESULT
        for (i = 0; i < resultsCount; i++) { // Fix, fjern alt uten var title
          var results = data.response.docs;
          var title = results[i]["title"];
          var id = results[i]["id"];
          var resultUrl = results[i]["subject"];
          var resultLastModified = Date.parse(results[i]["modified"]).toString('MMMM dS, yyyy HH:mm:ss');
          var keyword = results[i]["keywords"];

          if (jQuery.inArray(keyword, keywordArr) == -1) {
            keywordArr.push(keyword);
          }

          $('#updatedoc_form #doc_titles').append('<option value=' + title + '>' + title + '</option>');

        }
      }
    }
  });
}


function getDocData(key, val) {
  query = key + ':\"' + val + '\"';
  $.ajax({
    url: 'http://130.211.71.115/solr/ptil9/select/',
    data: {
      'wt' : 'json',
      'q' : query,
      'rows' : 15 // rows=numOfResults, change?
    },
    dataType: 'jsonp',
    contentType: false,
    jsonp: 'json.wrf',
    success: function(data) {
      var resultsCount = (data.response["numFound"]);
      if (!resultsCount == 1) {
        return;
      } else {
        var results = data.response.docs[0];
        var title = results["title"];
        var id = results["id"];
        var resultUrl = results["subject"];
        var resultLastModified = Date.parse(results["modified"]).toString('MMMM dS, yyyy HH:mm:ss');
        var keyword = results["keywords"];



        $.each(keywordArr, function(key, val) {
          if (val == keyword) {
            $('#updatedoc_form #keyword_list').val(val);
            $('#updatedoc_form #doc_keyword').append('<option value=' + '\"' + val + '\" class="selected_option current_val"' + '>');
          } else {
            $('#updatedoc_form #doc_keyword').append('<option value=' + '\"' + val + '\"' + '>');
          }
        });

        $('#updatedoc_form #doc_title').val(title);
        $('#updatedoc_form a').attr('href', resultUrl);
        $('#updatedoc_form a').text(resultUrl);

      }
    }
  });
}

function getDocId(title) {
  // val = $('#doc_titles').find('option:selected').text();
  var queryTitle = 'title:\"' + title + '\"';
  var ajaxCall =
  new Promise(function(resolve, reject) {
    $.ajax({
      url: 'http://130.211.71.115/solr/ptil9/select/',
      data: {
        'wt' : 'json',
        'q' : queryTitle,
        'rows' : 15 // rows=numOfResults, change?
      },
      dataType: 'jsonp',
      jsonp: 'json.wrf',
      success: function(data) {
        var resultsCount = (data.response["numFound"]);
        if (!resultsCount == 1) {
          return
        } else {
          var results = data.response.docs[0];
          var id = results["id"];
          resolve(id);
        }
      }
    });
  });
  return ajaxCall;
  // return ajaxCall;
}

/*
'id' : '/Users/MatsJacobsen/Documents/Nettsider/Solr/solr-7.0.0/example/ptil/report/2016_1142_granskingsrapport Sture H2S.pdf',
'title' : { 'set' : 'ASDF' }
*/

/*
data: {
  'id' : '/Users/MatsJacobsen/Documents/Nettsider/Solr/solr-7.0.0/example/ptil/report/2016_1142_granskingsrapport Sture H2S.pdf',
  'set' : {
    'title' : 'asdasdassda'
  }
},
*/

$("#updatedoc_form").submit(function(e) {
  var titleInput = $('#doc_title').val();
  var keywordInput = $('#keyword_list').val();
  var date = new Date().toString('u');
  date = date.replace(/ /g, 'T');

  var thisId;
  var selectedOption = $('#doc_titles').find('option:selected').text();

  if (!titleInput || !keywordInput || !selectedOption) {
    failResponse();
  } else {
    getDocId(selectedOption).then(function(id) {
      var updateQuery =
      "<add><doc><field name='id'>" + id +
      "</field><field name='title' update='set'>" + titleInput +
      "</field><field name='keywords' update='set'>" + keywordInput +
      "</field><field name='modified' update='set'>" + date +
      "</field></doc></add>";
      updateQuery = encodeURIComponent(updateQuery);

      $.ajax({
        url: 'http://130.211.71.115/solr/ptil9/update/?commit=true&stream.body=' + updateQuery, //FIX
        type: 'GET',
        crossDomain: true,
        dataType: 'jsonp',
        jsonp: 'json.wrf',
        success: function(data) {
          //
        }
      });
      successResponse();

    });
  }

  e.preventDefault();
  // location.reload();
});

function successResponse() {
  $('#updatedoc_form .response i').remove();
  $('#updatedoc_form .response').removeClass('fail');
  $('#updatedoc_form .response').addClass('success');
  $('#updatedoc_form .response').append('<i class="material-icons">check_circle</i>');
  $('#updatedoc_form .response').slideDown(200);
}

function failResponse() {
  $('#updatedoc_form .response i').remove();
  $('#updatedoc_form .response').removeClass('success');
  $('#updatedoc_form .response').addClass('fail');
  $('#updatedoc_form .response').append('<i class="material-icons">error</i>');
  $('#updatedoc_form .response').slideDown(200);
}

$('.keyword_toggle').on('change', function(e) {
  var inputVal = e.target['value'];
  var inputChecked = e.target.checked;

  if (!inputChecked) {
    $('.result_item').filter('[keyword=\"' + inputVal + '\"]').hide();
  } else {
    $('.result_item').filter('[keyword=\"' + inputVal + '\"]').show();
  }
});

$('#input_toggle').click(function() {
  if (loggedIn()) {
    sessionStorage.clear();
    location.reload();
  } else {
    $('.modal_container').slideDown();
  }
});

$('.modal_container').click(function(e) {
  if ($(e.target).attr('class') == 'modal_container') {
    $('.modal_container').slideUp();
  }
});

$('#admin_btn').click(function(e) {
  e.preventDefault();
  var username = $('#username').val();
  var pw = $('#password').val();

  if (username == 'admin' && pw == 'abc123') {
    sessionStorage['token'] = 'admin';
    if (loggedIn()) {
      showAdminPage();
    }
    $('.modal_container').slideUp();
  } else {
    $('#admin_btn').addClass('fail');
  }
});



$('#doc_titles').on('change', function() {
  $('#updatedoc_form .response').hide();
  $('#updatedoc_form input').removeClass('input_error');

  var selection = $(this).find('option:selected').text();
  $('#updatedoc_form #doc_title').val('');
  $('#updatedoc_form #keyword_list').val('');
  $('#updatedoc_form #doc_keyword option').remove();

  if (selection) {
    $('#updatedoc_form .container').removeClass('hidden');
    $('#updatedoc_form .container').css({
      'display' : 'flex'
    }).hide().fadeIn(250);
  } else {
    $('#updatedoc_form .container').addClass('hidden');
  }
  getDocData('title', selection);
});

// Hide/show datalist values on click
$('#keyword_list').on('click', function() {
  var selection = $('#keyword_list').val();
  $('.selected_option').removeClass('selected_option');
  $('#doc_keyword').find('option[value=\"' + selection + '\"]').addClass('selected_option');

  $(this).val('');
  // $('#updatedoc_form #doc_keyword').append('<option value=' + '\"' + val + '\" class="selected_option"' + '>');
});
$('#keyword_list').on('mouseleave', function() {
  if ($(this).val() == '') {
    $(this).val($('.selected_option').val());
  }
});
$('#keyword_list').on('focusout', function() {
  var selection = $('#keyword_list').val();
  if(selection != '' && $('#doc_keyword').has('option[value=\"' + selection + '\"]').length == 0) {
    $('.selected_option').removeClass('selected_option');
    $('#updatedoc_form #doc_keyword').append('<option value=' + '\"' + selection + '\" class="selected_option"' + '>');
  } else if (selection == '') {
    $(this).val($('.current_val').val());
  }
});


$('#updatedoc_form input').on('change keyup keydown paste', function() {
  if (!$(this).val()) {
    $(this).addClass('input_error');
  } else {
    $(this).removeClass('input_error');
  }
});

$('#admin_form input').on('change keyup keydown paste', function() {
  $('#admin_btn').removeClass('fail');
});
