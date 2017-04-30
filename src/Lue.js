import Event from './Event';
import Observer from './Observer';
import Directive from './Directive';

export default class Lue {
    constructor(options) {
        this._init(options);
    }
    _init(options) {
        // 初始化元数据
        this.$options = options;
        this.$el = document.querySelector(options.el);
        this.$data = options.data;

        this._directives = [];

        // 事件监听
        this.$observer = new Observer(this.$data);
        this.$observer.eventHub.on('set', this._updateDirective.bind(this));

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
        // 讲指令操作存入_directives数组
        this._directives.push(
            new Directive(type, el, this, expression)
        );
    }

    _updateDirective() {
        let path = arguments[1];
        this._directives.forEach((directive) => {
            if (directive.expression !== path) {
                return;
            }
            directive.update();
        });
    }
}
