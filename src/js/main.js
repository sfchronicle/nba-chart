require("./lib/social"); //Do not delete

// fills in HTML for year as years toggle
var updateInfo = function(data) {
  document.querySelector("#season").innerHTML = "<div class='season'>"+data.season+"</div>";
  document.querySelector("#warriors-fact").innerHTML = "<div class='score warscore'>Warriors: "+data.w_score+"</div><div class='desc'>"+data.w_text+"</div>";
  document.querySelector("#cavs-fact").innerHTML = "<div class='score cavscore'>Cavaliers: "+data.c_score+"</div><div class='desc'>"+data.c_text+"</div>";
};

// color by year function
function color_by_team(team) {
  if (team == "warriors") {
    return "#006BB6";
  } else if (team == "cavs"){
    return "#860038";
  }
}

// setting sizes of interactive
var margin = {
  top: 0,
  right: 50,
  bottom: 50,
  left: 30
};
if (screen.width > 768) {
  var width = 900 - margin.left - margin.right;
  var height = 450 - margin.top - margin.bottom;
} else if (screen.width <= 768 && screen.width > 480) {
  var width = 720 - margin.left - margin.right;
  var height = 450 - margin.top - margin.bottom;
} else if (screen.width <= 480 && screen.width > 340) {
  console.log("big phone");
  var margin = {
    top: 20,
    right: 50,
    bottom: 40,
    left: 30
  };
  var width = 340 - margin.left - margin.right;
  var height = 350 - margin.top - margin.bottom;
} else if (screen.width <= 340) {
  console.log("mini iphone")
  var margin = {
    top: 20,
    right: 30,
    bottom: 40,
    left: 20
  };
  var width = 310 - margin.left - margin.right;
  var height = 300 - margin.top - margin.bottom;
}

var	parseYr = d3.timeParse("%Y");

// create SVG container for chart components
var svgNBA = d3.select("#line-chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    // .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var g = svgNBA.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var x = d3.scaleTime().range([0, width]),
    y = d3.scaleLinear().range([height, 0]);

x.domain([parseYr(2007),parseYr(2016)]);
y.domain([0,80]);

var lineWarriors = d3.line()
    .x(function(d) {
      return x(parseYr(+d.years));
    })
    .y(function(d) {
      return y(+d.w_wins);
    });
var lineCavs = d3.line()
    .x(function(d) {
      return x(parseYr(+d.years));
    })
    .y(function(d) {
      return y(+d.c_wins);
    });

if (screen.width <= 480) {
  g.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x)
        .ticks(5))
      .append("text")
        .text("Season")
    .select(".domain")
      .remove()
} else {
  g.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .append("text")
        .text("Season")
    .select(".domain")
      .remove()
}

// Add the filled area
g.append("path")
    .datum(statsData)
    .attr("class","thicklines")
    .style("stroke",color_by_team("warriors"))
    .attr("d", lineWarriors);

// Add the filled area
g.append("path")
    .datum(statsData)
    .attr("class","thicklines")
    .style("stroke",color_by_team("cavs"))
    .attr("d", lineCavs);

// define the area
var areaWAR = d3.area()
   .x(function(d) { return x(parseYr(+d.years)); })
   .y0(height)
   .y1(function(d) { return y(+d.w_wins); });

function areaTweenWAR() {
  var interpolate = d3.scaleQuantile()
    .domain([0,1])
    .range(d3.range(1, statsData.length + 1));
  return function(t) {
    return areaWAR(statsData.slice(0, interpolate(t)));
  };
}

// define the area
var areaCAV = d3.area()
   .x(function(d) { return x(parseYr(+d.years)); })
   .y0(height)
   .y1(function(d) { return y(+d.c_wins); });

function areaTweenCAV() {
  var interpolate = d3.scaleQuantile()
    .domain([0,1])
    .range(d3.range(1, statsData.length + 1));
  return function(t) {
    return areaCAV(statsData.slice(0, interpolate(t)));
  };
}

// draw dots
var nodes = g.selectAll(".dot")
    .data(statsData)
  .enter().append("g")
    .attr("class","node");

nodes.append("circle")
    .attr("class", "cavDot")
    .attr("r", 5)
    .attr("fill",color_by_team("cavs"))
    .attr("cx", function(d) { return x(parseYr(+d.years)); })
    .attr("cy", function(d) { return y(+d.c_wins); })

nodes.append("circle")
    .attr("class", "warDot")
    .attr("r", 5)
    .attr("fill",color_by_team("warriors"))
    .attr("cx", function(d) { return x(parseYr(+d.years)); })
    .attr("cy", function(d) { return y(+d.w_wins); })

nodes.append("text")
  .attr("dx", function(d) { return x(parseYr(+d.years))-15; })
  .attr("dy", function(d) { return y(+d.c_wins)+20; })
  .attr("fill",color_by_team("cavs"))
  .text(function(d){
    return d.c_score;
  });

nodes.append("text")
  .attr("dx", function(d) { return x(parseYr(+d.years))-15; })
  .attr("dy", function(d) { return y(+d.w_wins)-20; })
  .attr("fill",color_by_team("warriors"))
  .text(function(d){
    return d.w_score;
  });

var years = [2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016];
var i = 0;
var tempData;
var tick = function() {
  updateInfo(statsData[i]);

  tempData = statsData.slice(0,i+1);
  d3.select("#warriors_area").remove();
  d3.select("#cavs_area").remove();
  g.append("path")
     .data([tempData])
     .attr("id","warriors_area")
     .attr("fill",color_by_team("warriors"))
     .attr("opacity","0.2")
     .attr("d", areaWAR);

   g.append("path")
      .data([tempData])
      .attr("id","cavs_area")
      .attr("fill",color_by_team("cavs"))
      .attr("opacity","0.2")
      .attr("d", areaCAV);
};

tick();

window.onscroll = function() {activate()};

if (screen.width <= 480) {
  var offset = 400;
} else {
  var offset = 500;
}

function activate() {

  var sticker = document.getElementById('stick-me');
  var sticker_ph = document.getElementById('stick-ph');
  var window_top = document.body.scrollTop;
  var sticker_stop = document.getElementById('stop-stick-here').getBoundingClientRect().top + window_top-offset;
  var div_top = document.getElementById('stick-here').getBoundingClientRect().top + window_top;

  if ((window_top > div_top) && (window_top < sticker_stop)) {
    sticker.classList.add('fixed-class');
    if (screen.width <= 480) {
      sticker_ph.style.height = "3000px";
    } else {
      sticker_ph.style.height = "2500px";
    }
    sticker_ph.style.display = 'block'; // puts in a placeholder for where sticky used to be for smooth scrolling
  } else {
    sticker.classList.remove('fixed-class');
    sticker_ph.style.display = 'none'; // removes placeholder
  }

  var currentPosition = getPageScroll();
  if (screen.width <= 480) {
    i = Math.floor(currentPosition/2900*10)-1;
  } else {
    i = Math.floor(currentPosition/2400*10);
  }
  console.log(i);
  if (i < 10 && i > -1) {
    tick();
  }
}


// desktop scrolling controls ----------------------------------------------------------------

function getPageScroll() {
  var yScroll;

  if (window.pageYOffset) {
    yScroll = window.pageYOffset;
  } else if (document.documentElement && document.documentElement.scrollTop) {
    yScroll = document.documentElement.scrollTop;
  } else if (document.body) {
    yScroll = document.body.scrollTop;
  }
  return yScroll;
}


// mobile swiping controls --------------------------------------------------------------------

// document.addEventListener('touchstart', handleTouchStart, false);
// document.addEventListener('touchmove', handleTouchMove, false);
//
// var xDown = null;
// var yDown = null;
//
// function handleTouchStart(evt) {
//     xDown = evt.touches[0].clientX;
//     yDown = evt.touches[0].clientY;
// };
//
// function handleTouchMove(evt) {
//     if ( ! xDown || ! yDown ) {
//         return;
//     }
//
//     var xUp = evt.touches[0].clientX;
//     var yUp = evt.touches[0].clientY;
//
//     var xDiff = xDown - xUp;
//     var yDiff = yDown - yUp;
//
//     if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
//         // if ( xDiff > 0 ) {
//         //     /* left swipe */
//         // } else {
//         //     /* right swipe */
//         // }
//     } else {
//         if ( yDiff > 0 ) {
//           // up swipe
//           i = i+1;
//           // filling in slide
//           tick();
//         } else {
//           // down swipe
//           i = i-1;
//           // filling in slide
//           tick();
//         }
//     }
//     /* reset values */
//     xDown = null;
//     yDown = null;
// };
