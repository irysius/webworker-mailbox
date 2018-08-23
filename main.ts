import { Mailbox } from './js/mailbox-host';

let btnExecute = document.querySelector('#execute');
let host = Mailbox('js/worker.js');

btnExecute.addEventListener('click', () => {
    host.send('return Object.keys(this).length', 5000).then(result => {
        console.log(result);
    }).catch(error => {
        console.error(error);
    });
});       