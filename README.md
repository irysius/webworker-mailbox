# Demo
To build:

    $ npm install
    $ node-tsc.cmd -b worker
    $ node-tsc.cmd -b browser

Mess around with the demo by hosting the folder as a site (using something like `http-server`).

By default, pressing execute will cause an error.

# Host
    // 1. Import the host side of the solution.

    // 2. Create a mailbox with a specific worker in mind.
    let mailbox = Mailbox('js/worker.js');

    // 3. Send a message via the mailbox, and (if the web worker is setup correctly,) retreive the response via a Promise.
    mailbox.send({ filter: 3 }).then(result => {
        // result will be the final response from the web worker
    });

    // 4. To assist the web worker with host-only activies, you may supply a hash of MailboxHandlers

    // 4a. Create the handler hash
    let handlers = {
        // handler key names should match the web worker side.
        ajax: function (options) {
            return fetch(options); // return values can be a Promise
            // throwing an Error is currently not supported.
        }
    };

    // 4b. When instantiating a Mailbox, pass it the handler hash
    let mailbox = Mailbox('js/worker.js', handlers);
    // When your web workers asks the hosts for help, the handlers will then kick in.

# Web Worker

    // 1. Import the web worker side of the solution
    importScripts('mailbox-worker.js');

    // 2. Put your main logic within the `logic` function
    logic(function (hostMessage) {
        // do something with the message sent from the host.
        return { result: 'ok' }; // return values can be a Promise
        // throwing an Error will propagate the Error's stack.
    });

    // 3. If your web worker requires access to host-only capabilities, use the Mailbox

    // 3a. Group concerns with a type
    let ajax = Mailbox('ajax');

    // 3b. Group mailboxes into a hash.
    let mailboxes = {
        // mailbox names should match the host side.
        ajax: ajax
    };

    // 3c. Pass the mailboxes to logic's 2nd parameter so it can automatically react to additional message sent from the host.
    logic(function (hostMessage) {
        // You may now use mailboxes in here and expect responses back from the host.
        return mailboxes.ajax.send(options).then(result => {
            // result will a response from the host (assuming things are setup correctly)
            return result;
        });

    }, mailboxes);

