import Event from './Event';
import Observer from './Observer';
import Directive from './Directive';
import Binding from './Binding';

export default class Lue {
    constructor(options) {
        this._init(options);
    }
    _init(options) {
        // 初始化元数据
        this.$options = options;
        this.$el = document.querySelector(options.el);
        this.$data = options.data;

        // 事件监听
        this.$observer = new Observer(this.$data);


        // 初始化binding
        this._initBinding();

        this._directives = [];

        // 挂载
        this._mount();

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

        if (node.hasChildNodes) {
            Array.from(node.childNodes).forEach((child) => {
                this._compileNode(child);
            })
        }

    }
    _compileText(node) {
        let nodeValue = node.nodeValue;

        let pattern = /\{\{(.+?)\}\}/g;
        let ret = nodeValue.match(pattern);
        if (!ret) {
            return;
        }
        ret.forEach((value) => {
            let textNode = document.createTextNode('');
            node.parentNode.insertBefore(textNode, node);
            let property = value.replace(/[{}]/g, '');
            // console.log(property);
            this._bindDirective('text', textNode, property);
        });
        node.parentNode.removeChild(node);

    }

    _bindDirective(type, el, expression) {
        // 将指令操作存入_directives数组
        this._directives.push(
            new Directive(type, el, this, expression)
        );
    }

    createBinding(path) {
        let rb = this._rootBinding;
        let pathArr = path.split('.');

        for (let i = 0; i < pathArr; i++) {
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
        let path = arguments[1];
        console.log(path);
        let pathArr = path.split('.');
        let rb = this._rootBinding;
        pathArr.forEach((key) => {
            rb = rb[key];
        });
        let subs = rb._subs;
        subs.forEach((watcher) => {
            watcher.callback.call(watcher);
        });
    }
}