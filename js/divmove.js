(function() {
    console.log("Div move");
    var elem2 = document.getElementById("savedialog");
    function toPixel(value, name) {
        if (typeof (value) === "string") {
            if (value.indexOf("px") > 0) {
                value = value.substring(0, value.indexOf("px"));
            } else if (value.indexOf("%") > 0) {
                value = value.substring(0, value.indexOf("%"));
                value = new Number(value);
                value = value * document.body[name] / 100;
            }
            return new Number(value);
        }
        return value;
    }
    if (elem2) {
        //var mouseDown = false;
        var elem = document.getElementById("save_dialog_title");
        addEvent(elem, "mousedown", function(e) {
            var p = document.getElementById("savedialog");
            if (e) {
                mouseDown = true;
                p.data = {startX: 0, startY: 0, mousedown: true};
                var left = toPixel(p.left, "offsetWidth");
                var top = toPixel(p.top, "offsetHeight");
                p.style.left = left + "px";
                p.style.top = top + "px";
                console.log(p.style);
                p.data.startX = e.clientX - left;
                p.data.startY = e.clientY - top;
                //p.data.startY = e.clientY - p.offsetTop;
                console.log(e);
                console.log(p.data);
            }
        });
        addEvent(elem, "mouseup", function() {
            var p = document.getElementById("savedialog");
            p.data.mousedown = false;
            mouseDown = false;
        });
        addEvent(elem, "click", function() {
            if (this.clicked) {
                this.clicked += 1;
            } else {
                this.clicked = 1;
            }
        });
        addEvent(elem, "mousemove", function(e) {
            var p = document.getElementById("savedialog");
            if (p.data && p.data.mousedown && mouseDown) {
                if (e) {
                    //console.log(e);
                    p.style.left = e.clientX + p.data.startX + "px";
                    p.style.top = e.clientY + p.data.startY + "px";
                }
            }
        });

    }


}());

