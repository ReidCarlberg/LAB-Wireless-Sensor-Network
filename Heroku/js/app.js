
/**
 * Configure all the AngularJS routes here.
 */
app.config(function ($routeProvider) {
    $routeProvider.
        when('/', {controller: HomeCtrl, templateUrl: 'partials/home.html'}).
        when('/login', {controller: LoginCtrl, templateUrl: 'partials/login.html'}).
        when('/callback', {controller: CallbackCtrl, templateUrl: 'partials/callback.html'}).
        when('/contacts', {controller: ContactListCtrl, templateUrl: 'partials/contact/list.html'}).
        when('/view/:contactId', {controller: ContactViewCtrl, templateUrl: 'partials/contact/view.html'}).
        when('/edit/:contactId', {controller: ContactDetailCtrl, templateUrl: 'partials/contact/edit.html'}).
        when('/new', {controller: ContactDetailCtrl, templateUrl: 'partials/contact/edit.html'}).
        when('/push', {controller: PushCtrl, templateUrl: 'partials/readings/push.html'}).
        when('/readings', {controller: ReadingsListCtrl, templateUrl: 'partials/readings/list.html'}).
        when('/graph/:station/:sensor', {controller: ReadingsGraphCtrl, templateUrl: 'partials/readings/graph.html'}).
        otherwise({redirectTo: '/'});
});

app.directive('chart', function(){
    return{
        restrict: 'E',
        link: function(scope, elem, attrs){
            
            var chart = null,
                opts  = { grid: {margin: {left: 0}}, xaxis: { mode: "time", timeformat: "%H/%M/%S" }};
            
            var data = scope[attrs.ngModel];            
            
            scope.$watch(attrs.ngModel, function(v){
                if(!chart){
                    chart = $.plot(elem, v , opts);
                    elem.show();
                }else{
                    chart.setData(v);
                    chart.setupGrid();
                    chart.draw();
                }
            });
        }
    };
});



/**
 * Describe Salesforce object to be used in the app. For example: Below AngularJS factory shows how to describe and
 * create an 'Contact' object. And then set its type, fields, where-clause etc.
 *
 *  PS: This module is injected into ListCtrl, EditCtrl etc. controllers to further consume the object.
 */
angular.module('Contact', []).factory('Contact', function (AngularForceObjectFactory) {
    var Contact = AngularForceObjectFactory({type: 'Contact', fields: ['FirstName', 'LastName', 'Title', 'Phone', 'Email', 'Id'], where: '', limit: 10});
    return Contact;
});

angular.module('Generic', []).factory('Generic', function (AngularForceObjectFactory) {
    var Generic = AngularForceObjectFactory({});
    return Generic;
});



function PushCtrl($scope, AngularForce, $location, Generic) {
    console.log(Generic);

}

function ReadingsListCtrl($scope, AngularForce, $location, Generic) {
    Generic.query(function (data) {
            $scope.readings = data.records;
            $scope.$apply();//Required coz sfdc uses jquery.ajax
        }, function (data) {
            alert('Query Error');
        }, 'Select Id, Station__c, Sensor__c, Value__c, CreatedDate From LABR_Reading__c Order By CreatedDate DESC Limit 100 ');
}

function ReadingsGraphCtrl($scope, Generic, $routeParams) {

    $scope.station = $routeParams.station;

    $scope.sensor = $routeParams.sensor;

    Generic.query(function (data) {
            $scope.readings = data.records;
            //$scope.$apply();//Required coz sfdc uses jquery.ajax
            $scope.graphData = [[]];
            for(var i = 0; i< $scope.readings.length; i++) {
                $scope.graphData[0].push([$scope.readings[i].UTC_Milliseconds__c, $scope.readings[i].Value__c]);
            }
            console.log($scope.graphData);
            $scope.$apply();
        }, function (data) {
            alert('Query Error');
        }, "Select Id, Station__c, Sensor__c, Value__c, UTC_Milliseconds__c From LABR_Reading__c Where Station__c = '" + $scope.station + "' and Sensor__c = '" + $scope.sensor + "' Order By CreatedDate DESC Limit 100 ");
}

function HomeCtrl($scope, AngularForce, $location, $route) {
    $scope.authenticated = AngularForce.authenticated();
    if (!$scope.authenticated) {
        return $location.path('/login');
    }

    $scope.logout = function () {
        AngularForce.logout();
        $location.path('/login');
    }
}

function LoginCtrl($scope, AngularForce, $location) {
    $scope.authenticated = AngularForce.authenticated();
    if ($scope.authenticated) {
        $location.path('/');
    }
    $scope.login = function () {
        AngularForce.login(function() {
            $scope.$apply(function () {
                $location.path('/contacts');
            });
            
        });
    }
}

function CallbackCtrl($scope, AngularForce, $location) {
    AngularForce.oauthCallback(document.location.href);
    $location.path('/home');
}

function ContactListCtrl($scope, AngularForce, $location, Contact) {
    $scope.authenticated = AngularForce.authenticated();
    if (!$scope.authenticated) {
        return $location.path('/login');
    }

    $scope.searchTerm = '';
   
    Contact.query(function (data) {
            $scope.contacts = data.records;
            $scope.$apply();//Required coz sfdc uses jquery.ajax
        }, function (data) {
            alert('Query Error');
        }, 'Select Id, FirstName, LastName, Title, Email, Phone, Account.Name From Contact Order By LastName Limit 20 ');

    $scope.doSearch = function (searchTerm) {
        Contact.search(function (data) {
            $scope.contacts = data;
            $scope.$apply();//Required coz sfdc uses jquery.ajax
        }, function (data) {
        }, 'Find {' + escape($scope.searchTerm) + '*} IN ALL FIELDS RETURNING CONTACT (Id, FirstName, LastName, Title, Email, Phone, Account.Name)');

    };

    $scope.doView = function (contactId) {
        $location.path('/view/' + contactId);
    };

    $scope.doCreate = function () {
        $location.path('/new');
    }
}

function ContactCreateCtrl($scope, $location, Contact) {
    $scope.save = function () {
        Contact.save($scope.contact, function (contact) {
            var c = contact;
            $scope.$apply(function () {
                $location.path('/view/' + c.Id);
            });
        });
    }
}

function ContactViewCtrl($scope, AngularForce, $location, $routeParams, Contact) {

    $scope.authenticated = AngularForce.authenticated();
    if (!$scope.authenticated) {
        return $location.path('/login');
    }

    Contact.get({id: $routeParams.contactId}, function (contact) {
        
        self.original = contact;
        $scope.contact = new Contact(self.original);
        $scope.$apply();//Required coz sfdc uses jquery.ajax
    });

}

function ContactDetailCtrl($scope, AngularForce, $location, $routeParams, Contact) {
    var self = this;

    $scope.destroyError = null;

    if ($routeParams.contactId) {
        AngularForce.login(function () {
            Contact.get({id: $routeParams.contactId}, function (contact) {
                self.original = contact;
                $scope.contact = new Contact(self.original);
                $scope.$apply();//Required coz sfdc uses jquery.ajax
            });
        });
    } else {
        $scope.contact = new Contact();
        //$scope.$apply();
    }

    $scope.isClean = function () {
        return angular.equals(self.original, $scope.contact);
    }

    $scope.destroy = function () {
        self.original.destroy(
            function () {
                $scope.$apply(function () {
                    $scope.destroyError = null;
                    $location.path('/contacts');
                });
            },
            function (data) {
                if (data.responseText) {
                    var res = angular.fromJson(data.responseText);
                }
                $scope.$apply(function() { $scope.destroyError = res[0].message });
                console.log('delete error');

            }
        );
    };

    $scope.save = function () {
        if ($scope.contact.Id) {
            $scope.contact.update(function () {
                $scope.$apply(function () {
                    $location.path('/view/' + $scope.contact.Id);
                });

            });
        } else {
            Contact.save($scope.contact, function (contact) {
                var c = contact;
                $scope.$apply(function () {
                    $location.path('/view/' + c.Id || c.id);
                });
            });
        }
    };

    $scope.doCancel = function () {
        if ($scope.contact.Id) {
            $location.path('/view/' + $scope.contact.Id);
        } else {
            $location.path('/contacts');
        }
    }
}
