import { showAlertBanner } from "../helpers/alertBanner.js";
import showConfirmationModal from "../helpers/confirmationModal.js";
import { mainFunctions } from "../main.js";
import loaderController from '../helpers/loader.js';

(async () => {
    let contentCard = document.getElementById('contentCard');

    let format = mainFunctions.formatter.format;

    let getOrdersCollected = await mainFunctions.getDataFromAPI('ordersCollector');
    console.log(getOrdersCollected);

    const openCard = (card) => {
        if (card.classList.contains('card-opened')) {
            card.classList.remove('card-opened');
        } else {
            card.classList.add('card-opened');
        }
    }

    const buildBodyCards = (ordersDetail) => {
        
        let tableOrders = document.createElement('div');
        tableOrders.classList.add('table-orders');
        
        let head = `
        <div class="thead">
            <div class="tr">
                <div class="th text-center">Código</div>
                <div class="th text-center">Orden No:.</div>
                <div class="th">Cliente</div>
                <div class="th text-right">Monto</div>
                <div class="th text-right">Cant. Articulos</div>
            </div>
        </div>
        `;
        tableOrders.insertAdjacentHTML('afterbegin',head);
        for (let order of ordersDetail) {
            
            let body = `
            <div class="tbody">
                <div class="tr">
                    <div class="td text-center">${order.collectionDetailId}</div>
                    <div class="td text-center">${order.orderId}</div>
                    <div class="td text-left">
                        <a href="wa.me:${order.nameCustomer}" target="_blank">
                            ${order.nameCustomer}
                        </a>
                    </div>
                    <div class="td text-right">${format(order.total)}</div>
                    <div class="td text-right">${format(order.totalProducts)}</div>
                </div>
            </div>
            `;

            tableOrders.insertAdjacentHTML('beforeend', body);
        };
        
        return tableOrders;
    }

    const buildHeaderCards = (headerData) => {
        return `
            <div class="colum">
                <div class="head text-center">Pedido No:</div>
                <div class="body text-center">${headerData.collectionId}</div>
            </div>
            <div class="colum">
                <div class="head text-center">Fecha</div>
                <div class="body text-center">${new Date(headerData.date).toISOString().substring(0,10)}</div>
            </div>
            <div class="colum">
                <div class="head">Estatus</div>
                <div class="body">${'Proceso'}</div>
            </div>
            <div class="colum">
                <div class="head text-center">Ordenes</div>
                <div class="body text-center">${headerData.ordersCollectedDetails.length}</div>
            </div>
            <div class="colum">
                <div class="head text-right">Monto</div>
                <div class="body text-right">${format(headerData.totalAmount)}</div>
            </div>
            <div class="colum">
                <div class="head text-right">Gastos</div>
                <div class="body text-right">
                    <input type="number" class="btn">
                </div>
            </div>
            <div class="menu text-center">
                <i data-id="83" class="fa-solid fa-ellipsis"></i>
            </div>
            <div class="down">
                <i class="open-card fa-solid fa-chevron-down"></i>
            </div>
        `;
    }

    const buildTableCards = (ordersCollected) => {
        let fragment = document.createDocumentFragment();

        for (let key in ordersCollected) {
            let order = ordersCollected[key];
            let row = document.createElement('div');
            row.classList.add('row');
            row.setAttribute('data-key', key);
            let header = buildHeaderCards(order);
            let body = buildBodyCards(order.ordersCollectedDetails);
            row.insertAdjacentElement("afterbegin", body);
            row.insertAdjacentHTML('afterbegin', header);
            fragment.append(row);
        };

        contentCard.append(fragment);
    }

    contentCard.addEventListener('click', e => {
        let card = e.target.closest('.row');

        if (e.target.closest('i.open-card')) {
            openCard(card);
        }

    });
    contentCard.addEventListener('change', e => {
        let card = e.target.closest('.row');
        console.log(e);
        if (e.target.matches('input[type="number"]')) {
            console.log(e.keyCode);
            if (e.keyCode == 15) {

            }
        }
    })

    buildTableCards(getOrdersCollected);
})()