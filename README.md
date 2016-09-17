# udp_stats
looks like we need a way to chart various metrics. Send to statsD or file output in order to stash data for later.

_currently **only supports simple count** since this is all we are using at the moment._

## install
```npm install git@github.com:Wambosa/udp_stats.git --save```

## statsD usage
```javascript 1.6
var stats = require('udp_stats').configure({
      mode: "udp",
      host: "stats.sclabs.com",
      port: 8125,
      type: "count",
      metricName: "my.metric.name"
});

stats.start();
// returns 1474132300

["process", "things", "fast"].forEach(function(){
    stats.send(1);
});

stats.stop();
//closes connection

```

## file-out usage
```javascript 1.6
var stats = require('udp_stats').configure({
      mode: "file",
      type: "count",
      metricName: "my.file.name"
});

stats.start();
// returns 1474132300

["process", "things", "fast"].forEach(function(){
    stats.push(1);
    //returns 1, 2, then 3 (the array count)
});

stats.stop();
//writes metric data to file: my.file.name.json then purges metric data

```

## config
the **optional** config file: **udp_stats.json** (must be in ```process.cwd()``` in oirder to be found)

statsD example config
```json
{
  "mode": "udp",
  "host": "stats.sclabs.com",
  "port": 8125,
  "type": "count",
  "metricName": "my.metric.name"
}
```

file-out example config
```json
{
  "mode": "file",
  "type": "count",
  "metricName": "my.file.name"
}
```

## future
- support more than just basic count
- support more file out formats