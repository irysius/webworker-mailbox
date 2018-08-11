interface HostMessage<T> {
    id: string;
    type: string;
    value: T;
    error: any;
}
interface MailMessage<R> {
    id: string;
    value: R;
    error: any;
}
interface WorkerMailbox<S = any, R = any> {
    send(value: S): Promise<R>;
    receive(message: MailMessage<R>): void;
}
interface WorkerMailboxes {
    [type: string]: WorkerMailbox;
}
interface AsyncBegins {
    [id: string]: Promise<any>;
}
interface AsyncEnds {
    [id: string]: (value: any, error: any) => void;
}

const MAIN_REQUEST = '_';
function Mailbox<S = any, R = any>(type: string): WorkerMailbox<S, R> {
    let id = 0;
    let begins: AsyncBegins = {};
    let ends: AsyncEnds = {};
    function nextId() {
        return `${type}-${id++}`;
    }
    function send(value: S) {
        let id = nextId();
        postMessage({ type, id, value });
        begins[id] = new Promise((resolve, reject) => {
            ends[id] = (data, error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(data);
                }
            }    
        });
        return begins[id];
    }
    function receive(message: MailMessage<R>) {
        let { id, value, error } = message;
        ends[id](value, error);
        delete begins[id];
        delete ends[id];
    }

    return {
        send, receive
    };
}

function logic(body: Function, mailboxes?: WorkerMailboxes) {
    onmessage = function (e) {
        let { type, ...payload } = e.data as HostMessage<any>;
        switch (type) {
            case MAIN_REQUEST: {
                Promise.resolve(body(payload.value)).then(value => {
                    postMessage({ type: MAIN_REQUEST, value });
                }).catch(error => {
                    postMessage({ type: MAIN_REQUEST, error: error.stack });
                });
            } break;
            default: {
                if (mailboxes && mailboxes[type]) {
                    mailboxes[type].receive(payload);
                }
            } break;
        }
    };
}