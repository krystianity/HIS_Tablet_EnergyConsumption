/*
   Copyright 2015 Dennis Stodko, Christian Fröhlingsdorf

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

/* Vanilla JS App File */
(function () {
    "use strict";

    if (_config.web_version) {
        //use JQuery if the APP is running in a Browsertab to kick of the onDeviceReady function
        //it is otherwise only called by Cordova on Mobile Devices (non Browsers..)
        //$("#cordova-script").remove();
        $(onDeviceReady);

        if (detectIE()) {
            alert("Please, run this App in a modern Browser e.g. Chrome!");
        }
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

        //tobii studio prototype testing
        if(!detectIE())
            $("html").on("taphold", onTouchHold.bind(this));
        else {
            console.log("detected IE will use doubleclick isntead of taphold");
            $("html").dblclick(onTouchHold.bind(this));
        }

        //check for keyboard combinations if the app is running in a browser
        registerKeyboardCombinations();

        //check for orientation changes if the app is running on a mobile device
        $("body").on("orientationchange", function (event) {
            console.log("device orientation changed, reloading page..");
            _app_scope.$apply(function () {

                if (_checkOrientation() == 0) {
                    _app_scope.portrait = true;
                    _app_scope.fillgauge = _config.fillgauge_portrait;
                } else {
                    _app_scope.portrait = false;
                    _app_scope.fillgauge = _config.fillgauge_landscape;
                }

                _app_scope.changePage(_current_page);

                //adjust ipad screenpositions
                if ($(window).width() < 800) {
                    _app_scope.fillgst_ipad = "fillgst fillgst-ipad";
                } else {
                    _app_scope.fillgst_ipad = "fillgst";
                }
            });
        });

        //set device orientation on start
        _app_scope.$apply(function () {

            if (_checkOrientation() == 0) {
                _app_scope.portrait = true;
                _app_scope.fillgauge = _config.fillgauge_portrait;
            } else {
                _app_scope.portrait = false;
                _app_scope.fillgauge = _config.fillgauge_landscape;
            }

            //adjust ipad screenpositions
            if ($(window).width() < 800) {
                _app_scope.fillgst_ipad = "fillgst fillgst-ipad";
            } else {
                _app_scope.fillgst_ipad = "fillgst";
            }
        });

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
        try {
            //try to find the closest item of class _il_, an item from the manageable list
            var _it = $(event.target).closest("._il_");
            if(!_it || typeof _it === "undefined")
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
        } catch (err) {
            console.log("touch-hold aborted with error!");
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
        //..
        _app_scope.$apply(function(){
            _app_scope.firstStart();
        });
    };

    // ### inner functions ###

    function registerKeyboardCombinations() {
        console.log("registering keyboard shortcut combinations!");

        //empty scope.items
        Mousetrap.bind('ctrl+alt+shift+e', function (e) {
            console.log("[CTRL+ALT+SHIFT+E] deleting scope.items!");
            _app_scope.$apply(function () {
                _app_scope.items = [];
                _app_scope.saveItems();
            });

            return false;
        }, 'keyup');

        //load pre-defined alpha data form alpha.json into scope.items
        Mousetrap.bind('ctrl+alt+shift+l', function (e) {
            console.log("[CTRL+ALT+SHIFT+L] loading alpha scope.items!");

            loadJsonData("db/alpha.json", function(success, data){
                if(success){
                    _app_scope.$apply(function () {
                        _app_scope.loadItems(data);
                        _app_scope.saveItems();
                    });
                } else {
                    console.log("failed to get alpha.json!");
                }
            });

            return false;
        }, 'keyup');

        //toggle day and night view
        Mousetrap.bind('ctrl+alt+shift+n', function (e) {
            console.log("[CTRL+ALT+SHIFT+N] toggeling night/day -view!");
            _app_scope.$apply(function () {
                _app_scope.toggleDayNightView();
                _changeDayView(_current_page, _app_scope.dayView);
                _redrawFillgauges();
            });
            return false;
        }, 'keyup');

        //alternative to swipe gestures if app is running on a desktop browser
        Mousetrap.bind('left', function (e) {
            onSwipe(null, "right", null, null, null, null); //inverted for swipes!
            return false;
        }, 'keyup');

        Mousetrap.bind('right', function (e) {
            onSwipe(null, "left", null, null, null, null); //inverted for swipes!
            return false;
        }, 'keyup');

        Mousetrap.bind('up', function (e) {
            onSwipe(null, "up", null, null, null, null);
            return false;
        }, 'keyup');

        Mousetrap.bind('down', function (e) {
            onSwipe(null, "down", null, null, null, null);
            return false;
        }, 'keyup');
    }

})();

///called by $scope, apply any page related calls here
///
function _onPageChange(uri) {
    var last_page = _current_page;
    _current_page = uri;
    console.log("Page movement: " + uri + "->" + last_page);

    //reset scrolling on all pages
    $("html").swipe("option", "allowPageScroll", "none");

    /* running the viscalc.js functions to generate data for the d3.js visualisations
    on the single pages */

    switch (uri) {
        case "history":
            console.log("Drawing wheel..");
            $("#wheel-body").empty();
            v_drawWheel(vc_getWheelData(_devices, _days));
            _changeDayView(uri, _app_scope.dayView);
            break;

        case "green":
            //allow vertical scrolling on green view
            $("html").swipe("option", "allowPageScroll", "vertical");

            console.log("Drawing bar..");
            $("#bar-body").empty();
            $("#bar-body2").empty();
            var tbars = vc_getBarData(_app_scope.items);
            v_drawBars("#bar-body", tbars[0]);
            v_drawBars("#bar-body2", tbars[1]);
            _changeDayView(uri, _app_scope.dayView);
            break;

        case "manage_items":
            //allow vertical scrolling on manage item list
            $("html").swipe("option", "allowPageScroll", "vertical");
            _redrawFillgauges();
            _changeDayView(uri, _app_scope.dayView);
            break;

        case "edit_item":
            _changeDayView(uri, _app_scope.dayView);
            break;

        default: break;
    }

    if (last_page == "manage_items" || last_page == "edit_item") {
        _app_scope.$apply(function () {
            _app_scope.saveItems();
        });
    }
};

///changes color and styles of a view related to day=true or day=false | day/night view
///
function _changeDayView(view, day) {
    if (day) {
        //dayview
        switch (view) {

            case "edit_item":
                $(".page__background").css("background-color", "ghostwhite");
                $(".settings-list").css("background-color", "ghostwhite");
                $(".list__item").css("color", "black");
                $(".profile-name").css("color", "black");
                $(".profile-email").css("color", "black");
                $(".list--inset").css("border", "1px solid #ddd");
                break;

            case "manage_items":
                $(".page__background").css("background-color", "ghostwhite");
                $(".list__item").css("background-color", "ghostwhite");
                $(".item-desc").css("color", "#666");
                $(".navigation-bar").removeClass("transparent-day");
                $(".navigation-bar").removeClass("transparent-night");
                break;

            case "green":
                $(".page__background").removeClass("background-green-night");
                $(".page__background").addClass("background-green-day");
                $(".navigation-bar").addClass("transparent-day");
                $(".navigation-bar").removeClass("transparent-night");
                break;

            case "history":
                $(".page__background").removeClass("background-history-night");
                $(".page__background").addClass("background-history-day");
                $(".navigation-bar").addClass("transparent-day");
                $(".navigation-bar").removeClass("transparent-night");
                break;
        }
    } else {
        //nightview
        switch (view) {

            case "edit_item":
                $(".page__background").css("background-color", "dimgrey");
                $(".settings-list").css("background-color", "dimgrey");
                $(".list__item").css("color", "white");
                $(".profile-name").css("color", "white");
                $(".profile-email").css("color", "white");
                $(".list--inset").css("border", "1px solid lightgrey");
                $(".navigation-bar").removeClass("transparent-day");
                $(".navigation-bar").addClass("transparent-night");
                break;

            case "manage_items":
                $(".page__background").css("background-color", "dimgrey");
                $(".list__item").css("background-color", "dimgrey");
                $(".item-desc").css("color", "ghostwhite");
                $(".navigation-bar").removeClass("transparent-day");
                $(".navigation-bar").addClass("transparent-night");
                break;

            case "green":
                $(".page__background").removeClass("background-green-day");
                $(".page__background").addClass("background-green-night");
                $(".navigation-bar").removeClass("transparent-day");
                $(".navigation-bar").addClass("transparent-night");
                break;

            case "history":
                $(".page__background").removeClass("background-history-day");
                $(".page__background").addClass("background-history-night");
                $(".navigation-bar").removeClass("transparent-day");
                $(".navigation-bar").addClass("transparent-night");
                break;
        }
    }
};

///uses viscalc.js and visualisation.js to draw the gauges on the ids of the views
///
function _redrawFillgauges(item) {
    console.log("Drawing liquids..");

    if(typeof item === "undefined")
        $(".fillgsli").empty();
    else {
        $("#fillgauge_" + item.id + "_1").empty();
        $("#fillgauge_" + item.id + "_2").empty();
    }

    v_drawLiquids(vc_getLiquidsData(_app_scope.items, item));
};

///checks if a swipe action is not related to navigation as it is an action / global because of anon event callback
///
function _specialCaseSwiping(direction) {

    if (_current_page == _config.item_view) {
        if (direction == _config.navigation.item_save) {
            //saving item here a. doing nothing ;) --> update we are saving the item now
            _app_scope.$apply(function () {
                _app_scope.saveItem();
            });
        } else if (direction == _config.navigation.item_delete) {
            //down swipe on the item detail view means bye bye item (a. deleting the item)
            _app_scope.$apply(function () {
                _app_scope.removeItemClick(); //changes page as well
            });

            return true; //stop the onSwipe() event
        }
    }

    return false; //continue with common onSwipe() event
}

///gets the devices orientation, 0 = portrait & 1 = landscape
///
function _checkOrientation() {
    var _w = $(window).width();
    var _h = $(window).height();
    if (_h > _w) {
        //portrait
        return 0;
    } else {
        //landscape
        return 1;
    }
}

///returns version of IE or false, if browser is not Internet Explorer
///
function detectIE() {
    var ua = window.navigator.userAgent;

    var msie = ua.indexOf('MSIE ');
    if (msie > 0) {
        // IE 10 or older => return version number
        return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }

    var trident = ua.indexOf('Trident/');
    if (trident > 0) {
        // IE 11 => return version number
        var rv = ua.indexOf('rv:');
        return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }

    var edge = ua.indexOf('Edge/');
    if (edge > 0) {
        // IE 12 => return version number
        return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
    }

    // other browser
    return false;
}
