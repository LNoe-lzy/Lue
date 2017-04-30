export default class Event {
    constructor() {
        this.events = {};
    }
    on(e, handler) {
        if (!this.events.hasOwnProperty(e)) {
            this.events[e] = [];
        }
        this.events[e].push(handler);
    }
    off(e) {
        for (let key in this.events) {
            if (this.events.hasOwnProperty(key) && key === e) {
                delete this.events[e];
                e
            }
        }
    }
    emit(e, ...args) {
        if (this.events.hasOwnProperty(e)) {
            this.events[e].forEach((item) => {
                item(...args);
            });
        }
    }
}