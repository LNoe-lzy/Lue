export default {
    update(value) {
        // let props = this.expression.split('.');
        // let val = this.vm.$data;
        // props.forEach((prop) => {
        //     val = val[prop];
        // });
        // this.el[this.attr] = val;
        // console.log(`更新了dom: ${this.expression}`);
        this.el[this.attr] = value;
    }
}