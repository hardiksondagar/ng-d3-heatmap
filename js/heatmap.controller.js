app.controller('HeatmapCtrl', ['$scope', '$http', function($scope, $http) {

    $scope.data = [];
    $http.get('data/timeseries.json').success(function(data) {
        $scope.data = data;
    });
}]);
