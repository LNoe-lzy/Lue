import Watcher from './Watcher';

export default class Directive {
    constructor(type, el, vm, descriptor) {
        this.type = type;
        this.el = el;
        this.vm = vm;
        this.expression = descriptor.expression;
        this.attr = 'nodeValue';

        this._initDef();

        this._bind();

        // this.update();
    }

    /**
     * 根据指令调用其对应的update
     * 
     * @memberOf Directive
     */
    _initDef() {
        let def = this.vm.$options.directives[this.type];
        this.update = def.update;
    }

    _bind() {
        if (!this.expression) {
            return;
        }

        this._watcher = new Watcher(
            this.vm,
            this.expression,
            this._update,
            this,
        );

        this.update();

    }

    _update() {
        this.update();
    }
}