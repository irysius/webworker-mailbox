interface WorkerMessage<T> {
    id: string;
    type: string;
    value: T;
    error: any;
}
export interface HostMailbox<S = any, R = any> {
    send(value: S, wait?: number): Promise<R>;
}
export interface MailboxHandlers {
    [type: string]: (value: any) => any|undefined;
}
type AsyncEnd = (value: any, error: any) => void;

const MAIN_REQUEST = '_';
function Timeout(wait: number) {
    return new Promise<never>((resolve, reject) => {
        setTimeout(() => {
            reject(new Error(`Timeout of ${wait} ms has been reached.`));
        }, wait);
    });
}

export function Mailbox<S = any, R = any>(url: string, handlers?: MailboxHandlers): HostMailbox<S, R> {
    function send(value: S, wait: number = 10 * 1000) {
        let asyncEnd: AsyncEnd;
        let worker = new Worker(url);
        function receive<R = any>(ev: MessageEvent) {
            let { type, ...payload } = ev.data as WorkerMessage<R>;
            switch (type) {
                case MAIN_REQUEST: {
                    let { value, error } = payload;
                    asyncEnd(value, error);
                } break;
                default: {
                    if (handlers[type]) {
                        let { id, value } = payload;
                        let result = handlers[type](value);
                        if (typeof result !== 'undefined') {
                            Promise.resolve(result).then(value => {
                                worker.postMessage({ id, value, type });
                            });
                        }        
                    }
                } break;
            }
        }
        worker.onmessage = receive;
        worker.postMessage({ value, type: MAIN_REQUEST });
        
        let promise = new Promise<R>((resolve, reject) => {
            asyncEnd = (data, error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(data);
                }
            }    
        });
        return Promise.race([promise, Timeout(wait)]).finally(() => {
            worker.terminate();
        });
    }

    return { send };
}