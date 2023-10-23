import { showAlertBanner } from "../helpers/alertBanner.js";
import showConfirmationModal from "../helpers/confirmationModal.js";
import { mainFunctions } from "../main.js";
import loaderController from '../helpers/loader.js';
import createTable from '../helpers/createTables.js';

(async () => {
    loaderController.enable();
    let salesmanImg = document.getElementById('salesmanImg');
    let salesmanCode = document.getElementById('salesmanCode');
    let salesmanName = document.getElementById('salesmanName');
    let salesmanLastName = document.getElementById('salesmanLastName');
    let salesmanIdentifycation = document.getElementById('salesmanIdentifycation');
    let salesmanCreationDate = document.getElementById('salesmanCreationDate');
    let salesmanStatus = document.getElementById('salesmanStatus');
    let salesmanForm = document.getElementById('salesmanForm');
    let phoneNumber = document.getElementById('phoneNumber');
    let cellPhone = document.getElementById('cellPhone');
    let salesManUserName = document.getElementById('salesManUserName');
    let salesPassword = document.getElementById('salesPassword');
    let confirmPassword = document.getElementById('confirmPassword');
    

    let salesModal = document.getElementById('salesModal');
    let closeModal = document.getElementById('closeModal');
    let salesmanTable = document.getElementById('salesmanTable');
    // let tbodyCustomer = salesmanTable.querySelector('.tbody');

    let searchSalesman = document.getElementById('searchSalesman');
    let clearInputs = document.getElementById('clearInputs');
    let saveSalesman = document.getElementById('saveSalesman');

    let getCustomers;
    let storeCustomerId = 0;
    let sales;

    let salesmanObject = {
        idSeller: {
            className: 'text-center',
            headDescription: 'Código'
        },
        nameSeller: {
            className: 'text-left',
            headDescription: 'Nombre'
        },
        lastName: {
            className: 'text-left',
            headDescription: 'Apellido'
        },
        sellerIdentification: {
            className: 'text-left',
            headDescription: 'Cedula'
        },
        statusSeller: {
            className: 'text-center',
            headDescription: 'Estatus'
        }
    }

    let baseUrl = `${mainFunctions.mainUrl}customer`;

    salesmanCreationDate.value = new Date().toISOString().substring(0, 10);

    const getDataForSend = () => {

        let date = new Date()

        return {
            idSeller: storeCustomerId,
            sellerName: salesmanName.value,
            sellerLastName: salesmanLastName.value,
            sellerIdentification: salesmanIdentifycation.value,
            userName: salesManUserName.value,
            password: salesPassword.value,
            creationDate: date.toISOString().substring(0,10),
            sellerStatus: salesmanStatus.value,
            phoneNumber: phoneNumber.value,
            cellPhone: cellPhone.value
        }
    }

    const clearAllMyInputs = () => {
        mainFunctions.clearAllInputs(salesmanForm);
        salesmanCreationDate.value = new Date().toISOString().substring(0, 10);
        salesmanCode.value = 'Nuevo';
        storeCustomerId = 0;
        salesPassword.classList.add('required');
        confirmPassword.classList.add('required');
    }

    const filAllInputs = (salesman) => {
        
        let date = new Date(salesman.creationDate)
        // salesmanImg.value = salesman.img;
        storeCustomerId = salesman.idSeller;
        salesmanCode.value = salesman.idSeller;
        salesmanName.value = salesman.nameSeller;
        salesmanLastName.value = salesman.lastName;
        salesManUserName.value = salesman.userName;
        phoneNumber.value = salesman.phoneNumber;
        cellPhone.value = salesman.cellPhone;
        salesmanIdentifycation.value = salesman.sellerIdentification;
        salesmanCreationDate.value = date.toISOString().substring(0,10);
        salesmanStatus.value = salesman.statusSeller;

    }

    document.addEventListener('input',e=>{
        mainFunctions.removeWrongInput(e.target)
    })

    searchSalesman.addEventListener('click', async e => {

        salesmanTable.textContent = '';
        salesPassword.classList.remove('required');
        confirmPassword.classList.remove('required');
        sales = await mainFunctions.getDataFromAPI('sellers');
        let data = createTable(sales, salesmanObject);
        salesmanTable.append(data);
        mainFunctions.showModal(salesModal);

    });

    closeModal.addEventListener('click', e => {
        mainFunctions.hideModal(salesModal);
    });

    clearInputs.addEventListener('click', e => {
        clearAllMyInputs()
    });

    salesmanTable.addEventListener('click', async e => {
        if (e.target.closest('.tr')) {
            mainFunctions.cleanAllWrongInput(salesmanForm);

            let key = e.target.closest('.tr').getAttribute('data-key');
            let getSalesManById = await mainFunctions.getDataFromAPI(`sellers/${sales[key].idSeller}`);
            filAllInputs(getSalesManById);
            mainFunctions.hideModal(salesModal);

        }
    });

    saveSalesman.addEventListener('click',async e=>{

        mainFunctions.cleanAllWrongInput(salesmanForm);

        if(salesPassword.value !== confirmPassword.value){
            showAlertBanner('warning','Las contraseñas no coinciden');
            mainFunctions.setWrongInput(salesPassword);
            mainFunctions.setWrongInput(confirmPassword);
            return;
        }

        let hasEmptyValue = mainFunctions.validateInputsRequired(salesmanForm);
        if(hasEmptyValue){
            showAlertBanner('warning','Faltan parametros');
            return;
        }
        let hasAcepted = await showConfirmationModal('¿Desea guardar?','Se guardaran todos los cambios realizados')
        if(!hasAcepted) return;
        let getSalesman = getDataForSend(); 
        if(storeCustomerId === 0){
            let postResult = await mainFunctions.sendDataByRequest('POST',getSalesman,`${mainFunctions.mainUrl}sellers`);
            console.log(postResult);
            let newSeller = await postResult.json();
            showAlertBanner('success',`Se ha creado el vendedor ${newSeller.idSeller}`);
            clearAllMyInputs();
        }
        else{
            await mainFunctions.sendDataByRequest('PUT',getSalesman,`${mainFunctions.mainUrl}sellers`,storeCustomerId);
            showAlertBanner('success','Se ha modificado el vendedor');
            clearAllMyInputs();
        }
    })

    loaderController.disabled();

})()