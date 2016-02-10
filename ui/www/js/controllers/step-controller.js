angular.module("step-controller", [])

.controller("stepCtrl", ["$scope", "dataService", function($scope, dataService) {
    
    /**************************/
    /********* !DATA **********/
    /**************************/
    
    $scope.nodes;
    
    
    
    /****************************/
    /********* !EVENTS **********/
    /****************************/
    
    
    
    /*******************************/
    /********* !FUNCTIONS **********/
    /*******************************/
    
    // get data
    getData("static", "steps");
    
	function getData(endpoint, id) {
		dataService.getData(endpoint, id).then(function(data) {
            
            // set current batch
            $scope.nodes = data;
           
		});
		
	};
    	
}]);