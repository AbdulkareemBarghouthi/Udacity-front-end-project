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
            }
        });
    },
    getFourSquareInfo: function(data) {
        var self = this;
        $.ajax({
            client_id: "0QVUHV412GGI1M4DCDYHSXK4LCYVASHMILEBMBR000RZ4TSR",
            client_secret: "GT3HKHHLLUP3R5JQQLUNF1R2YLBU0JLCEHUFWN4IHGL01AGI",
            url: "https://api.foursquare.com/v2/venues/search?client_id=0QVUHV412GGI1M4DCDYHSXK4LCYVASHMILEBMBR000RZ4TSR&client_secret=GT3HKHHLLUP3R5JQQLUNF1R2YLBU0JLCEHUFWN4IHGL01AGI&v=20180323&limit=1&ll=" + data.location.lat + "," + data.location.lng + "&query=" + data.title.replace(" ", "%20"),
            dataType: "jsonp",
            method: "GET",
            success: function(response) {
                console.log(response);
                var fsList = document.getElementById("fourSquareList");
                var container = document.getElementById("extraInfo");
                while (fsList.firstChild) {
                    fsList.removeChild(fsList.firstChild);
                }

                container.removeChild(container.lastChild);
                var address = response["response"].venues[0].location.formattedAddress[0];
                var category = response["response"].venues[0].categories[0].name;
                var iconSetup = response["response"].venues[0].categories[0].icon;
                var icon = iconSetup.prefix + "64" + iconSetup.suffix;
                var city = response["response"].venues[0].location.formattedAddress[1];

                var fsItem = document.createElement("li");
                var fscategoryItem = document.createElement("li");
                var fsIcon = document.createElement("img");

                fscategoryItem.innerHTML = category;
                fsItem.innerHTML = address;
                fsIcon.setAttribute("src", icon);
                fsList.appendChild(fsItem);
                fsList.appendChild(fscategoryItem);
                container.appendChild(fsIcon);
            }
        });
    }
}




// here's where i load the map
var map;
var allMarkers = [];

function initMap() {
    allMarkers = [];
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

    self.checkVisibilty = ko.observable(false);

    // Storing the full location of the site
    self.userInput = ko.observable("");
    self.listLocations = ko.observableArray([]);
    locations.forEach(function(item) {
        self.listLocations.push(item);
    });

    self.resultLocations = ko.observableArray(self.listLocations());
    self.result = ko.observable();

    self.filterFunction = function() {
        self.Markers = ko.observableArray(helperObject.getAllLocations());
        self.filteredMarkers = ko.observableArray([]);
        allMarkers.forEach(function(item) {
            item.setMap(null);
        });
        if (self.resultLocations().length != 0) {
            self.resultLocations([]);
        }
        for (var i = 0; i < locations.length; i++) {
            this.input = self.userInput().toString().toLowerCase();
            this.location = locations[i].title.toString().toLowerCase();
            if (this.location.includes(this.input)) {
                self.result(locations[i]);
                self.resultLocations.push(self.result());
            }
        }
    }

    self.getWikipediaArticles = function(data) {
        var that = this;
        self.checkVisibilty(true);
        helperObject.getWikiArticles(data.title);
        helperObject.getFourSquareInfo(data);

        // Deal with markers
        self.marker;
        allMarkers.forEach(function(item) {
            if (item.title == data.title) {
                self.marker = item;
            }
            item.setAnimation(null);
        });
        self.marker.setAnimation(google.maps.Animation.BOUNCE);
    }

    self.hideElement = function() {
        self.checkVisibilty(false);
    }

}
ko.applyBindings(new ViewModel());