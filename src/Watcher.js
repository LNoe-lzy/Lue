import Batcher from './Batcher';
import Observer from './Observer';

// watcher 标识
let uid = 0;

let batcher = new Batcher();


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
        this.id = ++uid;
        this.vm = vm;
        this.expression = expression;
        this.callback = callback;
        this.context = context || vm;
        this.deps = Object.create(null);
        this.getter = this.compileGetter(expression);
        this.initDeps(expression);
    }

    /**
     * 初始化依赖
     * 
     * @param {any} path 
     * 
     * @memberOf Watcher
     */
    initDeps(path) {
        this.addDep(path);
        this.value = this.get();
    }

    /**
     * 根据路径获取binding对象
     * 
     * @param {any} path 
     * 
     * @memberOf Watcher
     */
    addDep(path) {
        let vm = this.vm;
        let deps = this.deps;
        if (deps[path]) {
            return;
        }
        deps[path] = true;
        let binding = vm._getBinding(path) || vm._createBinding(path);
        binding._addSub(this);
    }


    boforeGet() {
        Observer.emitGet = true;
        this.vm._activeWatcher = this;

    }

    get() {
        this.boforeGet();
        let value = this.getter.call(this.vm, this.vm.$data);
        this.afterGet();
        return value;
    }

    afterGet() {
        Observer.emitGet = false;
        this.vm._activeWatcher = null;
    }

    /**
     * 当数据改变的时候触发的是notify
     * 当数据冒泡到顶层的时候触发的是updateBinding
     * 
     * @memberOf Watcher
     */
    update() {
        // this.callback.call(this.context, arguments);
        batcher.push(this);
    }

    run() {
        let value = this.get();
        let oldValue = this.value;
        this.value = value;
        this.callback.call(this.context, value, oldValue);
    }

    /**
     * user.age
     * 
     * @param {String} path 
     * 
     * @memberOf Watcher
     */
    compileGetter(path) {
        path = path.split('.');
        let boby = 'if (o != null';
        let pathString = 'o';
        let key;
        for (let i = 0; i < path.length - 1; i++) {
            key = path[i];
            pathString += `.${key}`;
            boby += ` && ${pathString} != null`;
        }
        key = path[path.length - 1];
        pathString += `.${key}`;
        boby += `) return ${pathString}`;
        return new Function('o', boby);
    }
}