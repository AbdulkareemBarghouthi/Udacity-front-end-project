var map;

function initMap() {
    try {
        map = new google.maps.Map(document.getElementById('map'), {
            center: {
                lat: 31.945367,
                lng: 35.928372
            },
            zoom: 13
        });
    } catch (err) {
        alert("Something went wrong try again later" + err.message);
    }
}

// as the google documentation states this function handles any authentication failures with api key
function gm_authFailure() {
    var ErrorDiv = document.createElement('div');
    alert("API authentication error, We promise we'll fix this as soon as we can :)");
}