/*
 * AngularJS integration with the HTML5Sortable library:
 * https://github.com/lukasoppermann/html5sortable
 *
 * Copyright 2023, Adam Barry (https://github.com/adambarry)
 *
 * The component is (almost) a drag-n-drop replacement for the:
 *
 * AngularJS integration with the HTML5 Sortable jQuery Plugin
 * https://github.com/voidberg/html5sortable
 * Copyright 2013, Alexandru Badiu <andu@ctrlz.ro>
 *
 * ... which is no longer available on GitHub. The only required changes is:
 * 
 * - The renaming of the related HTML-attribute(s) from `html-sortable`
 *   to `html5-sortable`.
 *
 * Released under the MIT license.
 *
 * Usage:
 *
 * In HTML:

    <script src="path/to/html5sortable.js"></script>
    <script src="path/to/html5sortable.angular.js"></script>

 *
 * In AngularJS module setup:

    angular.module("App", [
        "html5Sortable",
    ])

 *
 * In AngularJS controller:

    $scope.sortable1 = {};

    $scope.sortableCallbackViaAttribute = function (sourceModel, destModel, start, end) {
        console.log("callback for `sortable1` (via attribute)", {
            sourceModel: sourceModel,
            destModel: destModel,
            start: start,
            end: end
        });
    };

    $scope.sortable2 = {
        "sortupdate": function (sourceModel, destModel, start, end) {
            console.log("callback for `sortable2` (via option)", {
                sourceModel: sourceModel,
                destModel: destModel,
                start: start,
                end: end
            });
        }
    };

 *
 *In AngularJS HTML-template:
 
     <ul html5-sortable="sortable1" html5-sortable-callback="sortableCallbackViaAttribute" ng-model="items">
        <li>Item #1</li>
        <li>Item #2</li>
     </ul>

     <ul html5-sortable="sortable2" ng-model="items">
        <li>Item #1</li>
        <li>Item #2</li>
     </ul>

 *
 */

(function (angular) {
    "use strict";

    var moduleId = "html5Sortable";

    angular.module(moduleId, [])
        .directive(moduleId, [
            "$timeout", "$parse", function ($timeout, $parse) {
                return {
                    require: "?ngModel",
                    link: function (scope, element, attrs, ngModel) {

                        //console.log(moduleId, {
                        //    scope: scope,
                        //    element: element,
                        //    attrs: attrs,
                        //    ngModel: ngModel
                        //});

                        var opts,
                            model,
                            timeout = 50, //ms
                            scallback;

                        opts = angular.extend({}, scope.$eval(attrs.html5Sortable));
                        //console.log("opts", opts);

                        //Bind the callback for the "sortupdate" event-handler
                        if (opts.sortupdate || attrs.html5SortableCallback) {
                            //Prefer callback provided by component options (rather than element attribute)
                            scallback = opts.sortupdate || scope[attrs.html5SortableCallback];
                            //console.log("scallback", scallback);
                        }

                        //Make the sortable
                        sortable(element, opts);

                        if (!ngModel) {
                            return false;
                        }


                        /******************************************************************************
                         * Private functions
                         ******************************************************************************/

                        function reload() {
                            $timeout(function () {
                                //Reload the sortable
                                sortable(element);
                            }, timeout);
                        }

                        (function init() {
                            ngModel = $parse(attrs.ngModel);
                            //console.log("ngModel", ngModel);
                        }());


                        /******************************************************************************
                         * Event handlers
                         ******************************************************************************/

                        sortable(element)[0].addEventListener("sortupdate", function (e) {
                            //console.group(moduleId, "sortupdate");
                            //console.log("arguments", arguments);
                            //console.log("data", data);

                            var data = e.detail;

                            //Convert relevant elements to jQuery
                            data.origin.container = $(data.origin.container);
                            data.destination.container = $(data.destination.container);
                            //console.log("sortupdate event", data);

                            //Identify the respective model-names on the parent-scope
                            var $source = data.origin.container.attr("ng-model");
                            //console.log("$source", $source);
                            var $dest = data.destination.container.attr("ng-model");
                            //console.log("$dest", $dest);

                            var $sourceModel = $parse($source);
                            //console.log("$sourceModel", $sourceModel);
                            var $destModel = $parse($dest);
                            //console.log("$destModel", $destModel);

                            var $start = data.origin.index;
                            //console.log("$start", $start);
                            var $end = data.destination.index;
                            //console.log("$end", $end);

                            scope.$apply(function () {
                                if ($sourceModel(data.origin.container.scope()) === $destModel(data.destination.container.scope())) {
                                    var $items = $sourceModel(data.origin.container.scope());
                                    $items.splice($end, 0, $items.splice($start, 1)[0]);
                                    $sourceModel.assign(scope, $items);
                                } else {
                                    var $item = $sourceModel(data.origin.container.scope())[$start];
                                    var $sourceItems = $sourceModel(data.origin.container.scope());
                                    var $destItems = $destModel(data.destination.container.scope()) || [];

                                    $sourceItems.splice($start, 1);
                                    $destItems.splice($end, 0, $item);

                                    $sourceModel.assign(scope, $sourceItems);
                                    $destModel.assign(scope, $destItems);

                                    $timeout(function () {
                                        //Reload the destination sortable to make it draggable
                                        sortable(data.destination.container);
                                    }, timeout);
                                }
                            });

                            //console.log("scallback", scallback);

                            if (scallback) {
                                //console.log("Execute callback");
                                scallback($sourceModel(data.origin.container.scope()), $destModel(data.destination.container.scope()), $start, $end);
                            }

                            //console.groupEnd();
                        });

                        if (opts.sortstart) {
                            sortable(element)[0].addEventListener("sortstart", opts.sortstart);
                        }

                        if (opts.sortstop) {
                            sortable(element)[0].addEventListener("sortstop", opts.sortstop);
                        }


                        /******************************************************************************
                         * Scope watchers
                         ******************************************************************************/

                        ngModel.$render = function () {
                            reload();
                        };

                        scope.$watch(model, function () {
                            reload();
                        });

                    }
                };
            }
        ]);
}(angular));