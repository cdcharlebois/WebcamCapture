define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",

    "mxui/dom",
    "dojo/dom",
    "dojo/dom-prop",
    "dojo/dom-geometry",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/text",
    "dojo/html",
    "dojo/_base/event",


], function(declare, _WidgetBase, dom, dojoDom, dojoProp, dojoGeometry, dojoClass, dojoStyle, dojoConstruct, dojoArray, lang, dojoText, dojoHtml, dojoEvent) {
    "use strict";

    return declare("WebcamCapture.widget.WebcamCapture", [_WidgetBase], {


        // Internal variables.
        _handles: null,
        _contextObj: null,

        constructor: function() {
            this._handles = [];
        },

        postCreate: function() {
            logger.debug(this.id + ".postCreate");
            this.domNode.className = "webcam-capture";
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                // we have the necessary APIs, so add the nodes that we need.
                this.canvasEl = document.createElement("canvas");
                this.canvasEl.id = "canvas";
                this.canvasEl.width = "640";
                this.canvasEl.height = "480";

                this.videoEl = document.createElement("video");
                this.videoEl.id = "video";
                this.videoEl.width = "640";
                this.videoEl.height = "480";
                this.videoEl.autoplay = "true";

                this.buttonEl = document.createElement("button");
                this.buttonEl.id = "snap";
                this.buttonEl.innerHTML = "Capture";

                this.domNode.appendChild(this.videoEl);
                this.domNode.appendChild(this.buttonEl);
                this.domNode.appendChild(this.canvasEl);


            } else {
                console.error("Not supported");
            }
        },

        update: function(obj, callback) {
            this._contextObj = obj;
            this._updateRendering(callback);
            // Grab elements, create settings, etc.
            var video = this.videoEl;
            var errBack = lang.hitch(this, function() {

            });

            // Get access to the camera!
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                // Not adding `{ audio: true }` since we only want video now
                navigator.mediaDevices.getUserMedia({ video: true }).then(lang.hitch(this, function(stream) {
                    video.src = window.URL.createObjectURL(stream);
                    video.play();
                    if (!this.eventsSet) {
                        this._setupEvents();
                    }
                }));
            } else if (navigator.getUserMedia) { // Standard
                navigator.getUserMedia({ video: true }, function(stream) {
                    video.src = stream;
                    video.play();
                    if (!this.eventsSet) {
                        this._setupEvents();
                    }
                }, errBack);
            } else if (navigator.webkitGetUserMedia) { // WebKit-prefixed
                navigator.webkitGetUserMedia({ video: true }, function(stream) {
                    video.src = window.webkitURL.createObjectURL(stream);
                    video.play();
                    if (!this.eventsSet) {
                        this._setupEvents();
                    }
                }, errBack);
            } else if (navigator.mozGetUserMedia) { // Mozilla-prefixed
                navigator.mozGetUserMedia({ video: true }, function(stream) {
                    video.src = window.URL.createObjectURL(stream);
                    video.play();
                    if (!this.eventsSet) {
                        this._setupEvents();
                    }
                }, errBack);
            }


        },

        _setupEvents: function() {
            // Elements for taking the snapshot
            var canvas = this.canvasEl;
            var context = canvas.getContext('2d');
            var video = this.videoEl;
            if (this.handler) return;
            // Trigger photo take
            this.buttonEl.addEventListener("click", lang.hitch(this, function() {
                context.drawImage(video, 0, 0, 640, 480);
                // should grab this image and then do something with it.
                canvas.toBlob(lang.hitch(this, function(blob) {
                    var fname = "img_" + new Date().toISOString().replace(/\W/g, "") + ".jpg";
                    window.mx.data.saveDocument(
                        this._contextObj.getGuid(), fname, {
                            width: 640,
                            height: 480
                        },
                        blob,
                        lang.hitch(this, function() {
                            console.log("ok");
                            this.mxform.reload();

                        }),
                        function(err) {
                            console.error("error");
                        });
                }));
            }));
            this.eventsSet = true;
        },

        _updateRendering: function(callback) {
            logger.debug(this.id + "._updateRendering");

            if (this._contextObj !== null) {
                dojoStyle.set(this.domNode, "display", "block");
            } else {
                dojoStyle.set(this.domNode, "display", "none");
            }

            this._executeCallback(callback);
        },

        _executeCallback: function(cb) {
            if (cb && typeof cb === "function") {
                cb();
            }
        }
    });
});

require(["WebcamCapture/widget/WebcamCapture"]);