'use strict';

// https://stackoverflow.com/questions/3653065/get-local-ip-address-in-node-js

/* import libraries */

const os = require('os');
const ifaces = os.networkInterfaces();

/* end of import libraries */


/* global variables */

let ifnameAddressMap = null;

/* end of global variables */


/* private functions */

const initializeIfnameAddressMap = _ => {
  ifnameAddressMap = new Map();

  Object.keys(ifaces).forEach(function (ifname) {
    let alias = 0;
  
    ifaces[ifname].forEach(function (iface) {
      if ('IPv4' !== iface.family || iface.internal !== false) {
        // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
        return;
      }
  
      if (alias >= 1) {
        // this single interface has multiple ipv4 addresses
        console.log(ifname + ':' + alias, iface.address);
      } else {
        // this interface has only one ipv4 adress
        console.log(ifname, iface.address);
      }
  
      ++alias;
  
      // added by chris
      ifnameAddressMap.set(ifname, iface.address);
    });
  });
};

/* end of private functions */


/* public functions */

const getIpByInterfaceName = (interfaceName) => {
  if (!ifnameAddressMap) {
    initializeIfnameAddressMap();
  }
  return ifnameAddressMap.get(interfaceName);
};

/* end of public functions */


/* exports */

module.exports = {
  getIpByInterfaceName: getIpByInterfaceName
};

/* end of exports */