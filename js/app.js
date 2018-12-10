var helperObject = {
    articleList: [],
    getAllLocations: function() {
        return locations;
    },
    getWikiArticles: function(title) {
        $.ajax({
            url: 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + title + '&format=json&callback=wikiCallback',
            dataType: "jsonp",
            success: function(response) {
                var cardList = document.getElementById("wikiList");
                var card = document.getElementById("extraInfo");
                while (cardList.firstChild) {
                    cardList.removeChild(cardList.firstChild);
                }
                var article = document.createElement("li");
                if (response[2].length == 0 || response[2] == "") {
                    article.innerHTML = "No wikipedia links available for this restaraunt :/";
                    cardList.appendChild(article);
                    return false;
                };

                article.innerHTML = "<a href=http://en.wikipedia.org/wiki/" + response[0] + ">" + response[0] + "</a>";

                cardList.appendChild(article);
                return true;
            }
        });
    },
    getYelpReviews: function(lat, lng) {
        var yelpUrl = "https://api.yelp.com/v3/businesses/search?latitude=" + lat + "&longitude=" + lng;
        $.ajax({
            url: yelpUrl,
            headers: {
                'Authorization': 'Bearer xxxxxxxxxxxxx',
            },
            method: 'GET',
            dataType: "jsonp",
            success: function(response) {
                console.log(response);
            }
        });
    }
}




// here's where i load the map
var map;
var allMarkers = [];

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 26.13804,
            lng: -80.164247
        },
        zoom: 13
    });
    var markers = helperObject.getAllLocations();

    var infoWindow = new google.maps.InfoWindow();

    for (var i = 0; i < markers.length; i++) {
        var marker = new google.maps.Marker({
            position: markers[i].location,
            title: markers[i].title,
            map: map
        });
        allMarkers.push(marker);

        marker.addListener('click', function() {
            initializeInfoWindows(this, infoWindow);
        });

    }

}

// as the google documentation states this function handles any authentication failures with api key
function gm_authFailure() {
    var ErrorDiv = document.createElement('div');
    alert("API authentication error, We promise we'll fix this as soon as we can :)");
}

// Populate infoWindow
function initializeInfoWindows(marker, infoWindow) {
    infoWindow.marker = marker;
    infoWindow.setContent(marker.title);
    infoWindow.setContent('<div>' + marker.title + '</div>');
    infoWindow.open(map, marker);
}

var ViewModel = function() {
    var self = this;

    // Storing the full location of the site
    self.userInput = ko.observable("");
    self.listLocations = ko.observableArray([]);
    locations.forEach(function(item) {
        self.listLocations.push(item.title);
    });
    self.resultLocations = ko.observableArray(self.listLocations());
    self.result = ko.observable();

    self.filterFunction = function() {
        if (self.resultLocations().length != 0) {
            self.resultLocations([]);
        }
        for (var i = 0; i < locations.length; i++) {
            this.input = self.userInput().toString().toLowerCase();
            this.location = locations[i].title.toString().toLowerCase();
            if (this.location.includes(this.input)) {
                self.result(locations[i].title);
                self.resultLocations.push(self.result());
            }
        }
    }

    self.getWikipediaArticles = function(title) {
        helperObject.getWikiArticles(title);
    }

}
ko.applyBindings(new ViewModel());