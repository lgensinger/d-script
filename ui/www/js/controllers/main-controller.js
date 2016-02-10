angular.module("main-controller", [])

.controller("mainCtrl", ["$scope", "dataService", function($scope, dataService) {
    
    /**************************/
    /********* !DATA **********/
    /**************************/
    
    // current presetntation mode
    $scope.mode = "browse";
    
    $scope.steps;
    
    getSteps("static", "process"); // get content for slider
    
    
    /****************************/
    /********* !EVENTS **********/
    /****************************/
    
    // toggle presentation mode
    $scope.toggleMode = function(mode) {
        $scope.mode = mode == "browse" ? "presentation" : "browse";
    };
    
    

    /*******************************/
    /********* !FUNCTIONS **********/
    /*******************************/
    
    function getSteps(endpoint, id) {
		dataService.getData(endpoint, id).then(function(data) {
                        
            // assign to scope
			$scope.steps = data;
           
		});
		
	};
	
}]);