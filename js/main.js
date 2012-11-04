var map,layer, layer_2,
    state_layer,
    public_layer,
    private_layer;
var year = '2010-11';


function initialize() {

    map = new google.maps.Map(document.getElementById('map_canvas'), {
        center   :new google.maps.LatLng(40.4230, -98.7372),
        zoom     :4,
        mapTypeId:google.maps.MapTypeId.ROADMAP
    });

    // Initialize State Level Layer
    //get_layer('state',null);
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

    google.maps.event.addListener(map, 'zoom_changed', function(){

        var statezoom = 6;
        var zoomLevel = map.getZoom();

        // When zoom is finer than 6 get institutions
        if (zoomLevel >= statezoom) {

            // Add Public Institutions to layer
            layer.setOptions({
                query: {
                    select: 'longitude',
                    from: '1RMj6bytivb9T1EvGcGWHrPw8rWv8Ze3UVdIOZUE',
                    where: "Year = " + year
                }
            });

            // Add Private Institutions  to layer 2
            layer_2.setOptions({
                query: {
                    select: 'longitude',
                    from: '16k0RPYOl7XRRaXOEL710C1HDXW3q6cfSk01gInY',
                    where: "Year = " + year
                }
            });


        } else if (zoomLevel < statezoom){

            // Re-Display State Layer AND Remove Public Institution Layer
            layer.setOptions({
                query: {
                    select: 'geometry',
                    from: '1b-RZu6Cu4xDud8JEKCNEyzPXnnQ0suTk2KGs_Mk'
                }
            });

            // Removes Private Institutions layer
            layer_2.setOptions({
                query: null

            });

        }
    });
}


// Returns a Map Layer Based on the Type[public / private] and Year - DEPRECATED!!!..... smh
function get_layer(type,year){
    //var layer = null;

    switch (type){
        case 'public': {
            layer = new google.maps.FusionTablesLayer({
                query: {
                    select: 'longitude',
                    from: '1RMj6bytivb9T1EvGcGWHrPw8rWv8Ze3UVdIOZUE',
                    where: "Year = " + year
                }

            });
            layer.setMap(map);
            break;
        }
        case 'private': {
            layer = new google.maps.FusionTablesLayer({
                query: {
                    select: 'longitude',
                    from: '16k0RPYOl7XRRaXOEL710C1HDXW3q6cfSk01gInY',
                    where: "Year = " + year
                }

            });
            layer.setMap(map);
            break;
        }
        case 'state' : {
            layer = new google.maps.FusionTablesLayer({
                query: {
                    select: 'geometry',
                    from: '1b-RZu6Cu4xDud8JEKCNEyzPXnnQ0suTk2KGs_Mk'
                }
            });
            layer.setMap(map);
            break;
        }


    }

    //return layer;

} // End get_layer

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