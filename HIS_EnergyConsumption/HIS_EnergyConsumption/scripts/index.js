/* Vanilla JS App File */
(function () {
    "use strict";

    if (_config.web_version) {
        //use JQuery if the APP is running in a Browsertab to kick of the onDeviceReady function
        //it is otherwise only called by Cordova on Mobile Devices (non Browsers..)
        $(onDeviceReady);
    }

    document.addEventListener( 'deviceready', onDeviceReady.bind( this ), false );

    function onDeviceReady() {
        // Handle the Cordova pause and resume events
        document.addEventListener( 'pause', onPause.bind( this ), false );
        document.addEventListener('resume', onResume.bind(this), false);

        //get a reference to the main angular scope so that it can be called from vanilla JS
        //make sure to embrace content functions with in an scope.$apply(function(){ content here });
        _app_scope = angular.element(document.body).scope();

        _app_scope.$apply(function () {
            _app_scope.doSomething();
        });

        console.log("VanillaJS ready!");
    };

    function onPause() {
    };

    function onResume() {
    };

})();