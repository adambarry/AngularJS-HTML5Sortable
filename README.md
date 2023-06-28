# HTML5Sortable for AngularJS
[AngularJS](https://angularjs.org/) wrapper for the [HTML5Sortable](https://github.com/lukasoppermann/html5sortable) library.


# Getting started
First, obtain the `html5sortable.angular.js` file from the `src` folder and include it in your project after referencing the HTML5Sortable library, e.g.:

```
<script src="path/to/html5sortable.js"></script>
<script src="path/to/html5sortable.angular.js"></script>
```

Next, include the `html5Sortable` module in your AngularJS module configuration, e.g.:

```
angular.module("App", [
    "html5Sortable",
])
```

Now, configure the "sortable" in your AngularJS controller, e.g.:

```
$scope.items = [
    { name: "First item"},
    { name: "Item #2"},
    { name: "The third item"}
];

$scope.sortable = {
    //Various options from main library
    "sortstart": function (e) {
        //console.log("sortstart", e.detail);
    },
    "sortstop": function (e) {
        //console.log("sortstop", e.detail);
    },
    "sortupdate": function (sourceModel, destModel, start, end) {
        console.log("callback for `sortable` (via option)", {
            sourceModel: sourceModel,
            destModel: destModel,
            start: start,
            end: end
        });
    }
};
```

Finally, add a "sortable" structure to your AngularJS HTML-template, which references the $scope-variable name for your "sortable" via the `html5-sortable` attribute along with the `ng-model` attribute referencing the collection of items being sorted e.g.:

```
<ul html5-sortable="sortable" ng-model="items">
    <li ng-repeat="item in items">{item.name}</li>
</ul>
```

> Note that the `html5-sortable` and `ng-model` attributes should be specified on the container-element for the items which you want to be able to sort, i.e.
> - `<ul html5-sortable="sortable">` for items in an unordered list.
> - `<tbody html5-sortable="sortable">` for table-rows.

Happy AngularJS sorting!

# Legacy support
As this repository takes up the mantle on [Alexandru Badiu's](https://github.com/voidberg) repository: **[html.sortable](https://github.com/voidberg/html5sortable)** (which now redirects to **HTML5Sortable**, but can still be installed via Bower), it is also possible to use a separately defined $scope-variable for the `sortupdate` callback and have this specified via an optional `html5-sortable-callback` attribute on the "sortable" structure, e.g.:

AngularJS Controller:
```
$scope.items = [
    { name: "First item"}, {}, {}
];

$scope.sortable = {
    //Various options from main library
};

$scope.sortableCallback = function (sourceModel, destModel, start, end) {
    console.log("callback for `sortable` (via option)", {
        sourceModel: sourceModel,
        destModel: destModel,
        start: start,
        end: end
    });
};
```

AngularJS HTML-template:
```
<ul html5-sortable="sortable" html5-sortable-callback="sortableCallback" ng-model="items">
    <li ng-repeat="item in items">{item.name}</li>
</ul>
```