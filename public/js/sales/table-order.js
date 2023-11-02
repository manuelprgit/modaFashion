import { showAlertBanner } from "../helpers/alertBanner.js";
import showConfirmationModal from "../helpers/confirmationModal.js";
import { mainFunctions } from "../main.js";
import loaderController from '../helpers/loader.js';
(async() => {
    //Id
    let dataOrders = await mainFunctions.getDataFromAPI('orders');
    for(let key in dataOrders){
        let div = `
                <div class="row">
                    <div class="colum">
                        <div class="head">No.</div>
                        <div class="body">${d}</div>
                    </div>
                    <div class="colum">
                        <div class="head">Código cliente</div>
                        <div class="body">41658</div>
                    </div>
                    <div class="colum">
                        <div class="head">Nombre</div>
                        <div class="body">Manuel Perez</div>
                    </div>
                    <div class="colum">
                        <div class="head">Estatus</div>
                        <div class="body">En proceso</div>
                    </div>
                    <div class="colum">
                        <div class="head">Monto</div>
                        <div class="body">$20,123.05</div>
                    </div>
                    <div class="menu">
                        <i class="fa-solid fa-ellipsis"></i>
                    </div>
                    <div class="dowm">
                        <i class="open-card fa-solid fa-chevron-down"></i>
                    </div>
                </div>
                    `;
    }


    document.addEventListener('click', e => {
        if (e.target.matches('i.open-card')) {
            rowPrueba.style.height = '300px'
        }
    })
})()