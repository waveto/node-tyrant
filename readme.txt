node-tyrant
===========

Version : 0.1 
rhys@wave.to 6th July 2009

This is an implementation of the Tokyo Tyrant network protocol for the Node javascript/v8 language.


Pre-requisits
Install Tokyo Cabinet / Tokyo Tyrant, and set up either a b-tree or table database:

For a table database:
ttserver casket.tdb

For a b-tree (key/value) database:
ttserver casket.tcb


Quick Example

var tyrant = require("tyrant.js");
tyrant.put('town', 'Bangor');

tyrant.get('town', function(value, error) {
  puts('Result '+i+' : '+value);
});



