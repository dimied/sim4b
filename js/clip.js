window.createSimpleImageManipulator = (function() {

    var devlog, managedSIMs = [];
    var cvMod;
    function isManaged(obj) {
        var idx = 0;
        if (typeof (obj) === 'object') {
            for (idx = 0; idx < managedSIMs.length; idx += 1) {
                if (managedSIMs[idx] === obj) {
                    return true;
                }
            }
        }
        return false;
    }

    devlog = function(msg) {
        if (console && (typeof (console.log) === "function")) {
            console.log(msg);
        }
    };

    /**
     * Describes a simple point, which can also be rotated around another point in 3D.
     * @param {type} x
     * @param {type} y
     * @returns {_L1.Point}
     */
    function Point(x, y) {
        this.x = x;
        this.y = y;
        this.copy = function() {
            return new Point(this.x, this.y);
        };
        this.rotateAround = function(x, y, angle) {
            var newX = this.x - x, newY = this.y - y, s = Math.sin(angle), c = Math.cos(angle);
            this.x = c * newX + s * newY + x;
            this.y = -s * newX + c * newY + y;
        };

        /**
         * Calculates difference vector. We don't make any difference between vectors and points.
         * @param {type} otherPt the other point needed for calculating difference vector
         * @returns {_L1.Point}
         */
        this.diff = function(otherPt) {
            var diffPt;
            if (otherPt) {
                diffPt = new Point(otherPt.x - this.x, this.y - otherPt.y);
            } else {

            }
            diffPt = new Point(0, 0);
            diffPt.name = "diff";
            return diffPt;
        };

        this.negate = function() {
            this.x = -this.x;
            this.y = -this.y;
        };
    }

    /**
     * Describes a simple circle with a midpoint and radius.
     * @param {type} x
     * @param {type} y
     * @param {type} radius
     * @returns {_L1.Circle}
     */
    function Circle(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.midpoint = function() {
            return new Point(this.x, this.y);
        };
        this.isInRectArea = function(x, y, width, height) {
            var maxDistX, maxDistY;
            if ((this.x > x) && (this.x < x + width) &&
                (this.y > y) && (this.y < y + height)) {
                maxDistX = Math.max(Math.abs(this.x - x), Math.abs(x + width - this.x));
                maxDistY = Math.max(Math.abs(this.y - y), Math.abs(y + height - this.y));
                return (maxDistX < radius) && (maxDistY < radius);
            }
            return false;
        };
        this.isInRect = function(rect) {
            return this.isInRectArea(rect.x, rect.y, rect.width, rect.height);
        };
    }

    /**
     * 
     * @param {type} x the x coordinate of the left top corner of the rect
     * @param {type} y the y coordinate of the left top corner of the rect
     * @param {type} width the width of the rect
     * @param {type} height the height of the rect
     * @returns {_L1.Rect}
     */
    function Rect(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.copy = function() {
            return new Rect(this.x, this.y, this.width, this.height);
        };
        /**
         * Checks whether all internally saved properties are of the right/usable types.
         * @returns {Boolean} true on success (all internally saved properties are the right type).
         */
        this.checkTypes = function() {
            return (typeof (this.x) === 'number' && typeof (this.y) === 'number' &&
                typeof (this.width) === 'number' && typeof (this.height) === 'number');
        };
        /**
         * Ensures that width and height are always positive.
         */
        this.makeConsistent = function() {
            if (this.width < 0) {
                this.x += this.width;
                this.width = -this.width;
            }
            if (this.height < 0) {
                this.x += this.height;
                this.height = -this.height;
            }
        };
        this.getBoundingCircle = function() {
            var midPointX = (this.x + this.width / 2),
                midPointY = (this.y + this.height / 2), halfWidth = this.width / 2.0,
                halfHeight = this.height / 2.0,
                radius = Math.sqrt(halfWidth * halfWidth + halfHeight * halfHeight);
            return new Circle(midPointX, midPointY, radius);
        };

        this.rectWithPadding = function(pad) {
            return new Rect(this.x + pad, this.y + pad, this.width - 2 * pad, this.height - 2 * pad);
        };
        /**
         * Checks whether the point described by the given 2D coordinate values is inside the rect.
         * @param {number} x the x coordinate of the the 2D point to check
         * @param {number} y the y coordinate of the the 2D point to check
         * @returns {Boolean} true if the 2D point is inside the rect. 
         */
        this.contains = function(x, y) {
            if ((typeof (x) === 'number') && (typeof (x) === 'number')) {
                this.makeConsistent();
                return  (x >= this.x) && (x <= this.x + this.width) && (y >= this.y) && (y <= this.y + this.height);
            }
            return false;
        };
        /**
         * Checks whether the 2D coordinates describing a 2D point, 
         * given through (the attributes of) first parameter is inside the rect.
         * @param {object} pt the object, which has x and y attributes.
         * @returns {Boolean} true if the 2D point is inside the rect.
         */
        this.containsPoint = function(pt) {
            return (pt && pt.x && pt.y && this.contains(pt.x, pt.y));
        };
        /**
         * Returns the nearest x coordinate inside the rect for the given one.
         * @param {number} x the x coordinate
         * @returns {number}
         */
        this.nearestInnerX = function(x) {
            return Math.min(Math.max(x, this.x), Math.min(x, this.x + this.width));
        };

        this.scale = function(xScale, yScale) {
            this.x *= xScale;
            this.y *= yScale;
//            this.width *= xScale;
//            this.height *= yScale;
        };
        /**
         * Returns the nearest y coordinate inside the rect for the given one.
         * @param {number} y the y coordinate to test.
         * @returns {number}
         */
        this.nearestInnerY = function(y) {
            return Math.min(Math.max(y, this.y), Math.min(y, this.y + this.height));
        };
        this.leftMidpoint = function() {
            return new Point(this.x, this.y + this.height / 2.0);
        };
        this.rightMidpoint = function() {
            return new Point(this.x + this.width, this.y + this.height / 2.0);
        };
        this.topMidpoint = function() {
            return new Point(this.x + this.width / 2.0, this.y);
        };
        this.bottomMidpoint = function() {
            return new Point(this.x + this.width / 2.0, this.y + this.height);
        };
        this.topLeftCorner = function() {
            return new Point(this.x, this.y);
        };
        this.topRightCorner = function() {
            return new Point(this.x + this.width, this.y);
        };
        this.bottomLeftCorner = function() {
            return new Point(this.x, this.y + this.height);
        };
        this.bottomRightCorner = function() {
            return new Point(this.x + this.width, this.y + this.height);
        };
    }

    /**
     * 
     * @param {type} x the x coordinate of the left top corner of the clipping area
     * @param {type} y the y coordinate of the left top corner of the clipping area
     * @param {type} width the width of the clipping area
     * @param {type} height the height of the clipping area
     * @returns {_L1.ClippingArea}
     */
    function ClippingArea(x, y, width, height) {

//        this.data = (function(x, y, w, h) {
//            var rect = new Rect(x, y, w, h), parentRect;
//            return function() {
//
//            };
//        }(x, y, width, height));
        this.rect = new Rect(x, y, width, height);
        this.keepRatio = true;

        this.x = function() {
            return this.rect.x;
        };
        this.y = function() {
            return this.rect.y;
        };
        this.width = function() {
            return this.rect.width;
        };
        this.height = function() {
            return this.rect.height;
        };

        this.midPoint = function() {
            return new Point(this.x() + this.width() / 2, this.y() + this.height() / 2);
        };

        this.scale = function(xScale, yScale) {
            this.rect.scale(xScale, yScale);
        };

        this.contains = function(x, y) {
            return this.rect.contains(x, y);
        };

        this.containsPoint = function(pt) {
            return this.rect.containsPoint(pt);
        };

        this.getBoundingCircle = function() {
            return this.rect.getBoundingCircle();
        };
        this.setParentRect = function(x, y, width, height) {
            this.parentRect = new Rect(x, y, width, height);
        };
//        this.moveBy = function(pt) {
//            if (pt) {
//                devlog("MoveBy:" + pt.x + " / " + pt.y);
//                if (typeof (pt.x) === 'number') {
//                    this.rect.x += x;
//                }
//                if (typeof (pt.y) === 'number') {
//                    this.rect.y += y;
//                }
//            }
//        };
        this.rectWithPadding = function(padding) {
            return this.rect.rectWithPadding(padding);
        };
        this.moveLeftHandle = function(pt) {
            var x = pt.x, newX = x;//this.rect.x + x;
            if (this.parentRect) {
                newX = this.parentRect.nearestInnerX(newX);
            }
            this.rect.width = newX - this.rect.x;
            this.rect.x = newX;
            this.rect.makeConsistent();
        };
        this.moveRightHandle = function(pt) {
            var x = pt.x, newX = x;//this.rect.x + this.rect.width + x;
            if (this.parentRect) {
                newX = this.parentRect.nearestInnerX(newX);
            }
            this.rect.width = newX - this.rect.x;
            this.rect.makeConsistent();
        };
        this.moveTopHandle = function(pt) {
            var y = pt.y, newY = y; //this.rect.y + y;
            if (this.parentRect) {
                newY = this.parentRect.nearestInnerX(newY);
            }
            this.rect.height = newY - this.rect.y;
            this.rect.y = newY;
            this.rect.makeConsistent();
        };
        this.moveBottomHandle = function(pt) {
            devlog("Bottom:" + pt.y);
            var y = pt.y, newY = y;//this.rect.y + this.rect.height + y;
            if (this.parentRect) {
                newY = this.parentRect.nearestInnerY(newY);
            }

            this.rect.height = newY - this.rect.y;
            this.rect.makeConsistent();
        };

        this.moveLeftHandle = function(pt) {
            var x = pt.x, newX = x;//this.rect.x + x;
            if (this.parentRect) {
                newX = this.parentRect.nearestInnerX(newX);
            }
            this.rect.width = newX - this.rect.x;
            this.rect.x = newX;
            this.rect.makeConsistent();
        };

        this.moveTopLeftHandle = function(pt) {
            var newX = pt.x, newY = pt.y, xScale, yScale, minScale,
                oldX = this.width() + this.x(), oldY = this.y() + this.height(),
                newWidth = oldX - newX, newHeight = oldY - newY;
            if (this.keepRatio) {
                try {
                    xScale = newWidth / this.rect.width;
                    yScale = newHeight / this.rect.height;
                    minScale = Math.min(xScale, yScale);
                    if ((minScale !== 0) && (minScale !== 1.0)) {
                        if (xScale < yScale) {
                            this.rect.width = newWidth;
                            this.rect.height *= minScale;
                        } else {
                            this.rect.height = newHeight;
                            this.rect.width *= minScale;
                        }
                    }
                } catch (e) {
//                    devlog("Exception");
//                    devlog(e);
                }
            } else {
                this.width = newWidth;
                this.height = newHeight;
            }
            this.rect.x = oldX - this.rect.width;
            this.rect.y = oldY - this.rect.height;
            this.rect.makeConsistent();
        };

        this.moveTopRightHandle = function(pt) {
            var newX = pt.x, newY = pt.y, xScale, yScale, minScale,
                oldX = this.width() + this.x(), oldY = this.y() + this.height(),
                newWidth = newX - this.x(), newHeight = oldY - newY,
                oldHeight = this.height(), oldWidth = this.width();
            if (this.keepRatio) {
                try {
                    xScale = newWidth / this.rect.width;
                    yScale = newHeight / this.rect.height;
                    minScale = Math.min(xScale, yScale);
                    if ((minScale !== 0) && (minScale !== 1.0)) {
                        if (xScale < yScale) {
                            this.rect.width = newWidth;
                            this.rect.height *= minScale;
                            this.rect.y = oldY - this.rect.height;
                            this.rect.x = newX - this.rect.width;
                        } else {
                            this.rect.height = newHeight;
                            this.rect.width *= minScale;
                            this.rect.y = newY;
                        }
                    }
                } catch (e) {
                }
            } else {
                this.width = newWidth;
                this.height = newHeight;
                this.rect.x = oldX - this.rect.width;
                this.rect.y = oldY - this.rect.height;
            }
            this.rect.makeConsistent();
        };

        this.moveBottomLeftHandle = function(pt) {
            var newX = pt.x, newHeight = pt.y - this.y(), xScale, yScale, minScale,
                oldX = this.width() + this.x(), newWidth = oldX - newX;
            if (this.keepRatio) {
                try {
                    xScale = newWidth / this.rect.width;
                    yScale = newHeight / this.rect.height;
                    minScale = Math.min(xScale, yScale);
                    if ((minScale !== 0) && (minScale !== 1.0)) {
                        if (xScale < yScale) {
                            this.rect.width = newWidth;
                            this.rect.height *= minScale;
                        } else {
                            this.rect.height = newHeight;
                            this.rect.width *= minScale;
                        }
                    }
                } catch (e) {
                }
            } else {
                this.width = newWidth;
                this.height = newHeight;
            }
            this.rect.x = oldX - this.rect.width;
            this.rect.makeConsistent();
        };

        this.moveBottomRightHandle = function(pt) {

            var newHeight = pt.y - this.y(), newWidth = pt.x - this.x(), xScale, yScale, minScale;
            if (this.keepRatio) {
                try {
                    xScale = newWidth / this.rect.width;
                    yScale = newHeight / this.rect.height;
                    minScale = Math.min(xScale, yScale);
                    if ((minScale !== 0) && (minScale !== 1.0)) {
                        if (xScale < yScale) {
                            this.rect.width = newWidth;
                            this.rect.height *= minScale;
                        } else {
                            this.rect.height = newHeight;
                            this.rect.width *= minScale;
                        }
                    }
                } catch (e) {
                }
            } else {
                this.width = newWidth;
                this.height = newHeight;
            }
            this.rect.makeConsistent();
        };


        this.leftMidpoint = function() {
            return this.rect.leftMidpoint();
        };
        this.rightMidpoint = function() {
            return this.rect.rightMidpoint();
        };
        this.topMidpoint = function() {
            return this.rect.topMidpoint();
        };
        this.bottomMidpoint = function() {
            return this.rect.bottomMidpoint();
        };
        this.topLeftCorner = function() {
            return this.rect.topLeftCorner();
        };
        this.topRightCorner = function() {
            return this.rect.topRightCorner();
        };
        this.bottomLeftCorner = function() {
            return this.rect.bottomLeftCorner();
        };
        this.bottomRightCorner = function() {
            return this.rect.bottomRightCorner();
        };
    }
    ;

//    function ModifierHelper() {
//
//        this.__hasImageDimensionsChanged = function(newWidth, newHeight) {
//            return ((this.imgWidth !== newWidth) || (this.imgHeight !== newHeight));
//        };
//
//        this.__storeImageDimensions = function(width, height) {
//            this.imgWidth = width;
//            this.imgHeight = height;
//        };this.width *= 
//    }

    var cvListeners = [];

    function CanvasModifier() {

        this.img = new Image();

        this.privateData = {
        };
        //this.canvasElement
        //this.canvasCtx
        //this.clipperElement
        //this.clipperCtx

        this.createRectWithMidpoint = function(pt, w, h) {
            return new Rect(pt.x - w / 2, pt.y - h / 2, w, h);
        };

        this.clipperCanvasWidth = function() {
            if (this.clipperElement) {
                return this.clipperElement.width;
            }
            return 0;
        };

        this.clipperCanvasHeight = function() {
            if (this.clipperElement) {
                return this.clipperElement.height;
            }
            return 0;
        };

        this.canvasWidth = function() {
            if (this.canvasElement) {
                return this.canvasElement.width;
            }
            return 0;
        };

        this.canvasHeight = function() {
            if (this.canvasElement) {
                return this.canvasElement.height;
            }
            return 0;
        };

        this.canvasMidpoint = function() {
            return new Point(this.canvasWidth() / 2, this.canvasHeight() / 2);
        };

        this.__assignDimensionsToElement = function(elem, w, h) {
            //"brutal" assignments to min/max values, control everything
            var isStyle, idx, attrName, names = ["minHeight", "maxHeight", "minWidth", "maxWidth", "width", "height"];
            for (idx = 0; idx < names.length; idx += 1) {
                attrName = names[idx];
                isStyle = (attrName.indexOf("m") === 0);

                if (attrName.indexOf("dth") > 0) {
                    elem[attrName] = w;
                    if (isStyle) {
                        elem.style[attrName] = w + "px";
                    }
                } else {
                    elem[attrName] = h;
                    if (isStyle) {
                        elem.style[attrName] = h + "px";
                    }
                }
            }
        };

        this.__setCanvasDimensions = function(w, h) {
            if (this.canvasElement) {
                this.__assignDimensionsToElement(this.canvasElement, w, h);
            }
            if (this.clipperElement) {
                this.__assignDimensionsToElement(this.clipperElement, w, h);
            }
        };

        this.__clearDrawSurfaceForCanvas = function(elem, elemCtx) {
            if (elem && elemCtx) {
                elemCtx.clearRect(0, 0, elem.width, elem.height);
            }
        };

        this.__clearDrawSurface = function() {
            this.__clearDrawSurfaceForCanvas(this.canvasElement, this.canvasCtx);
            this.__clearDrawSurfaceForCanvas(this.clipperElement, this.clipperCtx);
//            if (this.imgElem) {
//                this.imgElem.style.visibility = "hidden";
//            }
        };

//        this.__clearRect = function(w, h) {
//            if (this.canvasCtx) {
//                this.canvasCtx.clearRect(0, 0, w, h);
//            }
//        };

        this.__drawImage = function() {
            var xScale, yScale;
            if (this.canvasElement && this.canvasCtx && this.img && this.img.width && this.img.height) {
                xScale = this.canvasElement.width / this.img.width;
                yScale = this.canvasElement.height / this.img.height;
                this.canvasCtx.save();
                this.canvasCtx.scale(xScale, yScale);
                this.canvasCtx.drawImage(this.img, 0, 0);
                if (this.clipper) {
                    //this.clipper.scale(1./xScale, 1./yScale);
                }
                this.canvasCtx.restore();
                if (this.clipperElement && this.clipperCtx) {
                    this.clipperCtx.save();
                    this.clipperCtx.scale(xScale, yScale);
                    this.clipperCtx.restore();
                }
            }
        };

        this.initImpl = function(options) {
            devlog("CanvasModifier: init!>>>");
            devlog(this.img.src);
            devlog(this.img.width);
            devlog(this.img.height);
            devlog("CanvasModifier: init!<<<");
            if (typeof (options.canvasID) === 'string') {
                this.canvasID = options.canvasID;
            } else {
                //create a canvas element.
            }

            if (this.canvasID) {
                this.canvasElement = document.getElementById(this.canvasID);
                if (this.canvasElement) {
                    this.canvasCtx = this.canvasElement.getContext("2d");
                    this.clipper = new ClippingArea(50, 50, this.canvasElement.width / 2, this.canvasElement.height / 2);
                    this.clipperElement = document.getElementById(this.canvasID + "_clipper");
                    if (this.clipperElement) {
                        this.clipperCtx = this.canvasElement.getContext("2d");
                    }
                    devlog("Clipper: " + this.clipperCtx);
                    this.adaptCanvas();
                    this.redraw();
                }
            }
            return !!(this.canvasCtx);
        };

        this.lastMidpoint = null;
        this.lastAngle = null;

        this.redraw = function() {
            var pt = this.rotationPoint;
            var angle, c = this.clipper, midpoint, cvCtx = this.canvasCtx, clCtx = this.clipperCtx;
            //this.canvasCtx.save();
            this.__clearDrawSurface();
            //if (this.rotationMode && this.mouseIsDown && pt) {
            if (pt && c && cvCtx) {
                //this.__clearDrawSurface();

                clCtx.save();
                if (!this.moveMode) {
                    midpoint = c.midPoint();
                    this.lastMidpoint = midpoint;
                    angle = this.__getRotationAngleToMidPoint(pt);
                    this.lastAngle = angle;
                } else {
                    midpoint = this.lastMidpoint;
                    angle = this.lastAngle;
                }

                devlog("Angle: " + angle);
                var mp = this.canvasMidpoint();
//                    midpoint.x = mp.x - midpoint.x;
//                    midpoint.y = mp.y - midpoint.y;
                //midpoint.negate();
                //cvCtx.save();
                if (midpoint) {
                    cvCtx.translate(midpoint.x, midpoint.y);
                    cvCtx.rotate(angle);
                    cvCtx.translate(-midpoint.x, -midpoint.y);
                }
                this.__drawImage();
                //cvCtx.restore();
                //cvCtx.rotate(-angle);
                clCtx.restore();
                this.drawClippingArea();

                //cvCtx.restore();
            }
            else {
                this.drawClippingArea();
            }
        };

        this.drawClippingArea = function() {

            this.__drawClipper();
            this.__drawRotationHelpers();
        };

        this.strokeRect = function(r) {
            if (this.canvasCtx && r) {
                this.canvasCtx.strokeRect(r.x, r.y, r.width, r.height);
            }
        };

        this.__drawClipper = function() {
            var r, c = this.clipper, w = 8, h = 8, cCtx = this.clipperCtx;
            if (cCtx && c) {
                //devlog("Draw clipper");
                devlog(c);
                //this.canvasCtx.save();
                cCtx.strokeStyle = "red";
                var bw = 4;
                cCtx.lineWidth = bw;
                bw /= 2;

                cCtx.strokeRect(c.x() - bw, c.y() - bw, c.width() + 2 * bw, c.height() + 2 * bw);

                cCtx.strokeStyle = "blue";
                cCtx.lineWidth = 1;
                r = this.createRectWithMidpoint(c.leftMidpoint(), w, h);
                this.strokeRect(r);
                r = this.createRectWithMidpoint(c.rightMidpoint(), w, h);
                this.strokeRect(r);
                r = this.createRectWithMidpoint(c.topMidpoint(), w, h);
                this.strokeRect(r);
                r = this.createRectWithMidpoint(c.bottomMidpoint(), w, h);
                this.strokeRect(r);

                r = this.createRectWithMidpoint(c.topLeftCorner(), w, h);
                this.strokeRect(r);
                r = this.createRectWithMidpoint(c.topRightCorner(), w, h);
                this.strokeRect(r);
                r = this.createRectWithMidpoint(c.bottomLeftCorner(), w, h);
                this.strokeRect(r);
                r = this.createRectWithMidpoint(c.bottomRightCorner(), w, h);
                this.strokeRect(r);

                //this.canvasCtx.restore();
            }
        };

        this.__isOnRotationHelper = function(pt) {
            var distance, diffX, diffY, c = this.clipper, circle, midPoint;
            if (pt && c) {
                circle = c.getBoundingCircle();
                midPoint = c.midPoint();
                if (midPoint && circle) {
                    diffX = pt.x - midPoint.x;
                    diffY = pt.y - midPoint.y;
                    distance = Math.sqrt(diffX * diffX + diffY * diffY);
                    if ((distance >= circle.radius + 6) && (distance <= circle.radius + 12)) {
                        return true;
                    }
                }

            }
            return false;
        };

        this.__getRotationAngleToMidPoint = function(pt) {
            var angle, diffX, diffY, c = this.clipper, midpoint, length1;
            if (pt && c) {
                midpoint = c.midPoint();
                diffX = pt.x - midpoint.x;
                diffY = pt.y - midpoint.y;
                length1 = Math.sqrt(diffX * diffX + diffY * diffY);
                if (Math.abs(diffX) > Math.abs(diffY)) {
                    angle = Math.acos(diffX / length1);
                } else {
                    angle = Math.asin((diffY / length1));
                }
                if (pt.y < midpoint.y) {
                    angle = -angle;
                }
//                if (pt.x < midpoint.x) {
//                    angle = -angle;
//                }
                //angle /= 60;
                //devlog("Angle° : " + angle * 180);
                return angle;
            }
            return 0;
        };

        this.drawPoint = function(pt) {
            if (pt && this.canvasCtx) {
//                this.canvasElement.save();
//                this.strokeStyle = "white";
//                this.canvasCtx.beginPath();
//                this.canvasCtx.arc(pt.x, pt.y, 4, 0, 2 * Math.PI);
//                this.canvasCtx.closePath();
//                this.canvasElement.restore();
            }
        };

        this.rotateImage = function(pt) {
            var angle, c = this.clipper, cvCtx = this.canvasCtx, midpoint;
            if (pt && c && cvCtx) {
                angle = this.__getRotationAngleToMidPoint(pt);
                devlog("Angle: " + angle);
                //cvCtx.save();
                midpoint = c.midPoint();
                var mp = this.canvasMidpoint();
                midpoint.x = mp.x - midpoint.x;
                midpoint.y = mp.y - midpoint.y;
                cvCtx.translate(-midpoint.x, -midpoint.y);
                cvCtx.rotate(angle);
                cvCtx.translate(midpoint.x, midpoint.y);
                //cvCtx.restore();
            }
        };


        this.__drawRotationHelpers = function() {
            var c, circle, lineWidth = 10, cCtx = this.clipperCtx;
            if (cCtx && this.clipper) {
                c = this.clipper;
                circle = c.getBoundingCircle();
                devlog(circle);
                cCtx.strokeStyle = "magenta";
                cCtx.lineWidth = 1;
                cCtx.beginPath();
                cCtx.arc(circle.x, circle.y, circle.radius + 6, 0, 2 * Math.PI);
                cCtx.arc(circle.x, circle.y, circle.radius + 12, 0, 2 * Math.PI);
                cCtx.stroke();
                cCtx.closePath();
            }
        };


        this.getCanvasPointFromEvent = function(e) {
            var cvX, cvY, elem = this.clipperElement;
            if (e && e.clientX && e.clientY && elem) {
                cvX = e.clientX - elem.offsetLeft;
                cvY = e.clientY - elem.offsetTop;
                return new Point(cvX, cvY);
            }
        };

        this.onClick = function(e) {
            //var cvPoint = this.getCanvasPointFromEvent(e);
            devlog("CV:click");
//            devlog(e);
//            devlog(cvPoint);
        };

        this.dVec = null;

        this.__moveClipper = function(cvPoint) {
            var c = this.clipper, ox, oy;
            if (this.clipper) {
                ox = c.x();
                oy = c.y();
                this.clipper.rect.x = cvPoint.x - 10;
                this.clipper.rect.y = cvPoint.y - 10;
                if (this.dVec) {
                    this.clipper.rect.x = cvPoint.x - this.dVec.x;
                    this.clipper.rect.y = cvPoint.y - this.dVec.y;
                }
                if (c.x() <= 0) {
                    this.clipper.rect.x = ox;
                }
                if (c.y() <= 0) {
                    this.clipper.rect.y = oy;
                }
                if (c.x() + c.width() >= this.clipperCanvasWidth()) {
                    this.clipper.rect.x = this.clipperCanvasWidth() - c.width();
                }
                if (c.y() + c.height() >= this.clipperCanvasHeight()) {
                    this.clipper.rect.y = this.clipperCanvasHeight() - c.height();
                }
            }
        };

        this.onMouseMove = function(e) {
            var needRedraw, cvPoint = this.getCanvasPointFromEvent(e);
            if (this.clipper) {
                c = this.clipper;
                //var isIn = this.isInsideClippingArea(cvPoint);
                if (this.inClippingArea && this.mouseIsDown) {
                    this.__moveClipper(cvPoint);
                    this.redraw();
                    this.lastPoint = cvPoint;
                    //devlog("CV:mousemove" + (this.inClippingArea ? "-area" : ""));
                    this.moveMode = true;
                    this.fireEvent({eventSource: cvMod});

                } else {
                    if (this.mouseIsDown) {
                        if (this.edgeHandle) {
                            this.edgeHandle(cvPoint);
                            this.moveMode = true;
                            needRedraw = true;

                        } else if (this.cornerHandle) {
                            this.cornerHandle(cvPoint);
                            this.moveMode = true;
                            needRedraw = true;
                        } else if (this.rotationMode) {
                            devlog("Rotate");
                            this.moveMode = false;
                            this.rotationPoint = cvPoint;
                            this.lastPoint = cvPoint;
                            //this.rotateImage(cvPoint);
                            needRedraw = true;
                        }
                        if (needRedraw) {
                            this.redraw();
                            this.fireEvent({eventSource: cvMod});
                        }
                    }
                    this.inClippingArea = false;
                }
            }
            //  devlog("CV:mousemove" + (this.mouseIsDown ? "down" : ""));
        };

        this.rotationPoint = null;
        this.lastPoint;
        this.mouseIsDown = false;
        this.inClippingArea = false;
        this.edgeHandle = null;
        this.cornerHandle = null;
        this.rotationMode = false;

        this.__getEdgeHandle = function(pt) {
            var r, w = 8, h = 8, c = this.clipper;
            if (c) {
                r = this.createRectWithMidpoint(c.leftMidpoint(), w, h);
                if (r.containsPoint(pt)) {
                    return function(pt) {
                        c.moveLeftHandle(pt);
                    };
                }
                r = this.createRectWithMidpoint(c.rightMidpoint(), w, h);
                if (r.containsPoint(pt)) {
                    return function(pt) {
                        c.moveRightHandle(pt);
                    };
                }
                r = this.createRectWithMidpoint(c.topMidpoint(), w, h);
                if (r.containsPoint(pt)) {
                    return function(pt) {
                        c.moveTopHandle(pt);
                    };
                }
                r = this.createRectWithMidpoint(c.bottomMidpoint(), w, h);
                if (r.containsPoint(pt)) {
                    return function(pt) {
                        c.moveBottomHandle(pt);
                    };
                }
            }
            return null;
        };

        this.__getCornerHandle = function(pt) {
            var r, w = 8, h = 8, c = this.clipper;
            if (c) {
                r = this.createRectWithMidpoint(c.topLeftCorner(), w, h);
                if (r.containsPoint(pt)) {
                    return function(pt) {
                        devlog("leftTop");
                        c.moveTopLeftHandle(pt);
                    };
                }
                r = this.createRectWithMidpoint(c.topRightCorner(), w, h);
                if (r.containsPoint(pt)) {
                    return function(pt) {
                        devlog("rightTop");
                        c.moveTopRightHandle(pt);
                    };
                }
                r = this.createRectWithMidpoint(c.bottomLeftCorner(), w, h);
                if (r.containsPoint(pt)) {
                    return function(pt) {
                        devlog("leftBottom");
                        c.moveBottomLeftHandle(pt);
                    };
                }
                r = this.createRectWithMidpoint(c.bottomRightCorner(), w, h);
                if (r.containsPoint(pt)) {
                    return function(pt1) {
                        devlog("rBottom");
                        c.moveBottomRightHandle(pt1);
                    };
                }
            }
            return null;
        };

        this.__isEdgeHandle = function(pt) {
            var handle = this.__getEdgeHandle(pt);
            if (!!handle) {
                return true;
            }
            return false;
        };

        this.__isCornerHandle = function(pt) {
            var handle = this.__getCornerHandle(pt);
            if (!!handle) {
                return true;
            }
            return false;
        };

        this.onMouseDown = function(e) {
            var c = this.clipper, cvPoint = this.getCanvasPointFromEvent(e);
            //devlog("CV:mousedown");
            this.mouseIsDown = true;
            if (this.isInsideClippingArea(cvPoint)) {
                devlog("INSIDE");
                this.inClippingArea = true;
                //this.lastPoint = cvPoint;
                if (c) {
                    this.dVec = new Point(cvPoint.x - c.x(), cvPoint.y - c.y());
                }
            } else {

                this.inClippingArea = false;
                this.lastPoint = null;
                this.dVec = null;
                if (this.__isEdgeHandle(cvPoint)) {
                    devlog("Edge");
                    this.edgeHandle = this.__getEdgeHandle(cvPoint);
                    devlog(this.edgeHandle);
                } else if (this.__isCornerHandle(cvPoint)) {
                    devlog("Corner");
                    this.cornerHandle = this.__getCornerHandle(cvPoint);
                    devlog(this.cornerHandle);
                } else if (this.__isOnRotationHelper(cvPoint)) {
                    this.rotationMode = true;
                }
            }
        };

        this.onMouseUp = function(e) {
            var cvPoint = this.getCanvasPointFromEvent(e);
            //devlog("CV:mouseup");
            this.mouseIsDown = false;
            this.inClippingArea = false;
            //this.lastPoint = null;
            this.edgeHandle = null;
            this.cornerHandle = null;
            //this.rotationMode = false;
        };

        this.isInsideClippingArea = function(pt) {
            if (this.clipper) {
                var r = this.clipper.rectWithPadding(4);
                return r.containsPoint(pt);
            }
            return false;
        };

        this.init = function(options) {
            if (typeof (options) === 'object') {
                if (typeof (options.imageID) === 'string') {
                    this.imgElem = document.getElementById(options.imageID);
                    if (this.imgElem) {
                        this.img.src = this.imgElem.src;
                        if (this.img.complete) {
                            return  this.initImpl(options);
                        } else {
                            this.img.onload = function() {
                                return this.initImpl(options);
                            };
                        }
                    }
                }
            }
            return false;
        };

        this.adaptCanvas = function() {
            var imgWidth, imgHeight;
            if (this.imgElem) {
                imgWidth = this.imgElem.offsetWidth;
                imgHeight = this.imgElem.offsetHeight;
                if (this.__hasImageDimensionsChanged(imgWidth, imgHeight)) {
                    devlog("Img dimensions changed");
                    this.__setCanvasDimensions(imgWidth, imgHeight);
                    this.__clearDrawSurface();
                    //this.__drawImage();
                    this.__storeImageDimensions(imgWidth, imgHeight);
                    //this.__example();
                    this.redraw();
                }
            }
        };

//        this.__example = function() {
//            if (this.canvasCtx) {
//                this.canvasCtx.fillRect(this.canvasElement.offsetWidth / 2, this.canvasElement.offsetHeight / 2, 100, 50);
//            }
//        };

        this.saveClippedArea = function(mimeType) {
            var img, data, x, y, w, h, elemCtx, elem, dataURL;
            devlog("CV: save");
            if (this.canvasCtx && this.canvasElement) {
                devlog("CV: save: context OK!");
                if (this.clipper) {
                    devlog("CV: save: clipper OK!");
                    devlog(this.clipper);
                    x = Math.round(this.clipper.x());
                    y = Math.round(this.clipper.y());
                    w = Math.round(this.clipper.width());
                    h = Math.round(this.clipper.height());
                    //this.canvasCtx.save();

                    img = new Image();
                    img.width = w;
                    img.height = h;

                    //this.__drawImage();
                    data = this.canvasCtx.getImageData(x, y, w, h);
                    //dataURL = this.canvasElement.toDataURL(mimeType);
                    elem = document.createElement("canvas");
//                    if (!this.rotationMode) {
//                        this.redraw();
//                    }

                    if (this.canvasElement.style && this.canvasElement.style.zIndex) {
                        //elem.style.zIndex = this.canvasElement.style.zIndex +1;
                    }

                    elem.width = w;
                    elem.height = h;
                    elemCtx = elem.getContext("2d");
                    elemCtx.putImageData(data, 0, 0);
                    dataURL = elem.toDataURL(mimeType);

                    img.src = dataURL;
                    //
                    elemCtx = null;
                    elem = null;
                    dataURL = null;

                    //this.canvasCtx.restore();
                    return img;
                }
            }
            devlog("CV: save:end!");
            return null;
        };

        this.onWindowResize = function(w, h) {
            devlog("CV: Window resize: " + w + " | " + h);
            this.adaptCanvas();
            this.redraw();
            this.fireEvent({eventSource: cvMod});
        };



        this.__hasImageDimensionsChanged = function(newWidth, newHeight) {
            return ((this.privateData.imgWidth !== newWidth) || (this.privateData.imgHeight !== newHeight));
        };
        this.__storeImageDimensions = function(width, height) {
            this.privateData.imgWidth = width;
            this.privateData.imgHeight = height;
        };
        //var eventHandler = {};
        //cvListeners = [];

        this.fireEvent = function(event) {
            var idx;
//            devlog("CV:fireEvent");
//            devlog(event);
//            devlog(cvListeners);
            if (cvListeners && cvListeners.length) {
                //devlog("CV:fireEvent:OK");
                for (idx = 0; idx < cvListeners.length; idx += 1) {
//                    devlog("Call:");
                    cvListeners[idx](event);
//                    devlog(cvListeners[idx]);
//                    devlog("Call:<<<");
                }
            }
        };

        this.getCanvasWidth = function() {
            if (this.canvasElement) {
                return this.canvasElement.offsetWidth;
            }
        };

        this.getCanvasHeight = function() {
            if (this.canvasElement) {
                return this.canvasElement.offsetHeight;
            }
        };

        this.getInfo = function() {
            var me = this, c, xScale = 0, yScale = 0, cw = this.getCanvasWidth(), ch = this.getCanvasHeight();

            var info = {
                "imageWidth": me.img.width,
                "imageHeight": me.img.height
            };

            if (this.clipper) {
                c = this.clipper;

                info.clipImageX = c.x();
                info.clipImageY = c.y();
                info.clipImageWidth = c.width();
                info.clipImageHeight = c.height();
                if (cw && ch) {
                    xScale = this.img.width / cw;
                    yScale = this.img.height / ch;
                    info.realClipImageX = c.x() * xScale;
                    info.realClipImageY = c.y() * yScale;
                    info.realClipImageWidth = c.width() * xScale;
                    info.realClipImageHeight = c.height() * yScale;
                }
            }
            return info;
        };


        this.addListener = function(callback) {
            var idx;
            devlog("CV:addListener");
            if (typeof (callback) === 'function') {
                for (idx = 0; idx < cvListeners.length; idx += 1) {
                    if (cvListeners[idx] === callback) {
                        return;
                    }
                }
                cvListeners[cvListeners.length] = callback;
                devlog("CV:addListener:OK");
                devlog(cvListeners);
            }
        };
//        this.removeListener = function(callback) {
//            devlog("CV:removeListener");
//            if (typeof (callback) === 'function') {
//                var idx = 0;
//                for (idx = 0; idx < this.cvListeners.length; idx += 1) {
//                    if (this.cvListeners[idx] === callback) {
//                        this.cvListeners.splice(idx, 1);
//                        return;
//                    }
//                }
//            }
//        };
    }


    function applyClippingAreaBorderConfigImpl(obj, config) {
        if (isManaged(obj)) {

        }
    }

    function applyClippingAreaDragPointConfigImpl(obj, config) {
        if (isManaged(obj)) {

        }
    }

    function onResizeImpl(obj, width, height) {
        devlog("Resizing: width = " + width + " | height = " + height + " | " + obj);
        if (isManaged(obj)) {
            if (cvMod) {
                //devlog("Canvas");
                cvMod.onWindowResize(width, height);
            }
        }
    }

    function attachCanvasEvents(cvObj) {
        var eventElem;
        if (cvObj) {
            eventElem = cvMod.clipperElement;
            if (eventElem) {
                devlog("ATACH EVENTS");
                addEvent(eventElem, "click", function(e) {
                    cvMod.onClick(e);
                });
                addEvent(eventElem, "mousemove", function(e) {
                    cvMod.onMouseMove(e);
                });
                addEvent(eventElem, "mousedown", function(e) {
                    cvMod.onMouseDown(e);
                });
                addEvent(eventElem, "mouseup", function(e) {
                    cvMod.onMouseUp(e);
                });
            }
        }
    }
    /*
     function detachCanvasEvents(cvObj) {
     if (cvObj) {
     if (cvMod.canvasElement) {
     
     removeEvent(cvMod.canvasElement, "click", function(e) {
     cvMod.onClick(e);
     });
     addEvent(cvMod.canvasElement, "mousemove", function(e) {
     cvMod.onMouseMove(e);
     });
     addEvent(cvMod.canvasElement, "mousedown", function(e) {
     cvMod.onMouseDown(e);
     });
     addEvent(cvMod.canvasElement, "mouseup", function(e) {
     cvMod.onMouseUp(e);
     });
     }
     }
     }
     */
    function addListenerImpl(callback) {
        if (cvMod) {
            cvMod.addListener(callback);
        }
    }
    function removeListenerImpl(callback) {
        if (cvMod) {
            cvMod.removeListener(callback);
        }
    }


    function saveClippedAreaImpl(obj, mimeType) {
        if (isManaged(obj)) {
            devlog("Save clipped!");
            if (cvMod) {
                return cvMod.saveClippedArea(mimeType);
            }
        }
        return null;
    }

    function createDummyCanvasImage(mimeType) {
        var data, elemCtx, w = 40, h = 30, elem = document.createElement("canvas");
        elem.width = w;
        elem.height = h;
        elemCtx = elem.getContext("2d");
        if (elemCtx) {
            //draw some special flag
            elemCtx.fillStyle = "black";
            elemCtx.fillRect(0, 0, w, h / 3);
            elemCtx.fillStyle = "red";
            elemCtx.fillRect(0, h / 3, w, h / 3);
            elemCtx.fillStyle = "yellow";
            elemCtx.fillRect(0, 2 * h / 3, w, h / 3);
            try {
                data = elem.toDataURL(mimeType);
                return data;
            } catch (e) {
            }
        }
        return null;
    }

    function isSaveSupportedPNG() {
        var data = createDummyCanvasImage("image/png");
        return (data && (data.indexOf("image/png") === 5));
    }

    function isSaveSupportedJPEG() {
        var data = createDummyCanvasImage("image/jpeg");
        return (data && (data.indexOf("image/jpeg") === 5));
    }

    function isSaveSupportedBMP() {
        var data = createDummyCanvasImage("image/bmp");
        return (data && (data.indexOf("image/bmp") === 5));
    }

    function initializeSIM(obj, options) {
        devlog("initSIM!");
        devlog(obj);
        devlog("options>>>");
        devlog(options);
        devlog("<<<");
        if (typeof (obj) === 'object') {
            if (!isManaged(obj)) {
                devlog("add-to-managed!");
                managedSIMs[managedSIMs.length] = obj;
            }
            if (typeof (options) === 'object') {
                cvMod = new CanvasModifier();
                var r = cvMod.init(options);
                attachCanvasEvents(cvMod);
                devlog("Init success: " + r);
            }
        }
    }

    function releaseSIM(obj) {
        var idx = managedSIMs.indexOf(obj);
        if (idx >= 0) {
            managedSIMs.splice(idx, 1);
            return true;
        }
        return false;
    }

    function getInfoImpl(obj) {
        if (isManaged(obj)) {
            if (cvMod) {
                return cvMod.getInfo();
            }
        }
    }

    function redrawImpl(obj) {
        if (cvMod) {
            cvMod.adaptCanvas();
            cvMod.redraw();
        }
    }

    return function(options) {

        if ((options === "release") && (typeof (arguments[1]) === 'object')) {
            return releaseSIM(arguments[1]);
        }

        return {
            init: function(options) {
                initializeSIM(this, options);
                return this;
            },
            getInfo: function() {
                return getInfoImpl(this);
            },
            applyClippingAreaBorderConfig: function(config) {
                applyClippingAreaBorderConfigImpl(this, config);
            },
            applyClippingAreaDragPointConfig: function(config) {
                applyClippingAreaDragPointConfigImpl(this, config);
            },
            onLoad: function() {
                this.init();
            },
            onResize: function(width, height) {
                onResizeImpl(this, width, height);
            },
            redraw: function() {
                redrawImpl(this);
            },
            saveClippedArea: function(mimeType) {
                return saveClippedAreaImpl(this, mimeType);
            },
            supportsMimeType: function(mimeType) {
                if (mimeType === "image/png") {
                    return isSaveSupportedPNG();
                }
                if (mimeType === "image/jpeg") {
                    return isSaveSupportedJPEG();
                }
                if (mimeType === "image/bmp") {
                    return isSaveSupportedBMP();
                }
                return false;
            },
            addListener: function(callback) {
                addListenerImpl(callback);
            },
            removeListener: function(callback) {
                removeListenerImpl(callback);
            },
            /**
             * Gives you access to internally used data structures and functions.
             * This function shouldn't be used by developers wanting to extend the 
             * capabilities. Its main purpose is for testing.
             * @param {string} name the name of internally used function/object.
             * @returns {function|object}
             */
            internals: function(name) {
                if (name === "Point") {
                    return Point;
                } else if (name === "Circle") {
                    return Circle;
                } else if (name === "Rect") {
                    return Rect;
                } else if (name === "ClippingArea") {
                    return ClippingArea;
                }
            }
        };
    };
}());