// const express = require('express');
import express from 'express'
import cors from 'cors';
import path from 'path';
import hbs from 'hbs';


import router from '../routers/product.routes';
import Invoice from './invoice';

class Server {
    constructor() {
        this.app = express();
        this.app.use(express.static(path.join(__dirname, 'public')));
        this.port = process.env.PORT;
        this.middleware();
        this.routes();
    }

    middleware() {
        this.app.use(cors());
        this.app.use(router);
    }

    routes() {

        this.app.get('/', (req, res) => {
            res.render(path.join('home'));
        });

    }

    listen() {
        this.app.listen(this.port)
    }
}

export default Server;