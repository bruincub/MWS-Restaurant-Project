let restaurant;
var newMap;

/**
 * Initialize map, called from HTML.
 */
document.addEventListener('DOMContentLoaded', (event) => {
    initMap();
});

/**
 * Initialize leaflet map
 */
initMap = () => {
    fetchRestaurantFromURL((error, restaurant) => {
        if (error) { // Got an error!
            console.error(error);
        } else {
            self.newMap = L.map('map', {
                center: [restaurant.latlng.lat, restaurant.latlng.lng],
                zoom: 16,
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
            fillBreadcrumb();
            WSHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
        }
    });
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
    if (self.restaurant) { // restaurant already fetched!
        callback(null, self.restaurant)
        return;
    }
    const id = getParameterByName('id');
    if (!id) { // no id found in URL
        error = 'No restaurant id in URL'
        callback(error, null);
    } else {
        WSHelper.fetchRestaurantById(id, (error, restaurant) => {
            self.restaurant = restaurant;
            if (!restaurant) {
                console.error(error);
                return;
            }
            fillRestaurantHTML();
            callback(null, restaurant)
        });
    }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
    const name = document.getElementById('restaurant-name');
    let imgBasePath;

    if (WSHelper.imageUrlForRestaurant(restaurant) == "undefined") {
        imgBasePath = "img/10";
    } else {
        imgBasePath = "img/" + WSHelper.imageUrlForRestaurant(restaurant);
    }

	const isFavorite = (restaurant.is_favorite === 'true');
	const favBtn = document.getElementById('favBtn');

	favBtn.id = 'favBtn' + restaurant.id;

    if (isFavorite) {
        favBtn.className = 'favBtn favorited';
        favBtn.setAttribute('aria-label', 'Remove from favorites');
    } else {
        favBtn.className = 'favBtn';
        favBtn.setAttribute('aria-label', 'Add to favorites');
    }

	favBtn.value = restaurant.id;

    name.innerHTML = restaurant.name;

    const address = document.getElementById('restaurant-address');
    address.innerHTML = restaurant.address;

    const image = document.getElementById('restaurant-img');
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

    const cuisine = document.getElementById('restaurant-cuisine');
    cuisine.innerHTML = restaurant.cuisine_type;

    // fill operating hours
    if (restaurant.operating_hours) {
        fillRestaurantHoursHTML();
    }
    // fill reviews
    // fillReviewsHTML();
	fetchReviews(restaurant.id);
}

fetchReviews = (id) => {
	if (self.reviews) { // reviews already fetched!
		return;
	}

	WSHelper.fetchRestaurantReviewById(id, (error, reviews) => {
		self.reviews = reviews;
		if (!reviews) {
			console.error(error);
			return;
		}
		fillReviewsHTML();
	});
};

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
    const hours = document.getElementById('restaurant-hours');
    for (let key in operatingHours) {
        const row = document.createElement('tr');

        const day = document.createElement('td');
        day.innerHTML = key;
        row.appendChild(day);

        const time = document.createElement('td');
        time.innerHTML = operatingHours[key];
        row.appendChild(time);

        hours.appendChild(row);
    }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.reviews) => {
    const container = document.getElementById('reviews-container');
    const title = document.createElement('h2');
    title.innerHTML = 'Reviews';
    container.appendChild(title);

    if (!reviews) {
        const noReviews = document.createElement('p');
        noReviews.innerHTML = 'No reviews yet!';
        container.appendChild(noReviews);
        return;
    }
    const ul = document.getElementById('reviews-list');
    reviews.forEach(review => {
        ul.appendChild(createReviewHTML(review));
    });
    container.appendChild(ul);
}

addReviewHTML = (review) => {
	"use strict";

	const reviewList = document.getElementById('reviews-list');
	reviewList.appendChild(createReviewHTML(review));
};

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
    const li = document.createElement('li');
    const name = document.createElement('p');
    name.innerHTML = review.name;
    li.appendChild(name);

    const date = document.createElement('p');
    let epochSeconds = Math.floor(review.createdAt / 1000);
    let datetime = new Date(0);
    datetime.setUTCSeconds(epochSeconds);

    date.innerHTML = datetime.toLocaleString();
    li.appendChild(date);

    const rating = document.createElement('p');
    rating.innerHTML = `Rating: ${review.rating}`;
    li.appendChild(rating);

    const comments = document.createElement('p');
    comments.innerHTML = review.comments;
    li.appendChild(comments);

    return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
    const breadcrumb = document.getElementById('breadcrumb');
    const li = document.createElement('li');
    li.innerHTML = restaurant.name;
    breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
    if (!url)
        url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
        results = regex.exec(url);
    if (!results)
        return null;
    if (!results[2])
        return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

/**
 *  Review form
 */
document.getElementById("submitReviewBtn").addEventListener("click", function(e) {
	"use strict";

	const url = "http://localhost:1337/reviews/";
	let form = document.getElementById("reviewForm");
	let data;

	e.preventDefault();

	if (form.reportValidity() || form.checkValidity()) {
		let restaurantId = parseInt(new URLSearchParams(window.location.search).get("id"));

		WSHelper.postRestaurantReview(restaurantId, (msg, review) => {
			WSHelper.showPopdown(msg);
			form.reset();
			addReviewHTML(review);
		});
	}
});
