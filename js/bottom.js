(function() {
    var saveDialog = document.getElementById("savedialog");
    saveDialog.style.display = "block";
}());

var SIM = window.createSimpleImageManipulator();

var SIMoptions = {"editor": "editorarea", "imageID": "real_image", "canvasID": "canvaseditor",
    "canvasDiv": "canvaseditor_div", "borderConfig": {
        "width": 2,
        "height": 2,
        "left": {
            "width": 4,
            "color": "red"
        },
        "right": {
            "width": 4,
            "color": "green"
        },
        "top": {
            "width": 4,
            "color": "blue"
        },
        "bottom": {
            "width": 4,
            "color": "yellow"
        }
    }, "lineConfig": {
        "width": 8,
        "height": 8
    }};

(function(simObj, options) {
    var nameID = "filename", elem, binder, markNotSupported, savePNG_ID = "saveimage_png",
        saveJPG_ID = "saveimage_jpg", saveBMP_ID = "saveimage_bmp";

    if (typeof (simObj) === 'object') {
        var onload, onresize,
            oldOnLoad = (typeof (window.onload) === 'function') ? window.onload : function() {
        };
        onload = function() {
            if (typeof (simObj.onLoad) === 'function') {
                simObj.onLoad();
            }
        };
        window.onload = function() {
            var args = arguments;
            oldOnLoad.call(null, args);
            onload();
            try {
                simObj.init(options);
            } catch (e) {
            }
        };
    }
    elem = document.getElementById("open_info");
    if (elem) {
        addEvent(elem, "click", function() {
            var infoElem = document.getElementById("info_content");
            if (infoElem) {
                infoElem.style.display = "block";
            }
        });
    }
    elem = document.getElementById("close_info");
    if (elem) {
        addEvent(elem, "click", function() {
            var infoElem = document.getElementById("info_content");
            if (infoElem) {
                infoElem.style.display = "none";
            }
        });
    }

    binder = function(id, mimeType, ext, namefieldID) {
        var elem = document.getElementById(id);
        if (elem) {
            var createFunc = function(id, mimeType, ext, namefieldID) {
                //console.log("Saver!" + mimeType);
                return function(e) {
                    var r, activatorElem, nameElement, name;
                    console.log(mimeType);
                    r = simObj.saveClippedArea(mimeType);
                    //console.log("LALA: " + r + namefieldID);
                    activatorElem = document.getElementById(id);
                    if (r && activatorElem) {
                        nameElement = document.getElementById(namefieldID);
                        name = nameElement ? nameElement.value : "snippet";
                        activatorElem.download = name + "." + ext;
                        activatorElem.href = r.src;
                    }
                };
            };
            addEvent(elem, "click", createFunc(id, mimeType, ext, namefieldID));
        }
    };
    markNotSupported = function(id) {
        var elem = document.getElementById(id);
        if (elem) {
            //console.log("Mark: " + id);
            elem.style.textDecoration = "line-through";
        }
    };
    if (simObj.supportsMimeType("image/png")) {
        binder(savePNG_ID, "image/png", "png", nameID);
    } else {
        markNotSupported(savePNG_ID);
    }
    if (simObj.supportsMimeType("image/jpeg")) {
        binder(saveJPG_ID, "image/jpeg", "jpg", nameID);
    } else {
        markNotSupported(saveJPG_ID);
    }
    if (simObj.supportsMimeType("image/bmp")) {
        binder(saveBMP_ID, "image/bmp", "bmp", nameID);
    } else {
        markNotSupported(saveBMP_ID);
    }

    simObj.init(options);

    var createUpdater = function() {
        return function(info) {
            var key, elem, infoMap = {
                "imageWidth": "orig_image_width",
                "imageHeight": "orig_image_height",
                "clipImageX": "clip_image_x",
                "clipImageY": "clip_image_y",
                "clipImageWidth": "clip_image_width",
                "clipImageHeight": "clip_image_height",
                "realClipImageX": "real_clip_image_x",
                "realClipImageY": "real_clip_image_y",
                "realClipImageWidth": "real_clip_image_width",
                "realClipImageHeight": "real_clip_image_height"
            };
            if (typeof (info) === 'object') {
                for (key in infoMap) {
                    if (info[key]) {
                        elem = document.getElementById(infoMap[key]);
                        if (elem) {
                            if (typeof (info[key]) === 'number') {
                                elem.innerHTML = Math.round(info[key]);
                            } else {
                                elem.innerHTML = "?";
                            }
                        }
                    }
                }
            }
        };
    };

    (function(updater) {
        simObj.addListener(function(e) {
            var infoUpdater, img, src;
            //, imgElem = document.getElementById("watcher");
            infoUpdater = updater;
            //console.log("Listener");
            if (e && e.eventSource) {
                src = e.eventSource;
                if (src && infoUpdater) {
                    infoUpdater(src.getInfo());
                }
            }
        });
        if (updater) {
            updater(simObj);
        }
    }(createUpdater()));


}(SIM, SIMoptions));

window.onresize("add", function(w, h) {
    SIM.onResize(w, h);
});