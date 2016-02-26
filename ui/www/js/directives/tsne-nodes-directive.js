angular.module("tsne-nodes-directive", [])

.directive("tsneNodes", ["d3Service", "dataService", "$interval", function(d3Service, dataService, $interval) {
	return {
		restrict: "E",
		scope: {
			vizData: "=",
            canvasWidth: "=",
            canvasHeight: "="
		},
        template: "<img ng-src='{{ path }}' width='100%' height='auto'/><svg></svg><content-slider viz-data='details' layout='layout'></content-slider><div class='tooltip'></div>",
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
                
                // zoom functionality
                var zoom = d3.behavior.zoom()
                    .scaleExtent([0.1, 10])
                    .center([0, 0])
                    .on("zoom", zoomed);
                
                // add svg canvas
                var canvas = d3.select(element.find("svg")[0])
                    .attr({
                        viewBox: "0 0 " + width + " " + height
                    })
                    .call(zoom);
                
                // add background to canvas
                canvas.append("rect")
                    .attr({
                        class: "background",
                        x: 0, 
                        y: 0, 
                        width: width, 
                        height: height
                      });
                
                // necessary for zooming
                var container = canvas.append("g");
                
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
                            T.initDataDist(data.matrix);
                            
                            // get min and max in each column of Y
                            var Y = T.Y;
                            
                            var group = container
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
                                    mouseover: function(d) {

                                        var tip = d3.select(element.find("div")[1]);

                                        tip.transition()		
                                            .duration(200)		
                                            .style("opacity", .9);		
                                        tip.html(d.id)	
                                            .style("left", (d3.event.pageX) + "px")		
                                            .style("top", (d3.event.pageY - 28) + "px");
                                        
                                    },
                                    mouseout: function(d) {
                                        
                                        var tip = d3.select(element.find("div")[1]);
                                        
                                        tip.transition()
                                            .duration(200)
                                            .style("opacity", 0);
                                        
                                    },
                                    click: function(d) {
                                        
                                        // set image value
                                        scope.path = "data/benchmarking/" + d.id + ".png";
                                        
                                        var isActive = d3.select(this).attr("class") == "node active" ? true : false;
                                    
                                        // check class
                                        if (isActive) {

                                            // make inactive
                                            d3.select(this)
                                                .attr({
                                                    class: "node"
                                                });

                                            // remove text marker
                                            d3.select("#t-" + d.id)
                                                .remove();

                                        } else {

                                            // make active
                                            d3.select(this)
                                                .attr({
                                                    class: "node active"
                                                });

                                            // add text marker
                                            d3.select("svg")
                                                .append("text")
                                                .attr({
                                                    id: "t-" + d.id,
                                                    dx: this.cx.baseVal.value,
                                                    dy: this.cy.baseVal.value
                                                })
                                                .text(d.id);

                                        };
                                        
                                        // node group
                                        var group = this.parentNode;
                                        
                                        // show tooltip
                                        d3.select(group)
                                            .append("text")
                                            .text(d.id);
                                        
                                        var newArray = [];
                                        
                                        // check for state of the node
                                        if (isActive) {
                                            
                                            // loop through detail object
                                            for (var i=0; i < scope.details.length; i++) {
                                                
                                                if (scope.details[i].id.split("_")[0] == d.id) {

                                                } else {
                                                    
                                                    // push value into new array
                                                    newArray.push(scope.details[i]);
                                                    
                                                }
                                                
                                            };
                                            
                                            // assign to scope
                                            scope.details = newArray;
                                            
                                        } else {
                                        
                                            // create new data object
                                            var newData = { id: d.id };

                                            // assign to scope
                                            scope.details = [newData].concat(scope.details);
                                            
                                        };
                                        
                                        // trigger digest to update details
                                        scope.$apply();
                                        console.log(scope.details);
                                    }
                                });
                            
                            var tx=0;
                            var ty=0;
                            var ss=1;
                            
                            // repeat step function to animate
                            $interval(step, 0, (width * 0.33));
                            
                            // tsne update
                            function updateEmbedding() {
                                
                                // new distances calc
                                var Y = T.getSolution();
                                
                                // update nodes
                                canvas
                                    .selectAll('.u')
                                    .data(data.nodes)
                                    .attr({
                                        transform: function(d, i) { 
                                            return "translate(" +
                                          ((Y[i][0]*20*ss + tx) + (width / 2)) + "," +
                                          ((Y[i][1]*20*ss + ty) + (height / 2)) + ")"; 
                                        }
                                    });
                            
                            };
                            
                            // layout step
                            function step() {
                                
                                for(var k=0; k<1; k++) {
                                    
                                    // do a few steps
                                    T.step();
                                
                                };
                                
                                updateEmbedding();
                            
                            };
                                
                        };
                        
                    };
                    
                });
                
                function zoomed() {
                    container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
                };
				
			});
			
		}
		
	};
}]);