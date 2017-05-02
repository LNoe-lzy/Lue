import Lue from '../Lue';
import config from '../config';
import _ from '../util';


export default {
    /**
     * 当if所依赖的data值发生改变的时候触发
     * 
     * @param {Boolean} value 
     */
    update(value) {
        if (value) {
            // 挂载子实例
            if (!this.inserted) {
                if (!this.childVM) {
                    this.childVM = new Lue({
                        el: this.el
                    });
                }

                this.childVM.$before(this.ref);
                this.inserted = true;
            }
        } else {
            // 卸载子实例
            if (this.inserted) {
                this.childVM.$remove();
                this.inserted = false;
            }
        }
    },

    bind() {
        let el = this.el;
        this.ref = document.createComment(`${config.prefix}if`);

        // 在原来节点之后插入占位置，及注释节点
        _.dom.after(this.ref, el);
        // 删除原来节点
        _.dom.remove(el);

        this.inserted = false;
    },


    /**
     * 将l-if指令下的节点集合当作是一个子Lue实例来对待
     * 
     */
    build() {
        this.childVM = new Lue({
            el: this.el
        });
    }
}