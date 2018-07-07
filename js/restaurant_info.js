let restaurant;
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
    fetchRestaurantFromURL((error, restaurant) => {
        if (error) { // Got an error!
            console.error(error);
        } else {
            self.map = new google.maps.Map(document.getElementById('map'), {
                zoom: 16,
                center: restaurant.latlng,
                scrollwheel: false
            });
            fillBreadcrumb();
            WSHelper.mapMarkerForRestaurant(self.restaurant, self.map);
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
    const imgBasePath = "img/" + WSHelper.imageUrlForRestaurant(restaurant);
    name.innerHTML = restaurant.name;

    const address = document.getElementById('restaurant-address');
    address.innerHTML = restaurant.address;

    const image = document.getElementById('restaurant-img');
    image.className = 'restaurant-img';
    image.src = imgBasePath + ".jpg";

    image.className = 'lazyImg';
    image.src = ' ';
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

    const cuisine = document.getElementById('restaurant-cuisine');
    cuisine.innerHTML = restaurant.cuisine_type;

    // fill operating hours
    if (restaurant.operating_hours) {
        fillRestaurantHoursHTML();
    }
    // fill reviews
    fillReviewsHTML();

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

    document.getElementById("map").style.display = "block";
}

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
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
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

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
    const li = document.createElement('li');
    const name = document.createElement('p');
    name.innerHTML = review.name;
    li.appendChild(name);

    const date = document.createElement('p');
    date.innerHTML = review.date;
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