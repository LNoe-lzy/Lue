import Watcher from './Watcher';
import config from './config';
import _ from './util';
import Lue from './Lue';

export default class Directive {
    constructor(type, el, vm, descriptor, bind) {
        this.type = type;
        this.el = el;
        this.vm = vm;
        this.expression = descriptor.expression;
        this.attr = 'nodeValue';

        this.bind = bind;

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

        // console.log(this.bind);

        // 执行初始化
        this.bind && this.bind();

        this._watcher = new Watcher(
            this.vm,
            this.expression,
            this._update,
            this,
        );

        this.update(this._watcher.value);

    }

    _update(value, oldValue) {
        this.update(value, oldValue);
    }
}