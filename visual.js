( function() {
    var width = 1250;
    height = 800;

    var svg = d3.select("#vis")
        .append("svg")
        .attr("height", height)
        .attr("width", width)
        .append("g")
        .attr("transform", "translate(0,0)")

    var colors = {
        red: "#D8352A",
        blue: "#48509E",
        green: "#02A371",
        yellow: "#F5A623",
        hyperGreen: "#19C992",
        purple: "#B1B4DA",
        orange: "#F6E7AD",
        charcoal: "#383838"
    }

    var radiusScale = d3.scaleSqrt().domain([7,614]).range([5,65])
    var radiusScaleE = d3.scaleSqrt().domain([2,465]).range([5,55])
    var radiusScaleP = d3.scaleSqrt().domain([1,456]).range([5,60])

    console.log(3*radiusScale(15));
    console.log(3*radiusScale(60));
    console.log(3*radiusScale(120));
    console.log(3*radiusScale(240));

    var colorPicker = d3.scaleQuantize().domain([1, 7]).range([colors.green, colors.blue, colors.yellow, colors.purple, colors.orange, colors.red, colors.hyperGreen]);

    var forceXweekend = d3.forceX(function(d) {
        if(d.weekend === 'TRUE'){
            return 300
        } else {
            return 750
        }
    }).strength(0.04)

    var forceXday = d3.forceX(function(d) {
        if(d.day >= 1 && d.day <= 4){
            return d.day*(width/5)
        } else {
            return (d.day-4)*(width/4)
        }
    }).strength(0.04)

    var forceXcombine = d3.forceX(width/2).strength(0.04)


    var forceY = d3.forceY(function(d) {
        return height/2
    }).strength(0.05)

    var forceYdays = d3.forceY(function(d) {
        if(d.day >= 1 && d.day <= 4){
            return height/3
        } else {
            return 2*(height/3)
        }
    }).strength(0.04)

    var forceCollide = d3.forceCollide(function(d) {
        return radiusScale(d.total) + 3;
    })

    var forceCollideE = d3.forceCollide(function(d) {
        return radiusScaleE(d.activity) + 3;
    })

    var forceCollideP = d3.forceCollide(function(d) {
        return radiusScaleP(d.productivity) + 3;
    })

    var simulation = d3.forceSimulation()
        .force('charge', d3.forceManyBody(-60))
        .force("x", forceXcombine)
        .force("y", forceY)
        .force("collide", forceCollide)

    const myCircles = d3.csv("finalData.csv");
    myCircles.then(function (datapoints){
        var circles = svg.selectAll(".day")
            .data(datapoints)
            .enter().append("circle")
            .attr("class", "day")
            .attr("date", function (d) {
                return d.date;
            })
            .attr("prod", function (d) {
                return d.productivity;
            })
            .attr("act", function (d) {
                return d.activity;
            })
            .attr("r", function (d) {
                return radiusScale(d.total);
            })
            .attr("fill", function (d){
                return colorPicker(d.day)
            })
            .style('stroke-width', '3px')
            .style('stroke', 'none')
            .on('mouseover', function(){
                details.html("<div class='card bg-light mb-3' style=\"max-width: 18rem;\"><div class='card-body'> <h5 class='card-title'>" + this.getAttribute('date') + "</h5><ul class='card-text'><li>"+this.getAttribute('prod')+" productive minutes</li><li>"+this.getAttribute('act')+" active minutes</li></ul></div></div>");

                d3.select(this)
                    .style('stroke', 'white');
                details.style("visibility", "visible");
            })
            .on('mousemove', function (){
                details
                    .style("top", d3.select(this).attr("cy") + "px")
                    .style("left", d3.select(this).attr("cx") + "px");
            })
            .on('mouseout', function(){
                    d3.select(this)
                        .style('stroke', 'none');
                 details.style("visibility", "hidden");
            })


        var details = d3.select("#detail")
            .append("div")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("max-width", '18rem')


        d3.select("#weekend").on('click', function (){
            console.log("Clicked weekend")
            simulation
                .force("x", forceXweekend)
                .force("y", forceY)
                .alphaTarget(0.7)
                .restart()
        })

        d3.select("#day").on('click', function (){
            simulation
                .force("y", forceYdays)
                .force("x", forceXday)
                .alphaTarget(0.7)
                .restart()
        })

        d3.select("#ex").on('click', function (){
            circles
                .attr("r", function (d) {
                    return radiusScaleE(d.activity);
                })

            simulation
                .force("collide", forceCollideE)
                .force('charge', d3.forceManyBody(-60))
                .alphaTarget(0.3)
                .restart()
        })

        d3.select("#prod").on('click', function (){
            circles
                .attr("r", function (d) {
                    return radiusScaleP(d.productivity);
                })

            simulation
                .force("collide", forceCollideP)
                .force('charge', d3.forceManyBody(-20))
                .alphaTarget(0.7)
                .restart()
        })

        d3.select("#total").on('click', function (){
            circles
                .attr("r", function (d) {
                    return radiusScale(d.total);
                })

            simulation
                .force("collide", forceCollide)
                .force('charge', d3.forceManyBody(-60))
                .alphaTarget(0.05)
                .restart()
        })

        d3.select("#center").on('click', function (){
            simulation
                .force('charge', d3.forceManyBody(-60))
                .force("x", forceXcombine)
                .force("y", forceY)
                .force("collide", forceCollide)
                .alphaTarget(.3)
                .restart()
        })

        simulation.nodes(datapoints)
            .on('tick', ticked)

        function ticked(){
            circles
                .attr("cx", function (d){
                    return d.x
            })
                .attr("cy", function (d){
                    return d.y
            })

        }

    });



}) ();