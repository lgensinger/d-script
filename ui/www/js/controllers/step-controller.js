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
    getDataset("icdar13");
    
	function getData(endpoint, id, name) {
		dataService.getData(endpoint, id).then(function(data) {
            
            // set current batch
            $scope[name] = data;
           
		});
		
	};
    
    function getDataset(name) {
		dataService.getDataset(name).then(function(data) {
            
            // set current batch
            $scope.tsneNodes = data;
           
		});
		
	};
    	
}]);