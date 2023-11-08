import { showAlertBanner } from "../helpers/alertBanner.js";
import showConfirmationModal from "../helpers/confirmationModal.js";
import { mainFunctions } from "../main.js";
import loaderController from '../helpers/loader.js';
(async () => {
    //Id
    let contentCard = document.getElementById('contentCard');
    let btnClose = document.getElementById('btnClose');

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
                             <div class="td">${dataRowProduct.productDetail}</div>
                             <div class="td text-center">${dataRowProduct.productQuantity}</div>
                             <div class="td text-right">${dataRowProduct.price}</div>
                             <div class="td text-right">${dataRowProduct.total}</div>
                        </div>
            `;
            listRowProduct.push(div);
        }
        return listRowProduct.join('');
    }
    for (let key in dataOrders) {
        let dataRowOrders = dataOrders[key];
        let div = `
                <div class="row" data-id="${dataRowOrders.orderId}">
                    <div class="colum">
                        <div class="head text-center">No.</div>
                        <div class="body text-center">${dataRowOrders.orderId}</div>
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
                        <div class="body text-center">${(dataRowOrders.orderStatus)?dataRowOrders.orderStatus.description:''}</div>
                    </div>
                    <div class="colum">
                        <div class="head text-right">Monto</div>
                        <div class="body text-right">${dataRowOrders.amount}</div>
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


    document.addEventListener('click',async e => {
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
        } else {
            contentCard.querySelectorAll('.content-menu-table').forEach(menu => menu.remove());
        }
        if (e.target.closest('#postDocument')) {
            let resConfirm = await showConfirmationModal('Postear', 'Precione aceptar para postear el documento');
            if(resConfirm){
                let id = e.target.closest('[data-id]').getAttribute('data-id');
                let dataObj = {
                    documentId: Number(id)
                }
                console.log(dataObj);
                let resPost = await mainFunctions.sendDataByRequest('POST', dataObj, 'api/orders/post');
                console.log(resPost.status);
                if(resPost.status >= 400){
                    showAlertBanner('warning', 'No fue posible postear el documento');
                }else{
                    showAlertBanner('success', 'El documento fue posteado correctamente');
                }
            }
        }
    })

    btnClose.addEventListener('click', e => location.assign('creacion-ordenes'))
})()