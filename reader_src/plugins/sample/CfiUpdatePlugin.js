/* global EPUBJS */
/**
 * Created by bjdmeest on 3/12/2014.
 */
EPUBJS.reader.plugins.SamplePlugin = function(book) {
    "use strict";

    var reader = this;

    reader.book.on("renderer:locationChanged", function() {
        var currentPosition = reader.currentLocationCfi;
        alert('CIF: ' + currentPosition);
    });
};