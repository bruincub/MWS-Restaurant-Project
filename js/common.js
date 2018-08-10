/**
 * Register service worker
 */
(function serviceWorker() {
    "use strict";

    if (!navigator.serviceWorker) return;

    navigator.serviceWorker.register('sw.js').then(function(reg) {
        console.log("Service worker registered.");
    });
})();

(function init() {
    "use strict";

    const maincontent = document.getElementById("maincontent");

    maincontent.addEventListener("click", function(e) {
	    let restaurantId;
	    let favStatus;

    	e.stopPropagation();

    	if (e.target.className.includes("favBtn")) {
    		restaurantId = e.target.value;
    		if (e.target.className === "favBtn favorited") {
    			favStatus = true;
		    } else {
    			favStatus = false;
		    }

    	    WSHelper.setFavorite(restaurantId, favStatus, (msg, success) => {
    	    	if (success) {
    	    		if (favStatus) {
    	    			e.target.className = "favBtn";
			        } else {
    	    			e.target.className = "favBtn favorited";
			        }
		        } else {
			        WSHelper.showPopdown(msg);
		        }
	        });
	    }
    });
})();
