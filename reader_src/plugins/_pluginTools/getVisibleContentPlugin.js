/**
 * Created by bjdmeest on 3/12/2014.
 */
/* global EPUBJS */
EPUBJS.reader.plugins.getVisibleContentPlugin = function(book) {
    "use strict";
    var subs = {};
    var EVENTS = {
        rangeUpdate: 'rangeUpdate',
        textUpdate: 'textUpdate',
        nodesUpdate: 'nodesUpdate'
    };
    for (var key in EVENTS) {
        if (EVENTS.hasOwnProperty(key)) {
            subs[key] = [];
        }
    }
    var sub = function(label, cb) {
        if (!EVENTS.hasOwnProperty(label)) {
            throw new Error(label + 'is not a supported event by getRangePlugin!');
        }
        subs[label].push(cb);
    };

    function trigger(label, val) {
        for (var i = 0; i < subs[label].length; i += 1) {
            subs[label][i](val);
        }
    }

    var reader = this;

    reader.book.on("renderer:locationChanged", function() {
        getRange(reader, function(err, range) {
            if (err) {
                throw err;
            }
            trigger(EVENTS.rangeUpdate, range);
            trigger(EVENTS.textUpdate, range.toString());
            trigger(EVENTS.nodesUpdate, getNodesInRange(range));
        });
    });

    function getNodesInRange(range) {
        var start = range.startContainer.parentElement;
        var end = range.endContainer;
        var commonAncestor = range.commonAncestorContainer;
        var nodes = [];
        var node = start;

        // Get the obvious out of the way
        if (start === end) {
            return finalize([start]);
        }
        if (end.contains(start)) {
            return finalize([end]);
        }
        if (start.contains(end)) {
            return finalize([start]);
        }

        nodes.push(node);
        // to the right and up
        var up = true;
        while (up) {
            while (node.nextSibling && !node.nextSibling.contains(end) && node.nextSibling !== end) {
                node = node.nextSibling;
                nodes.push(node);
            }
            while (!node.nextSibling) {
                node = node.parentNode;
            }
            if (node.nextSibling.contains(end) || node.nextSibling === end) {
                up = false;
            }
        }
        if (node === end) {
            return finalize(nodes);
        }

        // to the right and down
        node = node.nextSibling; // node.nextSibling has end!
        if (node === end) {
            nodes.push(end);
            return finalize(nodes);
        }

        var down = true;
        while (down) {
            if (!node.firstChild) {
                nodes.push(end);
                return finalize(nodes);
            }
            if (node.firstChild) {
                node = node.firstChild;
                if (node === end) {
                    break;
                }
                if (node.contains(end)) {
                    continue;
                }
                nodes.push(node);
            }

            while (node.nextSibling && !node.nextSibling.contains(end) && node.nextSibling !== end) {
                node = node.nextSibling;
                nodes.push(node);
            }
            if (node.nextSibling) {
                node = node.nextSibling;
            }
            else {
                throw new Error("don't know what to do when no next sibling...");
            }

            if (node === end) {
                down = false;
            }
        }
        nodes.push(end);

        return finalize(nodes);

        function finalize(nodes) {
            if (nodes.length === 0) {
                return nodes;
            }
            // If parentElement also visible: show that!
            if (nodes[0] === nodes[0].parentNode.firstElementChild) {
                var parent = nodes[0].parentNode;
                var lastChild = parent.lastChild;
                var lastIndex = nodes.indexOf(lastChild);
                if (lastIndex !== -1) {
                    nodes.splice(0, lastIndex, parent);
                }
            }
            while (nodes[0] === nodes[0].parentNode.firstElementChild && nodes[nodes.length - 1] === nodes[nodes.length - 1].parentNode.lastChild && nodes[0].parentNode === nodes[nodes.length - 1].parentNode) {
                nodes = [nodes[0].parentNode];
            }

            return nodes;
        }
    }

    function getRange(reader, cb) {
        var renderer = reader.book.renderer,
            currPage = (renderer.chapterPos - 1),
            endCfi,
            pageNum = 1,
            end = {};

        if (renderer.spreads) {
            pageNum = 2;
            currPage *= 2;
        }

        var startCfi = renderer.pageMap[currPage].start;

        if (renderer.pageMap.length > currPage + pageNum) {
            // I have to do this, because renderer.getVisibleRangeCfi() only returns correct start CFI
            endCfi = renderer.pageMap[currPage + pageNum].start;
            var endrange = EPUBJS.EpubCFI.prototype.generateRangeFromCfi(endCfi, renderer.doc);
            end.container = endrange.startContainer;
            end.offset = endrange.startOffset;
        }
        else {
            end = getEnd(renderer.doc);
        }
        var range = EPUBJS.EpubCFI.prototype.generateRangeFromCfi(startCfi, renderer.doc);
        range.setEnd(end.container, end.offset);
        cb(null, range);
    }

    function getEnd(doc) {
        var lastElement = doc.body.lastChild;
        while (lastElement.hasChildNodes()) {
            lastElement = lastElement.lastChild;
        }
        return {
            container: lastElement,
            offset: lastElement.textContent.length - 1
        };

    }

    return {
        sub: sub,
        EVENTS: EVENTS
    };
};