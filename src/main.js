class Event {
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

class Observer {
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
                return val;
            },
            set(newval) {
                console.log(`你设置了新值: ${newval}`);
                if (val === newval) {
                    return;
                }
                that._notify(key, val, newval)
                val = newval;
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
        // 递归传播
        let obj = parent.obj;
        obj._notify(e, path, val);
    }

    watch(e, handler) {
        this.eventHub.on(e, handler);
    }
}

class Lue {
    constructor(options) {
        this._init(options);
        this.$observer = new Observer(this.$data);
    }
    _init(options) {
        // 初始化元数据
        this.$options = options;
        this.$el = document.querySelector(options.el);
        this.$data = options.data;


        // 创建存储变量
        this.currentNodeList = [];
        this.fragment = document.createDocumentFragment();
        this.currentNodeList.push(this.fragment);

        // 挂载
        this._mount();
        // 替换原始dom
        this.$el.parentNode.replaceChild(this.fragment, this.$el);
        // 更新$el元素
        this.$el = document.querySelector(options.el);
    }
    _mount() {
        this._compile();
    }
    _compile() {
        this._compileNode(this.$el);
    }
    _compileNode(node) {
        let nodeType = node.nodeType;
        switch (nodeType) {
            case 1:
                this._compileElement(node);
                break;
            case 3:
                this._compileText(node);
                break;
            default:
                return;
        }
    }
    _compileElement(node) {
        let that = this;
        // 创建新节点
        let newNode = document.createElement(node.tagName);

        if (node.hasAttributes()) {
            Array.from(node.attributes).forEach((attr) => {
                newNode.setAttribute(attr.name, attr.value);
            });
        }

        // 获取准备替代的节点
        let currentNode = this.currentNodeList[this.currentNodeList.length - 1].appendChild(newNode);

        // 判断节点是否含有子节点
        if (node.hasChildNodes) {
            this.currentNodeList.push(currentNode);
            Array.from(node.childNodes).forEach((child) => {
                that._compileNode(child);
            });
        }

        this.currentNodeList.pop();

    }
    _compileText(node) {
        let nodeValue = node.nodeValue;

        let pattern = /\{\{(.+?)\}\}/g;
        let ret = nodeValue.match(pattern);
        if (!ret) {
            return;
        }
        ret.forEach((value) => {
            let property = value.replace(/[{}]/g, '');
            // 深度便利对象属性
            let pros = property.split('.');
            let val, curObj;
            for (let i = 0; i < pros.length; i++) {
                if (this.$data[pros[i]]) {
                    curObj = this.$data[pros[i]];
                }
                val = curObj[pros[i]];
            }
            nodeValue = nodeValue.replace(value, val);
        });

        this.currentNodeList[this.currentNodeList.length - 1].appendChild(document.createTextNode(nodeValue));

    }
}


let app = new Lue({
    el: '#app',
    data: {
        user: {
            name: 'lzy',
            age: 21
        }
    }
});

app.$data.user.age = '232';