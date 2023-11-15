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
    const customerLastName = document.getElementById('customerLastName');
    const identifyCustomer = document.getElementById('identifyCustomer');
    const pendingDebt = document.getElementById('pendingDebt');
    const saveOrder = document.getElementById('saveOrder');
    const searchProduct = document.getElementById('searchProduct');
    
    //Id
    const productsModal = document.getElementById('productsModal');
    const btnSearch = document.getElementById('btnSearch');
    const tbodyProduct = document.getElementById('tbodyProduct');
    const tbodyOrders = document.getElementById('tbodyOrders');
    const btnProductModal = document.getElementById('btnProductModal');
    const userForm = document.getElementById('userForm');
    const searchUser = document.getElementById('searchUser');
    const userModal = document.getElementById('userModal');
    const tbodyUser = document.getElementById('tbodyUser');


    //Variables
    let orderId = localStorage.getItem('orderId');

    if (orderId) {
        let dataOrderCreated = await mainFunctions.getDataFromAPI(`orders/${orderId}`)
        ordersNumber.value = dataOrderCreated.orderId
        customerCode.value = dataOrderCreated.idCustomer
        customerName.value = dataOrderCreated.nameCustomer
        customerLastName.value = dataOrderCreated.lastNameCustomer
        identifyCustomer.value = dataOrderCreated.customerIdentification
        pendingDebt.value = dataOrderCreated.amount

        let allProduct;
        for (let key in dataOrderCreated.orderDetail) {
            allProduct = dataOrderCreated.orderDetail[key];
            let row = document.createElement('div');
            row.classList.add('tr');
            row.setAttribute('data-id', allProduct.productId);
            let td = `
                            <div class="td text-center">${allProduct.productId}</div>
                            <div class="td">${allProduct.productBarCode}</div>
                            <div class="td">${allProduct.productDetail}</div>
                            <div class="td text-center"><input type="text" class="quantity" value="${allProduct.productQuantity}"></div>
                            <div class="td text-right"><input type="text" class="price" value="${allProduct.price}"></div>
                            <div class="td text-right ">${Number(allProduct.productQuantity * allProduct.price)}</div>
                            <div class="td text-center"><img class="ico-delete" src="../../../src/img/trash-regular.png" alt=""></div>
                            `;
            row.insertAdjacentHTML('beforeend', td);
            tbodyOrders.insertAdjacentElement('beforeend', row);
        }

        localStorage.removeItem('orderId');
    }

    async function fillUserInput(id) {
        let dataCustomer = await mainFunctions.getDataFromAPI(`customer/${id}`);
        customerCode.value = '';
        customerCode.value = dataCustomer.idCustomer
        customerName.value = dataCustomer.nameCustomer
        customerLastName.value = dataCustomer.lastNameCustomer
        identifyCustomer.value = dataCustomer.customerIdentification
        pendingDebt.value = dataCustomer.receivable
    }
    customerCode.addEventListener('change', async e => {
        fillUserInput(customerCode.value)
    })

    function rendTableProductModal(dataAllProduct){
        tbodyProduct.textContent = '';
        for (let key in dataAllProduct) {
            let dataRow = dataAllProduct[key];
            let row = document.createElement('div');
            row.classList.add('tr');
            row.setAttribute('data-id', dataRow.productId)
            // <p><span>$Us </span> ${dataRow.productPrice} <br /> <span>$RD </span> 906,300.00</p>
            let td = `
                        <div class="td text-center"><input data-id="${dataRow.productId}" class="input-check" type="checkbox"></div>
                        <div class="td text-center">${dataRow.productId}</div>
                        <div class="td text-center">${dataRow.productBarCode}</div>
                        <div class="td">
                            <a href="${dataRow.linkURL}" target="_blank">
                                ${dataRow.productName}
                            </a>
                        </div>
                        <div class="td text-center">${dataRow.productCategory}</div>
                        <div class="td text-right">${formatter.format(dataRow.productPrice)}</div>
                        <div class="td text-right">${formatter.format(dataRow.productCost)}</div>
                        `;
            row.insertAdjacentHTML('beforeend', td);
            tbodyProduct.insertAdjacentElement('beforeend', row)
        }
    }
    let dataAllProduct;
    document.addEventListener('click', async e => {
        if (e.target.matches('#btnSearch')) {
            dataAllProduct = await mainFunctions.getDataFromAPI('product');
            rendTableProductModal(dataAllProduct);
            mainFunctions.showModal(productsModal)
        }
        if (e.target.closest('#closeModal')) {
            mainFunctions.hideModal(productsModal)
        }
        if (e.target.closest('#closeModalUser')) {
            mainFunctions.hideModal(userModal)
        }
        if (e.target.closest('#tbodyUser')) {
            let id = e.target.closest('[data-id]').getAttribute('data-id');
            fillUserInput(id);
            mainFunctions.hideModal(userModal);
        }
    })

    let dataProduct;
    btnProductModal.addEventListener('click', async e => {
        let listProductCodeSelected = [];
        let allInputCheck = tbodyProduct.querySelectorAll('input[data-id]');
        allInputCheck.forEach(input => {
            if (input.checked) {
                let productCode = input.getAttribute('data-id');
                listProductCodeSelected.push(Number(productCode))
            }
        })
        let allProduct;
        dataProduct = await mainFunctions.getDataFromAPI('product');
        for (let key in dataProduct) {
            if (listProductCodeSelected.includes(dataProduct[key].productId)) {
                allProduct = dataProduct[key];
                let row = document.createElement('div');
                row.classList.add('tr');
                row.setAttribute('data-id', allProduct.productId);
                let td = `
                            <div class="td text-center">${allProduct.productId}</div>
                            <div class="td">${allProduct.productBarCode}</div>
                            <div class="td">${allProduct.productName}</div>
                            <div class="td text-center"><input type="text"  class="quantity" placeholder="0"></div>
                            <div class="td text-right"><input type="text" class="price" value="${allProduct.productPrice}"></div>
                            <div class="td text-right total">0</div>
                            <div class="td text-center"><img class="ico-delete" src="../../../src/img/trash-regular.png" alt=""></div>
                            `;
                row.insertAdjacentHTML('beforeend', td);
                tbodyOrders.insertAdjacentElement('beforeend', row);
            }
        }
        mainFunctions.hideModal(productsModal)
    })
    tbodyOrders.addEventListener('change', e => {
        if (e.target.matches('input')) {
            let id = e.target.closest('[data-id]').getAttribute('data-id');
            let quantity = tbodyOrders.querySelector(`div[data-id="${id}"] input.quantity`).value;
            let price = tbodyOrders.querySelector(`div[data-id="${id}"] input.price`).value;

            tbodyOrders.querySelector(`div[data-id="${id}"] .total`).textContent
                = formatter.format(Number(quantity) * Number(price)
                );
        }
    })
    tbodyOrders.addEventListener('click',async e=>{
        let resConfirm = await showConfirmationModal('Eliminar', 'Presione aceptar para eliminar este articulo');
        if(resConfirm){
            if(e.target.matches('.ico-delete')){
                e.target.closest('[data-id]').remove();
            }
        }
    })
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
            if (listObjDataPost.length > 0) {
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
                        mainFunctions.clearAllInputs(userForm);
                        tbodyOrders.textContent = ('');
                        showAlertBanner('success', 'Orden agregada correctamente');
                    }
                }
            } else showAlertBanner('warning', 'Debe agregar al menos un articulo');
        } else showAlertBanner('warning', 'Faltan parámetros');
    })

    btnSearch.addEventListener('click', e => location.assign('ordenes-creadas'))


    function filterProduct(dataList, textInput) {
        const textoBuscado = textInput;
        const resultados = dataList.filter(objeto => {
            if (objeto.productName && objeto.productBarCode) {
                // const productId = objeto.productId;
                const nombre = objeto.productName.toLowerCase();
                const code = objeto.productBarCode.toLowerCase();
                return nombre.includes(textoBuscado.toLowerCase().trim()) ||
                code.includes(textoBuscado.toLowerCase().trim());
                    // (productId == textoBuscado) ? productId : ''
            }
        });

        return resultados;
    }
    searchProduct.addEventListener('input', async e => {
        let data = await filterProduct(dataAllProduct, searchProduct.value)
        console.log(data);
        rendTableProductModal(data);
    })
})()