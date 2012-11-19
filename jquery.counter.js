/*
 * jQuery.counter plugin
 *
 * Copyright (c) 2012 Sophilabs <contact@sophilabs.com>
 * MIT License
 */
 
!(function (context, definition) {
  if (typeof define == 'function' && typeof define.amd  == 'object') define(['jquery'], definition);
  else definition(context['$']);
}(this, function ($) {

    $.fn.counter = function(options) {

        options = options || {};

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
            while(i >= 0 ) {
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
            while (i >= to) {
                var part = data.parts[i];
                var digits = part.value + '';
                while (digits.length < part.padding) {
                    digits = '0' + digits;
                }
                $.each(digits.split(''), function(j, digit) {
                    animate(e, i, j, digit);
                });
                i--;
            }
        };

        var animate = function(e, ipart, idigit, digit) {
            var edigit = $($(e.children('span.part').get(ipart)).find('span.digit').get(idigit));
            edigit.attr('class', 'digit digit' + digit +  ' digit' + edigit.text() + digit).text(digit);
        };

        return this.each(function() {
            var e = $(this);
            var data = e.data('counter') || {};
            data.interval = parseInt(options.interval || e.attr('data-interval') || '1000', 10);
            data.down = ( options.direction || e.attr('data-direction') || 'down') == 'down';
            data.parts = [];
            var initial = (options.initial || e.text()).split(/([^0-9]+)/);
            //WARN: Use attr() no data()
            var format = (options.format || e.attr('data-format') || "23:59:59").split(/([^0-9]+)/);
            var stop =  options.stop || e.attr('data-stop');
            if (stop) {
                stop = stop.split(/([^0-9]+)/);
            }
            e.html('');
            $.each(format, function(index, value) {
                if (/^\d+$/.test(value)) {
                    var part = {};
                    part.index = index;
                    part.padding = (value + '').length;
                    part.limit = parseFloat(value);
                    part.value = parseFloat(initial[initial.length - format.length + index] || 0);
                    part.value = part.value > part.limit ? part.limit : part.value;
                    part.stop = parseFloat(stop ? stop[stop.length - format.length + index] : (data.down ? 0 : part.limit));
                    part.stop = part.stop > part.limit ? part.limit : part.stop;
                    part.stop = part.stop < 0 ? 0 : part.stop;
                    var epart = $('<span>').addClass('part').addClass('part' + index);
                    var digits = part.value + '';
                    while (digits.length < part.padding) {
                        digits = '0' + digits;
                    }
                    $.each(digits, function(i, digit) {
                        epart.append($('<span>').addClass('digit digit' + digit).text(digit));
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
    };
}));
