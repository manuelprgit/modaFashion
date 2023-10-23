import { showAlertBanner } from "../helpers/alertBanner.js";
import { mainFunctions } from "../main.js";

(async()=>{
    let categoryId = document.getElementById('categoryId');
    let categoryDescription = document.getElementById('categoryDescription');
    let categoryStatus = document.getElementById('categoryStatus');

    let searchCategories = document.getElementById('searchCategories');
    let clean = document.getElementById('clean');
    let saveCategory = document.getElementById('saveCategory');
    
    let tbodyCategory = document.getElementById('tbodyCategory');
    let closeModal = document.getElementById('closeModal');
    
    let categoryModal = document.getElementById('categoryModal');
    let categoryContext = document.getElementById('categoryContext');

    let baseUrl = mainFunctions.mainUrl+'category';
    
    let getCategories = await mainFunctions.getDataFromAPI('category');

    let createRows = (key, rowData) => {
        console.log(rowData);
        let tr = document.createElement('div');
        tr.classList.add('tr');
        tr.setAttribute('data-key', key);
        let td = `
            <div class="td text-center">${rowData.categoryId}</div>
            <div class="td text-left">${rowData.categoryDescription}</div>
            <div class="td text-left">${(rowData.categoryStatusId === 1)
                                            ? 'Activo'
                                            : 'Inactivo'}</div>
        `;
        tr.insertAdjacentHTML('afterbegin', td);
        
        return tr;
    }

    let fillAllInputs = (category) => {
        categoryId.value = category.categoryId;
        categoryDescription.value = category.categoryDescription;
        categoryStatus.value = category.categoryStatusId
    }

    let getDataForRequest = () => {
        return {
            categoryId: Number(categoryId.value),
            categoryDescription: categoryDescription.value,
            categoryStatusId: Number(categoryStatus.value)
        }
    }

    let createHeadTable = (headInfo) => {
        
        let thead = document.createElement('div');
        thead.classList.add('thead');
        let tr = document.createElement('div');
        tr.classList.add('tr');
        for(let data of headInfo){
            let th = `<div class="th text-${data.position}">${data.name}</div>`; 
            tr.insertAdjacentHTML('beforeend',th);         
        }
        thead.insertAdjacentElement('afterbegin',tr); 
        return thead;
    }
    let createTable = () => {
        
        let table = document.createElement('div');
        table.classList.add('table');
        
        let headObj = [
            {
                name: "Codigo",
                position: "center"
            },
            {
                name: "Nombre",
                position: "left"
            },
            {
                name: "Apellido",
                position: "left"
            },
        ]
        let thead = createHeadTable(headObj);
        console.log(thead);
    }
    createTable()

    saveCategory.addEventListener('click',async e=>{    
        let hasEmptyValue = mainFunctions.validateInputsRequired(categoryContext);
        if(hasEmptyValue){
            console.log('Faltan valores');
            return;
        }
        let categoryObj = getDataForRequest();
        console.log(categoryObj);
        if(categoryObj.categoryId == 0){
            let newCategory = await mainFunctions.sendDataByRequest('POST',categoryObj, baseUrl);
            console.log(newCategory);
        }else{
            let newCategory = await mainFunctions.sendDataByRequest('PUT',categoryObj, baseUrl, categoryObj.categoryId);
            console.log(newCategory);
        }
    });

    searchCategories.addEventListener('click',e=>{
        mainFunctions.showModal(categoryModal);
    });

    tbodyCategory.addEventListener('click',e=>{
        if(e.target.closest('.tr')){

            mainFunctions.clearAllInputs(categoryContext)
            let key = e.target.closest('.tr').getAttribute('data-key');
            let category = getCategories[key];
            fillAllInputs(category);
            mainFunctions.hideModal(categoryModal);
            
        }
    });

    closeModal.addEventListener('click',e=>{
        mainFunctions.hideModal(categoryModal)
    });

    clean.addEventListener('click',e=> {
        mainFunctions.clearAllInputs(categoryContext);
    });

    categoryContext.addEventListener('change',e=>{
        if(e.target.matches('.required')){
            mainFunctions.removeWrongInput(e.target);
        }        
    });
    
    mainFunctions.renderTables(getCategories, createRows, tbodyCategory);

})()