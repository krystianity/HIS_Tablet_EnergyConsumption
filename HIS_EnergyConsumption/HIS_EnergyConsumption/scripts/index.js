/* Vanilla JS App File */
(function () {
    "use strict";

    if (_config.web_version) {
        //use JQuery if the APP is running in a Browsertab to kick of the onDeviceReady function
        //it is otherwise only called by Cordova on Mobile Devices (non Browsers..)
        //$("#cordova-script").remove();
        $(onDeviceReady);
    }

    document.addEventListener('deviceready', onDeviceReady.bind(this), false);

    function onDeviceReady() {
        // Handle the Cordova pause and resume events
        document.addEventListener('pause', onPause.bind(this), false);
        document.addEventListener('resume', onResume.bind(this), false);
        document.addEventListener('backbutton', onBackButton.bind(this), false);

        //get a reference to the main angular scope so that it can be called from vanilla JS
        //make sure to embrace content functions with in an scope.$apply(function(){ content here });
        _app_scope = angular.element(document.body).scope();
        //these scopes are defined in config.js and therefore globally available

        //register swipe and hold event handler (using TouchSwipe JQuery Plugin)
        $("html").swipe({ swipe: onSwipe.bind(this), threshold: _config.swipe_threshold });
        //$("body").swipe({ hold: onTouchHold.bind(this), threshold: _config.hold_threshold }); <--buggy!
        //found a fix using JQueryMobile
        $.mobile.loader.prototype.options.disabled = true;
        $.mobile.loading().remove();
        $.mobile.ajaxEnabled = false;
        $.event.special.tap.tapholdThreshold = _config.hold_threshold;
        $("html").bind("taphold", onTouchHold.bind(this));

        console.log("VanillaJS ready!");

        var parent_call = onFullyLoaded.bind(this);

        //loading json data
        loadJsonData(_config.db_devices_path, function (success, data) {
            _devices = data;
            loadJsonData(_config.db_days_path, function (success, data) {
                _days = data;

                //set db data in scope
                _app_scope.$apply(function () {
                    _app_scope.setDevices(_devices, _days);
                });

                //display bootscreen and switch to start screen after boot-time, calls onFullyLoaded() when ready
                _app_scope.$apply(function () {
                    _app_scope.changePage(_config.boot_page, false);
                });
                setTimeout(function () {
                    _app_scope.$apply(function () {
                        _app_scope.changePage(_config.start_page, false);
                        parent_call();
                    });
                }, _config.boot_time);
            });
        });
    };

    function onPause() {
    };

    function onResume() {
    };

    function onBackButton() {
    };

    function onTouchHold(event) {
        console.log("touch-hold!");
        //try to find the closest item of class _il_, an item from the manageable list
        var _it = $(event.target).closest("._il_");
        if(!_it)
            return;

        //get its id and split to the itemId        
        var itemId = ($(_it).attr("id").split("_il_"))[1];
        var itemNum = parseInt(itemId) || 0;

        //test if the itemId is an int and fire scope event
        if (itemNum !== 0) {
            console.log("touch-hold on item " + itemId);
            _app_scope.$apply(function () {
                _app_scope.listItemHold(itemNum);
            });
        }
    };

    ///uses the navigation object in config.js to identify the animation and path from the current page using the swipe direction
    ///
    function onSwipe(event, direction, distance, duration, fingerCount, fingerData) {
        console.log("Triggered swipe direction " + direction);

        //check if the navigation is safe!
        if (!_current_page || _current_page == null || _current_page == "" || _current_page == " ") {
            console.log("_current_page is null or empty!");
            return;
        } else {
            if (!_config.navigation[_current_page] || _config.navigation[_current_page] == null) {
                console.log("_current_page is not in navigation! " + _current_page);
                return;
            }
        }

        //trigger actions such as item delete on swipe before the page change
        if (_specialCaseSwiping(direction))
            return;

        //get the navigation info of the current page
        var page_obj = _config.navigation[_current_page];
        var page_uri = null;

        //could be simplified to _config.navigation[_current_page][direction], but its less flexible
        //can be null^^
        switch (direction) {
            case "left":
                page_uri = page_obj["right"]; //invert
                break;

            case "right":
                page_uri = page_obj["left"]; //invert
                break;

            case "up":
            case "down":
                page_uri = page_obj[direction];
                break;

            default: console.log("default swipe gesture! " + direction); return; //return breaks..
        }

        if (page_uri == null) {
            console.log("navigation is invalid, staying on current page.");
            return;
        }

        _app_scope.$apply(function () {
            _app_scope.changePage(page_uri);
        });
    };

    ///executed when app is in start screen
    ///
    function onFullyLoaded() {
        console.log("App is ready, in start screen..");

    };

    // ### inner functions ###

    function loadJsonData(file, callback) {
        $.getJSON(file, function (jdata) {
            console.log("got json data!");
            callback(true, jdata);
        }).fail(function (err) {
            console.log("failed to load " + file);
            console.log(err);
            callback(false, null);
        });
    }

})();

///called by $scope, apply any page related calls here
///
function _onPageChange(uri) {
    _current_page = uri;
    console.log("Changed page to " + uri);

    var bul = [
  { "title": "Revenue", "subtitle": "US$, in thousands", "ranges": [150, 225, 300], "measures": [220, 270], "markers": [250] },
  { "title": "Profit", "subtitle": "%", "ranges": [20, 25, 30], "measures": [21, 23], "markers": [26] },
  { "title": "Order Size", "subtitle": "US$, average", "ranges": [350, 500, 600], "measures": [100, 320], "markers": [550] },
  { "title": "New Customers", "subtitle": "count", "ranges": [1400, 2000, 2500], "measures": [1000, 1650], "markers": [2100] },
  { "title": "Satisfaction", "subtitle": "out of 5", "ranges": [3.5, 4.25, 5], "measures": [3.2, 4.7], "markers": [4.4] }
    ];

    switch (uri) {
        case _config.start_page:
            console.log("Drawing liquids..");
            v_drawLiquids();
            break;

        case "green_stats":
            console.log("Drawing pie..");
            $("pie-body").empty();
            v_drawPie();

            console.log("Drawing bar..");
            $("#bar-body").empty();
            v_drawBars("#bar-body", bul);
            break;

        default: break;
    }
};

///checks if a swipe action is not related to navigation as it is an action / global because of anon event callback
///
function _specialCaseSwiping(direction) {

    if (_current_page == _config.item_view) {
        if (direction == "up") {
            //saving item here a. doing nothing ;)
        } else if (direction == "down") {
            //down swipe on the item detail view means bye bye item (a. deleting the item)
            _app_scope.$apply(function () {
                _app_scope.removeItemClick(); //changes page as well
            });

            return true; //stop the onSwipe() event
        }
    }

    return false; //continue with common onSwipe() event
}