/* Main Angular JS Controller File */
angular.module('app', ['onsen']);

angular.module('app').controller('AppController',
    function ($scope) {

        $scope.config = _config;

        //default onsen ui framework example function
        $scope.doSomething = function () {
            setTimeout(function () {
                alert('tapped');
            }, 100);
        };

        console.log("AngularJS Scope ready!");
});