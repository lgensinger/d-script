angular.module("step-controller", [])

.controller("stepCtrl", ["$scope", "dataService", function($scope, dataService) {
    
    /**************************/
    /********* !DATA **********/
    /**************************/
    
    $scope.nodes;
    $scope.tsneNodes;
    
    
    
    /****************************/
    /********* !EVENTS **********/
    /****************************/
    
    
    
    /*******************************/
    /********* !FUNCTIONS **********/
    /*******************************/
    
    // get data
    getData("static", "steps", "nodes");
    getData("static", "tsnetest", "tsneNodes");
    
	function getData(endpoint, id, name) {
		dataService.getData(endpoint, id).then(function(data) {
            
            // set current batch
            $scope[name] = data;
           
		});
		
	};
    	
}]);