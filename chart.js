
const svgWidth = 450, svgHeight = 500, margin = { top: 30, right: 30, bottom: 60, left: 60 },
width = svgWidth - margin.left - margin.right,
height = svgHeight - margin.top - margin.bottom;;

let svgScatter = d3.select("#chart").append("svg")
.attr("width", svgWidth)
.attr("height", svgHeight)
.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
              
let svgBarRoot = d3.select("#left-histogram").append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight),
    svgBar = svgBarRoot.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")"),
    svgBarOverlay = svgBarRoot.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

let svgBarRoot2 = d3.select("#right-histogram").append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight),
    svgBar2 = svgBarRoot2.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")"),
    svgBarOverlay2 = svgBarRoot2.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

let brush = d3.brush() 
        .on("start brush", brushFxn)
        .on("end", updateBars);

let scatterData = [], 
    scatterData2 = [], 
    filteredBarData = [], 
    filteredBarData2 = [], 
    points, 
    xScaleScatter,
    yScaleScatter,
    xScaleBar,
    yScaleBar, 
    xScaleBar2, 
    yScaleBar2;

d3.csv("ca-housing-umap.csv")
    .then(function (data) {
        console.log(data);
        // Attempt to parse median_housing_price and housing_median_age as numbers
        data.forEach(d => {
            d.median_house_value = +d.median_house_value.replace(/[^\d.-]/g, '');  // Remove non-numeric characters
            d.housing_median_age = +d.housing_median_age.replace(/[^\d.-]/g, '');})

        // Check if the values are now numbers
        console.log("First few rows after conversion:", data.slice(0, 5));
        console.log("Type of median_house_value in first row after conversion:", typeof data[0].median_house_value);
        console.log("Type of housing_median_age in first row after conversion:", typeof data[0].housing_median_age);

        scatterData = data;  // Use the updated data
        
         // cast strings as numbers
         for (let i = 0; i < scatterData.length; i++) {
             scatterData[i].longitude = +scatterData[i].longitude;
             scatterData[i].latitude = +scatterData[i].latitude;

         }

        let barData = getHistogramData(scatterData, "median_house_value", 10);
        console.log("First few rows of barData:", barData.slice(0, 5));
        let barData2 = getHistogramData(scatterData, "housing_median_age", 10);

        // scatterplot:
        // create scales
        xScaleScatter = d3.scaleLinear()
            .domain(d3.extent(scatterData, (d) => d.longitude)) 
            .range([0, width]), 
        yScaleScatter = d3.scaleLinear()
            .domain(d3.extent(scatterData, (d) => d.latitude)) 
            .range([height, 0]);

        // create axes
        let xAxisScatter = svgScatter.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(xScaleScatter));
        let yAxisScatter = svgScatter.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(yScaleScatter));

        // label axes
        xAxisScatter.append("text")
            .attr("class", "label")
            .attr("transform", `translate(${width / 2}, 40)`)
            .text("Longitude")
        yAxisScatter.append("text")
            .attr("class", "label")
            .attr("transform", `translate(-40, ${2 * height / 5}) rotate(-90)`)
            .text("Latitude")



    // PLOT DATA 
        points = svgScatter.selectAll("circle") // inclass: assign selection to points var
            .data(scatterData) // inclass: change var name data
            .join("circle")
            .attr("cx", (d) => xScaleScatter(d.longitude))
            .attr("cy", (d) => yScaleScatter(d.latitude))
            .attr("r", 2) 
            .attr("fill", "red")
            .attr("opacity", 1)
            .attr("class", "non-brushed");

         // brush
        svgScatter.append("g") // inclass: add
            .call(brush);

        // histogram 1
        xScaleBar = d3.scaleLinear()
            .domain(d3.extent(scatterData, d => d.median_house_value))
            .range([0, width]);
        
        yScaleBar = d3.scaleLinear()
            .domain([0, d3.max(barData, d => d.count)])
            .range([height, 0]);
        
        // define axes
        let xAxisBar = svgBar.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScaleBar))
        xAxisBar.selectAll("text")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-45)")
            .attr("dx", "-0.8em")
            .attr("dy", "0.15em");

        let yAxisBar = svgBar.append("g")
            .call(d3.axisLeft(yScaleBar));

        // label axes
        xAxisBar.append("text")
            .attr("class", "label")
            .attr("transform", `translate(${width / 2}, 55)`)
            .text("Median Housing Price ($)")

        yAxisBar.append("text")
            .attr("class", "label")
            .attr("transform", `translate(-40, ${2 * height / 5}) rotate(-90)`)
            .text("Number of records")

        svgBar.selectAll("rect")
            .data(barData)
            .join("rect")
            .attr("x", d => xScaleBar(d.binStart))
            .attr("width", d => xScaleBar(d.binEnd) - xScaleBar(d.binStart))
            .attr("y", d => yScaleBar(d.count))
            .attr("height", d => height - yScaleBar(d.count));

        //histogram 2
        xScaleBar2 = d3.scaleLinear()
            .domain(d3.extent(scatterData, d => d.housing_median_age))
            .range([0, width]);
        
        yScaleBar2 = d3.scaleLinear()
            .domain([0, d3.max(barData2, d => d.count)])
            .range([height, 0]);

        // axes
        let xAxisBar2 = svgBar2.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScaleBar2));
        let yAxisBar2 = svgBar2.append("g")
            .call(d3.axisLeft(yScaleBar2));

        // label our axes
        xAxisBar2.append("text")
            .attr("class", "label")
            .attr("transform", `translate(${width / 2}, 40)`)
            .text("Housing Median Age (Years)")
        yAxisBar2.append("text")
            .attr("class", "label")
            .attr("transform", `translate(-40, ${2 * height / 5}) rotate(-90)`)
            .text("Number of records")

        svgBar2.selectAll("rect")
            .data(barData2)
            .join("rect")
            .attr("x", d => xScaleBar2(d.binStart))
            .attr("width", d => xScaleBar2(d.binEnd) - xScaleBar2(d.binStart))
            .attr("y", d => yScaleBar2(d.count))
            .attr("height", d => height - yScaleBar2(d.count));

    })
    .catch(function (err) {
        console.error(err);

    });

function brushFxn(event) { 
    points.attr("class", "non-brushed");

    if (event.selection != null) {
        let brushCoordsD3 = d3.brushSelection(this);
        brushCoords = {
            "x0": brushCoordsD3[0][0],
            "x1": brushCoordsD3[1][0],
            "y0": brushCoordsD3[0][1],
            "y1": brushCoordsD3[1][1]
        };

        let filteredScatterData = scatterData.filter(brushFilter);
        console.log("Filtered Scatter Data:", filteredScatterData);
        console.log("Filtered Scatter Data Length:", filteredScatterData.length);
        console.log("Points selected! Proceeding with variable mapping.");

        // Get variable values from selected scatter points
        let selectedRooms = filteredScatterData.map(d => d.median_house_value);
        console.log("selectedRooms:", selectedRooms);
        let selectedAges = filteredScatterData.map(d => d.housing_median_age);
        console.log("selectedAges:", selectedAges)

        // Update histograms with only selected values
        filteredBarData = getHistogramData(filteredScatterData, "median_house_value");
        console.log("filteredBarData bins:", filteredBarData);
        filteredBarData2 = getHistogramData(filteredScatterData, "housing_median_age");
        console.log("filteredBarData2 bins:");

        // Store selected values for brushing
        highlightDataRooms = selectedRooms;
        highlightDataAges = selectedAges;

        points.filter(d => filteredScatterData.includes(d))
        .attr("class", "brushed");
        }
        updateBars();
    
        }

function brushFilter(d) {
    let cx = xScaleScatter(d.longitude),
        cy = yScaleScatter(d.latitude);
    return (brushCoords.x0 <= cx && brushCoords.x1 >= cx && brushCoords.y0 <= cy && brushCoords.y1 >= cy);
}


function updateBars() { 
    // Update histogram 1 (median_housing_price)
    svgBarOverlay.selectAll("rect")
        .data(filteredBarData)
        .join("rect")
        .attr("class", "brushed")
        .attr("x", d => xScaleBar(d.binStart))  
        .attr("y", d => yScaleBar(d.count))
        .attr("width", d => Math.max(0, xScaleBar(d.binEnd) - xScaleBar(d.binStart)))
        .attr("height", d => height - yScaleBar(d.count));

    // Update histogram 2 (housing_median_age)
    svgBarOverlay2.selectAll("rect")
        .data(filteredBarData2)
        .join("rect")
        .attr("class", "brushed")
        .attr("x", d => xScaleBar2(d.binStart))  
        .attr("y", d => yScaleBar2(d.count))
        .attr("width", d => Math.max(0, xScaleBar2(d.binEnd) - xScaleBar2(d.binStart)))
        .attr("height", d => height - yScaleBar2(d.count));

}


function getHistogramData(data, variable, numBins = 10) {
    
    let cleanData = data.filter(d => {
        const value = +d[variable];
        return value != null && !isNaN(value);
    });

    console.log(`Clean data for ${variable}:`, cleanData.map(d => d[variable]));
    console.log(`Clean data length for ${variable}:`, cleanData.length);

    let extent = d3.extent(cleanData, d => +d[variable]); 
    extent = extent.sort(d3.ascending);

    console.log(`Extent for ${variable}:`, extent);

    if (!extent || isNaN(extent[0]) || isNaN(extent[1])) {
        console.error(`Invalid extent for variable ${variable}:`, extent);
        return [];
    }

    if (extent[0] === extent[1]) {
        extent[1] = extent[0] + 1e-6;
    }

    numBins = Math.min(Math.max(1, Math.floor(numBins)), cleanData.length || 10);

    let histogram = d3.histogram()
        .value(d => +d[variable]) 
        .domain(extent)
        .thresholds(numBins);

    let bins = histogram(cleanData).map(bin => ({
        binStart: bin.x0,
        binEnd: bin.x1,
        count: bin.length
    }));

    return bins;
}