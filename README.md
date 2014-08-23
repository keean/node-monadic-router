A simple proof of concept monadic router for Node.js using the ErrorCPS (continuation-passing-style) monad, to hide event callbacks in the monad sequencing. Also continuations are used to suspend workflows (the client state between submits), so that a chain of forms can be navigated using the back button safely, and any form resubmitted etc.

Note: the session management is rudimentary and only supports a single client, assigning a UID to each client is required to support suspending multiple workflows.
