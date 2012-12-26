/*
 * jQuery.counter plugin
 *
 * Copyright (c) 2012 Sophilabs <hi@sophilabs.com>
 * MIT License
 */
 
!(function (context, definition) {
  if (typeof define == 'function' && typeof define.amd  == 'object') define(['jquery'], definition);
  else definition(context['$']);
}(this, function ($) {

    var checkStop = function(data) {
        var stop = 0;
        var current = 0;
        $.each(data.parts, function(i, part) {
            stop += (stop * part.limit) + part.stop;
            current += (current * part.limit) + part.value;
        });
        return data.down ? stop >= current : stop <= current;
    };

    var tick = function() {
        var e = $(this);
        var data = e.data('counter');
        var i = data.parts.length - 1;
        while(i >= 0) {
            var part = data.parts[i];
            part.value += data.down ? -1 : 1;
            if (data.down && part.value < 0) {
                part.value = part.limit;
            } else if (!data.down && part.value > part.limit) {
                part.value = 0;
            } else {
                break;
            }
            i--;
        }
        refresh(e, i);
        if (checkStop(data)) {
            clearInterval(data.intervalId);
            e.trigger("counterStop");
        }
    };

    var refresh = function(e, to) {
        var data = e.data('counter');
        var i = data.parts.length - 1;
        var animateIJ = function(j, digit) {
            animate(e, i, j, digit);
        };
        while (i >= to) {
            var part = data.parts[i];
            var digits = part.value + '';
            while (digits.length < part.padding) {
                digits = '0' + digits;
            }
            $.each(split(digits, ''), animateIJ);
            i--;
        }
    };

    var animate = function(e, ipart, idigit, digit) {
        var edigit = $($(e.children('span.part').get(ipart)).find('span.digit').get(idigit));
        edigit.attr('class', 'digit digit' + digit +  ' digit' + edigit.text() + digit).text(digit);
    };

    //from http://blog.stevenlevithan.com/archives/cross-browser-split
    var split = function(undef) {

        var nativeSplit = String.prototype.split,
            compliantExecNpcg = /()??/.exec("")[1] === undef, // NPCG: nonparticipating capturing group
            self;

        self = function (str, separator, limit) {
            // If `separator` is not a regex, use `nativeSplit`
            if (Object.prototype.toString.call(separator) !== "[object RegExp]") {
                return nativeSplit.call(str, separator, limit);
            }
            var output = [],
                flags = (separator.ignoreCase ? "i" : "") +
                        (separator.multiline  ? "m" : "") +
                        (separator.extended   ? "x" : "") + // Proposed for ES6
                        (separator.sticky     ? "y" : ""), // Firefox 3+
                lastLastIndex = 0,
                // Make `global` and avoid `lastIndex` issues by working with a copy
                separator = new RegExp(separator.source, flags + "g"),
                separator2, match, lastIndex, lastLength;
            str += ""; // Type-convert
            if (!compliantExecNpcg) {
                // Doesn't need flags gy, but they don't hurt
                separator2 = new RegExp("^" + separator.source + "$(?!\\s)", flags);
            }
            /* Values for `limit`, per the spec:
             * If undefined: 4294967295 // Math.pow(2, 32) - 1
             * If 0, Infinity, or NaN: 0
             * If positive number: limit = Math.floor(limit); if (limit > 4294967295) limit -= 4294967296;
             * If negative number: 4294967296 - Math.floor(Math.abs(limit))
             * If other: Type-convert, then use the above rules
             */
            limit = limit === undef ?
                -1 >>> 0 : // Math.pow(2, 32) - 1
                limit >>> 0; // ToUint32(limit)
            while (match = separator.exec(str)) {
                // `separator.lastIndex` is not reliable cross-browser
                lastIndex = match.index + match[0].length;
                if (lastIndex > lastLastIndex) {
                    output.push(str.slice(lastLastIndex, match.index));
                    // Fix browsers whose `exec` methods don't consistently return `undefined` for
                    // nonparticipating capturing groups
                    if (!compliantExecNpcg && match.length > 1) {
                        match[0].replace(separator2, function () {
                            for (var i = 1; i < arguments.length - 2; i++) {
                                if (arguments[i] === undef) {
                                    match[i] = undef;
                                }
                            }
                        });
                    }
                    if (match.length > 1 && match.index < str.length) {
                        Array.prototype.push.apply(output, match.slice(1));
                    }
                    lastLength = match[0].length;
                    lastLastIndex = lastIndex;
                    if (output.length >= limit) {
                        break;
                    }
                }
                if (separator.lastIndex === match.index) {
                    separator.lastIndex++; // Avoid an infinite loop
                }
            }
            if (lastLastIndex === str.length) {
                if (lastLength || !separator.test("")) {
                    output.push("");
                }
            } else {
                output.push(str.slice(lastLastIndex));
            }
            return output.length > limit ? output.slice(0, limit) : output;
        };
        return self;
    }();

    var methods = {
        init: function(options) {
            options = options || {};
            return this.each(function() {
                var e = $(this);
                var data = e.data('counter') || {};
                data.interval = parseInt(options.interval || e.attr('data-interval') || '1000', 10);
                data.down = (options.direction || e.attr('data-direction') || 'down') == 'down';
                data.parts = [];
                var initial = split(options.initial || e.text(), /([^0-9]+)/);
                //WARN: Use attr() no data()
                var format = split(options.format || e.attr('data-format') || "23:59:59", /([^0-9]+)/);
                var stop =  options.stop || e.attr('data-stop');
                if (stop) {
                    stop = split(stop, /([^0-9]+)/);
                }
                e.html('');
                $.each(format, function(index, value) {
                    if (/^\d+$/.test(value)) {
                        var part = {};
                        part.index = index;
                        part.padding = (value + '').length;
                        part.limit = parseInt(value, 10);
                        part.value = parseInt(initial[initial.length - format.length + index] || 0, 10);
                        part.value = part.value > part.limit ? part.limit : part.value;
                        part.reset = part.value;
                        part.stop = parseInt(stop ? stop[stop.length - format.length + index] : (data.down ? 0 : part.limit), 10);
                        part.stop = part.stop > part.limit ? part.limit : part.stop;
                        part.stop = part.stop < 0 ? 0 : part.stop;
                        var epart = $('<span>').addClass('part').addClass('part' + index);
                        var digits = part.value + '';
                        while (digits.length < part.padding) {
                            digits = '0' + digits;
                        }
                        $.each(split(digits, ''), function(dindex, dvalue){
                            epart.append($('<span>').addClass('digit digit' + dvalue).text(dvalue));
                        });
                        e.append(epart);
                        data.parts.push(part);
                    } else {
                        e.append($('<span>').addClass('separator').addClass('separator' + index).text(value));
                    }
                });
                if (!checkStop(data)) {
                    data.intervalId = setInterval($.proxy(tick, this), data.interval);
                } else {
                    e.trigger("counterStop");
                }
                e.data('counter', data);
                return this;
            });
        },
        play: function() {
            return this.each(function() {
                var e = $(this);
                var data = e.data('counter');
                if (!data.intervalId) {
                    data.intervalId = setInterval($.proxy(tick, this), data.interval);
                }
            });
        },
        reset: function() {
            return this.each(function() {
                var e = $(this);
                var data = e.data('counter');
                $.each(data.parts, function(pindex, pvalue){
                    pvalue.value = pvalue.reset;
                });
                refresh($(this), 0);
                if (data.intervalId) {
                    clearInterval(data.intervalId);
                    data.intervalId = setInterval($.proxy(tick, this), data.interval);
                }
            });
        },
        stop: function() {
            return this.each(function() {
                var e = $(this);
                var data = e.data('counter');
                clearInterval(data.intervalId);
                data.intervalId = 0;
                e.trigger("counterStop");
            });
        }
    };

    $.fn.counter = function(method) {
        // Method calling logic
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || ! method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' +  method + ' does not exist on jQuery.counter');
        }
    };

}));
