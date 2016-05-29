/*
  @author Hardik Sondagar
  @abstract
            Load d3 script dynamically. On injecting d3Service into directives, write all the dynamic code after d3Service.d3() promise resolveFor example check app/shared/d3/d3.directive.js
*/
(function() {
  'use strict';

  angular.module('d3', [])
    .factory('d3Service', ['$document', '$q', '$rootScope',
      function($document, $q, $rootScope) {
        var d = $q.defer();
        
        function onScriptLoad() {
          // Load client in the browser
          $rootScope.$apply(function() {
            d.resolve(window.d3);
          });
        }

        /* Check if already loaded */
        if (typeof d3 != "undefined") {
          d.resolve(window.d3);
        } else {
          // Create a script tag with d3 as the source
          // and call our onScriptLoad callback when it
          // has been loaded
          var scriptTag = $document[0].createElement('script');
          scriptTag.type = 'text/javascript';
          scriptTag.async = true;
          scriptTag.src = 'http://d3js.org/d3.v3.min.js';
          scriptTag.onreadystatechange = function() {
            if (this.readyState == 'complete') onScriptLoad();
          };
          scriptTag.onload = onScriptLoad;

          var s = $document[0].getElementsByTagName('body')[0];
          s.appendChild(scriptTag);
        }
        return {
          d3: function() {
            return d.promise;
          }
        };
      }
    ]);

}());
