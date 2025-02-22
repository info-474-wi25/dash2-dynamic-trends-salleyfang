// 1: SET GLOBAL VARIABLES
const margin = { top: 50, right: 30, bottom: 60, left: 70 };
const width = 900 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Create SVG containers for both charts
const svg1_RENAME = d3.select("#lineChart1") // If you change this ID, you must change it in index.html too
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const svg2_RENAME = d3.select("#lineChart2")
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
    // airport transformation
    airportData.forEach(d => {
        d.year = +d.Event_Year;
        delete d.Event_Year;
    });
    console.log(airportData);
    // make transformation
    // makeData.forEach(d => {
    //     // group Injury_Severity to make counting easier

    //     // keep Make, Injury_Severity columns ONLY
    //     delete d.Accident_Number;
    //     delete d.Event_Date;
    //     delete d.Accident_Year;
    //     delete d.Location;
    //     delete d.Country;
    //     delete d.Latitude;
    //     delete d.Longitude;
    //     delete d.Airport_Code;
    //     delete d.Airport_Name;
    //     delete d.Aircraft_Damage;
    //     delete d.Registration_Number;
    //     delete d.Model;
    //     delete d.Schedule;
    //     delete d.Air_Carrier;
    //     delete d.Total_Fatal_Injuries;
    //     delete d.Total_Serious_Injuries;
    //     delete d.Total_Uninjured;
    //     delete d.Weather_Condition;
    //     delete d.Broad_Phase_of_Flight;
    // });
    console.log(makeData);
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