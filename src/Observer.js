import Event from './Event';

export default class Observer {
    constructor(data) {
        this.data = data;
        this.eventHub = new Event();
        this._walk(data);
    }

    _walk(data) {
        let val;
        for (let key in data) {
            if (data.hasOwnProperty(key)) {
                val = data[key];
                if (typeof val === 'object') {
                    // 如果是对象，则递归创建新的observer对象，并保存parent对象
                    let obj = new Observer(val);
                    obj.parent = {
                        key,
                        obj: this
                    };
                }
                this._convert(key, val);
            }
        }
    }

    _convert(key, val) {
        let that = this;
        Object.defineProperty(this.data, key, {
            enumerable: true,
            configurable: true,
            get() {
                // 监听computed或其他属性的访问
                if (Observer.emitGet) {
                    that._notify('get', key);
                }
                return val;
            },
            set(newval) {
                if (val === newval) {
                    return;
                }
                val = newval;
                that._notify('set', key, newval);
                if (typeof newval === 'object') {
                    new Observer(val);
                }
            }
        });
    }

    _notify(e, path, val) {
        // 执行事件
        this.eventHub.emit(e, path, val);
        // 事件传播
        let parent = this.parent;
        if (!parent) {
            return;
        }
        let parentKey = parent.key;
        let parentPath = `${parentKey}.${path}`
        // 递归传播
        let obj = parent.obj;
        obj._notify(e, parentPath, val);
    }

    watch(e, handler) {
        this.eventHub.on(e, handler);
    }
}

Observer.emitGet = false;