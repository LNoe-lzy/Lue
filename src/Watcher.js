/**
 * 当指令对应的数据发生变化的时候，执行更新DOM的update函数
 * 当$watch监听到数据发生改变的时候，执行回调函数
 * 
 * @export
 * @class Watcher
 */
export default class Watcher {
    /**
     * Creates an instance of Watcher.
     * @param {Bue} vm Lue实例
     * @param {String} expression 指令表达式
     * @param {Function} callback 回调函数
     * @param {Object} context 回调函数执行的上下文
     * 
     * @memberOf Watcher
     */
    constructor(vm, expression, callback, context) {
        this.vm = vm;
        this.expression = expression;
        this.callback = callback;
        this.context = context || vm;
    }

    addDep(path) {
        let binding = this.vm._createBinging(path);
        binding._addSub(this);
    }

    /**
     * 当数据改变的时候触发的是notify
     * 当数据冒泡到顶层的时候触发的是updateBinding
     * 
     * @memberOf Watcher
     */
    update() {
        this.callback.call(this.context, arguments);
    }
}