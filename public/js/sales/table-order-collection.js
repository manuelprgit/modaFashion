import { showAlertBanner } from "../helpers/alertBanner.js";
import showConfirmationModal from "../helpers/confirmationModal.js";
import { mainFunctions } from "../main.js";
import loaderController from '../helpers/loader.js';

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
});

(async () => {
    //Id
    let contentCard = document.getElementById('contentCard');
    let btnClose = document.getElementById('btnClose');
    let searchCollectionOrder = document.getElementById('searchCollectionOrder');
    let collectionOrderModal = document.getElementById('collectionOrderModal');
    let saveCollectionOrder = document.getElementById('saveCollectionOrder');

    let templateMenuTable = document.getElementById('templateMenuTable');

    let dataOrders = await mainFunctions.getDataFromAPI('orders');
    function tbodyProductOrder(dataProduct) {
        let div;
        let listRowProduct = [];
        for (let key in dataProduct) {
            let dataRowProduct = dataProduct[key];
            div = `
                        <div class="tr">
                             <div class="td text-center">${dataRowProduct.productId}</div>
                             <div class="td text-center">${dataRowProduct.productBarCode}</div>
                             <div class="td">
                                <a href="${dataRowProduct.linkURL}" target="_blank">   
                                    ${dataRowProduct.productName}
                                </a>
                            </div>
                             <div class="td text-center">${dataRowProduct.productQuantity}</div>
                             <div class="td text-right">${formatter.format(dataRowProduct.price)}</div>
                             <div class="td text-right">${formatter.format(dataRowProduct.total)}</div>
                        </div>
            `;
            listRowProduct.push(div);
        }
        return listRowProduct.join('');
    }
    for (let key in dataOrders) {
        let dataRowOrders = dataOrders[key];
        let colorStatus;
        if (dataRowOrders.orderStatus.orderStatusId == 1) colorStatus = 'proceso'
        if (dataRowOrders.orderStatus.orderStatusId == 2) colorStatus = 'pedido'
        if (dataRowOrders.orderStatus.orderStatusId == 3) colorStatus = 'recibido'
        let div = `
                <div class="row" data-id="${dataRowOrders.orderId}">
                    <div class="colum">
                        <div class="head text-center">Seleccionar</div>
                        <div class="body text-center">
                            <input class="check" type="checkbox">
                        </div>
                    </div>
                    <div class="colum">
                         <div class="head text-center">No.</div>
                         <div class="body text-center" order-id="${dataRowOrders.orderId}">${dataRowOrders.orderId}</div>
                    </div>
                    <div class="colum">
                        <div class="head text-center">Código cliente</div>
                        <div class="body text-center">${dataRowOrders.idCustomer}</div>
                    </div>
                    <div class="colum">
                        <div class="head">Nombre</div>
                        <div class="body">${dataRowOrders.nameCustomer + ' ' + dataRowOrders.lastNameCustomer}</div>
                    </div>
                    <div class="colum">
                        <div class="head text-center">Estatus</div>
                        <div class="body text-center ${colorStatus}">${(dataRowOrders.orderStatus) ? dataRowOrders.orderStatus.description : ''}</div>
                    </div>
                    <div class="colum">
                        <div class="head text-right">Monto</div>
                        <div class="body text-right" data-amount="${dataRowOrders.amount}">${formatter.format(dataRowOrders.amount)}</div>
                    </div>
                    <div class="menu text-center">
                        <i data-id="${dataRowOrders.orderId}" class="fa-solid fa-ellipsis"></i>
                    </div>
                    <div class="down">
                        <i class="open-card fa-solid fa-chevron-down"></i>
                    </div>

                    <div class="table-orders">
                        <div class="thead">
                            <div class="tr">
                                <div class="th text-center">Código</div>
                                <div class="th text-center">Código de barra</div>
                                <div class="th">Descripción</div>
                                <div class="th text-center">Cantidad</div>
                                <div class="th text-right">Precio</div>
                                <div class="th text-right">Total</div>
                            </div>
                        </div>
                        <div class="tbody">
                            ${tbodyProductOrder(dataRowOrders.orderDetail)}
                        </div>
                </div>
                </div>
                    `;
        contentCard.insertAdjacentHTML('beforeend', div);
    }

    async function changeStatusOrders(method, obj, url, message) {
        let resPost = await mainFunctions.sendDataByRequest(method, obj, url);
        if (resPost.status >= 400) {
            showAlertBanner('warning', `No fue posible ${message} el documento`);
        } else {
            showAlertBanner('success', `El documento fue ${message} correctamente`);
            location.assign('ordenes-creadas');
        }
    }

    searchCollectionOrder.addEventListener('click', e=>{
        mainFunctions.showModal(collectionOrderModal);
    })
    let orderStatusPosteo = '';
    document.addEventListener('click', async e => {
        if (e.target.matches('i.open-card')) {
            let dataId = e.target.closest('[data-id]').getAttribute('data-id');
            contentCard.querySelectorAll(`div.row[data-id]`).forEach(row => row.style.height = '100px');
            contentCard.querySelectorAll(`div.row i.open-card`).forEach(ico => ico.style.rotate = '0deg');
            contentCard.querySelector(`div.row[data-id="${dataId}"]`).style.height = '300px';
            e.target.style.rotate = '180deg';
        }
        if (e.target.matches('.row .menu i')) {
            contentCard.querySelectorAll(`div.row[data-id]`).forEach(row => {
                row.style.height = '100px'
            });
            contentCard.querySelectorAll('.content-menu-table').forEach(menu => menu.remove());
            let clone = templateMenuTable.cloneNode(true);
            clone = clone.content.firstElementChild;
            e.target.insertAdjacentElement('beforeend', clone);
            e.target.parentElement.parentElement.style.height = '300px';
            e.target.querySelector('.content-menu-table').setAttribute('data-id', e.target.getAttribute('data-id'))
            let id = e.target.getAttribute('data-id');
            let orderById = await mainFunctions.getDataFromAPI(`orders/${id}`)
            let textStatus = document.getElementById('textStatus');

            if (orderById.orderStatusId == 1) {
                orderStatusPosteo = 'posteo';
                textStatus.textContent = 'Pedir';
            }
            else if (orderById.orderStatusId == 2) {
                orderStatusPosteo = 'recieve';
                textStatus.textContent = 'Recibir';
            }
            else if (orderById.orderStatusId == 3) {
                orderStatusPosteo = 'given';
                textStatus.textContent = 'Entregar';
            }

        } else {
            contentCard.querySelectorAll('.content-menu-table').forEach(menu => menu.remove());
        }
        if (e.target.closest('#openDocument')) {
            let id = e.target.closest('[data-id]').getAttribute('data-id');
            localStorage.setItem('orderId', id)
            location.assign('creacion-ordenes');
        }
        if (e.target.closest('#postDocument')) {
            let resConfirm = await showConfirmationModal('¿Desea continuar?', 'Precione aceptar para seguir el proceso');
            if (resConfirm) {
                let id = e.target.closest('[data-id]').getAttribute('data-id');
                let dataObj = {
                    documentId: Number(id)
                }
                let url;
                let message = '';
                if (orderStatusPosteo == 'posteo') {
                    url = 'orders/post'
                    message = 'Pedir'
                }
                else if (orderStatusPosteo == 'recieve') {
                    url = 'orders/recieve'
                    message = 'Recibir'
                }
                else if (orderStatusPosteo == 'given') {
                    let affectAccountReceivable = await showConfirmationModal('Guardar pagado', 'Si este pedido ya está pagado presione aceptar de lo contrario presione cancelar y de este modo el cliente puede pagar mas adelante si no ha entendido este proceso por favor llamar al departamento de tecnología, muchas gracias y pase buen resto del día')
                    url = 'orders/given'
                    message = 'Entregar';
                    dataObj = {
                        documentId: Number(id),
                        "killReceivable": affectAccountReceivable
                    }
                }
                changeStatusOrders('POST', dataObj, url, 'Postear', message)
            }
        }
        if (e.target.closest('#decline')) {
            let resConfirm = await showConfirmationModal('Rechazar', 'Presione aceptar para rechazar el pedido');
            if (resConfirm) {
                let id = e.target.closest('[data-id]').getAttribute('data-id');
                let dataObj = {
                    documentId: Number(id)
                }
                let resPost = await mainFunctions.sendDataByRequest('POST', dataObj, 'orders/reject');
                console.log(resPost.status);
                if (resPost.status >= 400) {
                    showAlertBanner('warning', 'No fue posible rechazar el pedido');
                } else {
                    showAlertBanner('success', 'El documento fue rechazado correctamente');
                    location.assign('ordenes-creadas');
                }
            }
        }
        if(e.target.closest('#closeModalUser')){
            mainFunctions.hideModal(collectionOrderModal);
        }
    })

    let listAllOrder = [];
    let ordersCollectedDetails = {};
    saveCollectionOrder.addEventListener('click',async e=>{
        contentCard.querySelectorAll('div[data-id]').forEach(tr=>{
            let check = tr.querySelector('input');
            let objDateOrder = {
                "collectionId": tr.querySelector('div[order-id]').getAttribute('order-id'),
                "totalAmount": tr.querySelector('div[data-amount]').getAttribute('data-amount'),
            }

            if(check.checked) listAllOrder.push(objDateOrder);

            ordersCollectedDetails = {
                "date": new Date().toISOString().substring(0,10),
                "collectionDetail": listAllOrder
            }
        })
        console.log(ordersCollectedDetails);
        
        if(listAllOrder.length > 0){
            let resConfirm = await showConfirmationModal('Guardar', 'Presione aceptar para guardar esta colección de pedidos');
            if(resConfirm){
                showAlertBanner('success', 'Colección de ordenes guardad correctamente');
            }
        }else{
            showAlertBanner('warning', 'Debe seleccionar al menos una orden');
        } 
    })
    btnClose.addEventListener('click', e => location.assign('creacion-ordenes'))
})()