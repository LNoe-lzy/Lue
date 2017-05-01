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

console.log(app);


app.$watch('user.name', function () {
    console.log('watcher监测到了user.name');
})

app.$data.user.name = 'lzyssds';

window.app = app;