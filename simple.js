var tyrant = require("tyrant.js");

var c = tyrant.connect();
c.addListener("connect", function (){
  c.put('town', 'Llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch');
  c.get('town').addCallback(function(value) {
    puts('Town : '+value);
    c.quit();
  });
});
