export default class Batcher {
    constructor() {
        this.reset();
    }

    /**
     * 重制当前的时间队列
     * 
     * @memberOf Batcher
     */
    reset() {
        this.has = {};
        this.queue = [];
        this.waiting = false;
    }

    /**
     * 将Watcher添加到事件队列
     * 
     * @param {Wataher} job 
     * 
     * @memberOf Batcher
     */
    push(job) {
        if (!this.has[job.id]) {
            this.queue.push(job);
            this.has[job.id] = job;
            if (!this.waiting) {
                this.waiting = true;
                // 将this.flush()方法异步执行，并不指定时间间隔推入到异步队列首位
                setTimeout(() => {
                    // 执行事件队列里头的函数
                    this.flush()
                });
            }
        }
    }

    flush() {
        this.queue.forEach((job) => {
            // job.callback.call(job.context);
            job.run();
        });

        this.reset();
    }
}