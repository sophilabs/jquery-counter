# jQuery.counter (javascript + css3)

Info + Demo: http://sophilabs.github.com/jquery-counter

![jQuery Counter](http://i.imgur.com/ub7D9.png)

A jQuery counter based on http://code.google.com/p/jquery-countdown with more options.


## Options
Options can be set by attribute `data-<name>="value"` or in the options hash on counter initialization: `$(element).counter({name: value, ...})`

**`direction: up|down`** Counter direction

**`format: string`** Defines the format and the limit for each part - _e.g: 23:59:59_

**`interval: number`** Defines the time between each counter increment - _by default 1000 milliseconds_

**`stop: string`** Defines the counter limit - _eg: 10:00 (ten minutes)_

## Methods
Methods can be call using `$(element).counter('method')`

**`play`** Play counter

**`reset`** Reset counter

**`stop`** Stop counter

## Events

**`counterStop`** Raised when the counter reach limit

## Example
### 10 seconds countdown:

    <span class="counter counter-analog">0:10</span>
    <script>
        $('.counter').counter();
    </script>

### 120 seconds count:
    <span class="counter counter-analog" data-direction="up" data-format="120">0</span>
    <script>
        $('.counter').counter();
    </script>
    
## License
MIT License
