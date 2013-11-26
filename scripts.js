var query = 'football';
var orderby = 'published';
var maxResults = 10;
var queryURL = 'https://gdata.youtube.com/feeds/api/videos?q='+query+'&orderby='+orderby+'&start-index=11&max-results='+maxResults+'&v=2&alt=json';

var playlistArray = [];
var playlistArrayTitle = [];

$(function() {
	// load playlist
	getStorage('local');

	// query
	var searchInput = $("#search-input");
	var searchValue = $('#search-value');
	searchInput.keyup(function(event){
		event.preventDefault();
		query = searchInput.val();
		searchValue.html('Showing results for "'+query+'"...');
		constructURL(query, orderby, maxResults);
		var searchResults = $('#search-results');
		searchResults.html('');
	    getData(queryURL);
	});

	// clear query
	searchInput.blur(function(event){
		if (!searchInput.val()){
			$('#search-results').html('');
			searchValue.html('Start searching for videos!');
		}
	});
	
	// sorting
	$('input[name=orderby]').change(function()  {
    	var selectedVal = "";
		var selected = $("input[type='radio'][name='orderby']:checked");
		if (selected.length > 0) {
		    selectedVal = selected.val();
		    console.log(selectedVal);
		    orderby = selectedVal;
		    // reconstructURL & getData
		    constructURL(query, orderby, maxResults);
		    getData(queryURL);
		}
	});
});

function constructURL (_query, _orderby, _maxResults) {
	query = _query;
	orderby = _orderby;
	maxResults = _maxResults;
	queryURL = 'https://gdata.youtube.com/feeds/api/videos?q='+query+'&orderby='+orderby+'&start-index=11&max-results='+maxResults+'&v=2&alt=json';
}

function getData (_url) {
	queryURL = _url;
	var searchResults = $('#search-results');
	searchResults.html('');
	// Data Retrieval
	console.log(queryURL);
	$.getJSON(queryURL, function(data) {
		$.each(data.feed.entry, function(i, item) {
			var videoID = item.id.$t;
			videoID = videoID.substr(videoID.length-11);
		    var title = item.title.$t;
		    var category = item.category;
		    $.each(category, function(k, categoryItem) {
			    category = categoryItem.label;
			});
		    var author = item.author;
		    $.each(author, function(j, authorItem) {
		    	author = authorItem.name.$t;
		    });
		    var date = item.published.$t;
		    date = date.substr(0,10);
		    var src = item.content.src;
		    var encodedTitle = title.replace(/\"/g, '\\"');
		    searchResults.prepend("<div class='result-item'><div class='thumb-holder'><a target='_blank' href='"+src+"'><img class='video-thumb' src='http://img.youtube.com/vi/"+videoID+"/0.jpg' /></a></div><div class='info-holder'><span class='video-title' id='t-"+videoID+"'>"+title+"</span><span class='video-category'>category: "+category+"</span><span class='video-author'>by: "+author+"</span><span class='video-date'>on: "+date+"</span></div><div class='video-controls'><a href='javascript:void(0)' class='add-video' id='"+videoID+"' onclick=addToPlaylist('"+videoID+"')><span class='icon icon-plus'></span><br /><span class='control-text'>Add to playlist</span></a></div></div>").slideDown();
		});
	});	
}

function checkExisting(_id,_array){
	if ( _array.indexOf( _id ) > -1 ){
		return true;
	} else {
		return false;
	}
}
function addToPlaylist(_id) {
	var id = _id;
	var title = $('#t-'+id).html();
	var duplicate = checkExisting(id,playlistArray);
	if (duplicate!=true){
		playlistArray.push(id);
		playlistArrayTitle.push(title);
		// stringify and save in storage
		var stringifiedPlaylistArray = JSON.stringify(playlistArray);
		var stringifiedPlaylistArrayTitle = JSON.stringify(playlistArrayTitle);
		localStorage.setItem('id', stringifiedPlaylistArray);
		localStorage.setItem('title', stringifiedPlaylistArrayTitle);
		// add individual video to playlist container
		var playlistContainer = $('#playlist-container');
		playlistContainer.prepend("<a href='https://www.youtube.com/v/"+id+"?version=3&f=videos&app=youtube_gdata' target='_blank'><div class='playlist-item'><div class='playlist-thumb'><img src='http://img.youtube.com/vi/"+id+"/0.jpg' /></div><div class='playlist-title'><span>"+title+"</span></div><a class='remove-video' href='javascript:void(0)' id='r-"+id+"' onclick=removeVideo('"+id+"')><span class='icon icon-minus'></span>Remove</a></div></a>").slideDown();		
	}
}

function getStorage(type) {
  var storage = window[type + 'Storage'];
  if (!window[type + 'Storage']) return;
  if (storage.getItem('id')) {    
  	// retrieve and parse stringified array
  	playlistArray = JSON.parse(storage.getItem('id'));
  	playlistArrayTitle = JSON.parse(storage.getItem('title'));
  	$.each(playlistArray, function(i, item) {
  		console.log('title '+playlistArrayTitle[i]);
	 	var playlistContainer = $('#playlist-container');
	 	var title = playlistArrayTitle[i];
	 	var id = item;
		playlistContainer.prepend("<a href='https://www.youtube.com/v/"+id+"?version=3&f=videos&app=youtube_gdata' target='_blank'><div class='playlist-item'><div class='playlist-thumb'><img src='http://img.youtube.com/vi/"+id+"/0.jpg' /></div><div class='playlist-title'><span>"+title+"</span></div><a class='remove-video' href='javascript:void(0)' id='r-"+id+"' onclick=removeVideo('"+id+"')><span class='icon icon-minus'></span>Remove</a></div></a>").slideDown();		
  	});
  } 
}

addEvent(document.querySelector('.playlist-clear'), 'click', function () {
  sessionStorage.clear();
  localStorage.clear();
  document.querySelector('#playlist-container').innerHTML = '';
  getStorage('local');
  getStorage('session');
});

function removeVideo(_id) {
	var id = _id;
	var index;
	console.log(playlistArray);
	console.log(id);
  	if ( playlistArray.indexOf( id ) > -1 ){
		console.log('remove '+ playlistArray.indexOf( id ));
		index = playlistArray.indexOf( id );
		console.log('remove '+ playlistArrayTitle[index]);
		playlistArray.splice(index, 1);
		playlistArrayTitle.splice(index, 1);
		// stringify and save in storage
		var stringifiedPlaylistArray = JSON.stringify(playlistArray);
		var stringifiedPlaylistArrayTitle = JSON.stringify(playlistArrayTitle);
		localStorage.setItem('id', stringifiedPlaylistArray);
		localStorage.setItem('title', stringifiedPlaylistArrayTitle);
		var playlistContainer = $('#playlist-container');
		playlistContainer.html('');
		getStorage('local');
	} else {
		return false;
	}

}