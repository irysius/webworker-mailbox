declare function importScripts(...urls: string[]): void;
importScripts('mailbox-worker.js');

logic(function (source) {
    let func = new Function(source).bind(null);
    return Promise.resolve(func());
});