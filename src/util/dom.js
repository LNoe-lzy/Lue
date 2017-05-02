import config from '../config';

export default {
    before(el, target) {
        target.parentNode.insertBefore(el, target);
    },
    after(el, target) {
        if (target.nextSibling) {
            target.nextSibling.parentNode.insertBefore(el, target.nextSibling);
        } else {
            target.parentNode.appendChild(el);
        }
    },
    remove(el) {
        el.parentNode.removeChild(el);
    },
    attr(node, attr) {
        attr = config.prefix + attr;
        let val = node.getAttribute(attr);
        if (val) {
            node.removeAttribute(attr);
        }
        return val;
    }
}