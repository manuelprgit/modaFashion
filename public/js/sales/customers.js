import { showAlertBanner } from "../helpers/alertBanner.js";
import showConfirmationModal from "../helpers/confirmationModal.js";
import { mainFunctions } from "../main.js";
import loaderController from '../helpers/loader.js';

(async () => {
    loaderController.enable();
    let customerImg = document.getElementById('customerImg');
    let customerCode = document.getElementById('customerCode');
    let customerName = document.getElementById('customerName');
    let customerLastName = document.getElementById('customerLastName');
    let identifyCustomer = document.getElementById('identifyCustomer');
    let customerCreationDate = document.getElementById('customerCreationDate');
    let customerStatus = document.getElementById('customerStatus');

    let customerModal = document.getElementById('customerModal');
    let closeModal = document.getElementById('closeModal');
    let customerTable = document.getElementById('customerTable');
    let tbodyCustomer = document.getElementById('tbodyCustomer');

    let searchCustomer = document.getElementById('searchCustomer');
    let clearInputs = document.getElementById('clearInputs');
    let saveCustomer = document.getElementById('saveCustomer');

    let getCustomers;
    let storeCustomerId = 0;

    let baseUrl = `${mainFunctions.mainUrl}customer`

    customerCreationDate.value = new Date().toISOString().substring(0, 10);

    const fillCustomersTable = (customers) => {
        let fragment = document.createDocumentFragment();
        for (let key in customers) {
            let customer = customers[key];
            let status = (customer.statusCustomer) ? 'Activo' : 'Inactivo';
            let div = document.createElement('div');
            div.classList.add('tr');
            div.setAttribute('data-key', key);
            let td = `
                <div class="td text-center">${customer.idCustomer}</div>
                <div class="td text-left">${customer.nameCustomer}</div>
                <div class="td text-left">${customer.lastNameCustomer}</div>
                <div class="td text-left">${customer.customerIdentification}</div>
                <div class="td text-center">${status}</div>
            `;
            div.insertAdjacentHTML('afterbegin', td);
            fragment.append(div);
        }
        tbodyCustomer.append(fragment);
    }

    const fillAllInputs = (customer) => {
        console.log(customer);
        let date = new Date(customer.creationDate)
        // customerImg.value = customer.
        storeCustomerId = customer.idCustomer;
        customerCode.value = customer.idCustomer;
        customerName.value = customer.nameCustomer;
        customerLastName.value = customer.lastNameCustomer;
        identifyCustomer.value = customer.customerIdentification;
        customerCreationDate.value = date.toISOString().substring(0, 10);
        customerStatus.value = (customer.statusCustomer) ? 1 : 0;
    }

    const getDataFromApi = () => {
        return {
            idCustomer: storeCustomerId,
            nameCustomer: customerName.value,
            lastNameCustomer: customerLastName.value,
            customerIdentification: identifyCustomer.value,
            creationDate: new Date().toISOString().substring(0, 10),
            statusCustomer: Number(customerStatus.value)
        }
    }

    const clearAllMyInputs = () => {
        mainFunctions.clearAllInputs(articleForm);
        customerCreationDate.value = new Date().toISOString().substring(0, 10);
        customerCode.value = 'Nuevo';
        storeCustomerId = 0;
    }

    searchCustomer.addEventListener('click', async e => {
        tbodyCustomer.textContent = '';
        getCustomers = await mainFunctions.getDataFromAPI('customer');
        fillCustomersTable(getCustomers);
        mainFunctions.showModal(customerModal);
    });

    closeModal.addEventListener('click', e => {
        mainFunctions.hideModal(customerModal);
    });

    tbodyCustomer.addEventListener('click', async e => {
        if (e.target.closest('.tr')) {
            let key = e.target.closest('.tr').getAttribute('data-key');
            let id = getCustomers[key].idCustomer;
            let getCustomerById = await mainFunctions.getDataFromAPI(`customer/${id}`);
            console.log(getCustomerById);
            fillAllInputs(getCustomerById);
            mainFunctions.hideModal(customerModal)
        }
    });

    clearInputs.addEventListener('click',e=>{
        clearAllMyInputs()
    });

    saveCustomer.addEventListener('click', async e => {

        let hasEmptyValue = mainFunctions.validateInputsRequired(articleForm);
        if(hasEmptyValue) {
            showAlertBanner('warning','Faltan parametros');
            return;
        };
        let hasAcepted = await showConfirmationModal('Crear Cliente', '¿Desea cear el cliente?');
        if (!hasAcepted) return;

        loaderController.enable();
        let getDataUser = getDataFromApi();
        if(storeCustomerId === 0){
            let newCustomer = await mainFunctions.sendDataByRequest('POST', getDataUser, baseUrl);
            if(!newCustomer.ok){
                showAlertBanner('danger','Error al hacer la peticion');
                return;
            }
            newCustomer = await newCustomer.json(); 
            showAlertBanner('success',`Se ha creado el cliente numero ${newCustomer.idCustomer}`);
        }
        else{
            let newCustomer = await mainFunctions.sendDataByRequest('PUT', getDataUser, baseUrl, storeCustomerId);
            if(!newCustomer.ok){
                showAlertBanner('danger','Error al hacer la peticion');
                return;
            } 
            showAlertBanner('success',`Se ha modificado el cliente numero ${storeCustomerId}`);
        }

        clearAllMyInputs();
        loaderController.disabled();

    });

    loaderController.disabled(); 

})()