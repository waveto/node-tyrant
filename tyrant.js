var conn = new node.tcp.Connection();
var callbacks=[];
var response=[];

exports.ITLEXICAL = '0';
exports.ITDECIMAL = '1';
exports.ITOPT = 9998;
exports.ITVOID = 9999;
exports.ITKEEP = 16777216;

exports.connect = function(port, hostname) {
    conn.connect(port || 1978, hostname || '127.0.0.1');
}


// List of Command hex codes for Tyrant
var commandCode = {
  misc: 0x90,
  get: 0x30,
  out: 0x20,
  vsiz: 0x38,
  iterinit: 0x50,
  iternext: 0x51,
  status: 0x88,
  addint: 0x60,
}

// Commands and their request and response functions
var commands = {
  status:[formatNone, responseSingle],
  get:[formatMisc, responseMisc],
  getlist:[formatMisc, responseMisc],
  out:[formatSingle, responseNone],
  vsiz:[formatSingle, responseInt],
  iterinit:[formatNone, responseNone],
  iternext:[formatNone, responseSingle],
  put:[formatMisc, responseMisc], // Store and overwrite if already present
  putkeep:[formatMisc, responseMisc], // Store but dont overwrite if already present
  putcat:[formatMisc, responseMisc], // Store and concatinate if already present
  setindex:[formatMisc, responseSingle],
  search:[formatMisc, responseMisc],
  addint:[formatInt, responseInt],
}

// Filter queries for search
var queries = {
  'is' : '0',
  'like' : '1',
  'starts' : '2',
  'ends' : '3',
  'hasall' : '4',
  'has' : '5',
  'isone' : '6',
  'matches' : '7',
  'eq' : '8',
  'gt' : '9',
  'gte' : '10',
  'lt' : '11',
  'lte' : '12',
  'between' : '13',
  'eqone' : '14',
}

// Convert to unsinged int
function ui(i){
  return i>=0?i:i+256;
}

// Take a raw byte array and return a utf8 string
function decode_utf8(a) {
  var string = "";
  var i = 0;
  var c = c1 = c2 = 0;

  while ( i < a.length ) {
    c = ui(a[i]);
    if (c < 128) {
      string += String.fromCharCode(c);
      i++;
    }
    else if((c > 191) && (c < 224)) {
      c2 = ui(a[i+1]);
      string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
      i += 2;
    }
    else {
      c2 = ui(a[i+1]);
      c3 = ui(a[i+2]);
      string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
      i += 3;
    }
  }
  return string;
}


// Take a utf8 string and return a raw array
function encode_utf8(s) {
  var a=[];
  for (var n=0; n< s.length; n++) {
    var c=s.charCodeAt(n);
    if (c<128) {
      a.push(c);
    }
    else if ((c>127)&&(c<2048)) {
      a.push( (c>>6) | 192);
      a.push( (c&63) | 128);
    }
    else {
      a.push( (c>>12) | 224);
      a.push( ((c>>6) & 63) | 128);
      a.push( (c&63) | 128);
    }
  }
  return a;
}

// Convert a 4 byte array into a 32-bit int
function unpackInt(si) {
  return (ui(si[0])*256*256*256)+(ui(si[1])*256*256)+(ui(si[2])*256)+ui(si[3]);
}

// Convert an int into a 4 byte array
function packInt(i) {
  return [Math.floor(i/(256*3))&0xff, Math.floor(i/(256*2))&0xff, Math.floor(i/256)&0xff, i%256];
}


function pprint(s) {
  for (var i=0; i<s.length; i++) {
    if (s[i]<32) {puts(s[i]+' : ');}
    else {puts(s[i]+' : '+String.fromCharCode(s[i]));}
  }
}

function formatNone(commandName, commandArgs, argCount, opts) {
  var cmd=[0xC8].concat(commandCode[commandName]);
  return cmd;
}

function formatSingle(commandName, commandArgs, argCount, opts) {
  var d=encode_utf8(commandArgs[0]);
  var cmd=[0xC8].concat(commandCode[commandName]).concat(packInt(d.length)).concat(d);
  return cmd;
}

function formatInt(commandName, commandArgs, argCount, opts) {
  var k=encode_utf8(commandArgs[0]);
  var i=packInt(commandArgs[1]);
  var cmd=[0xC8].concat(commandCode[commandName]).concat(packInt(k.length)).concat(i).concat(k);
  return cmd;
}

function formatMisc(commandName, commandArgs, argCount, opts) {
  var cmdName=encode_utf8(commandName);
  var cmdArgs=[];
  var cmdCount=0;
  for (var i=0; i<argCount; i++) {
    if (typeof commandArgs[i]=='string') {
      var d=encode_utf8(commandArgs[i]);
      cmdArgs = cmdArgs.concat(packInt(d.length)).concat(d);
      cmdCount++;
    } else {
      // Deal with an array of strings
      for (var j=0; j<commandArgs[i].length; j++) {
	var d=encode_utf8(commandArgs[i][j]);
	cmdArgs = cmdArgs.concat(packInt(d.length)).concat(d);
	cmdCount++;
      }
    }
  }
  var cmd=[0xC8].concat(commandCode.misc).concat(packInt(cmdName.length)).concat(packInt(opts || 0)).concat(packInt(cmdCount)).concat(cmdName).concat(cmdArgs);
  return cmd;
}


function responseNone(data) {
  if (data[0]!=0) return [null, 1, 'Tyrant Error : '+data[0]];
  return [0, 1, null];
}

function responseInt(data) {
  if (data[0]!=0) return [null, 1, 'Tyrant Error : '+data[0]];
  if (data.length<5) return [null, -1, null];
  var rlen=unpackInt(data.slice(1, 5));
  return [rlen, 5, null];
}

function responseSingle(data) {
  if (data[0]!=0) return [null, 1, 'Tyrant Error : '+data[0]];
  if (data.length<5) return [null, -1, null];
  var rlen=unpackInt(data.slice(1, 5));
  if (data.length<(rlen+5)) return [null, -1, null];
  return [decode_utf8(data.slice(5, rlen+5)), rlen+5, null];
}

function responseMisc(data) {
  if (data[0]!=0) return [null, 5, 'Tyrant Error : '+data[0]];
  if (data.length<9) return [null, -1, null];
  var r=[];
  var c=1;
  var resultCount=unpackInt(data.slice(c, c+=4));
  for (var i=0; i<resultCount; i++) {
    var rlen=unpackInt(data.slice(c, c+=4));
    if (data.length<(c+rlen)) return ['', -1, null];
    r.push(decode_utf8(data.slice(c, c+=rlen)));
  }
  return [ r, c, null];
}


function createCommandSender(commandName) {
  return function() {
    if (conn.readyState != 'open') {
      throw "connection is not open";
    }

    var callback = null;
    var numArgs = arguments.length;

    if (typeof(arguments[arguments.length-1])=='function') {
      callback = arguments[arguments.length-1];
      numArgs=arguments.length-1;
    }

    var cmd;

   if (commands[commandName]) {
      cmd = commands[commandName][0](commandName, arguments, numArgs);
    } else {
      throw 'unknown command '+commandName;
    }

    callbacks.push( { cb:callback, cmd:commandName });
    conn.send(cmd, "raw");
  }
}


function createQuery(query) {
  return function() {
    var name = arguments[0];
    var expr = arguments[1];
    return 'addcond'+String.fromCharCode(0)+name+String.fromCharCode(0)+queries[query]+String.fromCharCode(0)+expr;
  }
}

for (var commandName in commands) {
  exports[commandName] = createCommandSender(commandName);
}

for (var query in queries) {
  exports[query] = createQuery(query);
}

exports.sort = function(name, direction, numerical) {
  var d;
  if (numerical) {
    d = direction=='asc' ? '2' : '3';
  } else {
    d = direction=='asc' ? '0' : '1';
  }
  return 'setorder'+String.fromCharCode(0)+name+String.fromCharCode(0)+d;
}

exports.limit = function(max, skip) {
  if (max==null) max=-1;
  if (skip==null) skip=-1;
  return 'setlimit'+String.fromCharCode(0)+max+String.fromCharCode(0)+skip;
}


// Helper function to take name,value array and return a dictionary
exports.dict = function (r) {
  var d={};
  for (var i=0; i<r.length; i+=2) {
    d[r[i]]=r[i+1];
  }
  return d;
}



conn.onReceive = function(data) {
  //puts('Received: '+data.length+', response : '+response.length);
  //pprint(data);
  response=response.concat(data);
  var offset=0;
  while (callbacks[0] && (offset>=0) && (response.length>0)) {
    var resultHandler=commands[callbacks[0].cmd][1];
    var resultData = resultHandler(response);
    var result = resultData[0];
    offset = resultData[1];
    var err = resultData[2];
    if (offset>=0) {
      response=response.slice(offset);
    }
    if ( offset>=0 || result || err ) {
      var callback = callbacks.shift();
      if (callback && callback.cb) {
	callback.cb(result, err);
      }
    }
  }
}


exports.quit = function() {
  if (conn.readyState != "open")
    throw "connection is not open";

  //conn.send('quit' + CRLF);
  conn.close();
}

conn.onConnect = function() {
  conn.setEncoding("raw");
}

conn.onDisconnect = function(hadError) {
  if (hadError)
    throw "disconnected from Tyrant server in error";
}

