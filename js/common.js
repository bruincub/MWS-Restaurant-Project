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

    // const _dbPromse = WSHelper.openDatabase();
})();