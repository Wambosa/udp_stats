"use strict";

var path = require('path');
var fs = require('fs-extra-promise');

var mode = "file";
var socket = {};
var port = 8125;
var host = "localhost";
var metricName = "my.metric";
var type = "count";
var rate = "0.1";
var typeTable = {};

var startTime = 0;
var stopTime = 0;
var metricData = [];

function timeStamp(){
    return Math.floor(new Date().getTime() / 1000);
}


module.exports = {

    configure: function(options){

        if(!options)
            options = require(`${process.cwd()}/udp_stats.json`);

        mode = options.mode || mode;
        port = options.port || port;
        host = options.host || host;
        type = options.type || type;
        rate = ""+options.sampleRate || rate;
        metricName = options.metricName || metricName;

        // todo: finish this concept with validation
        typeTable = {
            count: {
                symbol: "c",
                validation: /^\w+:(\d+|\d)\|c$/,
                info: "COUNT requires a integer"
            },
            sampling: {
                symbol: `c|@${rate}`
            },
            timing: {
                symbol: `|ms|@${rate}`
            }
        };

     return this;
    },

    start: function(specifiedTime) {

        if(mode == "udp")
            socket = require('dgram').createSocket('udp4');

        return startTime = specifiedTime || timeStamp();
    },

    stop: function(specifiedTime){

        stopTime = specifiedTime || timeStamp();

        if(mode == 'file')
            this.stash(`${metricName}.json`);

        if(mode == 'udp'){
            // todo switch on type: this.send(metricData.map.reduce) honor sampling rate
            socket.close();
        }

        return stopTime;
    },

    push: function(dataPoint){

        if(!startTime)
            console.warn("You should call start() before stashing metric data. The second time will be broken if you do not do this.");

        return metricData.push({
            dataPoint: dataPoint,
            seconds: timeStamp() - startTime
            }) && metricData.length;
    },

    send: function(dataPoint, callback){

        let errMsg = "cannot send without an open socket! call the start() method to begin recording metrics and open an udp socket.";

        if(!socket && !callback)
            return Promise.reject(errMsg);

        if(!socket)
            callback(errMsg);

        return new Promise(function(resolve, reject){
            let msg = `${metricName}:${dataPoint}|${typeTable[type].symbol}`;
            socket.send(msg, 0, msg.length, port, host, callback || function(err){
                    if(err)reject(err);
                    else resolve();
                }
            );
        });
    },

    stash: function(fileName){
        let self = this;
        // todo: support csv, tab, txt path.extname(filename)

        var content = {
            startTime: startTime,
            stopTime: stopTime,
            type: type
        };
        content[metricName] = metricData;

        return fs.ensureDirAsync(path.dirname(fileName))
            .then(function(){
                return fs.writeFileAsync(fileName, JSON.stringify(content, null, ' '));
            }).then(function(){
                self.purge();
            })
            .catch(console.error)
    },

    purge: function(filter){
        metricData = [];
    }
};