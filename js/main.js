var map,
    markercluster,
    markersArray=[],
    infoWindow,
    layer,
    layer_2,
    year = '2010-11';

google.load('visualization', '1', { packages: ['corechart'] });

function initialize() {

    infoWindow = new google.maps.InfoWindow();

    map = new google.maps.Map(document.getElementById('map_canvas'), {
        center: new google.maps.LatLng(38, -97),
        zoom: 5,
        scrollwheel: false,
        streetViewControl: false,
        mapTypeControl: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });

    map.setOptions({
        styles: [
            {
                stylers: [
                    { saturation: -100 }
                ]
            },{
                featureType: "road",
                stylers: [
                    { visibility: "off" }
                ]
            },{
                featureType: "poi",
                stylers: [
                    { visibility: "off" }
                ]
            },{
                featureType: "water",
                elementType: "labels",
                stylers: [
                    { visibility: "off" }
                ]
            }
        ]
    });

    createNationCharts(map,year);

    // Initialize State Level Layer
    layer = new google.maps.FusionTablesLayer({
        query: {
            select: 'geometry',
            from: '1F9sMc6ZkLQ_YqEBtjiIWNyOsMFO8DKjm9FUqho0',
            where: "Year = '" + year + "'"
        },
        suppressInfoWindows:true
    });

    layer.setMap(map);

    // Initialize Empty Second Layer to contain Private Schools later
    layer_2 = new google.maps.FusionTablesLayer({

    });

    layer_2.setMap(map);

    createLegend(map, 'State Ranking of Student Debt');

    // Initialize Markers
    setMarkerData('public');
    setMarkerData('private');

    google.maps.event.addListener(layer, 'click', function(e) {
            var json = e.row;

            var stateDebtAvg = json['Average debt of graduates'].value;
            stateDebtAvg = (stateDebtAvg !== 'N/A') ? '$' + stateDebtAvg : stateDebtAvg;

            var stateDebtPer = json['Percent of graduates with debt'].value ;
            stateDebtPer = (stateDebtPer !== 'N/A') ? (stateDebtPer* 100).toPrecision(2) + '%' : stateDebtPer;

            var stateYear = json['Year'].value;
            var stateTui = '$' + json['Tuition and fees (in-district/in-state)'].value;
            var stateName = json.name.value;

            $('#stName').text(stateName);
            $('#stAvg').text(stateDebtAvg);
            $('#stPer').text(stateDebtPer);
            $('#stTui').text(stateTui);
            $('#stYear').text(stateYear);

            var stateDetails = $('#stateInformation');
            if (stateDetails.is(":hidden")) {
                stateDetails.slideDown("slow");
            }

            //drawVisualization(state);
    });

    // Setup markers
    var count = 0;

    // Check if User has changed the zoom level
    google.maps.event.addListener(map, 'zoom_changed', function(){

        var statezoom = 6;
        var zoomLevel = map.getZoom();
        var stateDetails = $('#stateInformation');

        // When zoom is finer than 6 get institutions
        if (zoomLevel >= statezoom) {

            // Add Public Institutions to layer
            update_layer('rmstate');

            // If zoom is as fine as 6 for the first time create new Marker Cluster
            if (count < 1) {
                //setMarkerData('public');
                //setMarkerData('private');
                var mcOptions = {gridSize: 40, maxZoom: 13};
                markercluster = new MarkerClusterer(map,markersArray,mcOptions);
                count++;
            }else { // Refresh the cluster
                //showMarkers();
                //console.log("Array has: " + markersArray.length);
                markercluster.resetViewport();
            }

            // Add Private Institutions  to layer 2
            //update_layer('private');
            updateLegend();
            stateDetails.slideUp();

        } else {
            // Reset Zoom count
            count = 0;

            //clearMarkers();

            // Clear Marker Clusters
            markercluster.clearMarkers();

            // Re-Display State Layer AND Remove Public Institution Layer
            update_layer('state');

            // Removes Private Institutions layer
            //update_layer(null);
            updateLegend('State Ranking of Student Debt');
            
        }
    });
}


// Returns a Map Layer Based on the Type[public / private / state] and Year
function update_layer(type){

    switch (type){
        case 'public': {
            layer.setOptions({
                query: {
                    select: 'longitude',
                    from: '1RMj6bytivb9T1EvGcGWHrPw8rWv8Ze3UVdIOZUE',
                    where: "Year = '" + year + "'"
                }

            });
            break;
        }
        case 'private': {
            layer_2.setOptions({
                query: {
                    select: 'longitude',
                    from: '16k0RPYOl7XRRaXOEL710C1HDXW3q6cfSk01gInY',
                    where: "Year = '" + year + "'"
                }

            });
            break;
        }
        case 'state' : {
            layer.setOptions({
                query: {
                    select: 'geometry',
                    from: '1F9sMc6ZkLQ_YqEBtjiIWNyOsMFO8DKjm9FUqho0',
                    where: "Year = '" + year + "'"
                },
                suppressInfoWindows: true
            });
            break;
        }
        case 'rmstate' : {
            layer.setOptions({
                query: null
            });
            break;
        }
        default: {
            layer_2.setOptions({
                query: null

            });
            break;
        }
    }

} // End update_layer

google.maps.event.addDomListener(window, 'load', initialize);


$(function() {
    var sliderLabels = $('#sliderLabels');
    var timearr = new Array("2003-04","2004-05","2005-06","2006-07","2007-08","2008-09","2009-10","2010-11");

    $("#slider").slider({
        value:7,
        min: 0,
        max: 7,
        step: 1,
        slide: function( event, ui ) {
            year = timearr[ui.value];
            sliderLabels.find('li.active').removeClass('active');
            sliderLabels.find('li#'+year).addClass('active');
            createNationCharts(map,year);

            //clear and display the new year's layer
            update_layer('state');

            if(map.getZoom() >= 6) {
                deleteMarkers();
                setMarkerData('public');
                setMarkerData('private');
            }


        }
    });
});

/**
 * Stores the styles for all the states
 * @type {Object}
 */
var LAYER_STYLES = {
    'State Ranking of Student Debt': {
        'min': 0,
        'max': 50,
        'colors': [
            '#045a8d',
            '#2b8cbe',
            '#a6bddb',
            '#a6bddb',
            '#d0d1e6'
        ]
    }
};

function createNationCharts(map, year){

    if (document.getElementById('nationCharts')) {
        var oldCharts = document.getElementById('nationCharts');
        oldCharts.parentNode.removeChild(oldCharts);
    }
    var nationCharts = document.createElement('div');
    nationCharts.id = 'nationCharts';
    nationCharts.index = 1;

    var nation_debt_avg = document.createElement('div');
    nation_debt_avg.id = 'nation_debt_avg';

    var nation_debt_percent = document.createElement('div');
    nation_debt_percent.id = 'nation_debt_percent';

    nationCharts.appendChild(nation_debt_avg);
    nationCharts.appendChild(nation_debt_percent);

    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(nationCharts);
    //drawNationVisualization(year);
}

/**
 *
 * @param map
 * @param sector
 */
function createLegend(map, sector) {
    var legendWrapper = document.createElement('div');
    legendWrapper.id = 'legendWrapper';
    legendWrapper.index = 1;
    map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(legendWrapper);
    legendStateContent(legendWrapper, sector);
}

function legendStateContent(legendWrapper, sector) {
    var legend = document.createElement('div');
    legend.id = 'legend';

    var title = document.createElement('p');
    title.innerHTML = sector;
    legend.appendChild(title);

    var layerStyle = LAYER_STYLES[sector];
    var colors = layerStyle.colors;
    var minNum = layerStyle.min;
    var maxNum = layerStyle.max;
    var step = (maxNum - minNum) / colors.length;

    for (var i = 0; i < colors.length; i++) {
        var legendItem = document.createElement('div');

        var color = document.createElement('div');
        color.setAttribute('class', 'color');
        color.style.backgroundColor = colors[i];
        legendItem.appendChild(color);

        var newMin = minNum + step * i;
        var newMax = newMin + step;
        var minMax = document.createElement('span');
        minMax.innerHTML = newMin + ' - ' + newMax;
        legendItem.appendChild(minMax);

        legend.appendChild(legendItem);
    }

    legendWrapper.appendChild(legend);
}

function updateLegend(sector) {
    var legendWrapper = document.getElementById('legendWrapper');
    var legend = document.getElementById('legend');
    legendWrapper.removeChild(legend);

    if (sector) {
        legendStateContent(legendWrapper, sector);
    }
}

/**
 * Generates the bar charts for the selected state
 * @param state
 */
function drawVisualization(state) {
    google.visualization.drawChart({
        containerId: "debt_percent",
        dataSourceUrl: "http://www.google.com/fusiontables/gvizdata?tq=",
        query: "SELECT '2003-04','2004-05','2005-06','2006-07','2007-08','2008-09','2009-10','2010-11' " +
            "FROM 1eppwUeL-UhwEQSmjparfT13a_G0yZZirYBw-F80 WHERE ST = '" + state + "'",
        chartType: "BarChart",
        options: {
            title: 'Percent of students that graduate with debt - ' + state,
            vAxis: {
                title: 'Year'
            },
            hAxis: {
                title: 'Percentage'
            }
        }
    });
}

function drawNationVisualization(year) {
    google.visualization.drawChart({
        containerId: "nation_debt_avg",
        dataSourceUrl: "http://www.google.com/fusiontables/gvizdata?tq=",
        query: "SELECT Type,'Average debt of graduates' " +
            "FROM 1UX8wPKCTz4bvqgsbPi3zalm28UxMLmL183nONoo WHERE Year = '" + year + "'",
        chartType: "ColumnChart",
        options: {
            title: 'Nation - Average debt of graduates ' + year,
            height: 200,
            width: 200,
            legend: {
                position: 'none'
            },
            vAxis: {
                format:'$#'
            }
        }
    });

    google.visualization.drawChart({
        containerId: "nation_debt_percent",
        dataSourceUrl: "http://www.google.com/fusiontables/gvizdata?tq=",
        query: "SELECT Type,'Percent of graduates with debt' " +
            "FROM 1UX8wPKCTz4bvqgsbPi3zalm28UxMLmL183nONoo WHERE Year = '" + year + "'",
        chartType: "ColumnChart",
        options: {
            title: 'Nation - Proportion of graduating seniors with debt ' + year,
            height: 200,
            width: 200,
            legend: {
                position: 'none'
            },
            vAxis: {
                format:'#%'
            }
        }
    });

}

/*
 *    Gets data from fusion table and creates an array of markers
 *    @param type - They type of data to query for.
 */
function setMarkerData(type){

    var tableId = (type == 'public') ? "17hyJhTdWctFwnS6wZBZAcFostEd3KPMmBVl9IV8" : "1dQB9NiJJgew8kJb7zMTOMgyL8cOHW2sOI2x6nCc";

    var query = "SELECT Name,Year,'Percent of graduates with debt','Average debt of graduates','12-month enrollment - Total (IPEDS)'," +
        "longitude,latitude,url FROM " + tableId + " WHERE Year ='" + year + "'";

    query = encodeURIComponent(query);
    var gvizQuery = new google.visualization.Query(
        'http://www.google.com/fusiontables/gvizdata?tq=' + query);

    var createMarker = function(coordinate, name, p_year, percent, avg, enrollment, url) {
        var marker = new google.maps.Marker({
            //map: map,
            position: coordinate,
            icon: new google.maps.MarkerImage(url)
        });

        var placemarkInfo = name + '<br>' + p_year.getFullYear() + '<br>Average Debt: $' + avg + '<br>Graduate % with Debt: ' +
            (percent *100) + '%<br>Total Enrollment: ' + enrollment;

        google.maps.event.addListener(marker, 'click', function(event) {
            infoWindow.setPosition(coordinate);
            infoWindow.setContent(placemarkInfo);
            infoWindow.open(map);
        });

        markersArray.push(marker);
    };


    gvizQuery.send(function(response) {
        var numRows = response.getDataTable().getNumberOfRows();

        // For each row in the table, create a marker
        for (var i = 0; i < numRows; i++) {
            var name = response.getDataTable().getValue(i,0);
            var curr_year = response.getDataTable().getValue(i,1);
            var perc = response.getDataTable().getValue(i,2);
            var avg_debt = response.getDataTable().getValue(i,3);
            var enroll = response.getDataTable().getValue(i,4);
            var lng = response.getDataTable().getValue(i,5);
            var lat = response.getDataTable().getValue(i,6);
            var url = response.getDataTable().getValue(i,7);

            var coordinate = new google.maps.LatLng(lat, lng);

            createMarker(coordinate, name, curr_year, perc, avg_debt, enroll, url);
        }

    });
}

/*
 *    Hides Markers from map
 */
function clearMarkers() {
    if (markersArray) {
        for(ndx in markersArray){
            markersArray[ndx].setMap(null);
        }
    }
}

/*
 *    Show markers on the map in Marker Array if it exists
 */
function showMarkers() {
    if (markersArray) {
        for (i in markersArray) {
            markersArray[i].setMap(map);
        }
    }
}

/*
*    Clears Markers from map and Empty the Marker Array
*/
function deleteMarkers() {
    if (markersArray) {
        for (i in markersArray) {
            markersArray[i].setMap(null);
        }
        markersArray.length = 0;
    }
}
