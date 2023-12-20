import { showAlertBanner } from "../helpers/alertBanner.js";
import showConfirmationModal from "../helpers/confirmationModal.js";
import { mainFunctions } from "../main.js";
import loaderController from '../helpers/loader.js';

(async () => {
    let contentCard = document.getElementById('contentCard');
    let templateMenuTable = document.getElementById('templateMenuTable');
    let subContextMenu = document.getElementById('subContextMenu');

    let baseUrl = mainFunctions.mainUrl;
    let format = mainFunctions.formatter.format;

    let getOrdersCollected = [];
    let getStatusOrders = [];

    await Promise.all([
        mainFunctions.getDataFromAPI('ordersCollector'),
        mainFunctions.getDataFromAPI('orders/status')
    ])
        .then(async ([ordersCollected, orderStatus]) => {
            getOrdersCollected = ordersCollected;
            getStatusOrders = orderStatus;
        });
        
    console.log({ getOrdersCollected, getStatusOrders });

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
        tableOrders.insertAdjacentHTML('afterbegin', head);

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
        console.log(headerData);
        return `
            <div class="colum">
                <div class="head text-center">Pedido No:</div>
                <div class="body text-center">${headerData.collectionId}</div>
            </div>
            <div class="colum">
                <div class="head text-center">Fecha</div>
                <div class="body text-center">${new Date(headerData.date).toISOString().substring(0, 10)}</div>
            </div>
            <div class="colum">
                <div class="head">Estatus</div>
                <div class="body">${headerData.description}</div>
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
                    <input type="number" ${(headerData.orderStatusId == 1) ? 'disabled' : ''}>
                </div>
            </div>
            <div class="menu text-center">
                <i class="fa-solid fa-ellipsis open-context-menu"></i>
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

    const openContextMenu = async (e) => {

        let contextMenu = e.target;
        let row = contextMenu.closest('[data-key]');
        let key = row.getAttribute('data-key');
        let order = getOrdersCollected[key];
        let nextStepId = order.nextStepId;
        let nextStepStatus = getStatusOrders.find(status => status.orderStatusId == nextStepId);
        let clone = templateMenuTable.cloneNode(true);
        clone = clone.content.firstElementChild;
        contextMenu.insertAdjacentElement('beforeend', clone);
        contextMenu.querySelector('#textStatus').textContent = nextStepStatus.description;
        let icon = mainFunctions.iconStatus.find(iStatus => iStatus.statusId == nextStepStatus.orderStatusId);
        contextMenu.querySelector('.ico i').className = '';
        contextMenu.querySelector('.ico i').className = icon.statusIcon;
        
    }

    contentCard.addEventListener('click', async e => {
        let card = e.target.closest('.row');

        if(e.target.closest('#postDocument')){
            let row = e.target.closest('[data-key');
            let key = row.getAttribute('data-key');
            let id = getOrdersCollected[key].collectionId;
            
            console.log(id);
            let orderCreated = await mainFunctions.sendDataByRequest('POST',{ orderCollectId:id},`ordersCollector/postOrderCollected`);
            console.log(orderCreated);
        }

        if (e.target.closest('i.open-card')) {
            openCard(card);
        }

        if (e.target.closest('.open-context-menu')) {
            console.log(card);
            openCard(card);
            contentCard.querySelectorAll(`div.row[data-id]`).forEach(row => {
                row.style.height = '100px';
            });
            contentCard.querySelectorAll('.content-menu-table').forEach(menu => menu.remove());

            openContextMenu(e);
        } else {
            contentCard.querySelectorAll('.content-menu-table').forEach(menu => menu.remove());
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