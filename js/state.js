"use strict";

app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.when('', '/heatmap');

    $stateProvider.state('heatmap', {
        url: '/heatmap',
        templateUrl: 'templates/heatmap.tpl.html',
        controller: 'HeatmapCtrl'
    })

}]);
