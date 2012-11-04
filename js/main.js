var map,
    layer,
    layer_2,
    year = '2010-11';

google.load('visualization', '1', { packages: ['corechart'] });

function initialize() {

    map = new google.maps.Map(document.getElementById('map_canvas'), {
        center   :new google.maps.LatLng(40.4230, -98.7372),
        zoom     :4,
        mapTypeId:google.maps.MapTypeId.ROADMAP
    });

    // Initialize State Level Layer
    layer = new google.maps.FusionTablesLayer({
        query: {
            select: 'geometry',
            from: '1b-RZu6Cu4xDud8JEKCNEyzPXnnQ0suTk2KGs_Mk'
        }
    });
    layer.setMap(map);

    // Initialize Empty Second Layer to contain Private Schools later
    layer_2 = new google.maps.FusionTablesLayer({

    });

    layer_2.setMap(map);

    createLegend(map, 'State Ranking of Student Debt');

    google.maps.event.addListener(layer, 'click', function(e) {
        var state = e.row.id.value;
        drawVisualization(state);
    });

    // Check if User has changed the zoom level
    google.maps.event.addListener(map, 'zoom_changed', function(){

        var statezoom = 6;
        var zoomLevel = map.getZoom();

        // When zoom is finer than 6 get institutions
        if (zoomLevel >= statezoom) {

            // Add Public Institutions to layer
            update_layer('public');

            // Add Private Institutions  to layer 2
            update_layer('private');

            updateLegend();


        } else if (zoomLevel < statezoom){

            // Re-Display State Layer AND Remove Public Institution Layer
            update_layer('state');

            // Removes Private Institutions layer
            update_layer(null);
            
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
                    where: "Year = " + year
                }

            });
            break;
        }
        case 'private': {
            layer_2.setOptions({
                query: {
                    select: 'longitude',
                    from: '16k0RPYOl7XRRaXOEL710C1HDXW3q6cfSk01gInY',
                    where: "Year = " + year
                }

            });
            break;
        }
        case 'state' : {
            layer.setOptions({
                query: {
                    select: 'geometry',
                    from: '1b-RZu6Cu4xDud8JEKCNEyzPXnnQ0suTk2KGs_Mk'
                }
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
    var timearr = new Array("2003-04","2004-05","2005-06","2006-07","2007-08","2008-09","2009-10","2010-11");
    $( "#slider" ).slider({
        value:7,
        min: 0,
        max: 7,
        step: 1,
        slide: function( event, ui ) {
            $( "#current_year" ).val( timearr[ui.value] );
        }
    });
    $( "#current_year" ).val( " " );
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
