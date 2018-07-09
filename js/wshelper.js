/**
 * Common web service helper functions.
 */
class WSHelper {
    /**
     * Open Indexed DB
     */
    static openDatabase() {
        "use strict";

        if (!("indexedDB" in window)) {
            console.error("IndexedDB is not supported.");

            return Promise.resolve();
        }

        return idb.open("mws-restaurants", 1, function(upgradeDb) {
            switch (upgradeDb.oldVersion) {
                case 0:
                    upgradeDb.createObjectStore("restaurants", {
                        keyPath: "id"
                    });
            }
        }).then(function(db) {
            return db;
        });
    }

    /**
     * Web service URL.
     * Change this to restaurants.json file location on your server.
     */
    static get WS_URL() {
        const port = 1337; // Change this to your server port
        return `http://localhost:${port}`;
    }

    /**
     * Fetch all restaurants.
     */
    static fetchRestaurants(callback) {
        // let xhr = new XMLHttpRequest();
        // xhr.open('GET', WSHelper.WS_URL);
        // xhr.onload = () => {
        //     if (xhr.status === 200) { // Got a success response from server!
        //         const json = JSON.parse(xhr.responseText);
        //         const restaurants = json.restaurants;
        //         callback(null, restaurants);
        //     } else { // Oops!. Got an error from server.
        //         const error = (`Request failed. Returned status of ${xhr.status}`);
        //         callback(error, null);
        //     }
        // };
        // xhr.send();
        const _dbPromise = WSHelper.openDatabase();

        _dbPromise.then(function(db) {
            let tx = db.transaction("restaurants", "readonly");
            let store = tx.objectStore("restaurants");

            return store.count();
        }).then(function(count) {
            if (count) {
                _dbPromise.then(function(db) {
                    let tx = db.transaction("restaurants", "readonly");
                    let store = tx.objectStore("restaurants");

                    console.log("getting from db");
                    return store.getAll();
                }).then(function(restaurants) {
                    callback(null, restaurants);
                })
            } else {
                fetch(WSHelper.WS_URL + `/Restaurants`).then(function (response) {
                    if (response.ok) {
                        _dbPromise.then(function(db) {
                            let restaurants = response.clone().json();

                            response.json().then(function(r) {
                                r.forEach(function(restaurant) {
                                    let tx = db.transaction("restaurants", "readwrite");
                                    let store = tx.objectStore("restaurants");

                                    store.put(restaurant);
                                })
                            });

                            return restaurants;
                        }).then(function (restaurants) {
                            callback(null, restaurants);
                        });
                    } else {
                        const error = (`Request failed. Returned status of ${xhr.status}`);
                        callback(error, null);
                    }
                });
            }
        });
    }

    /**
     * Fetch a restaurant by its ID.
     */
    static fetchRestaurantById(id, callback) {
        // fetch all restaurants with proper error handling.
        // WSHelper.fetchRestaurants((error, restaurants) => {
        //     if (error) {
        //         callback(error, null);
        //     } else {
        //         const restaurant = restaurants.find(r => r.id == id);
        //         if (restaurant) { // Got the restaurant
        //             callback(null, restaurant);
        //         } else { // Restaurant does not exist in the database
        //             callback('Restaurant does not exist', null);
        //         }
        //     }
        // });

        fetch(WSHelper.WS_URL + `/Restaurants/${id}`).then(function(response) {
            if (response.ok) {
                return response.json();
            } else {
                const error = (`Request failed. Returned status of ${xhr.status}`);
                callback(error, null);
            }
        }).then(function(restaurant) {
            callback(null, restaurant);
        }).catch(function(error) {
            callback(error, null);
        });
    }

    /**
     * Fetch restaurants by a cuisine type with proper error handling.
     */
    static fetchRestaurantByCuisine(cuisine, callback) {
        // Fetch all restaurants with proper error handling
        WSHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Filter restaurants to have only given cuisine type
                const results = restaurants.filter(r => r.cuisine_type == cuisine);
                callback(null, results);
            }
        });
    }

    /**
     * Fetch restaurants by a neighborhood with proper error handling.
     */
    static fetchRestaurantByNeighborhood(neighborhood, callback) {
        // Fetch all restaurants
        WSHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Filter restaurants to have only given neighborhood
                const results = restaurants.filter(r => r.neighborhood == neighborhood);
                callback(null, results);
            }
        });
    }

    /**
     * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
     */
    static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
        // Fetch all restaurants
        WSHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                let results = restaurants
                if (cuisine != 'all') { // filter by cuisine
                    results = results.filter(r => r.cuisine_type == cuisine);
                }
                if (neighborhood != 'all') { // filter by neighborhood
                    results = results.filter(r => r.neighborhood == neighborhood);
                }
                callback(null, results);
            }
        });
    }

    /**
     * Fetch all neighborhoods with proper error handling.
     */
    static fetchNeighborhoods(callback) {
        // Fetch all restaurants
        WSHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Get all neighborhoods from all restaurants
                const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
                // Remove duplicates from neighborhoods
                const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
                callback(null, uniqueNeighborhoods);
            }
        });
    }

    /**
     * Fetch all cuisines with proper error handling.
     */
    static fetchCuisines(callback) {
        // Fetch all restaurants
        WSHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Get all cuisines from all restaurants
                const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
                // Remove duplicates from cuisines
                const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
                callback(null, uniqueCuisines);
            }
        });
    }

    /**
     * Restaurant page URL.
     */
    static urlForRestaurant(restaurant) {
        return (`./restaurant.html?id=${restaurant.id}`);
    }

    /**
     * Restaurant image URL.
     */
    static imageUrlForRestaurant(restaurant) {
        return (`${restaurant.photograph}`);
    }

    /**
     * Map marker for a restaurant.
     */
    static mapMarkerForRestaurant(restaurant, map) {
        // https://leafletjs.com/reference-1.3.0.html#marker
        const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
            {title: restaurant.name,
                alt: restaurant.name,
                url: WSHelper.urlForRestaurant(restaurant)
            });
        marker.addTo(newMap);
        return marker;
    }

}