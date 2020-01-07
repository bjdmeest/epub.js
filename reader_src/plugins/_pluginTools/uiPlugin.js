/**
 * Created by bjdmeest on 23/12/2014.
 */
/* global EPUBJS, $*/
EPUBJS.reader.plugins.uiPlugin = function(book) {
    "use strict";

    var uiSelectorControls = 'div#title-controls';
    var tplMenuButton = '<a id="%label%" title="%label%"> %label%</a>';

    var tplModal = '' +
        '<div class="modal md-effect-1" id="%label%-modal">' +
        '    <div class="md-content">' +
        '       <h3>%label%</h3>' +
        '       <div>' +
        '       </div>' +
        '       <div class="closer icon-cancel-circled"></div>' +
        '    </div>' +
        '</div>';

    var modals = {};

    function addMenuButton(label, options, cb) {
        options = options || {};
        options.icon = options.icon || null;
        $(function() {
            var $button = $(tplMenuButton.replace(/%label%/g, label));
            if (options.icon) {
                $button.addClass('fa fa-' + options.icon);
            }
            $(uiSelectorControls).append($button);
            cb(null, $button[0]);
        });
    }

    function showModal(label) {
        if(!modals[label]) {
            return;
        }
        modals[label].addClass('md-show');
    }

    function hideModal(label) {
        if(!modals[label]) {
            return;
        }
        modals[label].removeClass('md-show');
    }

    function addModal(label, options, cb) {
        options = options || {};
        options.$el = options.$el || null;
        var $modal = $(tplModal.replace(/%label%/g, label));
        $modal.find('div.closer').on('click', function() {
            $modal.removeClass('md-show');
        });
        if(options.$el) {
            $modal.find('div.md-content > h3').next('div').append(options.$el);
        }
        $(function() {
            $('body div.overlay').before($modal);
            modals[label] = $modal;
            cb(null, $modal);
        });
    }

    return {
        addMenuButton: addMenuButton,
        addModal: addModal,
        showModal: showModal,
        hideModal: hideModal
    };

};