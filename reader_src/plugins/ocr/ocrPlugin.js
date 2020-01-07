/**
 * Created by bjdmeest on 23/12/2014.
 */
/* global EPUBJS, Webcam, OCRAD, $, fuzzy, rangy */
EPUBJS.reader.plugins.ocrPlugin = function(book) {
    "use strict";

    var reader = this;
    var epubCFI = new EPUBJS.EpubCFI();
    var bookSentences = getContents(book);
    if (!(reader.uiPlugin.addMenuButton && reader.uiPlugin.showModal && reader.uiPlugin.addModal && reader.uiPlugin.hideModal)) {
        console.warn('ocrPlugin: I cannot work in these circumstances!');
        return;
    }

    // Attach UI controls
    var $ctrlButton = null;
    reader.uiPlugin.addMenuButton('OCR', {icon: 'camera'}, function(err, button) {
        if (!err && button) {
            $ctrlButton = $(button);
            $ctrlButton.on('click', function() {
                reader.uiPlugin.showModal('ocr');
            });
        }
    });

    var $el = $('<div></div>');
    var $camdiv = $('<div></div>');
    var $snapBtn = $('<button>Find book location</button>');
    $el.append($snapBtn);
    $el.append($camdiv);

    $snapBtn.on('click', function() {
        var img = snap();
        var canvas = toCanvas(img);
        var sentence = OCRAD(canvas).split('\n')[0];
        var cfi = getBestCfi(sentence);
        console.log(cfi);
        var goingPromise = book.gotoCfi(cfi);
        goingPromise.then(function() {
            var range = epubCFI.generateRangeFromCfi(cfi, book.renderer.doc);
            var $el = $(range.commonAncestorContainer.parentElement);
            var bg = $el.css('background-color');
            $el.css('backgroundColor', 'hsl(0,100%,50%');

            var d = 1000;
            for (var i = 50; i <= 100; i = i + 0.1) {
                d += 10;
                step(i, d);
            }
            reader.uiPlugin.hideModal('ocr');

            function step(ii, dd) {
                setTimeout(function() {
                    $el.css('backgroundColor', 'hsl(0,100%,' + ii + '%)');
                }, dd);
            }
        });
    });

    reader.uiPlugin.addModal('ocr', {
        $el: $el
    }, function(err, modal) {
        if (err) {
            throw err;
        }
        attachCamera($camdiv);
    });

    function attachCamera($div) {
        $div.css('width', '320px');
        $div.css('height', '240px');
        Webcam.set({
            width: 480,
            height: 360,
            dest_width: 960,
            dest_height: 720,
            image_format: 'jpeg',
            jpeg_quality: 100,
            force_flash: false
        });
        Webcam.attach($div[0]);
    }

    function snap() {
        var dataUri = Webcam.snap();
        var $img = $('<img style="max-width=400px;" src="' + dataUri + '"/>');
        return $img[0];
    }

    function toCanvas(image) {
        var canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        canvas.getContext('2d').drawImage(image, 0, 0);
        return canvas;
    }

    function getBestCfi(sentence) {
        var sentences = [];
        for (var i = 0; i < bookSentences.length; i += 1) {
            sentences.push(bookSentences[i].text);
        }
        var results = fuzzy.filter(sentence, sentences).sort(function(a, b) {
            return b.score - a.score;
        });
        console.log('%s || %s', sentence, results[0].string);
        return bookSentences[results[0].index].cfi;
    }

    function getContents(book) {
        var bookSentences = [];
        book.ready.all.then(function() {
            for (var i = 0; i < book.spine.length; i += 1) {
                var ch = new EPUBJS.Chapter(book.spine[i], book.store);
                var promise = EPUBJS.core.request(ch.absolute);
                addContents(book.spine[i].cfiBase, promise);
            }
        });

        return bookSentences;

        function addContents(cfiBase, promise) {
            promise.then(function(contents) {
                var body = '<div id="body-mock">' + contents.replace(/^[\s\S]*<body.*?>|<\/body>[\s\S]*$/g, '') + '</div>';
                var $doc = $(body);

                var sentences = $doc[0].innerText.trim().split(/\n+/g);
                var $curr = $doc;
                var offset = 0;
                var parts = [4];

                for (var i = 0; i < sentences.length; i += 1) {
                    sentences[i] = sentences[i].length > 80 ? sentences[i].slice(0, 80) : sentences[i];
                    var found = false;
                    while (!found) {
                        var currText = $curr.text();
                        var currOffset = currText.indexOf(sentences[i]);
                        if (currOffset === -1) { // sentence not in current -> go to next
                            if (currText !== '' && sentences[i].indexOf(currText) === 0) {
                                push();
                                found = true;
                            }
                            else {
                                var temp = $curr.parent();
                                $curr = $curr.next();
                                parts.push(parts.pop() + 2);
                                while ($curr.length === 0) {
                                    $curr = temp.next();
                                    parts.pop();
                                    parts.push(2);
                                    if (temp.is($doc)) {
                                        throw new Error('too far up the top!');
                                    }
                                    temp = temp.parent();
                                }
                            }
                        }
                        else if (currOffset === 0) {
                            push();
                            found = true;
                        }
                        else {
                            if ($curr.contents().length > 0) {
                                $curr = $curr.contents().first();
                                parts.push(2);
                                var total = $curr.text().length;
                                while (total < currOffset && $curr.next().length > 0) {
                                    $curr = $curr.next();
                                    total += $curr.text().length;
                                    parts.push(parts.pop() + 2);
                                }
                            }
                            push();
                            found = true;
                            $curr = $curr.parent();
                            parts.pop();
                        }
                    }

                }
                function push(offset) {
                    offset = offset || 0;
                    parts.push('1:' + offset);
                    bookSentences.push({
                        text: sentences[i],
                        index: i,
                        cfi: 'epubcfi(' + cfiBase + '!/' + parts.join('/') + ')'
                    });
                    parts.pop();
                }

                function skipEmpty() {
                    while ($curr.length > 0 && $curr.text() === '') {
                        $curr = $curr.next();
                        parts.push(parts.pop() + 2);
                    }
                }
            });
        }
    }
};