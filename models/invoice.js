import express from "express";

class Invoice {
    constructor() {
        this.app = express();

        this.routes();
    }

    routes() {
        this.app.get('/facturacion', (req, res) => {
            res.render(path.join('facturacion'), billingProps);
        })
        this.app.get('/facturar', (req, res) => {
            res.render(path.join('./views/Facturacion/facturar'), billingProps);
        })

        this.app.get('/creacion-cliente', (req, res) => {
            res.render(path.join('./views/Facturacion/creacion-cliente'), billingProps);
        })

        this.app.get('/creacion-vendedor', (req, res) => {
            res.render(path.join('./views/Facturacion/creacion-vendedor'), billingProps);
        })

        this.app.get('/creacion-ordenes', (req, res) => {
            res.render(path.join('./views/Facturacion/creacion-ordenes'), billingProps);
        })
    }
}

export default Invoice;