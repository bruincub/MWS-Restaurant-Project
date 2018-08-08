let restaurants,
    neighborhoods,
    cuisines
var newMap
var markers = []

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
    initMap();
    fetchNeighborhoods();
    fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
    WSHelper.fetchNeighborhoods((error, neighborhoods) => {
        if (error) { // Got an error
            console.error(error);
        } else {
            self.neighborhoods = neighborhoods;
            fillNeighborhoodsHTML();
        }
    });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
    const select = document.getElementById('neighborhoods-select');
    neighborhoods.forEach(neighborhood => {
        const option = document.createElement('option');
        option.innerHTML = neighborhood;
        option.value = neighborhood;
        select.append(option);
    });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
    WSHelper.fetchCuisines((error, cuisines) => {
        if (error) { // Got an error!
            console.error(error);
        } else {
            self.cuisines = cuisines;
            fillCuisinesHTML();
        }
    });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
    const select = document.getElementById('cuisines-select');

    cuisines.forEach(cuisine => {
        const option = document.createElement('option');
        option.innerHTML = cuisine;
        option.value = cuisine;
        select.append(option);
    });
}

/**
 * Initialize Leaflet map, called from HTML.
 */
initMap = () => {
    self.newMap = L.map('map', {
        center: [40.722216, -73.987501],
        zoom: 12,
        scrollWheelZoom: false
    });
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
        mapboxToken: 'pk.eyJ1IjoidHVmMzc1MDQiLCJhIjoiY2pqZTZpZ2RmNGk4czN2bzRueTIzb2ZreSJ9.TdVLs0lgWABF2QtqcX1_tA',
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'
    }).addTo(newMap);

    updateRestaurants();
};

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
    const cSelect = document.getElementById('cuisines-select');
    const nSelect = document.getElementById('neighborhoods-select');

    const cIndex = cSelect.selectedIndex;
    const nIndex = nSelect.selectedIndex;

    const cuisine = cSelect[cIndex].value;
    const neighborhood = nSelect[nIndex].value;

    WSHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
        if (error) { // Got an error!
            console.error(error);
        } else {
            resetRestaurants(restaurants);
            fillRestaurantsHTML();
        }
    })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
    // Remove all restaurants
    self.restaurants = [];
    const ul = document.getElementById('restaurants-list');
    ul.innerHTML = '';

    // Remove all map markers
    self.markers.forEach(m => m.setMap(null));
    self.markers = [];
    self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
    const ul = document.getElementById('restaurants-list');
    restaurants.forEach(restaurant => {
        ul.append(createRestaurantHTML(restaurant));
    });
    addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
    const li = document.createElement('li');
    let imgBasePath;

    if (WSHelper.imageUrlForRestaurant(restaurant) == "undefined") {
        imgBasePath = "img/10";
    } else {
        imgBasePath = "img/" + WSHelper.imageUrlForRestaurant(restaurant);
    }

    const image = document.createElement('img');
    image.className = 'restaurant-img';
    image.src = imgBasePath + ".jpg";
    image.setAttribute("src", imgBasePath + ".jpg");
    image.setAttribute("srcset", imgBasePath + "-small.jpg 280w, " +
                                        imgBasePath + "-medium.jpg 400w, " +
                                        imgBasePath + "-large.jpg 600w");
    image.setAttribute("sizes", "(max-width: 399px) 280px, (max-width: 599px) 400px, (max-width: 774px) 600px, " +
                                "280px");

    // Simulate alt text data from database server
    switch (restaurant.id) {
        case 1:
            image.alt = "Patrons enjoying dinner at Mission Chinese Food";
            break;
        case 2:
            image.alt = "Cheese pizza from Emily";
            break;
        case 3:
            image.alt = "Dining room at Kang Ho Dong Baekjeong";
            break;
        case 4:
            image.alt = "Entrance to Katz's Delicatessan";
            break;
        case 5:
            image.alt = "Patrons enjoying casual dining at Roberta's Pizza";
            break;
        case 6:
            image.alt = "Patrons eating in the rustic dining room at Hometown BBQ";
            break;
        case 7:
            image.alt = "Entrance of Superiority Burger";
            break;
        case 8:
            image.alt = "Shop sign that reads 'The Dutch'";
            break;
        case 9:
            image.alt = "Foodie patron taking a photo of her dish";
            break;
        case 10:
            image.alt = "White dining room and bar at Casa Enrique";
            break;
        default:
            image.alt = "";
    }

    li.append(image);

    const isFavorite = (restaurant.is_favorite === 'true');
	const favBtn = document.createElement('button');

	favBtn.id = 'favBtn' + restaurant.id;

	if (isFavorite) {
		favBtn.className = 'favBtn favorited';
	} else {
		favBtn.className = 'favBtn';
	}

	favBtn.setAttribute("aria-label", "favorite");
	favBtn.innerHTML = "&#10084;";
	favBtn.value = restaurant.id;
	li.append(favBtn);

    const name = document.createElement('h1');
    name.innerHTML = restaurant.name;
    li.append(name);

    const neighborhood = document.createElement('p');
    neighborhood.innerHTML = restaurant.neighborhood;
    li.append(neighborhood);

    const address = document.createElement('p');
    address.innerHTML = restaurant.address;
    li.append(address);

    const more = document.createElement('a');
    more.innerHTML = 'View Details';
    more.href = WSHelper.urlForRestaurant(restaurant);
    li.append(more);

    return li;
}

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
    restaurants.forEach(restaurant => {
        // Add marker to the map
        const marker = WSHelper.mapMarkerForRestaurant(restaurant, self.newMap);
        marker.on("click", onClick);
        function onClick() {
            window.location.href = marker.options.url;
        }
    });
}
