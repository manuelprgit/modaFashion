import { showAlertBanner } from "../helpers/alertBanner.js";
import showConfirmationModal from "../helpers/confirmationModal.js";
import { mainFunctions } from "../main.js";
import loaderController from '../helpers/loader.js';

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
});

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
    const panelContent = document.getElementById('panelContent');
    

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
                        <div class="td text-right" bill-amount="${dataRow.amount}">${formatter.format(dataRow.amount)}</div>
                        <div class="td text-right">${formatter.format(dataRow.receivable)}</div>
                        <div class="td text-center">
                            <input type="text" class="inputNumber">
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
        let amountTotal = 0;
        tbodyInvoices.querySelectorAll('.tr[data-id]').forEach(tr => {
            let objDataProduct = {
                'documentId': Number(tr.getAttribute('data-id')),
                'date': tr.querySelector('.td[bill-date]').getAttribute('bill-date'),
                "amount": Number(tr.querySelector('.td input').value),
            }
            amountTotal += Number(tr.querySelector('.td input').value)
            listObjDataPost.push(objDataProduct)
        })
        let resValidate = await mainFunctions.validateInputsRequired(panelContent);
        if(amountTotal == amount.value){
            if (!resValidate) {
                    let resConfirm = await showConfirmationModal('Guardar', 'Presione aceptar para registrar el pago');
                    if (resConfirm) {
        
                        let objetSend = {
                            'customerId': Number(customerCode.value),
                            'invoices': listObjDataPost
                        }
                        console.log(objetSend);
                        let resPost = await mainFunctions.sendDataByRequest('POST', objetSend, 'receivable');
                        console.log(resPost);
                        if (resPost.status >= 400) showAlertBanner('Warning', 'No fue posible realizar el pago');
                        else {
                            mainFunctions.clearAllInputs(panelContent)
                            tbodyInvoices.textContent = '';
                            showAlertBanner('success', 'Pago realizado correctamente');
                        }
                    }
            }else showAlertBanner('warning', 'Faltan parámetros');
        }else showAlertBanner('warning', 'El monto debe ser igual a la suma de la facturas, verifique');
    })

    btnSearch.addEventListener('click', e => location.assign('ordenes-creadas'))

    document.addEventListener('input', e=>{
        if(e.target.matches('input.inputNumber')){
            if(Number(e.target.value) >= 0){
                e.target.value = Number(e.target.value);
                formatter.format(e.target.value)
            }else{
                e.target.value = e.target.value.substring(0, e.target.value.length - 1);
                formatter.format(e.target.value)
            }
        }
    })
})()