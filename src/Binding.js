export default class Binding {
    constructor() {
        this._subs = [];
    }

    _addChild(key) {
        return this[key] || new Binding();
    }

    /**
     * 将Watcher添加到subs
     * 
     * @param {Watcher} sub 
     * 
     * @memberOf Binding
     */
    _addSub(sub) {
        this._subs.push(sub);
    }
}