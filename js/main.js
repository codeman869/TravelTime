	/*
		 * GEO SHP files provided by US Census Bureau http://www.census.gov/ 
		 * 
		 * 
		 * City Names / Locations / Populations provided by Natural Earth http://www.naturalearthdata.com
		 * 
		 * 
		 * 
		 * Commute times provided by US Census Bureau http://quickfacts.census.gov/qfd/download_data.html
		 * 				(mean travel time to work, mins, workers age 16+)
		 * 
		 * 
		 * 
		 * 
		 * 
		 * 
		 */
		
		//initial variables
		var width = 1200,
			height = 900,
			scale = 1500,
			usMin = 4.3,
			usMax = 42.6,
			usAverage=25.4,
			padding = 10,
			popMin=0,
			popMax=1,
			dX=20,
			dY=20;
			
		//create SVG Object this will be kept as a reference to append path elements to
		var svg = d3.select("body").append("svg").attr("width", width)
			.attr("height", height);
		
		//grey background so the white text is visible	
		svg.append("rect").attr("height", height).attr("width",width).attr("style","fill:grey")
			.attr("rx",20).attr("ry",20);
			
		svg.append("text").attr("x",width/2).attr("y",40).attr("class","title-text")
			.text("Average Commute Time by County for Workers Aged 16+, 2008-2012");
		
		
		//create the actual albers projection
		var projection = d3.geo.albersUsa().translate([width / 2, height / 2])
			.scale(scale);
			
		var path = d3.geo.path().projection(projection);
		
		//scale will be used to determine size of city points
		var popscale = d3.scale.linear();
		
		//used to represent the commute time, will return a number between 0 to 255 for 1 color channel
		var linearScale = d3.scale.linear().domain([usMin, usMax]).range([0,255]);
		
		//begin json parsing
		d3.json("json/final2.json", function(error, us){
			
			if(error){return console.log(error);}
			
			//easier for later reference
			var counties = topojson.feature(us,us.objects.counties);
			var cities = topojson.feature(us,us.objects.places);
			
			svg.selectAll("path").data(counties.features).enter().append("path")
				.attr("name",function(d){
					//easier to see for debugging, nice to have a name in each path
					return d.properties.name;
				}).attr("fill",function(d){
					
					//determines fill color, I choose the red channel
					return d3.rgb(linearScale(d.properties.travel),0,0);
					
				})
				.attr("d",path).attr("class","county").on("mouseover", function(d){
					
						//determines x and  y positions of cursor and adds a small separation to them
						var xPos = parseFloat(d3.mouse(this)[0])+dX;
						var yPos = parseFloat(d3.mouse(this)[1])+dY;
						
						
						//moves, updates and unhides the tool tip
						d3.select("#tooltip").style("left", xPos + "px")
							.style("top", yPos + "px").select("#county")
							.text(d.properties.name);
							
						d3.select("#travel-time").text(d.properties.travel);
						
						
						
						d3.select("#tooltip").classed("hidden",false);
					
				}).on("mouseout", function() {
					
						//hides tool tip when leaving a county
						d3.select("#tooltip").classed("hidden", true);
					
				});
		
			
			//finds min and max populations
			popMin = d3.min(us.objects.places.geometries, function(d){
				
					return d.properties.population;
				
			});
			
			popMax = d3.max(us.objects.places.geometries, function(d){
				
					return d.properties.population;
				
			});
			
			
			//sets scale accordingly, points can range from 1 to 20 pixels
			popscale.domain([popMin,popMax]).range([1,20]);
			
			
			svg.selectAll(".city").data(cities.features).enter().append("path").attr("class","city")
				.attr("d",path.pointRadius(function(d){
					
					return popscale(d.properties.population);
					
				}));
			
			
			//labels cities
			svg.selectAll("text").data(topojson.feature(us, us.objects.places).features).enter()
				.append("text").attr("class", "place-label")
				.attr("transform", function(d) {return "translate (" + projection(d.geometry.coordinates) + ")";})
				.attr("dy", ".35em").attr("dx", ".5em")
				.text(function(d){
					
					return d.properties.name;
					
				});
			
		});
		
		
		
		function setupLegend() {
			//used to move and update legend once page loads, dynamically coded in case scale is changed
			
			d3.select("div.legend").style("left", width - 100 - padding + "px")
				.style("top", height - 150 - padding + "px");
				
			d3.select("#max").text("Max commute time: " + usMax + " mins")
				.style("color", d3.rgb(linearScale(usMax),0,0));
			d3.select("#avg").text("Avg commute time: " + usAverage + " mins")
				.style("color", d3.rgb(linearScale(usAverage),0,0));
			d3.select("#min").text("Min commute time: "+ usMin + " mins")
				.style("color", d3.rgb(linearScale(usMin),0,0));
		}