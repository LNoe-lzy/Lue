import Watcher from './Watcher';

export default class Directive {
    constructor(type, el, vm, expression) {
        this.type = type;
        this.el = el;
        this.vm = vm;
        this.expression = expression;
        this.attr = 'nodeValue';

        this._bind();

        this.update();
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

    update() {
        // 深度遍历expression, 获取所需要的属性值
        let exps = this.expression.split('.');
        let val = this.vm.$data;
        exps.forEach((exp) => {
            val = val[exp];
        })
        this.el[this.attr] = val;
    }
}