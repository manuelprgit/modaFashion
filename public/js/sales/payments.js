import { showAlertBanner } from "../helpers/alertBanner.js";
import showConfirmationModal from "../helpers/confirmationModal.js";
import { mainFunctions } from "../main.js";
import loaderController from '../helpers/loader.js';

(async () => {
    loaderController.disabled();
    //Id de inputs
    const ordersNumber = document.getElementById('ordersNumber');
    const customerCode = document.getElementById('customerCode');
    const customerName = document.getElementById('customerName');
    const amount = document.getElementById('amount');
    const dateBill = document.getElementById('dateBill');
    const pendingDebt = document.getElementById('pendingDebt');
    const saveOrder = document.getElementById('saveOrder');

    //Id
    const productsModal = document.getElementById('productsModal');
    const btnSearch = document.getElementById('btnSearch');
    const tbodyInvoices = document.getElementById('tbodyInvoices');
    const tbodyOrders = document.getElementById('tbodyOrders');
    const btnProductModal = document.getElementById('btnProductModal');
    const userForm = document.getElementById('userForm');
    const searchUser = document.getElementById('searchUser');
    const userModal = document.getElementById('userModal');
    const tbodyUser = document.getElementById('tbodyUser');


    //Variables

    async function fillUserInput(id){
        let dataCustomer = await mainFunctions.getDataFromAPI(`receivable/invoices/${id}`);
        console.log(dataCustomer);
        customerCode.value = '';
        customerCode.value = dataCustomer.idCustomer
        customerName.value = dataCustomer.nameCustomer
        amount.value = dataCustomer.lastNameCustomer
        dateBill.value = dataCustomer.creationDate.substring(0, 10);

        for(let key in dataCustomer.invoices){
            let dataRow = dataCustomer.invoices[key];
            let row = document.createElement('div');
            row.setAttribute('data-id', dataRow.documentId)
            let td = `
                        <div class="td text-center"><input data-id="${dataRow.documentId}" class="input-check" type="checkbox"></div>
                        <div class="td text-center">${dataRow.date}</div>
                        <div class="td text-center">${dataRow.amount}</div>
                        <div class="td">${dataRow.receivable}</div>
                        <div class="td text-center">
                            <input type"number">
                        </div>
                        `;
            row.insertAdjacentHTML('beforeend', td);
            tbodyInvoices.insertAdjacentElement('beforeend', row)
        }
    }
    customerCode.addEventListener('change', async e => {
        fillUserInput(customerCode.value)
    })

    // document.addEventListener('click', async e => {
    //     if (e.target.matches('#btnSearch')) {
    //         let dataProduct = await mainFunctions.getDataFromAPI('product');
    //         for (let key in dataProduct) {
    //             let dataRow = dataProduct[key];
    //             let row = document.createElement('div');
    //             row.classList.add('tr');
    //             row.setAttribute('data-id', dataRow.productId)
    //             let td = `
    //                         <div class="td text-center"><input data-id="${dataRow.productId}" class="input-check" type="checkbox"></div>
    //                         <div class="td text-center">${dataRow.productId}</div>
    //                         <div class="td text-center">${dataRow.productBarCode}</div>
    //                         <div class="td">${dataRow.productName}</div>
    //                         <div class="td text-center">${dataRow.productCategory}</div>
    //                         <div class="td text-right">
    //                             <p><span>$Us </span> ${dataRow.productPrice} <br /> <span>$RD </span> 906,300.00</p>
    //                         </div>
    //                         <div class="td text-right">${dataRow.productCost}</div>
    //                         `;
    //             row.insertAdjacentHTML('beforeend', td);
    //             tbodyProduct.insertAdjacentElement('beforeend', row)
    //         }

    //         mainFunctions.showModal(productsModal)
    //     }
    //     if (e.target.closest('#closeModal')) {
    //         mainFunctions.hideModal(productsModal)
    //     }
    //     if (e.target.closest('#closeModalUser')) {
    //         mainFunctions.hideModal(userModal)
    //     }
    //     if(e.target.closest('#tbodyUser')){
    //         let id = e.target.closest('[data-id]').getAttribute('data-id');
    //         fillUserInput(id);
    //         mainFunctions.hideModal(userModal);
    //     }
    // })

    searchUser.addEventListener('click', async e => {
        let dataUser = await mainFunctions.getDataFromAPI('customer');
        for (let key in dataUser) {
            let rowDataUser = dataUser[key];
            let row = document.createElement('div');
            row.classList.add('tr');
            row.classList.add('cursor-pointer');
            row.setAttribute('data-id', rowDataUser.idCustomer);
            let td = `
                                <div class="td text-center">${rowDataUser.idCustomer}</div>
                                <div class="td text-center">${rowDataUser.customerIdentification}</div>
                                <div class="td">${rowDataUser.nameCustomer}</div>
                                <div class="td">${rowDataUser.lastNameCustomer}</div>
                                <div class="td text-right">${rowDataUser.statusCustomer}</div>
                                <div class="td text-center ">${rowDataUser.customerIdentification}</div>
                                `;
            row.insertAdjacentHTML('beforeend', td);
            tbodyUser.insertAdjacentElement('beforeend', row);
            mainFunctions.showModal(userModal);
        }
    })
    saveOrder.addEventListener('click', async e => {
        let listObjDataPost = [];
        tbodyOrders.querySelectorAll('.tr[data-id]').forEach(tr => {
            let objDataProduct = {
                'productId': Number(tr.getAttribute('data-id')),
                'orderId': 0,
                "orderDetailId": 0,
                'productQuantity': Number(tr.querySelector('input.quantity').value),
                'price': Number(tr.querySelector('input.price').value),
            }
            listObjDataPost.push(objDataProduct)
        })
        let resValidate = await mainFunctions.validateInputsRequired(userForm);
        if (!resValidate) {
            if(listObjDataPost.length > 0){
                let resConfirm = await showConfirmationModal('Guardar', 'Precione aceptar para registrar el pedido');
                if (resConfirm) {
    
                    let objetSend = {
                        'customerId': Number(customerCode.value),
                        'orderId': 0,
                        "orderStatusId": 1,
                        'orderDetails': listObjDataPost
                    }
    
                    let resPost = await mainFunctions.sendDataByRequest('POST', objetSend, 'orders');
                    console.log(resPost);
                    if (resPost.status >= 400) showAlertBanner('Warning', 'No fue posible agregar esta orden');
                    else {
                        showAlertBanner('success', 'Orden agregada correctamente');
                    }
                }
            }else showAlertBanner('warning', 'Debe agregar al menos un articulo');
        }else showAlertBanner('warning', 'Faltan parámetros');
    })

    btnSearch.addEventListener('click', e => location.assign('ordenes-creadas'))

})()