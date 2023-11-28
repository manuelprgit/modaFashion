import { showAlertBanner } from "../helpers/alertBanner.js";
import { mainFunctions } from "../main.js";

(async () => {
    let tbodyArticles = document.getElementById('tbodyArticles');
    let baseUrl = 'product';
    let getInventory;
    let formatter = mainFunctions.formatter.format;
  
    getInventory = await mainFunctions.getDataFromAPI(baseUrl);

    const fillInventoryTable = (inventory) => {
        let fragment = document.createDocumentFragment();
        for (let key in inventory) {
            let product = inventory[key]
            let tr = document.createElement('div')
            tr.classList.add('tr');
            let description = (product.productName.lengt > 10) ? `${product.productName.substring(0, 10)}...` : product.productName;
            tr.setAttribute('data-key', key);
            let tds = `
                <div class="td text-center">${product.productId}</div>
                <div class="td text-left">${product.productBarCode}</div>
                <div class="td text-left">${description}</div>
                <div class="td text-right">${formatter(product.quantity)}</div>
                <div class="td text-right">${formatter(product.productPrice)}</div>
                <div class="td text-right">${formatter(product.productCost)}</div>
                <div class="td text-center">${product.statusDescription}</div>
                <div class="td text-left">${product.supplierName}</div>
                <div class="td text-center">
                    <button class="edit-button">
                        <i id="iconContent" class="fa-solid fa-edit"></i>
                    </button>
                </div>
            `;
            tr.insertAdjacentHTML('afterbegin', tds);
            fragment.append(tr);
        }
        tbodyArticles.append(fragment);
    }

    tbodyArticles.addEventListener('click',e=>{
        if(e.target.closest('.edit-button')){
            let key = e.target.closest('[data-key]').getAttribute('data-key');
            let getPoductById = JSON.stringify(getInventory[key]);
            localStorage.setItem('productInventory',getPoductById);
            window.location.assign('/creacion-articulos');
        }
    });    

    fillInventoryTable(getInventory)
})()
