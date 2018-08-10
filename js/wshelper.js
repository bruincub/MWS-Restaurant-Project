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
        	let reviewsStore;

            switch (upgradeDb.oldVersion) {
                case 0:
                    upgradeDb.createObjectStore("restaurants", {
                        keyPath: "id"
                    });

                    reviewsStore = upgradeDb.createObjectStore("reviews", {
                    	keyPath: "id"
                    });
                    reviewsStore.createIndex("by-restaurant", "restaurant_id");

                    upgradeDb.createObjectStore("offlineReviews", {
                    	keyPath: "restaurant_id"
                    });

                    upgradeDb.createObjectStore("offlineFavs", {
						autoIncrement: true
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
        const _dbPromise = WSHelper.openDatabase();

        fetch(WSHelper.WS_URL + `/Restaurants`).then(function (response) {
            if (response.ok) {
                _dbPromise.then(function(db) {
                    let restaurants = response.clone().json();

                    response.json().then(function(r) {
                        r.forEach(function(restaurant) {
                            let tx = db.transaction("restaurants", "readwrite");
                            let store = tx.objectStore("restaurants");

                            store.put(restaurant);
                        });
                    });

                    return restaurants;
                }).then(function (restaurants) {
                    callback(null, restaurants);
                });
            } else {
                const error = (`Request failed. Returned status of ${xhr.status}`);
                callback(error, null);
            }
        }).catch(function(error) {
            _dbPromise.then(function(db) {
                let tx = db.transaction("restaurants", "readonly");
                let store = tx.objectStore("restaurants");

                return store.getAll();
            }).then(function(restaurants) {
               callback(null, restaurants);
            });
        });
    }

    /**
     * Fetch a restaurant by its ID.
     */
    static fetchRestaurantById(id, callback) {
        const _dbPromise = WSHelper.openDatabase();

        fetch(WSHelper.WS_URL + `/restaurants/${id}`).then(function(response) {
            if (response.ok) {
                return _dbPromise.then(function(db) {
                    let restaurant = response.clone().json();

                    response.json().then(function(r) {
                        let tx = db.transaction("restaurants", "readwrite");
                        let store = tx.objectStore("restaurants");

                        store.put(r);
                    });

                    return restaurant;
                });
            } else {
                const error = (`Request failed. Returned status of ${xhr.status}`);
                callback(error, null);
            }
        }).then(function(restaurant) {
            callback(null, restaurant);
        }).catch(function(error) {
            _dbPromise.then(function(db) {
                let tx = db.transaction("restaurants", "readonly");
                let store = tx.objectStore("restaurants");

                return store.get(parseInt(id));
            }).then(function(restaurant) {
               callback(null, restaurant);
            });
        });
    }

	/**
	 * Fetch restaurant review
	 */
	static fetchRestaurantReviewById(id, callback) {
		const _dbPromise = WSHelper.openDatabase();

		fetch(WSHelper.WS_URL + `/reviews/?restaurant_id=${id}`).then(function(response) {
			if (response.ok) {
				return _dbPromise.then(function(db) {
					let reviews = response.clone().json();

					response.json().then(function(r) {
						let tx = db.transaction("reviews", "readwrite");
						let store = tx.objectStore("reviews");

						r.forEach(function(review) {
							store.put(review);
						});
					});

					return reviews;
				});
			} else {
				const error = (`Request failed. Returned status of ${xhr.status}`);
				callback(error, null);
			}
		}).then(function(reviews) {
			callback(null, reviews);
		}).catch(function(error) {
			_dbPromise.then(function(db) {
				let tx = db.transaction("reviews", "readonly");
				let store = tx.objectStore("reviews");
				let index = store.index("by-restaurant");

				return index.getAll(parseInt(id));
			}).then(function(reviews) {
				callback(null, reviews);
			});
		});
	}

	/**
	 * Post restaurant review
	 */
	static postRestaurantReview(id, callback) {
		const url = "http://localhost:1337/reviews/";
		const _dbPromise = WSHelper.openDatabase();
		let review = JSON.parse(JSON.stringify({
			restaurant_id: id,
			name: document.getElementById("name").value,
			createdAt: Date.now(),
			modifiedAt: Date.now(),
			rating: document.getElementById("rating").value,
			comments: document.getElementById("review").value
		}));

		if (!navigator.onLine) {
			_dbPromise.then(function(db) {
				let tx = db.transaction("offlineReviews", "readwrite");
				let store = tx.objectStore("offlineReviews");

				store.add(review);
			});

			window.addEventListener("online", function(e) {
				"use strict";

				WSHelper.postOfflineReviews();
			}, {once: true});

			callback("It appears you are offline. Your post will be submitted once you are reconnected.", review);
		} else {
			fetch(url, {
				method: "post",
				body: JSON.stringify({
					restaurant_id: id,
					name: document.getElementById("name").value,
					createdAt: Date.now(),
					modifiedAt: Date.now(),
					rating: document.getElementById("rating").value,
					comments: document.getElementById("review").value
				})
			}).then(function(response) {
				if (response.ok) {
					// Store in IndexedDB
					return _dbPromise.then(function(db) {
						let tx = db.transaction("reviews", "readwrite");
						let store = tx.objectStore("reviews");
						let review = response.clone().json();

						response.json().then(function(r) {
							store.put(r);
						});

						return review;
					});
				} else {
					callback("There was a problem submitting your review. Please try again.", null);
				}
			}).then(function(review) {
				callback("New review posted.", review);
			}).catch(function(error) {
				callback(error.message + " occurred while posting a review.", null);
			});
		}
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

	/**
	 * Post offline reviews
	 */
	static postOfflineReviews(callback) {
		const _dbPromise = WSHelper.openDatabase();

		_dbPromise.then(function(db) {
			let tx = db.transaction("offlineReviews", "readwrite");
			let store = tx.objectStore("offlineReviews");

			store.getAll().then(function(reviews) {
				reviews.forEach(function(review) {
					WSHelper.postRestaurantReview(review.restaurant_id, (msg, review) => {
						WSHelper.showPopdown(msg);
					});
				});

			}).then(function() {
				store.clear();
			});

		});
	}

	static showPopdown(content) {
		"use strict";

		let popdown = document.getElementById("popdown");

		popdown.innerHTML = "<p>" + content + "</p>";
		popdown.classList.add("show");
		setTimeout(function() {
			popdown.classList.remove("show");
		}, 4000);
	}

	static setFavorite(id, favStatus, callback) {
		"use strict";

		let status = !favStatus;
		const url = "http://localhost:1337/restaurants/" + id + "/?is_favorite=" + status;
		const _dbPromise = WSHelper.openDatabase();

		if (!navigator.onLine) {
			_dbPromise.then(function(db) {
				let tx = db.transaction("offlineFavs", "readwrite");
				let store = tx.objectStore("offlineFavs");

				let favorite = '{"restaurant_id": ' + id + ', "status": "' + status + '"}';

				store.add(JSON.parse(favorite));
			});

			window.addEventListener("online", function(e) {
				"use strict";

				WSHelper.setOfflineFavs();
			}, {once: true});

			callback("It appears you are offline. Your restaurant favorite will be submitted once you are reconnected.", "false");
		} else {
			fetch(url, {
				method: "put"
			}).then(function(response) {
				if (response.ok) {
					// Update restaurant in IndexedDB
					_dbPromise.then(function(db) {
						response.json().then(function(restaurant) {
							let tx = db.transaction("restaurants", "readwrite");
							let store = tx.objectStore("restaurants");

							store.put(restaurant);
						});
					});
				} else {
					callback("There was a problem favoriting the restaurant. Please try again.", "false");
				}
			}).then(function() {
				callback("Restaurant favorite status changed.", "true");
			}).catch(function(error) {
				callback(error.message + " occurred while favoriting a restaurant.", "false");
			});
		}

	}

	static setOfflineFavs(callback) {
		const _dbPromise = WSHelper.openDatabase();

		_dbPromise.then(function(db) {
			let tx = db.transaction("offlineFavs", "readwrite");
			let store = tx.objectStore("offlineFavs");
			let status;

			store.getAll().then(function(favs) {
				favs.forEach(function(fav) {
					if (fav.status === "true") {
						status = false;
					} else {
						status = true;
					}

					WSHelper.setFavorite(fav.restaurant_id, status, (msg, success) => {
						if (success) {
							WSHelper.showPopdown(msg);
						}
					});
				});
			}).then(function() {
				store.clear();
			});
		});
	}
}
