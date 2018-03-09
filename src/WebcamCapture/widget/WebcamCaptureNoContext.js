define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "dojo/_base/lang",
    "WebcamCapture/widget/WebcamCapture",

], function(declare, _WidgetBase, lang, WC) {

    "use strict";
    return declare("WebcamCapture.widget.WebcamCaptureNoContext", [WC], {});
});

require(["WebcamCapture/widget/WebcamCaptureNoContext"]);