// Here's an object that provides helper functions acting closely like a controller but i like to consider it as a middleware
'use strict';
var helperObject = {
    articleList: [],
    getAllLocations: function() {
        return locations;
    },
    getDirections: function(data) {
        var self = this;
        var success;
        var directionService = new google.maps.DirectionsService();
        var directions = {
            origin: map.center,
            destination: data.location,
            travelMode: google.maps.DirectionsTravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.METRIC
        };
        directionService.route(
            directions,
            function(response, status) {
                if (status == google.maps.DirectionsStatus.OK) {

                    new google.maps.DirectionsRenderer({
                        map: map,
                        directions: response
                    });
                    console.dir(response);
                } else {
                    alert("We couldn't get the route to your location, we'll fix that as soon as we can!");
                }
            }
        )
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
            map: map,
            animation: null
        });
        allMarkers.push(marker);
        var infowindow = new google.maps.InfoWindow();
        marker.addListener('click', function() {
            populateInfoWindow(this, infowindow)
            infowindow.open(map, this);
        });
    }

}

function populateInfoWindow(marker, infowindow) {
    var self = this;
    var markerPosition = marker.getPosition();
    var myUrl = "https://api.foursquare.com/v2/venues/search?client_id=0QVUHV412GGI1M4DCDYHSXK4LCYVASHMILEBMBR000RZ4TSR&client_secret=GT3HKHHLLUP3R5JQQLUNF1R2YLBU0JLCEHUFWN4IHGL01AGI&v=20180323&limit=1&ll=" + markerPosition.lat().toString() + "," + markerPosition.lng().toString() + "&query=" + marker.title.split(" ").join("%20");
    $.ajax({
        client_id: "0QVUHV412GGI1M4DCDYHSXK4LCYVASHMILEBMBR000RZ4TSR",
        client_secret: "GT3HKHHLLUP3R5JQQLUNF1R2YLBU0JLCEHUFWN4IHGL01AGI",
        url: myUrl,
        dataType: "jsonp",
        method: "GET",
        success: function(response) {
            console.dir(response);
            if (!response["response"].venues[0]) {
                infowindow.setContent("We couldn't fetch any foursquare data for this location :/");
                return;
            }
            var address = response["response"].venues[0].location.formattedAddress[0];
            var category = response["response"].venues[0].categories[0].name;
            var iconSetup = response["response"].venues[0].categories[0].icon;
            var icon = iconSetup.prefix + "64" + iconSetup.suffix;
            var city = response["response"].venues[0].location.formattedAddress[1];
            var name = response["response"].venues[0].name;
            var content = "<div style='background-color:mediumvioletred;'><h4>" + category + "</h4>" + "<h4>" +
                name + "</h4>" +
                "<p>address: " + address + "</p>" + "<p>city: " + city + "</p><br>" +
                "<img src=" + icon + "><br>" +
                "<p><b>Data collected From foursquare</b></p>" +
                "</div>";
            infowindow.setContent(content);

        }
    }).fail(function() {
        alert("Something was wrong while we were dealing with the foursquare API");
    });
    allMarkers.forEach(function(item) {
        item.setAnimation(null);
    });
    marker.setAnimation(google.maps.Animation.BOUNCE);
};

// as the google documentation states this function handles any authentication failures with api key
function gm_authFailure() {
    var ErrorDiv = document.createElement('div');
    alert("API authentication error, We promise we'll fix this as soon as we can :)");
}

function google_error_message() {
    alert("We encountered an error while loading the map :/")
}


// ViewModel for knockoutjs
var ViewModel = function() {
    var self = this;
    // Manipulate DOM through these observables
    self.checkVisibilty = ko.observable(false);
    self.wikiResult = ko.observableArray([]);
    self.fourSquareResult = ko.observable();

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
                allMarkers.forEach(function(item) {
                    if (item.title == locations[i].title) {
                        item.setMap(map);
                    }
                });
            }
        }
    }
    self.getWikiLinks = function(data) {
        $.ajax({
            url: 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + data.title + '&format=json&callback=wikiCallback',
            dataType: "jsonp",
            success: function(response) {
                self.wikiResult([]);
                if (response[3][0] == undefined) {
                    self.wikiResult.push({ title: "wikipedia link not found", link: "#" });
                    self.checkVisibilty(true);
                    return;
                }
                console.dir(response[0]);
                var content = { title: response[0], link: response[3][0] };
                self.wikiResult.push(content);
                self.checkVisibilty(true);
            }
        }).fail(function() {
            alert("Something went wrong while getting wikipedia links");
        });
    }

    self.getFoursquareInfo = function(data) {
        var self = this;
        var myUrl = "https://api.foursquare.com/v2/venues/search?client_id=0QVUHV412GGI1M4DCDYHSXK4LCYVASHMILEBMBR000RZ4TSR&client_secret=GT3HKHHLLUP3R5JQQLUNF1R2YLBU0JLCEHUFWN4IHGL01AGI&v=20180323&limit=3&ll=" + data.location.lat + "," + data.location.lng + "&query=" + data.title.replace(" ", "%20");
        var venueID = [];
        $.ajax({
            url: myUrl,
            dataType: "jsonp",
            method: "GET",
            success: function(response) {
                if (!response["response"].venues[0]) {
                    var result = { address: "We couldn't fetch foursquare data :/", name: "N/A", icon: "#", city: "N/A" }
                    self.fourSquareResult(result);
                    return;
                }
                var address = response["response"].venues[0].location.formattedAddress[0];
                var category = response["response"].venues[0].name;
                var iconSetup = response["response"].venues[0].categories[0].icon;
                var icon = iconSetup.prefix + "64" + iconSetup.suffix;
                var city = response["response"].venues[0].location.formattedAddress[1];
                var result = { address: address, name: category, icon: icon, city: city };
                self.fourSquareResult(result);
            }
        }).fail(function() {
            alert("Something was wrong while we were dealing with the foursquare API");
        });

    }

    self.getExtraInfo = function(data) {
        self.checkVisibilty(false);
        self.getWikiLinks(data);
        self.getFoursquareInfo(data);
        // Add Animation to markers and streetView pano in the extraInfo div
        self.marker;
        allMarkers.forEach(function(item) {
            if (item.title == data.title) {
                self.marker = item;
                var panorama = new google.maps.StreetViewPanorama(document.getElementById('pano'), {
                    position: self.marker.getPosition(),
                    pov: {
                        heading: 34,
                        pitch: 10
                    }
                });
                map.setStreetView(panorama);
            }
            item.setAnimation(null);
        });
        self.marker.setAnimation(google.maps.Animation.BOUNCE);

    }

    self.hideElement = function() {
        self.checkVisibilty(false);
    }
    self.getRoute = function(data) {
        helperObject.getDirections(data);
    }


}

ko.applyBindings(new ViewModel());