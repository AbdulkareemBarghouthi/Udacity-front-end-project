var Controller = {
    getAllLocations: function() {
        return locations;
    }
}




// here's where i load the map
var map;
var allMarkers = [];

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 31.945367,
            lng: 35.928372
        },
        zoom: 13
    });
    var markers = Controller.getAllLocations();

    var infoWindow = new google.maps.InfoWindow({
        content: "Hey there"
    });

    for (var i = 0; i < markers.length; i++) {
        var marker = new google.maps.Marker({
            position: markers[i].location,
            title: markers[i].title,
            map: map
        });
        allMarkers.push(marker);

        marker.addListener('click', function() {
            // initializeInfoWindows(this, infoWindow);
            infoWindow.open(map, this);
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
    // infoWindow.setContent(marker.title);
    infoWindow.setContent('<div>' + marker.title + '</div>');
    infoWindow.open(map, marker);
}

var ViewModel = function() {
    var self = this;
    self.userInput = ko.observable("");
    self.listLocations = ko.observableArray([]);
    locations.forEach(function(item) {
        self.listLocations.push(item);
    });
    self.resultLocations = ko.observableArray([]);

    self.filterFunction = function() {
        for (var i = 0; i <= locations.length; i++) {
            this.input = self.userInput.toString().toLowerCase();
            this.location = self.locations[i].title;
            alert("Location: " + this.location + " Input: " + this.input);
            if (this.location.includes(this.input)) {
                self.resultLocations.push(listLocations[i].title);
            }
        }
    }

}
ko.applyBindings(new ViewModel);