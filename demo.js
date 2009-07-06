var tyrant = require("tyrant.js");

function simpleStoreAndRetreive() {
  puts('Writing 10 records..');
  for (var i=0; i<10; i++) {
    tyrant.put('val_'+i, 'Record number '+i);
  }
  puts('Reading 10 records :');
  for (var i=0; i<10; i++) {
    tyrant.get('val_'+i, function(value, error) {
      puts('Result '+i+' : '+value);
    });
  }
}


function tableStoreAndRetreive() {
  puts('Writing 10 table records..');
  for (var i=0; i<10; i++) {
    tyrant.put('k_'+i, 'name', 'Mr. Number '+i);
  }
  puts('Reading 10 table records :');
  for (var i=0; i<10; i++) {
    tyrant.get('k_'+i, function(values) {
      var r=tyrant.dict(values);
      puts('Result '+i+' : name = '+r.name); // is always 10....
    });
  }
}

function tableStoreAndRetreiveWithClosure() {
  puts('Writing 10 table records..');
  for (var i=0; i<10; i++) {
    tyrant.put('k_'+i, 'name', 'Mr. Number '+i);
  }
  puts('Reading 10 table records :');
  for (var i=0; i<10; i++) {
    (function(i) {
       tyrant.get('k_'+i, function(values) {
	 var r=tyrant.dict(values);
	 puts('Result '+i+' : name = '+r.name); // is now the expected value for i
       });
    })(i); // Stick i into the anonymous function, so it has it at this value, not the overall variable in the enlarged scope
  }
}

function generalDemo() {
  simpleStoreAndRetreive();

}


function tableDemo(){
  tableStoreAndRetreive();
  tableStoreAndRetreiveWithClosure();

}

function runDemo() {
  // Server status

  tyrant.connect();

  tyrant.status(function(s) {
    puts('Tokyo Tyrant Server Status');
    puts('--------------------------');
    puts(s);
    puts('\n');
    if (s.indexOf('type\ttable')>=0) {
      tableDemo();
    } else {
      generalDemo();
    }
    tyrant.quit();
  });
}

function onLoad() {
  runDemo();
}