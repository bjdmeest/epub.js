/**
 * Created by bjdmeest on 3/12/2014.
 */
/* global EPUBJS, L, $ */
EPUBJS.reader.plugins.GeoPlugin = function(book) {
    "use strict";

    var reader = this;
    if (reader.getVisibleContentPlugin.sub) {
        reader.getVisibleContentPlugin.sub(reader.getVisibleContentPlugin.EVENTS.nodesUpdate, updateGeo);
    }

    var $mapDiv = $('<div id="geoPlugin_map" style="height: 240px; z-index: 9999; width: 400px; position: absolute; bottom: 0; opacity: 0.2"></div>');
    var $placeMarginCss = $('<style>' +
    '[typeof="schema:Place"] {' +
        'border: solid 1px black;' +
        'margin: -1px;' +
    '}</style>');

    $('body').append($mapDiv);
    $mapDiv.hover(function() {
        $mapDiv.css('opacity', '1');
        $(book.renderer.doc.head).append($placeMarginCss);
    }, function() {
        $mapDiv.css('opacity', '0.2');
        $placeMarginCss.detach();
    });

    var index = require('RDFaLocation-module');

    var map = L.map('geoPlugin_map');
    var parts = 5;
    var curr = -parts;

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18
    }).addTo(map);

    var markers = new L.FeatureGroup();

    map.locate({setView: true, maxZoom: 3}).on('locationfound', function(e) {
        var marker = L.marker([e.latitude, e.longitude]).bindPopup('You are here :)');
        var circle = L.circle([e.latitude, e.longitude], e.accuracy / 2, {
            weight: 1,
            color: 'blue',
            fillColor: '#cacaca',
            fillOpacity: 0.2
        });
        map.addLayer(marker);
        map.addLayer(circle);
    });
    map.addLayer(markers);

    function updateGeo(nodes) {
        for(var i = nodes.length-1; i >= 0; i -= 1) {
            if(nodes[i].nodeType !== 1) {
                nodes.splice(i, 1);
            }
        }
        console.warn('updating locs...');
        index.updateLocs(markers, L, nodes);
        console.warn('done!');
    }
};