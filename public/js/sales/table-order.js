import { showAlertBanner } from "../helpers/alertBanner.js";
import showConfirmationModal from "../helpers/confirmationModal.js";
import { mainFunctions } from "../main.js";
import loaderController from '../helpers/loader.js';
(async() => {
    //Id
    let contentCard = document.getElementById('contentCard');


    let dataOrders = await mainFunctions.getDataFromAPI('orders');
    console.log(dataOrders);
    
    function tbodyProductOrder(dataProduct){
        let div;
        let listRowProduct = [];
        for(let key in dataProduct){
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
        console.log(listRowProduct.join(''));
        return listRowProduct.join('');
    }
    for(let key in dataOrders){
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
                        <div class="body text-center">En proceso</div>
                    </div>
                    <div class="colum">
                        <div class="head text-right">Monto</div>
                        <div class="body text-right">${dataRowOrders.amount}</div>
                    </div>
                    <div class="menu text-center">
                        <i class="fa-solid fa-ellipsis"></i>
                    </div>
                    <div class="dowm">
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


    document.addEventListener('click', e => {
        if (e.target.matches('i.open-card')) {
            let dataId = e.target.closest('[data-id]').getAttribute('data-id');
            console.log(dataId);
            contentCard.querySelectorAll(`div.row[data-id]`).forEach(row=>row.style.height = '100px');
            contentCard.querySelectorAll(`div.row i.open-card`).forEach(ico=>ico.style.rotate = '0deg');
            contentCard.querySelector(`div.row[data-id="${dataId}"]`).style.height = '300px';
            e.target.style.rotate = '180deg';
        }
    })
})()