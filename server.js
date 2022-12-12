const http = require('http');
const Koa = require('koa');
const Router = require('koa-router');
const cors = require('koa2-cors');
const koaBody = require('koa-body');
const fs = require('fs');

const app = new Koa();
app.use(cors());
app.use(koaBody({json: true}));

let nextId = 1;
const services = [
    {id: nextId++, name: 'Замена стекла', price: 21000, content: 'Стекло оригинал от Apple'},
    {id: nextId++, name: 'Замена дисплея', price: 25000, content: 'Дисплей оригинал от Foxconn'},
    {id: nextId++, name: 'Замена аккумулятора', price: 4000, content: 'Новый на 4000 mAh'},
    {id: nextId++, name: 'Замена микрофона', price: 2500, content: 'Оригинальный от Apple'},
];

const skills = [
    {id: 1, name: "React"},
    {id: 2, name: "Redux"},
    {id: 3, name: "Redux Thunk"},
    {id: 4, name: "RxJS"},
    {id: 5, name: "Redux Observable"},
];

const news = JSON.parse(fs.readFileSync('./news.json')); 
const limit = 5;


const router = new Router();

function fortune(ctx, body = null, status = 200) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (Math.random() > 0.65) {
                ctx.response.status = status;
                ctx.response.body = body;
                resolve();
                return;
            }

            reject(new Error('Something bad happened'));
        }, 3 * 1000);
    })
}

router.get('/api/services', async (ctx, next) => {
    const body = services.map(o => ({id: o.id, name: o.name, price: o.price}))
    return fortune(ctx, body);
});
router.get('/api/services/:id', async (ctx, next) => {
    const id = Number(ctx.params.id);
    const index = services.findIndex(o => o.id === id);
    if (index === -1) {
        const status = 404;
        return fortune(ctx, null, status);
    }
    const body = services[index];
    return fortune(ctx, body);
});

let isEven = true;
router.get('/api/search', async (ctx, next) => {
    if (Math.random() > 0.75) {
        ctx.response.status = 500;
        return;
    }
    const { q } = ctx.request.query;
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const response = skills.filter(o =>
                o.name.toLowerCase().startsWith(q.toLowerCase()));
            ctx.response.body = response;
            resolve();
        }, isEven ? 1 * 1000 : 5 * 1000);
        isEven = !isEven;
    });
});


router.get('/api/news', async (ctx, next) => {
    const {lastSeenId} = ctx.request.query;
    if (lastSeenId === undefined) {
        return fortune(ctx, news.slice(0, limit)); 
    }

    const id = Number(lastSeenId);
    if (Number.isNaN(id)) {
        const status = 400;
        return fortune(ctx, null, status);
    }

    const index = news.findIndex(o => o.id === id);
    if (index === -1) {
        const status = 404;
        return fortune(ctx, null, status);
    }

    const body = news.slice(index + 1, index + 1 + limit);
    return fortune(ctx, body);
});

app.use(router.routes());
app.use(router.allowedMethods());

const port = process.env.PORT || 7071;
const server = http.createServer(app.callback());
server.listen(port, () => console.log(`server started http://localhost:${port}`))