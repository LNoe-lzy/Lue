import _ from '../util';

export default {

    /**
     * 插入Lue实例
     * 
     * @param {any} target 
     */
    $before(target) {

        _.dom.before(this.$el, target);
    },

    $remove() {
        if (this.$el.parentNode) {
            _.dom.remove(this.$el);
        }
    }

}