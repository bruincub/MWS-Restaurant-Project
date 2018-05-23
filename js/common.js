/**
 * Open Indexed DB
 */
function openDatabase() {
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

    const _dbPromse = openDatabase();
})();