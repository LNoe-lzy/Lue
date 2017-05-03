import Event from './Event';
import Observer from './Observer';
import Directive from './Directive';
import Binding from './Binding';
import Watcher from './Watcher';

import _ from './util/index';

import config from './config';


// 引入api
import domAPI from './api/dom';

// 引入指令库
import directives from './directives';


const priorityDirs = [
    'if'
];

export default class Lue {
    constructor(options) {
        this._init(options);

    }
    _init(options) {

        // 初始化原始数据
        this.$options = options;
        this.$parent = options.parent;
        this.$children = [];

        // 判断是顶层lue实例还是子lue实例
        if (this.$parent) {
            this.$parent.$children.push(this);
            this.$data = options.parent.$data;
        } else {
            this.$data = options.data || {};
        }

        // 挂载api
        this.$before = domAPI.$before;
        this.$remove = domAPI.$remove;

        // 存储遍历DOM过程中生成的当前的Watcher
        this._activeWatcher = null;

        // 绑定指令到$options
        Object.assign(this.$options, {
            directives
        });

        // 事件监听
        if (this.$parent) {
            this.$observer = this.$parent.$observer;
        } else {
            this.$observer = new Observer(this.$data);
        }

        // 初始化计算属性
        this._initComputed();

        // 初始化binding
        this._initBinding();

        this._directives = [];

        // 挂载
        this._mount(options.el);

        // this.$el = document.querySelector(options.el);
    }
    _mount(el) {
        this._initElement(el);
        this._compile();
    }

    /**
     * 初始化dom节点，如果不存在抛出警告
     * 
     * @param {String} el 
     * @returns 
     * 
     * @memberOf Lue
     */
    _initElement(el) {
        if (typeof el === 'string') {
            let sel = el;
            this.$el = el = document.querySelector(el);
            if (!el) {
                console.warn(`can not fount element: ${sel}`);
            }
        } else {
            this.$el = el;
        }
    }

    /**
     * 解析dom
     * 
     * @memberOf Lue
     */
    _compile() {
        this._compileNode(this.$el);
    }

    /**
     * 根据nodeType调用不同的方法
     * 
     * @param {any} node 
     * @returns 
     * 
     * @memberOf Lue
     */
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

    /**
     * 渲染普通节点
     * 
     * @param {Object} node 
     * 
     * @memberOf Lue
     */
    _compileElement(node) {
        let hasAttributes = node.hasAttributes();

        // 如果含有show指令跳出节点渲染
        if (hasAttributes && this._checkPriorityDirs(node)) {
            return;
        }
        if (node.hasChildNodes()) {
            Array.from(node.childNodes).forEach((child) => {
                this._compileNode(child);
            });
        }
    }

    /**
     * 获取指令值并绑定Directive
     * 
     * @param {Object} node 
     * 
     * @memberOf Lue
     */
    _checkPriorityDirs(node) {
        priorityDirs.forEach((dir) => {
            let value = _.dom.attr(node, dir);

            // 监测到l-指令后动态植入bind函数
            let bind = function () {
                let el = this.el;
                this.ref = document.createComment(`${config.prefix}if`);
                // 在原来节点之后插入占位置，及注释节点
                _.dom.after(this.ref, el);
                // 删除原来节点
                _.dom.remove(el);

                this.inserted = false;
            }
            if (value) {
                this._bindDirective(dir, node, value, bind);
                return;
            }
        })
    }

    /**
     * 渲染文本节点
     * 
     * @param {any} node 
     * @returns 
     * 
     * @memberOf Lue
     */
    _compileText(node) {
        let nodeValue = node.nodeValue;

        let tokens = this._parse(nodeValue);

        if (!tokens) {
            return;
        }

        tokens.forEach((token) => {
            let value = token.value;
            if (token.tag) {
                let textNode = document.createTextNode('');
                node.parentNode.insertBefore(textNode, node);
                this._bindDirective('text', textNode, value);
            } else {
                // 处理普通文本节点
                let textNode = document.createTextNode(value);
                node.parentNode.insertBefore(textNode, node);
            }
        });

        // 替换节点内容之后需要删除原来的文本节点
        node.parentNode.removeChild(node);

    }

    /**
     * 正则匹配节点
     * 
     * @param {String} text 
     * 
     * @memberOf Lue
     */
    _parse(text) {
        if (text.trim() === '') {
            return false;
        }
        let tokens = [];
        let pattern = /\{\{(.+?)\}\}/g;
        let match, index, value;
        let lastIndex = 0;

        // 处理包含指令的文本节点 
        while (match = pattern.exec(text)) {
            index = match.index;
            // 取得指定以外的文本
            if (index > lastIndex) {
                tokens.push({
                    value: text.slice(lastIndex, index)
                });
            }
            index = match.index;
            value = match[1];
            tokens.push({
                value,
                tag: true
            });
            lastIndex = match[0].length + index;
        }

        // 处理不含指令的纯文本节点
        if (lastIndex < text.length - 1) {
            tokens.push({
                value: text.slice(lastIndex)
            });
        }

        return tokens;
    }

    /**
     * 初始化computed属性
     * 
     * 
     * @memberOf Lue
     */
    _initComputed() {
        let computed = this.$options.computed;
        if (!computed) {
            return;
        }
        Object.keys(computed).forEach((key) => {
            let def = computed[key];
            if (typeof def === 'function') {
                // 将def设为对应的元素的getter
                def = {
                    get: def
                };
                def.enumerable = true;
                def.configurable = true;
                // 绑定到data
                Object.defineProperty(this.$data, key, def);
            }
        });
    }

    _bindDirective(type, node, value, bind) {
        let descriptors = [];
        descriptors.push({
            expression: value
        });

        let dirs = this._directives;
        descriptors.forEach((descriptor) => {
            dirs.push(
                new Directive(type, node, this, descriptor, bind)
            )
        });
    }

    _initBinding() {
        this._rootBinding = new Binding();

        // 在数据冒泡顶层注册监听事件
        this.$observer.eventHub.on('set', this._updateBinding.bind(this));

        // 获数据顶层取依赖监听 
        this.$observer.eventHub.on('get', this._collectDep.bind(this));

    }

    /**
     * 收集computed所需要的data
     * 
     * @param {String} event 
     * @param {String} path 
     * 
     * @memberOf Lue
     */
    _collectDep(path) {
        let watcher = this._activeWatcher;
        if (watcher) {
            watcher.addDep(path);
        }
    }

    /**
     * 当数据改变的时候，找到其对应的watcher然后执行其callback
     * 
     * @memberOf Lue
     */
    _updateBinding() {
        let path = arguments[0];
        let pathArr = path.split('.');
        let rb = this._rootBinding;

        // 找到最里层对象的subs数组
        pathArr.forEach((key) => {
            rb = rb[key];
        });

        if (!rb) {
            return;
        }

        let subs = rb._subs;
        subs.forEach((watcher) => {
            watcher.callback.call(watcher);
        });
    }

    /**
     * 根据path获取Binding
     * 
     * @param {any} path 
     * 
     * @memberOf Lue
     */
    _getBinding(path) {
        let rb = this._rootBinding;
        let pathArr = path.split('.');
        for (let i = 0; i < pathArr.length; i++) {
            let key = pathArr[i];
            rb = rb[key];
            if (!rb) {
                return false;
            }
        }
        return rb;
    }

    /**
     * 创建Binding
     * 
     * @param {any} path 
     * @returns 
     * 
     * @memberOf Lue
     */
    _createBinding(path) {
        let rb = this._rootBinding;
        let pathArr = path.split('.');
        for (let i = 0; i < pathArr.length; i++) {
            let key = pathArr[i];
            rb = rb[key] = rb._addChild(key);
        }

        return rb;
    }

    $watch(expression, callback) {
        new Watcher(this, expression, callback, this);
    }
}