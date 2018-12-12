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
            destination: data.position,
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
                    success = response["routes"][0]["legs"];
                    var infoWindow = new google.maps.InfoWindow();
                    console.dir(success);
                    return "<h5>here is the route to your location</h5><br>" +
                        "Restaurant is this far away: " + success[0]["distance"].text + " And it will approximately take: " +
                        success[0]["duration"].text;

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
            map: map
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
    console.log(myUrl);
    console.log(marker.title.toString());
    $.ajax({
        client_id: "0QVUHV412GGI1M4DCDYHSXK4LCYVASHMILEBMBR000RZ4TSR",
        client_secret: "GT3HKHHLLUP3R5JQQLUNF1R2YLBU0JLCEHUFWN4IHGL01AGI",
        url: myUrl,
        dataType: "jsonp",
        method: "GET",
        success: function(response) {
            if (!response["response"].venues[0]) {
                infowindow.setContent("We couldn't fetch any foursquare data for this location :/");
                return;
            }
            var address = response["response"].venues[0].location.formattedAddress[0];
            var category = response["response"].venues[0].categories[0].name;
            var iconSetup = response["response"].venues[0].categories[0].icon;
            var icon = iconSetup.prefix + "64" + iconSetup.suffix;
            var city = response["response"].venues[0].location.formattedAddress[1];
            var result = { address: address, name: category, icon: icon, city: city };
            var content = "<h4>" + category + "</h4>" +
                "<p>address: " + address + "</p>" + "<p>city: " + city + "</p>";
            infowindow.setContent(content);
        }
    }).fail(function() {
        alert("Something was wrong while we were dealing with the foursquare API");
    });

};

// as the google documentation states this function handles any authentication failures with api key
function gm_authFailure() {
    var ErrorDiv = document.createElement('div');
    alert("API authentication error, We promise we'll fix this as soon as we can :)");
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
        $.ajax({
            client_id: "0QVUHV412GGI1M4DCDYHSXK4LCYVASHMILEBMBR000RZ4TSR",
            client_secret: "GT3HKHHLLUP3R5JQQLUNF1R2YLBU0JLCEHUFWN4IHGL01AGI",
            url: "https://api.foursquare.com/v2/venues/search?client_id=0QVUHV412GGI1M4DCDYHSXK4LCYVASHMILEBMBR000RZ4TSR&client_secret=GT3HKHHLLUP3R5JQQLUNF1R2YLBU0JLCEHUFWN4IHGL01AGI&v=20180323&limit=1&ll=" + data.location.lat + "," + data.location.lng + "&query=" + data.title.replace(" ", "%20"),
            dataType: "jsonp",
            method: "GET",
            success: function(response) {
                if (!response["response"].venues[0]) {
                    var result = { address: "We couldn't fetch foursquare data :/", name: "N/A", icon: "#", city: "N/A" }
                    self.fourSquareResult(result);
                    return;
                }
                var address = response["response"].venues[0].location.formattedAddress[0];
                var category = response["response"].venues[0].categories[0].name;
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