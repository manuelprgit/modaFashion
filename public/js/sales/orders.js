import { showAlertBanner } from "../helpers/alertBanner.js";
import showConfirmationModal from "../helpers/confirmationModal.js";
import { mainFunctions } from "../main.js";
import loaderController from '../helpers/loader.js';
(() => {
    loaderController.disabled();
    //Id de inputs
    const ordersNumber = document.getElementById('ordersNumber');
    const customerCode = document.getElementById('customerCode');
    const customerName = document.getElementById('customerName');
    const customerLastName = document.getElementById('customerLastName');
    const identifyCustomer = document.getElementById('identifyCustomer');
    const pendingDebt = document.getElementById('pendingDebt');

    //Id
    const productsModal = document.getElementById('productsModal');
    const btnSearch = document.getElementById('btnSearch');
    const tbodyProduct = document.getElementById('tbodyProduct');
    const tbodyOrders = document.getElementById('tbodyOrders');
    const btnProductModal = document.getElementById('btnProductModal');


    customerCode.addEventListener('change', async e => {
        let dataCustomer = await mainFunctions.getDataFromAPI(`customer/${customerCode.value}`);

        customerName.value = dataCustomer.nameCustomer
        customerLastName.value = dataCustomer.lastNameCustomer
        identifyCustomer.value = dataCustomer.customerIdentification
        pendingDebt.value = dataCustomer.idCustomer
        console.log(dataCustomer)
    })

    document.addEventListener('click', async e => {
        if (e.target.matches('#btnSearch')) {
            let dataProduct = await mainFunctions.getDataFromAPI('product');
            for (let key in dataProduct) {
                let dataRow = dataProduct[key];
                let row = document.createElement('div');
                row.classList.add('tr');
                row.setAttribute('data-id', dataRow.productId)
                let td = `
                            <div class="td text-center"><input data-id="${dataRow.productId}" class="input-check" type="checkbox"></div>
                            <div class="td text-center">${dataRow.productId}</div>
                            <div class="td text-center">${dataRow.productBarCode}</div>
                            <div class="td">${dataRow.productName}</div>
                            <div class="td text-center">${dataRow.productCategory}</div>
                            <div class="td text-right">
                                <p><span>$Us </span> ${dataRow.productPrice} <br /> <span>$RD </span> 906,300.00</p>
                            </div>
                            <div class="td text-right">${dataRow.productCost}</div>
                            `;
                row.insertAdjacentHTML('beforeend', td);
                tbodyProduct.insertAdjacentElement('beforeend', row)
            }

            mainFunctions.showModal(productsModal)
        }
        if (e.target.closest('#closeModal')) {
            mainFunctions.hideModal(productsModal)
        }
    })

    btnProductModal.addEventListener('click', async e => {
        let listProductCodeSelected = [];
        let allInputCheck = tbodyProduct.querySelectorAll('input[data-id]');
        allInputCheck.forEach(input => {
            if (input.checked) {
                let productCode = input.getAttribute('data-id');
                listProductCodeSelected.push(Number(productCode))
            }
        })

        let dataProduct = await mainFunctions.getDataFromAPI('product');
        for (let key in dataProduct) {
            if (listProductCodeSelected.includes(dataProduct[key].productId)) {
                let allProduct = dataProduct[key];
                let row = document.createElement('div');
                row.classList.add('tr');
                row.setAttribute('data-id', allProduct.productId);
                let td = `
                            <div class="td text-center">${allProduct.productId}</div>
                            <div class="td">${allProduct.productBarCode}</div>
                            <div class="td">${allProduct.productName}</div>
                            <div class="td"><input type="text" value="${allProduct.productCategory}"></div>
                            <div class="td"><input type="text" value="${allProduct.productPrice}"></div>
                            <div class="td">${allProduct.productPrice * 4}</div>
                            <div class="td"><img src="../../../src/img/trash-regular.png" alt=""></div>
                            `;
                row.insertAdjacentHTML('beforeend', td);
                tbodyOrders.insertAdjacentElement('beforeend', row);
            }
        }
        mainFunctions.hideModal(productsModal)
    })

})()