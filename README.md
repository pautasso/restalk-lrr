# RESTalk Long Running Operation
RESTalk Long Running Operation Polling with Node.js

A node.js example which will call any slow URL (configurable in the code) and allow clients to observe the progress of the call using the Long Running Operation Polling Conversation pattern described here:

http://restalk-patterns.org/long-running-operation-polling.html


## How to use

1. Configure the getTarget() function with the URL of the slow operation to invoke
2. node index.js

## How to test

The code is preconfigured to use the slow URL from a separate server found inside test/wait.js

