import express from 'express'
const app = express();
import dotenv from 'dotenv'
import cors from 'cors';
import open from 'open';
dotenv.config();
const port = process.env.PORT;
import path from 'path';
import hbs from 'hbs';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
import router from './routers/route.routes.js';
app.use(router);

app.set('view engine', 'hbs');
app.set('views', path.join('public', 'html'));

hbs.registerPartials(path.join(__dirname, 'public', 'html', 'partials'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render(path.join('home'));
})

//#region Facturacion

let billingProps = {
  mainTitle: "Ventas",
  icon: "fa-solid fa-store"
} 

app.get('/facturacion', (req, res) => {
  res.render(path.join('facturacion'),billingProps);
})

app.get('/facturar', (req, res) => {
  res.render(path.join('./views/Facturacion/facturar'),billingProps);
})

app.get('/creacion-cliente', (req, res) => {
  res.render(path.join('./views/Facturacion/creacion-cliente'),billingProps);
})

app.get('/creacion-vendedor', (req, res) => {
  res.render(path.join('./views/Facturacion/creacion-vendedor'),billingProps);
})

app.get('/creacion-ordenes', (req, res) => {
  res.render(path.join('./views/Facturacion/creacion-ordenes'),billingProps);
})
//#endregion Facturacion

//#region Inventario

let inventoryProps = {
  mainTitle: "Inventario",
  icon: "fa-solid fa-paste"
} 

app.get('/inventario', (req, res) => {
  res.render(path.join('inventario'),inventoryProps);
})

app.get('/creacion-articulos', (req, res) => {
  res.render(path.join('./views/Inventario/creacion-articulos'),inventoryProps);
})

app.get('/categoria', (req, res) => {
  res.render(path.join('./views/Inventario/categoria'),inventoryProps);
})

app.get('/familia', (req, res) => {
  res.render(path.join('./views/Inventario/familia'),inventoryProps);
})
//#endregion Inventario

//#region Compras

let salesProps = {
  mainTitle: "Compras",
  icon: "fa-solid fa-file-invoice-dollar"
} 

app.get('/compras', (req, res) => {
  res.render(path.join('compras'),salesProps);
})

app.get('/mantenimiento-suplidor', (req, res) => {
  res.render(path.join('./views/Compras/mantenimiento-suplidor'),salesProps);
})
app.get('/ordenes-creadas', (req, res) => {
  res.render(path.join('./views/Facturacion/ordenes-creadas'),salesProps);
})
//#endregion Compras

app.listen(port, () => {
  console.log(`listening on http://localhost:${port}`);
})
