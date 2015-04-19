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

/* Main Angular JS Controller File */
angular.module('app', ['onsen']);

angular.module('app').controller('AppController',
    function ($scope) {

        //configured data
        $scope.config = _config;

        //current data
        $scope.currentItem = {};
        $scope.currentCategory = {};
        $scope.removeItemSwipe = false;
        $scope.missingItem = false; //error message
        $scope.pushItem = false; //if the item should be pushed to the list on save or not
        $scope.items = [];

        //data
        $scope.devices = [];
        $scope.days = [];
        $scope.dayView = true; //day 'n' night
        $scope.portrait = true;
        $scope.fillgauge = $scope.config.fillgauge_portrait;

         $scope.firstStart = function() {
            if(localStorage){
               if(!localStorage.firstStart){ //load alpha.json on firstStart of app (adding sample data)
                  localStorage.firstStart = true;
                  loadJsonData("db/alpha.json", function(success, data){
                      if(success){
                           $scope.loadItems(data);
                           $scope.saveItems();
                      }
                  });
               }
            }
         };

        ///this data is loaded by index.js onAppStart from json files in the dp dir, it has to be applied later
        ///
        $scope.setDevices = function (devices, days) {
            $scope.devices = devices;
            //console.log(devices);
            console.log("added " + $scope.devices.length + " device categorie/s!");
            $scope.days = days;
            //console.log(days);
            console.log("added " + $scope.days.length + " day/s!");
        };

        ///changes the view(screen, page..) of the main controller - page stacking is skipped by resetToPage()
        ///
        $scope.changePage = function (uri, anim) {
            //$scope.ons.screen.presentPage($scope.config.view_dir + uri);
            //$location.path($scope.config.view_dir + uri);
            //$scope.tabnav.setMainPage($scope.config.view_dir + uri);

            /*
            if (!pop) {
                $scope.navi.pushPage($scope.config.view_dir + uri + $scope.config.view_format);
            } else {
                $scope.navi.popPage($scope.config.view_dir + uri+ $scope.config.view_format);
            } */

            //"slide", "simpleslide", "lift", "fade" and "none".
            anim = typeof anim === 'undefined' ? "fade" : anim;
            $scope.navi.resetToPage($scope.config.view_dir + uri + $scope.config.view_format, {
                "animation": anim,
                "onTransitionEnd": function () {
                    _onPageChange(uri);
                }
            });
        };

        ///if the user touches on one of the items in the manage_items view (list)
        ///
        $scope.listItemClick = function (itemId) {
            console.log("Clicked on ListItem " + itemId);

            //$scope.currentItem = $scope.getItemById(itemId);
            //$scope.changePage($scope.config.item_view, "lift");

            //on a simple touch the active state of the item will switch
            var fullItem = $scope.getItemById(itemId);
            $scope.toggleItemState(fullItem);
            _redrawFillgauges(fullItem);
        };

        ///if the user touches and holds on one of the items in the manage_items view (list) - triggered by ontouchhold() in index.js
        ///
        $scope.listItemHold = function (itemId) {
            $scope.currentItem = $scope.getItemById(itemId);
            $scope.pushItem = false; //we do not want to duplicate the item
            $scope.removeItemSwipe = false; //and reset delete state
            //$scope.toggleItemState($scope.currentItem); //because listItemClick will be triggered before
            $scope.changePage($scope.config.item_view, "lift");
        };

        ///adding the item to the last, after it was save by the user in the edit-view, because
        ///adding it earlier results in svg attribute errors with angular js and fillgauge
        ///
        $scope.saveItem = function () {
            console.log("Saving item..");
            
            //dont save items without category or device obj
            if(Object.keys($scope.currentItem.category).length === 0
            || Object.keys($scope.currentItem.device).length === 0) {
               $scope.missingItem = true;
               return;
            }
            
            $scope.missingItem = false; //reset error message
            
            if($scope.pushItem){
               $scope.pushItem = false;
               //actually just adding it to the list
               $scope.items.push($scope.currentItem);
               $scope.saveItems();
            }
            
            $scope.changePage($scope.config.item_list, "fade");
        };

        ///if the user touches the add item button on the manage_items view (list)
        ///
        $scope.addItemClick = function () {
            console.log("Clicked on Add Item");

            var ni = new EleItem($scope.getNextItemId());
            $scope.currentItem = ni;
            //$scope.items.push(ni); do not do this here! exceptions will be thrown

            $scope.removeItemSwipe = false; //and reset delete state
            $scope.pushItem = true; //add the item to the list when it is saved
            $scope.changePage($scope.config.item_view, "lift");
        };

        ///if the user touches the delete button on the edit_item view / can also be triggered by swipe down through onSwipe()
        ///
        $scope.removeItemClick = function () {
           
           $scope.missingItem = false; //reset error message
           
            /* has to be triggered twice *update* */
            if (!$scope.removeItemSwipe) {
                //swipes for the first time, show a message
                $scope.removeItemSwipe = true; //message will appear if this is true
                return; //cancle further steps
            }
            //if its already true, we just continue and delete the item

            if($scope.pushItem){
              //just skip if the item wasnt even a member of the itemlist
               $scope.pushItem = false;
               $scope.currentItem = null;
               $scope.changePage($scope.config.item_list, "fade");
               return;
           }

            var index = $scope.items.indexOf($scope.currentItem);
            $scope.items.splice(index, 1);
            $scope.currentItem = null;

            $scope.changePage($scope.config.item_list, "fade");
        };

        ///returns the specific item from the scope's item list - identified by item.id
        ///
        $scope.getItemById = function (itemId) {
            for (var i = 0; i < $scope.items.length; i++) {
                if ($scope.items[i].id == itemId) {
                    return $scope.items[i];
                }
            }
        };

        ///toggles the active state of an item
        ///
        $scope.toggleItemState = function (i) {
            if (i.active)
                i.active = false;
            else
                i.active = true;
        };

        ///returns the next possible id for the creation of a new item
        ///
        $scope.getNextItemId = function () {
            var hId = 1;
            for (var i = 0; i < $scope.items.length; i++) {
                if ($scope.items[i].id == hId)
                    hId++;
                else if ($scope.items[i].id > hId)
                    hId = $scope.items[i].id + 1;
            }

            return hId;
        };

        ///saves $scope.items in localStorage
        ///
        $scope.saveItems = function () {
            if (localStorage) {
                localStorage.savedItems = angular.toJson($scope.items);
                console.log("saved: " + localStorage.savedItems);
            } else {
                console.log("couldnt save items!");
            }
        };

        ///loads $scope.items from localStorage
        ///
        $scope.loadItems = function (json) {

            if (typeof json === "undefined") {
                if (localStorage && localStorage.savedItems) {
                    $scope.items = JSON.parse(localStorage.savedItems);

                    //re-assign getters
                    for (var i = 0; i < $scope.items.length; i++) {
                        $scope.items[i] = new EleItem(null, $scope.items[i]);
                    }

                    console.log("loaded: " + JSON.stringify($scope.items));
                } else {
                    console.log("couldnt load items!");
                }
            } else {
                $scope.items = json;
                //re-assign getters
                for (var i = 0; i < $scope.items.length; i++) {
                    $scope.items[i] = new EleItem(null, $scope.items[i]);
                }
                console.log("loaded from json: " + JSON.stringify($scope.items));
            }
        };

        ///toggles day and night view (css changes are related to the dayView property)
        ///
        $scope.toggleDayNightView = function () {
            if ($scope.dayView)
                $scope.dayView = false;
            else
                $scope.dayView = true;

            //call vanillajs change day function
            _changeDayView(_current_page, $scope.dayView);
            _redrawFillgauges();
        };

        $scope.loadItems(); //load items on start
        console.log("AngularJS Scope ready!");
});
