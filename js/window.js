//
//Event handlers 
//
window.onresize = (function() {

    var listeners = [];

    return function(actionName, callback) {
        var currentWidth = 0, currentHeight = 0, listenerIdx, func;

        if (typeof (callback) === 'function' && typeof (actionName) === 'string' &&
            (actionName === 'add' || actionName === 'remove' || actionName === 'clear')) {
            if (actionName === 'add') {

                if (listeners.indexOf(callback) < 0) {
                    listeners[listeners.length] = callback;
                }
            } else if (actionName === 'remove') {
                if (listeners) {
                    listenerIdx = listeners.indexOf(callback);
                    if (listenerIdx >= 0) {
                        listeners.splice(listenerIdx, 1);
                    }
                }
            } else {
                //clear
                if (listeners) {
                    listeners.splice(0, listeners.length);
                }
            }
        } else {
            if (window.innerWidth) {
                currentWidth = window.innerWidth;
            } else if (document.body && document.body.offsetWidth) {
                currentWidth = document.body.offsetWidth;
            }
            if (window.innerHeight) {
                currentHeight = window.innerHeight;
            } else if (document.body && document.body.offsetHeight) {
                currentHeight = document.body.offsetHeight;
            }
            if (listeners) {
                for (listenerIdx = 0; listenerIdx < listeners.length; listenerIdx += 1) {
                    func = listeners[listenerIdx];
                    if (func) {
                        func(currentWidth, currentHeight);
                    }
                }
            }
        }
    };
}());

/**
* John Resig's event management functions.
* http://ejohn.org/projects/flexible-javascript-events/
*/
function addEvent( obj, type, fn )
{
   if (obj.addEventListener) {
      obj.addEventListener( type, fn, false );
   } else if (obj.attachEvent) {
      obj["e"+type+fn] = fn;
      obj[type+fn] = function() { obj["e"+type+fn]( window.event ); }
      obj.attachEvent( "on"+type, obj[type+fn] );
   }
}

function removeEvent( obj, type, fn )
{
   if (obj.removeEventListener) {
      obj.removeEventListener( type, fn, false );
   } else if (obj.detachEvent) {
      obj.detachEvent( "on"+type, obj[type+fn] );
      obj[type+fn] = null;
      obj["e"+type+fn] = null;
   }
}
