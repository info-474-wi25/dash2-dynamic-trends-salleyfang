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

const svg2_Bar = d3.select("#lineChart2")
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
    airportData.forEach(d => {
        // convert year to numeric
        d.year = +d.Event_Year;
        // delete og column
        delete d.Event_Year;
        // extract ORD airport incidents only
        d.incidents = +d["ORD"];
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
        .call(d3.axisLeft(yScaleLine));
        // How do we make it so that the y-axis counts by ones?
        // TODO: figure out how to make the y-axis count by ones

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
    

    // ==========================================
    //         CHART 2 (if applicable)
    // ==========================================

    // 3.b: SET SCALES FOR CHART 2
    const x0Bar = d3.scaleBand() // X axis scaling
        .domain(makeData.map(d => d.Make))
        .rangeRound([0, width])
        .paddingInner(0.05);

    const x1Bar = d3.scaleBand() // sub category
        .domain(["Fatal", "Non-Fatal", "Incident", "Unavailable"])
        .rangeRound([0, x0Bar.bandwidth()])
        .padding(0.05);

    const yScaleBar = d3.scaleLinear() // Y axis scaling
        .domain([0, d3.max(makeData, d => d3.max(["Fatal", "Non-Fatal", "Incident", "Unavailable"].map(key => d[key])))]).nice()
        .range([height, 0]);

    const color = d3.scaleOrdinal()
        .domain(["Fatal", "Non-Fatal", "Incident", "Unavailable"])
        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b"]);
        

    // 4.b: PLOT DATA FOR CHART 2
    svg2_Bar.append("g")
        .selectAll("g")
        .data(makeData)
        .enter().append("g")
        .attr("transform", d => `translate(${x0Bar(d.Make)},0)`)
        .selectAll("rect")
        .data(d => ["Fatal", "Non-Fatal", "Incident", "Unavailable"].map(key => ({ key, value: d[key] })))
        .enter().append("rect")
        .attr("x", d => x1Bar(d.key))
        .attr("y", d => yScaleBar(d.value))
        .attr("width", x1Bar.bandwidth())
        .attr("height", d => height - yScaleBar(d.value))
        .attr("fill", d => color(d.key));


    // 5.b: ADD AXES FOR CHART 
    svg2_Bar.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x0Bar))
        .selectAll("text")
        .style("text-anchor", "middle");

    svg2_Bar.append("g")
        .call(d3.axisLeft(yScaleBar).ticks(null, "s"))

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
    const legendData = ["Fatal", "Non-Fatal", "Incident", "Unavailable"];

    const legend = svg2_Bar.append("g")
        .attr("transform", `translate(${width - 700}, -30)`);
    
    legend.selectAll("g")
        .data(legendData)
        .enter().append("g")
        .attr("transform", (d, i) => `translate(0,${i * 20})`)
        .each(function(d) {
            const g = d3.select(this);
            g.append("rect")
                .attr("width", 18)
                .attr("height", 18)
                .attr("fill", color(d));
            g.append("text")
                .attr("x", 24)
                .attr("y", 9)
                .text(d);
        });

    

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