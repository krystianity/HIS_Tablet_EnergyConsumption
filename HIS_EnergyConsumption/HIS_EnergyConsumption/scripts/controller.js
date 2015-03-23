/* Main Angular JS Controller File */
angular.module('app', ['onsen']);

angular.module('app').controller('AppController',
    function ($scope) {

        $scope.config = _config;

        $scope.currentItem = {};
        $scope.items = [new EleItem(1), new EleItem(2), new EleItem(3)];

        $scope.categories = $scope.config.categories;
        $scope.types = $scope.config.types;

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
            anim = typeof anim === 'undefined' ? "none" : anim;
            $scope.navi.resetToPage($scope.config.view_dir + uri + $scope.config.view_format, {
                "animation": "fade",
                "onTransitionEnd": function () {
                    _onPageChange(uri);
                }
            });
        };

        ///if the user touches on one of the items in the manage_items view (list)
        ///
        $scope.listItemClick = function (itemId) {
            console.log("Clicked on ListItem " + itemId);

            $scope.currentItem = $scope.getItemById(itemId);
            $scope.changePage($scope.config.item_view, "lift");
        };

        ///if the user touches the add item button on the manage_items view (list)
        ///
        $scope.addItemClick = function () {
            console.log("Clicked on Add Item");

            var ni = new EleItem($scope.items.length);
            $scope.currentItem = ni;
            $scope.items.push(ni);

            $scope.changePage($scope.config.item_view, "lift");
        };

        ///if the user touches the delete button on the edit_item view / can also be triggered by swipe down through onSwipe()
        ///
        $scope.removeItemClick = function () {
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

        console.log("AngularJS Scope ready!");
});