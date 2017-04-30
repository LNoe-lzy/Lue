export default class Directive {
    constructor(type, el, vm, expression) {
        this.type = type;
        this.el = el;
        this.vm = vm;
        this.expression = expression;
        this.attr = 'nodeValue';

        this.update();
    }

    update() {
        // 深度遍历expression, 获取所需要的属性值
        let data = this.vm.$data;
        let expression = this.expression;
        let exps = expression.split('.');
        let currentAttr;
        for (let i = 0; i < exps.length; i++) {
            if (data[exps[i]]) {
                currentAttr = data[exps[i]];
            } else {
                currentAttr = currentAttr[exps[i]];
            }
        }
        this.el[this.attr] = currentAttr;
    }
}