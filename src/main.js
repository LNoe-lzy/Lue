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


app.$watch('user.name', function () {
    console.log('watcher监测到了user.name');
})

app.$data.user.name = 'lzys';