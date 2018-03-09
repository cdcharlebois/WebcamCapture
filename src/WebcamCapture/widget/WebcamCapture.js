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

        width: null,
        wunit: null,
        onUploaded: null,
        buttonText: null,
        imageEntity: null,
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
                this.videoEl.setAttribute("width", this.width + (this.wunit === "percent" ? "%" : "px"));
                this.videoEl.autoplay = "true";

                this.buttonEl = document.createElement("button");
                this.buttonEl.id = "snap";
                this.buttonEl.innerHTML = this.buttonText;
                this.buttonEl.className = "mx-button " + this.buttonClass;

                this.domNode.appendChild(this.videoEl);
                this.domNode.appendChild(this.buttonEl);
                this.domNode.appendChild(this.canvasEl);

            } else {
                console.error("Not supported");
            }
        },

        update: function(obj, callback) {
            this._contextObj = obj;
            // Grab elements, create settings, etc.
            var video = this.videoEl;
            var errBack = lang.hitch(this, function() {

            });

            // Get access to the camera!
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                // Not adding `{ audio: true }` since we only want video now
                navigator.mediaDevices.getUserMedia({ video: true }).then(lang.hitch(this, function(stream) {
                    video.src = window.URL.createObjectURL(stream);
                    setTimeout(function() {
                        video.play();
                    }, 500);
                    // video.play();
                    if (!this.eventsSet) {
                        this._setupEvents();
                    }
                }));
            } else if (navigator.getUserMedia) { // Standard
                navigator.getUserMedia({ video: true }, function(stream) {
                    video.src = stream;
                    setTimeout(function() {
                        video.play();
                    }, 500);
                    if (!this.eventsSet) {
                        this._setupEvents();
                    }
                }, errBack);
            } else if (navigator.webkitGetUserMedia) { // WebKit-prefixed
                navigator.webkitGetUserMedia({ video: true }, function(stream) {
                    video.src = window.webkitURL.createObjectURL(stream);
                    setTimeout(function() {
                        video.play();
                    }, 500);
                    if (!this.eventsSet) {
                        this._setupEvents();
                    }
                }, errBack);
            } else if (navigator.mozGetUserMedia) { // Mozilla-prefixed
                navigator.mozGetUserMedia({ video: true }, function(stream) {
                    video.src = window.URL.createObjectURL(stream);
                    setTimeout(function() {
                        video.play();
                    }, 500);
                    if (!this.eventsSet) {
                        this._setupEvents();
                    }
                }, errBack);
            }
            this._executeCallback(callback);

        },

        _setupEvents: function() {
            // Elements for taking the snapshot
            var canvas = this.canvasEl;
            var context = canvas.getContext('2d');
            var video = this.videoEl;
            if (this.handler) return;
            // var self = this;
            // Trigger photo take
            this.buttonEl.addEventListener("click", lang.hitch(this, function() {
                context.drawImage(video, 0, 0, 640, 480);
                // should grab this image and then do something with it.
                this._getImageObjectGuid()
                    .then(lang.hitch(this, function(guid) {
                        canvas.toBlob(lang.hitch(this, function(blob) {
                            var fname = "img_" + new Date().toISOString().replace(/\W/g, "") + ".jpg";
                            window.mx.data.saveDocument(
                                guid, fname, {
                                    width: 640,
                                    height: 480
                                },
                                blob,
                                lang.hitch(this, function() {
                                    console.log("ok");
                                    // this.mxform.reload(); // fine for pages for the context is parameter
                                    if (this.onUploaded) {
                                        this._executeMicroflow(this.onUploaded, guid);
                                    }
                                }),
                                function(err) {
                                    console.error("error");
                                });
                        }));
                    }));

            }));
            this.eventsSet = true;
        },

        _executeMicroflow: function(mfname, guid) {
            mx.data.action({
                params: {
                    applyto: "selection",
                    actionname: mfname,
                    guids: [guid],
                },
                callback: function(obj) {
                    console.log("mf ok")
                },
                error: function(error) {
                    alert(error.description);
                }
            }, this);
        },

        _executeCallback: function(cb) {
            if (cb && typeof cb === "function") {
                cb();
            }
        },

        /**
         * GetImageObejctGuid
         * ---
         * Returns the image object (either from context or creates one)
         *  
         * @author Conner Charlebois
         * @since Mar 9, 2018
         */
        _getImageObjectGuid: function() {
            return new Promise(lang.hitch(this, function(resolve, reject) {
                if (this._contextObj) {
                    resolve(this._contextObj.getGuid());
                } else if (this.imageEntity) {
                    // create a new object of this entity
                    mx.data.create({
                        entity: this.imageEntity,
                        callback: lang.hitch(this, function(obj) {
                            console.log("The object has been created");
                            resolve(obj.getGuid());
                        }),
                        error: function(e) {
                            reject("there was an error creating this object");
                        },
                    });
                } else {
                    reject("There is no context and the image entity is not specified. Please correct your widget configuration");
                }
            }));
        },
    });
});

require(["WebcamCapture/widget/WebcamCapture"]);