function initialize() {

    var unitedstates = new google.maps.LatLng(40.4230, -98.7372);

    var map = new google.maps.Map(document.getElementById('map_canvas'), {
        center   :unitedstates,
        zoom     :4,
        mapTypeId:google.maps.MapTypeId.ROADMAP
    });

    var layer = new google.maps.FusionTablesLayer({
        query: {
            select: 'geometry',
            from: '1b-RZu6Cu4xDud8JEKCNEyzPXnnQ0suTk2KGs_Mk'
        }
    });

    layer.setMap(map);

    google.maps.event.addListener(map, 'zoom_changed', function(){

        var statezoom = 6;
        var zoomLevel = map.getZoom();

        // When zoom is finer than 6 get institutions
        if (zoomLevel >= statezoom) {
            layer.setMap(null);
            layer = new google.maps.FusionTablesLayer({
                query: {
                    select: 'Longitude location of institution(HD2011)',
                    from: '1Y0LFXEJRk0r0NIqZYEu66_0AHDelx0wClEJLW5w'
                }
            });


            layer.setMap(map);
        } else {

            layer.setMap(null);
            layer = new google.maps.FusionTablesLayer({
                query: {
                    select: 'geometry',
                    from: '1b-RZu6Cu4xDud8JEKCNEyzPXnnQ0suTk2KGs_Mk'
                }
            });

            layer.setMap(map);
        }
    });
}

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