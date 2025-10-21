module.exports = function (RED) {
    "use strict";

    const noble = require('@abandonware/noble');

    function BLEScanNode(config) {
        RED.nodes.createNode(this, config);

        let node = this;
        node.filterString = config.filterString ? config.filterString.toLowerCase() : "";
        if (noble.state === 'poweredOn') {
            noble.startScanning([], true);
        } else {
            noble.on('stateChange', function (state) {
                if (state === 'poweredOn') {
                    noble.startScanning([], true);
                } else {
                    node.status({
                        fill: "red",
                        shape: "dot",
                        text: "device status: " + state
                    });
                }
            });
        }

        let discover = function (peripheral) {
            // Check if a filter string is set.
            if (node.filterString.length > 0) {
                
                // Check if the peripheral has an address and if it matches.
                if (!peripheral.address || !peripheral.address.toLowerCase().startsWith(node.filterString)) {
                    // Address doesn't match the filter. Stop and send no message.
                    return; 
                }
            }
            
            // If we are here, the device passed the filter
            let msg = { payload: peripheral };
            node.send(msg);
        }
            let msg = { payload: peripheral };
            node.send(msg);
        }
        noble.on('discover', discover);

        node.on('close', function () {
            noble.stopScanning();
            noble.removeListener('discover', discover);

            node.status({});
        });
    }
    RED.nodes.registerType("BLE Scan", BLEScanNode);
}
