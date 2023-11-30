import os from 'os';
import express from 'express'
import dotenv from 'dotenv'
dotenv.config();
import cors from 'cors'; 
import path from 'path';
import hbs from 'hbs';
import { fileURLToPath } from 'url';
// import Server from './models/server.js'
import router from './routers/route.routes.js';


const app = express();
const port = process.env.PORT;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(router);

app.set('view engine', 'hbs');
app.set('views', path.join('public', 'html'));

hbs.registerPartials(path.join(__dirname, 'public', 'html', 'partials'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render(path.join('home'));
})

let billingProps = {
  mainTitle: "Ventas",
  icon: "fa-solid fa-store"
} 
//#region Facturacion

app.get('/facturacion', (req, res) => {
  res.render(path.join('facturacion'),billingProps);
})

app.get('/facturar', (req, res) => {
  res.render(path.join('./views/Facturacion/facturar'),billingProps);
})

app.get('/creacion-cliente', (req, res) => {
  res.render(path.join('./views/Facturacion/creacion-cliente'),{
    mainTitle: "Clientes",
    icon: "fa-solid fa-user"
  });
})

app.get('/ventas', (req, res) => {
  res.render(path.join('./views/Facturacion/ventas'),{
    mainTitle: "Ventas",
    icon: "fa-solid fa-coins"
  } );
})

app.get('/creacion-vendedor', (req, res) => {
  res.render(path.join('./views/Facturacion/creacion-vendedor'),billingProps);
})

app.get('/payments', (req, res) => {
  res.render(path.join('./views/Facturacion/payments'),{
    mainTitle: "Pagos",
    icon: "fa-solid fa-money-bill-wave"
  });
})

app.get('/creacion-ordenes', (req, res) => {
  res.render(path.join('./views/Facturacion/creacion-ordenes'),{
    mainTitle: "Ordenes",
    icon: "fa-solid fa-basket-shopping"
  } );
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
  res.render(path.join('./views/Inventario/creacion-articulos'),{
    mainTitle: "Creación de articulos",
    icon: "fa-solid fa-box"
  } );
})

app.get('/consulta-inventario', (req, res) => {
  res.render(path.join('./views/Inventario/consulta-inventario'),{
    mainTitle: "Inventario",
    icon: "fa-solid fa-boxes-stacked"
  } );
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
app.get('/table-order-collection', (req, res) => {
  res.render(path.join('./views/Facturacion/table-order-collection'),salesProps);
})

//#endregion Compras

// //TODO: MACADDRESS
// const networkInterfaces = os.networkInterfaces();

// let macAddress = 
//   (networkInterfaces['Ethernet'][1].mac) 
//     ? networkInterfaces['Ethernet'][1].mac 
//     : networkInterfaces['Wi-Fi'][1].mac; 
// console.log({macAddress});
// //TODO: MACADDRESS

// const server = new Server();

app.listen(port, () => {
  console.log(`listening on http://localhost:${port}`);
})

