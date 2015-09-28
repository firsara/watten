var tasks = {
  run: function(){
    if (platform === 'mac') {
      execute((process.env.HOME || process.env.USERPROFILE) + '/cache/nwjs/0.12.3/osx64/nwjs.app/Contents/MacOS/nwjs .');
    } else if (platform === 'win') {
      execute('"' + (process.env.HOME || process.env.USERPROFILE) + '/cache/nwjs/0.12.3/win64/nw.exe" .');
    }
  },
  debug: function(){
    if (platform === 'mac') {
      execute((process.env.HOME || process.env.USERPROFILE) + '/cache/nwjs/0.12.3/osx64/nwjs.app/Contents/MacOS/nwjs --enable-logging  --remote-debugging-port=9222 .');
    } else if (platform === 'win') {
      execute('"' + (process.env.HOME || process.env.USERPROFILE) + '/cache/nwjs/0.12.3/win64/nw.exe" --enable-logging  --remote-debugging-port=9222 .');
    }
  },
};



var exec = require('child_process').exec;

function execute(task, opts){
  console.log(task);

  var child = exec(task, opts);

  child.stdout.on('data', function(data){
    data = data.toString();
    if (data.replace(/\s/g, '').length > 0) {
      console.log(data);
    }
  });

  child.stderr.on('data', function(data){
    data = data.toString();
    if (data.replace(/\s/g, '').length > 0) {
      console.log(data);
    }
  });
}

var platform = process.platform;
platform = /^win/.test(platform)? 'win' : /^darwin/.test(platform)? 'mac' : 'linux' + (process.arch == 'ia32' ? '32' : '64');

var args = process.argv.slice(2);

if (args.length === 0) {
  args.push('all');
}

args.forEach(function(val, index, array){
  if (tasks[val]) {
    tasks[val]();
  } else {
    console.log('task ' + val + ' not found');
  }
});
