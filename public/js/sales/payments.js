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
    const savePayment = document.getElementById('savePayment');
    
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
        dateBill.value = dataCustomer.creationDate.substring(0, 10);

        tbodyInvoices.textContent = '';
        for(let key in dataCustomer.invoices){
            let dataRow = dataCustomer.invoices[key];
            let row = document.createElement('div');
            row.classList.add('tr')
            row.setAttribute('data-id', dataRow.documentId)
            let td = `
                        <div class="td text-center" bill-id="${dataRow.documentId}">${dataRow.documentId}</div>
                        <div class="td text-center" bill-date="${dataRow.date}">${dataRow.date.substring(0, 10)}</div>
                        <div class="td text-right" bill-amount="${dataRow.amount}">${dataRow.amount}</div>
                        <div class="td text-right">${dataRow.receivable}</div>
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

    document.addEventListener('click', async e => {
        if(e.target.closest('#tbodyUser')){
            let id = e.target.closest('[data-id]').getAttribute('data-id');
            fillUserInput(id);
            mainFunctions.hideModal(userModal);
        }
    })

    searchUser.addEventListener('click', async e => {
        let dataUser = await mainFunctions.getDataFromAPI('customer');
        tbodyUser.textContent = '';
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
    savePayment.addEventListener('click', async e => {
        let listObjDataPost = [];
        tbodyInvoices.querySelectorAll('.tr[data-id]').forEach(tr => {
            let objDataProduct = {
                'documentId': Number(tr.getAttribute('data-id')),
                'date': tr.querySelector('.td[bill-date]').getAttribute('bill-date'),
                "amount": Number(tr.querySelector('.td input').value),
            }
            listObjDataPost.push(objDataProduct)
        })
        console.log(listObjDataPost);
        let resValidate = await mainFunctions.validateInputsRequired(userForm);
        if (!resValidate) {
                let resConfirm = await showConfirmationModal('Guardar', 'Presione aceptar para registrar el pago');
                if (resConfirm) {
    
                    let objetSend = {
                        'customerId': Number(customerCode.value),
                        'invoices': listObjDataPost
                    }
    
                    let resPost = await mainFunctions.sendDataByRequest('POST', objetSend, 'receivable');
                    console.log(resPost);
                    if (resPost.status >= 400) showAlertBanner('Warning', 'No fue posible realizar el pago');
                    else {
                        showAlertBanner('success', 'Pago realizado correctamente');
                    }
                }
        }else showAlertBanner('warning', 'Faltan parámetros');
    })

    btnSearch.addEventListener('click', e => location.assign('ordenes-creadas'))

})()