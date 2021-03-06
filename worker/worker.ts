declare function importScripts(...urls: string[]): void;
importScripts('mailbox-worker.js');

logic(function (source) {
    let func = new Function(`"use strict";\r\n${source}`).bind(null);
    return func();
    // or return Promise.resolve(func());
});