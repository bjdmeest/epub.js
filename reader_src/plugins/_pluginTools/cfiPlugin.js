/**
 * Created by bjdmeest on 4/12/2014.
 */
/* global EPUBJS */
EPUBJS.reader.plugins.cfiPlugin = function(book) {
    "use strict";

    var CFISTRING = 'epubcfi(';

    function getRangeCfi(startCfi, stopCfi) {
        startCfi = _stripCfi(startCfi);
        stopCfi = _stripCfi(stopCfi);
        var cfiParts = {
            start: startCfi.split('/'),
            stop: stopCfi.split('/')
        };
        cfiParts.start.splice(0, 1);
        cfiParts.stop.splice(0, 1);
        var common = '';
        var i = 0;
        var minLength = cfiParts.start.length < cfiParts.stop.length ? cfiParts.start.length : cfiParts.stop.length;
        while (i < minLength && cfiParts.start[i] === cfiParts.stop[i]) {
            common += '/' + cfiParts.start[i];
            i += 1;
        }
        var commonCfi = common + ',' + startCfi.slice(common.length) + ',' + stopCfi.slice(common.length);
        return _wrapCfi(commonCfi);
    }

    function getSeperateCfi(rangeCfi) {
        rangeCfi = _stripCfi(rangeCfi);
        var parts = rangeCfi.split(',');
        return {
            start: _wrapCfi(parts[0] + parts[1]),
            end: _wrapCfi(parts[0] + parts[2])
        };
    }

    function _stripCfi(cfiStr) {
        if (cfiStr.indexOf(CFISTRING) === 0 && cfiStr[cfiStr.length - 1] === ")") {
            // Remove intial epubcfi( and ending )
            cfiStr = cfiStr.slice(CFISTRING.length, -1);
        }
        return cfiStr;
    }

    function _wrapCfi(cfiStr) {
        if (cfiStr.indexOf(CFISTRING) !== 0 && cfiStr[cfiStr.length - 1] !== ")") {
            // Remove intial epubcfi( and ending )
            cfiStr = CFISTRING + cfiStr + ')';
        }
        return cfiStr;
    }

    return {
        getRangeCfi: getRangeCfi,
        getSeperateCfi: getSeperateCfi
    };
};