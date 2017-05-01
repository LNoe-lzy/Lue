import Event from './Event';
import Observer from './Observer';
import Directive from './Directive';
import Binding from './Binding';
import Watcher from './Watcher';

// 引入指令库
import directives from './directives';

export default class Lue {
    constructor(options) {
        this._init(options);
    }
    _init(options) {
        // 初始化元数据
        this.$options = options;
        this.$data = options.data || {};

        // 绑定指令到$options
        Object.assign(this.$options, {
            directives
        });

        // 事件监听
        this.$observer = new Observer(this.$data);

        // 初始化binding
        this._initBinding();

        this._directives = [];

        // 挂载
        this._mount(options.el);

        this.$el = document.querySelector(options.el);
    }
    _mount(el) {
        this._initElement(el)
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
        if (typeof el !== 'string') {
            return;
        }
        let sel = el;
        this.$el = el = document.querySelector(el);
        if (!el) {
            console.warn(`can not fount element: ${sel}`);
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
        if (node.hasChildNodes) {
            Array.from(node.childNodes).forEach((child) => {
                this._compileNode(child);
            });
        }
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

    _bindDirective(type, node, value) {
        let descriptors = [];
        descriptors.push({
            expression: value
        });

        let dirs = this._directives;
        descriptors.forEach((descriptor) => {
            dirs.push(
                new Directive(type, node, this, descriptor)
            )
        });
    }

    _createBinding(path) {
        let rb = this._rootBinding;
        let pathArr = path.split('.');
        for (let i = 0; i < pathArr.length; i++) {
            let key = pathArr[i];
            rb = rb[key] = rb._addChild(key);
        }

        return rb;
    }

    _initBinding() {
        this._rootBinding = new Binding();

        // 在数据冒泡顶层注册监听事件
        this.$observer.eventHub.on('set', this._updateBinding.bind(this));

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

        let subs = rb._subs;
        subs.forEach((watcher) => {
            watcher.callback.call(watcher);
        });
    }

    $watch(expression, callback) {
        new Watcher(this, expression, callback, this);
    }
}