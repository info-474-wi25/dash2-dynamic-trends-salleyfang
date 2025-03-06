// 1: SET GLOBAL VARIABLES
const margin = { top: 50, right: 30, bottom: 60, left: 70 };
const width = 900 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Create SVG containers for both charts
const svg1_Line = d3.select("#lineChart1") // If you change this ID, you must change it in index.html too
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const svg2_Bar = d3.select("#barChart2")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// (If applicable) Tooltip element for interactivity
// const tooltip = ...

// 2.a: LOAD...
Promise.all([
    d3.csv("CLEANED-grouped-airport.csv"),
    d3.csv("CLEANED-grouped-make.csv")
    // d3.csv("CLEANED-make.csv")
]).then(([airportData, makeData]) => {
    // 2.b: ... AND TRANSFORM DATA
    // airport transformation
    const selectedAirport = "ATL"; // default airport
    airportData.forEach(d => {
        // convert year to numeric
        d.year = +d.Event_Year;
        // delete og column
        delete d.Event_Year;
        // extract ORD airport incidents only
        d.incidents = +d[selectedAirport];
    });
    console.log(airportData);
    // make transformation
    makeData.forEach(d => {
        d.Fatal = +d.Fatal;
        d["Non-Fatal"] = +d["Non-Fatal"];
        d.Incident = +d.Incident;
        d.Unavailable = +d.Unavailable;
    })
    makeData.sort((a, b) => d3.ascending(a.Incident, b.Incident));
    console.log(makeData);

    // ==========================================
    //                  CHART 1 
    // ==========================================

    // 3.a: SET SCALES FOR CHART 1

    const xScaleLine = d3.scaleLinear()
        .domain(d3.extent(airportData, d => d.year))
        .range([0, width]);

    const yScaleLine = d3.scaleLinear()
        .domain([0, d3.max(airportData, d => d.incidents)])
        .range([height, 0]);

    const line = d3.line()
        .x(d => xScaleLine(d.year))
        .y(d => yScaleLine(d.incidents));

    // 4.a: PLOT DATA FOR CHART 1
    svg1_Line.append("path")
        .datum(airportData)
        .attr("class", "line") // added class so we can select it later
        .attr("d", line)
        .attr("stroke", "black")
        .attr("fill", "none")
        .attr("stroke-width", 2);

    // 5.a: ADD AXES FOR CHART 1
    svg1_Line.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScaleLine)
            .tickFormat(d3.format("d")));

    svg1_Line.append("g")
        .attr("class", "y-axis") // added class so we can select it later
        .call(d3.axisLeft(yScaleLine));

    const maxIncidents = d3.max(airportData, d => d.incidents);
    yScaleLine.domain([0, maxIncidents]);
    // update y-axis with integer tick formatting that counts by ones
    // **used chat gpt to figure out how to do this**
    svg1_Line.select(".y-axis")
            .call(d3.axisLeft(yScaleLine)
            .ticks(maxIncidents)
            .tickFormat(d3.format("d")));

    // 6.a: ADD LABELS FOR CHART 1
    svg1_Line.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
        .text("Year");

    svg1_Line.append("text")
        .attr("x", -height / 2)
        .attr("y", -50)
        .attr("text-anchor", "middle")
        .text("Incidents")
        .attr("transform", "rotate(-90)");

    
    // 7.a: ADD INTERACTIVITY FOR CHART 1
    function updateLineChart(selectedAirport) {
        // update data row's incidents using selected airport
        airportData.forEach(d => {
            d.incidents = +d[selectedAirport];
        });

        // update yScale based on new max incidents (same as above)
        const maxIncidents = d3.max(airportData, d => d.incidents);
        yScaleLine.domain([0, maxIncidents]);
        // update y-axis with integer tick formatting that counts by ones
        // **used chat gpt to figure out how to do this**
        svg1_Line.select(".y-axis")
                .call(d3.axisLeft(yScaleLine)
                .ticks(maxIncidents)
                .tickFormat(d3.format("d")));

        // update line path
        svg1_Line.select(".line")
                .datum(airportData)
                .transition()
                .attr("d", d3.line()
                    .x(d => xScaleLine(d.year))
                    .y(d => yScaleLine(d.incidents))
                );
        
        // update title
        d3.select(".chart-container h2")
          .text(`Incidents at ${selectedAirport} Over Time`);
    }

    // add event listener MOVE TO BOTTOM WHEN DONE!!!
    // **taken from demo8-nobel-interactive code**
    d3.select("#airportSelect").on("change", function() {
        const selectedAirport = d3.select(this).property("value");
        updateLineChart(selectedAirport);
    });

    // ==========================================
    //         CHART 2 (if applicable)
    // ==========================================

    // 3.b: SET SCALES FOR CHART 2
    const x0Bar = d3.scaleBand() // X axis scaling
        .domain(makeData.map(d => d.Make))
        .rangeRound([0, width])
        .paddingInner(0.2);

    const x1Bar = d3.scaleBand() // sub category
        .domain(["Fatal", "Non-Fatal", "Incident", "Unavailable"])
        .rangeRound([0, x0Bar.bandwidth()])
        .padding(0.05);

    const yScaleBar = d3.scaleLinear() // Y axis scaling
        // .domain([0, d3.max(makeData, d => d3.max(["Fatal", "Non-Fatal", "Incident", "Unavailable"].map(key => d[key])))]).nice()
        .domain([0, 700])
        .range([height, 0]);

    const color = d3.scaleOrdinal()
        .domain(["Fatal", "Non-Fatal", "Incident", "Unavailable"])
        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b"]);
        

    // 4.b: PLOT DATA FOR CHART 2
    const tooltip = d3.select ("body")
        .append ("div")
        .attr("class", "tooltip-bar")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style( "background", "rgba(0, 0, 0, 0.7)")
        .style("color", "white")
        .style("padding", "8px")
        .style("border-radius", "5px")
        .style("font-size", "12px");
        
    svg2_Bar.append("g")
        .selectAll("g")
        .data(makeData)
        .enter().append("g")
        .attr("transform", d => `translate(${x0Bar(d.Make)},0)`)
        .selectAll("rect")
        .data(d => ["Fatal", "Non-Fatal", "Incident", "Unavailable"].map(key => ({ key: key, value: d[key], make: d.Make })))
        .enter().append("rect")
        .attr("x", d => x1Bar(d.key))
        .attr("y", d => yScaleBar(d.value))
        .attr("width", x1Bar.bandwidth())
        .attr("height", d => height - yScaleBar(d.value))
        .attr("fill", d => color(d.key))

        .on("mouseover", function(event, d) {
            tooltip.style("visibility", "visible")
                .text(`${d.make} - ${d.key}: ${d.value}`)
            // d3.select(this).style("stroke", "white").style("stroke-width", 2);
        })
        .on("mousemove", function(event) {
            tooltip.style("top", (event.pageY - 10) + "px")
                .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function() {
            tooltip.style("visibility", "hidden");
            d3.select(this).style("stroke", "none");
        })

        


    // 5.b: ADD AXES FOR CHART 
    svg2_Bar.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x0Bar))
        .selectAll("text")
        .style("text-anchor", "middle");

    svg2_Bar.append("g")
        .call(d3.axisLeft(yScaleBar)
        .ticks(7)
        .tickFormat(d3.format("d"))
    );

    // 6.b: ADD LABELS FOR CHART 2
    svg2_Bar.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
        .text("Aircraft Make");

    svg2_Bar.append("text")
        .attr("x", -height / 2)
        .attr("y", -50)
        .attr("text-anchor", "middle")
        .text("Number of Incidents")
        .attr("transform", "rotate(-90)");

    // LEGEND
    // const legendData = ["Fatal", "Non-Fatal", "Incident", "Unavailable"];

    // const legend = svg2_Bar.append("g")
    //     // .attr("transform", `translate(${width - 700}, -30)`);
    //     .attr("class", "legend")
    //     // centers the legend and moves up 20px
    //     .attr("transform", `translate(${width / 2}, -20)`);
    
    // const spacing = 100; // can adjust...distance between legend
    // const offset = ((legendData.length - 1) * spacing) / 2; // centers the legend

    // legend.selectAll("g")
    //     .data(legendData)
    //     .enter().append("g")
    //     // .attr("transform", (d, i) => `translate(0,${i * 20})`)
    //     // each item in legend shifted so centered around origin of container
    //     .attr("transform", (d, i) => `translate(${i * spacing - offset}, 0)`) // 
    //     .each(function(d) {
    //         const g = d3.select(this);
    //         g.append("rect")
    //             .attr("width", 18)
    //             .attr("height", 18)
    //             .attr("fill", color(d));
    //         g.append("text")
    //             .attr("x", 24)
    //             .attr("y", 9)
    //             .text(d);
    //     });

    // 7.b: ADD INTERACTIVITY FOR CHART 2


    
}).catch(err => {
    console.log(err);
});

// OLD
// d3.csv("YOUR_CSV_NAME.csv").then(data => {
    // 2.b: ... AND TRANSFORM DATA

    // 3.a: SET SCALES FOR CHART 1


    // 4.a: PLOT DATA FOR CHART 1


    // 5.a: ADD AXES FOR CHART 1


    // 6.a: ADD LABELS FOR CHART 1


    // 7.a: ADD INTERACTIVITY FOR CHART 1
    

    // ==========================================
    //         CHART 2 (if applicable)
    // ==========================================

    // 3.b: SET SCALES FOR CHART 2


    // 4.b: PLOT DATA FOR CHART 2


    // 5.b: ADD AXES FOR CHART 


    // 6.b: ADD LABELS FOR CHART 2


    // 7.b: ADD INTERACTIVITY FOR CHART 2


// });