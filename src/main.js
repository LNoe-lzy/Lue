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

app.$data.user.age = '232';