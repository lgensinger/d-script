angular.module("tsne-nodes-directive", [])

.directive("tsneNodes", ["d3Service", "dataService", "$interval", function(d3Service, dataService, $interval) {
	return {
		restrict: "E",
		scope: {
			vizData: "=",
            canvasWidth: "=",
            canvasHeight: "="
		},
		link: function(scope, element, attrs) {
			
			// get d3 promise
			d3Service.d3().then(function(d3) {
                                
                // set sizes from attributes in html element
                // if not attributes present - use default
				var width = parseInt(attrs.canvasWidth) || 700;
                var height = parseInt(attrs.canvasHeight) || width;
                var radius = 2;
				var color = ["orange", "teal", "grey", "#5ba819"];
                
                // tsne items
                var opt = {epsilon: 10, perplexity: 30};
                var T = new tsnejs.tSNE(opt); // create a tSNE instance
                
                var canvas = d3.select(element[0])
                    .append("svg")
                    .attr({
                        viewBox: "0 0 " + width + " " + height
                    });
                
                // bind data
                scope.$watch("vizData", function(newData, oldData) {
                    //console.log("--------------------- watch triggered ---------------------");
                    //console.log("------- old data -------"); console.log(oldData);
                    //console.log("------- new data -------"); console.log(newData);
    
                    // async check
                    if (newData !== undefined) {
                        //console.log("data is ready");
						
						// check new vs old
                        var isMatching = angular.equals(newData, oldData);
                        
                        // if false
                        if (!isMatching) {

                            // update the viz
                            draw(newData);

                        };
                        
                        function draw(data) {
                            
                            // initialize embedding data
                            T.initDataDist(data.mat);
                            
                            // get min and max in each column of Y
                            var Y = T.Y;
                            
                            var group = canvas
                                .selectAll(".b")
                                .data(data.nodes)
                                .enter()
                                .append("g")
                                .attr({
                                    class: "u"
                                });
                            
                            group.append("circle")
                                .attr({
                                    r: radius
                                })
                                .on({
                                    click: function(d) {
                                        
                                        var group = this.parentNode;
                                        
                                        d3.select(group)
                                            .append("text")
                                            .text(d);
                                        
                                    }
                                });
                            
                            // zoom functionality
                            var zoomListener = d3.behavior.zoom()
                                .scaleExtent([0.1, 10])
                                .center([0, 0])
                                .on("zoom", zoomHandler);
                            
                            // apply zoom to canvas
                            zoomListener(canvas);
                            
                            var tx=0;
                            var ty=0;
                            var ss=1;
                            
                            // repeat step function to animate
                            $interval(step, 0);
                            
                            
                            

function updateEmbedding() {
  var Y = T.getSolution();
  canvas.selectAll('.u')
    .data(data.nodes)
    .attr("transform", function(d, i) { return "translate(" +
                                          ((Y[i][0]*20*ss + tx) + (width / 2)) + "," +
                                          ((Y[i][1]*20*ss + ty) + (height / 2)) + ")"; });
}



function zoomHandler() {
  tx = d3.event.translate[0];
  ty = d3.event.translate[1];
  ss = d3.event.scale;
}

function step() {
  for(var k=0;k<1;k++) {
    T.step(); // do a few steps
  }
  updateEmbedding();
}


                                
                        };
                        
                    };
                    
                });
				
			});
			
		}
		
	};
}]);