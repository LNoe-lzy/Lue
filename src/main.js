import Lue from './Lue';

let app = new Lue({
    el: '#app',
    data: {
        user: {
            name: 'lzy',
            age: 21
        }
    }
});

console.log(app);

app.$data.user.name = 'lzys';