var tyrant = require("./tyrant");
var sys = require('sys');

var c = tyrant.connect();
c.addListener("connect", function (){
  c.put('town', 'Llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch');
  c.get('town').addCallback(function(value) {
    sys.puts('Town : '+value);
    c.quit();
  });
});
