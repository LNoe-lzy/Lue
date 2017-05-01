import Lue from './Lue';

let app = new Lue({
    el: '#app',
    data: {
        user: {
            name: 'lzy',
            age: 21
        }
    },
    computed: {
        info () {
            return `name: ${this.user.name}, age: ${this.user.age}`;
        }
    }
});


app.$data.user.name = 'lzyssds';

window.app = app;

console.log(window.app);