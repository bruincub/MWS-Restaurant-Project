let restaurants,
    neighborhoods,
    cuisines
var map
var markers = []

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
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
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
    let loc = {
        lat: 40.722216,
        lng: -73.987501
    };
    self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: loc,
        scrollwheel: false
    });
}

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

    if (cIndex || nIndex) {
        document.getElementById("map").style.display = "block";
    }
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

    /* https://developers.google.com/web/fundamentals/performance/lazy-loading-guidance/images-and-video/ */
    let lazyImages = [...document.querySelectorAll("img.lazyImg")];

    if ("IntersectionObserver" in window) {
        let lazyImgObserver = new IntersectionObserver(function(images, observer) {
            images.forEach(function(image) {
                if (image.isIntersecting) {
                    let lazyImg = image.target;
                    lazyImg.src = lazyImg.dataset.src;
                    lazyImg.srcset = lazyImg.dataset.srcset;
                    lazyImg.classList.remove("lazy");
                    lazyImg.classList.add("restaurant-img");
                    lazyImgObserver.unobserve(lazyImg);
                }
            });
        });

        lazyImages.forEach(function(lazyImg) {
            lazyImgObserver.observe(lazyImg);
        });
    } else {
        alert("Intersection Observer is not supported by your browser.");
    }
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
    const li = document.createElement('li');
    const imgBasePath = "img/" + WSHelper.imageUrlForRestaurant(restaurant);

    const image = document.createElement('img');
    // image.className = 'restaurant-img';
    // image.src = WSHelper.imageUrlForRestaurant(restaurant);
    image.className = 'lazyImg';
    image.src = " ";
    image.setAttribute("data-src", imgBasePath + ".jpg");
    image.setAttribute("data-srcset", imgBasePath + "-small.jpg 280w, " +
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
        const marker = WSHelper.mapMarkerForRestaurant(restaurant, self.map);
        google.maps.event.addListener(marker, 'click', () => {
            window.location.href = marker.url
        });
        self.markers.push(marker);
    });
}