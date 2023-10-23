import { showAlertBanner } from "../helpers/alertBanner.js";
import showConfirmationModal from "../helpers/confirmationModal.js";
import { mainFunctions } from "../main.js";

(async () => {
    const SideMenu = document.querySelector('.side-menu');

    let mainContent = document.getElementById('mainContent');
    const bar_code_input = document.getElementById('bar_code_input');
    const tableArticleBody = document.getElementById('tableArticleBody');
    const name_client = document.getElementById('name_client');
    const cedu_client = document.getElementById('cedu_client');
    const totalPrice = document.getElementById('totalPrice');
    const totalArticles = document.getElementById('totalArticles');
    const controlActions = document.getElementById('controlActions');
    const searchCustomers = document.getElementById('searchCustomers');
    const optionContainer = document.getElementById('optionContainer');
    const inpCustomerData = document.getElementById('inpCustomerData');

    let totalOfArtCollect = document.getElementById('totalOfArtCollect');
    let subTotalCollect = document.getElementById('subTotalCollect');
    let totalCollect = document.getElementById('totalCollect');
    let totalRestCollect = document.getElementById('totalRestCollect');
    let grandTotalCollect = document.getElementById('grandTotalCollect');
    let modalCollect = document.getElementById('modalCollect');
    let inputsContent = document.getElementById('inputsContent');

    //MODAL
    const customersModal = document.getElementById('customersModal');
    const closeModal = document.getElementById('closeModal');
    const customersTable = document.getElementById('customersTable');
    const tbodyCustomers = document.getElementById('tbodyCustomers');

    const btnDelete = document.getElementById('btnDelete');
    const btnCollect = document.getElementById('btnCollect');
    const clean = document.getElementById('clean');


    const formatter = mainFunctions.formatter.format;

    let articleToInvoiceObj = {};
    let totalToInvoice = 0;
    let totalOfArticle = 0;
    let articleCounter = 0;
    let quantity = 1;
    let storeCumerId = 0;
    let totalPay = 0;
    let pendingValue = 0;
    let totalArt = 0;
    let totalPric = 0;
    let getCustomers;

    getCustomers = await mainFunctions.getDataFromAPI(`customer`);


    let status = 'N';

    const renderTableRow = (tableData, quantity) => {

        let tr = document.createElement('tr');
        tr.classList.add('tr');
        tr.setAttribute('data-artcount', articleCounter)
        let td = `
            <div class="td"><a href="/"> ${tableData.productDetail}</a></div>
            <div class="td text-right">${quantity}</div>
            <div class="td text-right">${formatter(tableData.productPrice * quantity)}</div>
        `;
        tr.insertAdjacentHTML('afterbegin', td);
        return tr;
    }

    const calculateTotalToInvoice = (condition, quantity, price) => {

        if (condition) {
            totalToInvoice += quantity * price;
            totalPric += price * quantity;
            totalOfArticle += quantity;
            totalArt += quantity;
        } else {
            totalToInvoice -= quantity * price;
            totalPric -= price * quantity
            totalOfArticle -= quantity;
            totalArt -= quantity;
        }
        totalPrice.textContent = formatter(totalToInvoice);
        totalArticles.textContent = totalOfArticle;
        totalOfArtCollect.textContent = formatter(totalArt);
        subTotalCollect.textContent = formatter(totalPric);
        grandTotalCollect.textContent = formatter(totalPric);
        compareDifferences();

    }

    const getBarcode = async (barCode) => {
        let article = await mainFunctions.getDataFromAPI(`product/barcode/${barCode}`);
        if (!article) {
            bar_code_input.select();
            return;
        }
        return article;
    }

    const insertIntoArticleToInoice = (article) => {
        article.subTotal = article.productQuantity * article.productPrice;

        articleToInvoiceObj[articleCounter] = article;
        articleCounter++;
    }

    const changeDisabledButtons = (condition) => {
        controlActions.querySelectorAll('button')
            .forEach(button => {
                if (condition) {
                    button.classList.remove('disabled');
                }
                else {
                    button.classList.add('disabled');
                }
            })
    }

    const changeDeleteButton = (className, text) => {
        btnDelete.querySelector('i').className = `fa-solid ${className}`;
        btnDelete.querySelector('span').textContent = text;
    }

    const changeDeleteStatus = (isDeleting) => {

        if (isDeleting) {
            let rowsSelected = tableArticleBody.querySelectorAll('.selected-row');

            if (rowsSelected.length > 0) {
                rowsSelected.forEach(row => {
                    let idCounter = row.getAttribute('data-artcount');
                  
                    calculateTotalToInvoice(
                        false,
                        articleToInvoiceObj[idCounter].productQuantity,
                        articleToInvoiceObj[idCounter].productPrice
                    );

                    delete articleToInvoiceObj[idCounter]
                    row.remove();
                    let tableRows = tableArticleBody.querySelectorAll('.select-row');
                    tableRows.forEach(tr => { tr.classList.remove('select-row') });
                    
                })
            } else {
                changeDeleteButton('fa-trash-can', 'Eliminar');
                tableArticleBody.querySelectorAll('.select-row').forEach(tr => { tr.classList.remove('select-row') });
            }
            btnCollect.classList.remove('disabled');
            bar_code_input.disabled = false;
            status = 'N';
        } else {
            tableArticleBody.querySelectorAll('.tr')
                .forEach(tr => {
                    tr.classList.add('select-row');
                })
            changeDeleteButton('fa-xmark', 'Cancelar');
            btnCollect.classList.add('disabled');
            bar_code_input.disabled = true;
            status = 'D';
        }

        if(tableArticleBody.querySelectorAll('.td').length <= 0){
            btnCollect.classList.add('disabled');
            btnDelete.classList.add('disabled');
        }

    }

    const verifyIfHaveMoreAsterisk = (input) => {

        let destructuringInput = input.split('');
        let counterFlag = 0;
        for (let i = 0; i < destructuringInput.length; i++) {
            if (destructuringInput[i] === '*') {
                counterFlag++;
            }
        }

        if (counterFlag > 1) {
            return true;
        }
        return false;
    }

    const selectRow = (tr) => {
        if (tr.classList.contains('select-row')) {
            tr.classList.remove('select-row');
            tr.classList.add('selected-row');
        } else {
            tr.classList.add('select-row');
            tr.classList.remove('selected-row');
        }
    }

    const convertObjectToArray = () => {
        return Object.values(articleToInvoiceObj);
    }

    const sendCollectData = () => {
         
        let customerData = inpCustomerData.value;
        let getCustomerById;
        if (customerData.split('-').length == 2) {
            getCustomerById = getCustomers.find(customer => customer.idCustomer == customerData.split('-')[0]);
            storeCumerId = getCustomerById.idCustomer;
        }
        let articleList = convertObjectToArray();
        let total = 0;
        articleList.forEach(article => {
            total += article.productPrice * article.productQuantity;
        })

        return {
            customerId: storeCumerId || null,
            customerName: (getCustomerById) ? getCustomerById.nameCustomer + ' ' + getCustomerById.lastNameCustomer : customerData,
            idSeller: 1,
            total: total,
            note: 'Prueba de nota',
            cash: Number(txtEfectivo.value),
            creditCard: Number(txtTarjeta.value),
            checkType: Number(txtCheque.value),
            credit: Number(txtCredito.value),
            articleDetails: articleList
        }

    }

    const clearAllMyInputs = () => {
        mainFunctions.clearAllInputs(mainContent);
        tableArticleBody.textContent = '';
        btnDelete.classList.add('disabled');
        btnCollect.classList.add('disabled');

        totalOfArtCollect.textContent = '0.00';
        subTotalCollect.textContent = '0.00';
        totalCollect.textContent = '0.00';
        totalRestCollect.textContent = '0.00';
        grandTotalCollect.textContent = '0.00';

        articleToInvoiceObj = {};
        totalToInvoice = 0;
        totalOfArticle = 0;
        articleCounter = 0;
        txtEfectivo.value = "";
        txtTarjeta.value = "";
        txtCheque.value = "";
        txtCredito.value = "";
        quantity = 1;
        storeCumerId = 0;
        status = 'N';
        totalArticles.textContent = 0;
        totalPrice.textContent = '$0.00';
        totalPay = 0;
        pendingValue = 0;
        totalArt = 0;
        totalPric = 0;
    }

    const fillcustomersTable = (customers) => {

        customers = customers.filter(customer=> customer.statusCustomer == true);

        let fragment = document.createDocumentFragment();
        for (let key in customers) {
            let customer = customers[key];
            let row = document.createElement('div');
            row.classList.add('tr');
            row.setAttribute('data-key', key);
            let td = ` 
                <div class="td text-center">${customer.idCustomer}</div>
                <div class="td text-left">${customer.nameCustomer}</div>
                <div class="td text-left">${customer.lastNameCustomer}</div>
                <div class="td text-left">${customer.customerIdentification}</div>
            `;
            row.insertAdjacentHTML('afterbegin', td);
            fragment.append(row);
        }
        tbodyCustomers.append(fragment);
    }

    const fillCustomerSelect = (customers) => { 
        customers = customers.filter(customer=> customer.statusCustomer);
        for (let customer of customers) {
            let option = document.createElement('option');
            option.value = `${customer.idCustomer} - ${customer.nameCustomer} ${customer.lastNameCustomer}`;
            option.setAttribute('data-id', customer.idCustomer);
            optionContainer.append(option)
        }

    }

    //TODO: CODIGO PARA CALCULAR CUANDO SE VALLA A COBRAR LA FACTURA

    const totalToPay = () => {
        totalPay = 0;
        totalPay += Number(txtEfectivo.value) || 0;
        totalPay += Number(txtTarjeta.value) || 0;
        totalPay += Number(txtCheque.value) || 0;
        totalPay += Number(txtCredito.value) || 0;

        pendingValue = totalPay;
        return totalPay;
    }

    let compareDifferences = () => {
        totalRestCollect.textContent = formatter(Number(pendingValue) - Number(totalPric));
    }

    modalCollect.addEventListener('input', e => {
        totalCollect.textContent = formatter(totalToPay());
        compareDifferences();
    });

    bar_code_input.addEventListener('change', async e => {

        let barCode = e.target;
        if (barCode.value.includes('*')) {

            let hasMoreAsterisk = verifyIfHaveMoreAsterisk(barCode.value)

            if (hasMoreAsterisk) {
                showAlertBanner('warning', 'Solo se acepta 1 asterisco');
                barCode.classList.add('wrong-input');
                barCode.select()
                return;
            }

            quantity = (Number(barCode.value.slice(1)) == 0)
                ? 1 :
                Number(barCode.value.slice(1));

            barCode.value = "";
            return;

        }
        let article = await getBarcode(barCode.value);
        if (!article) return;
        tableArticleBody.append(renderTableRow(article, quantity));
        article.productQuantity = quantity;
        insertIntoArticleToInoice(article);
        changeDisabledButtons(true)
        calculateTotalToInvoice(true, quantity, article.productPrice);
        // calculateTotals(true, quantity, article.productPrice);
        e.target.value = '';
        quantity = 1;

    })

    SideMenu.addEventListener('click', async e => {
        e.preventDefault();
        let link = e.target.closest('.option').getAttribute('href');
        if (e.target.closest('.option')) {
            if (Object.keys(articleToInvoiceObj).length) {
                let wasAccepted = await showConfirmationModal('Advertencia', 'Si sale de esta opcion se perdera todo el proceso realizado');
                if (wasAccepted) {
                    window.location.href = link;
                }
                return;
            }
        }
        window.location.href = link;
    });

    btnDelete.addEventListener('click', e => {

        if (status === 'N') {
            changeDeleteStatus(false);
        } else {
            changeDeleteStatus(true);
        }
    });

    tableArticleBody.addEventListener('click', e => {
        if (status === 'D') {
            let tr = e.target.closest('.tr');

            selectRow(tr);

            let hasSelectedValue = false;
            tableArticleBody.querySelectorAll('.selected-row')
                .forEach(tr => {
                    if (tr.classList.contains('selected-row')) {
                        hasSelectedValue = true;
                    }
                })
            if (hasSelectedValue) {
                changeDeleteButton('fa-trash-can', 'Eliminar');
            } else {
                changeDeleteButton('fa-xmark', 'Cancelar');
            }
        }
    });

    btnCollect.addEventListener('click', async e => {        
        mainFunctions.showModal(modalCollect);
    });

    btnCobrar.addEventListener('click', async e => {

        if ((pendingValue - totalPric) === 0) {

            let dataCollect = sendCollectData(); 
    
             
            let invoiceInserted = await mainFunctions.sendDataByRequest('POST', dataCollect, 'api/invoice');
            console.log(invoiceInserted);
            invoiceInserted = await invoiceInserted.json();
            showAlertBanner('success', `Se ha generado la factura numero: ${invoiceInserted.invoiceId}`);
            clearAllMyInputs();
            mainFunctions.hideModal(modalCollect);
        } else {
            showAlertBanner('warning', 'Debe de cuadrar los montos');
        }
    });

    btnClose.addEventListener('click', e => {
        mainFunctions.hideModal(modalCollect)
    });

    searchCustomers.addEventListener('click', async e => {

        mainFunctions.showModal(customersModal);

    });

    tbodyCustomers.addEventListener('click', e => {
        if (e.target.closest('.tr')) {
            let key = e.target.closest('.tr').getAttribute('data-key');
            let customer = getCustomers[key];
            inpCustomerData.value = `${customer.idCustomer} - ${customer.nameCustomer} ${customer.lastNameCustomer}`;
            mainFunctions.hideModal(customersModal)
        }
    });

    closeModal.addEventListener('click', e => {
        mainFunctions.hideModal(customersModal)
    });

    clean.addEventListener('click', async e => {
        if (Object.keys(articleToInvoiceObj).length) {
            let wasAccepted = await showConfirmationModal('Advertencia', 'Se borrara todo el proceso');
            if (wasAccepted) {
                clearAllMyInputs();
            }
            return;
        }
        clearAllMyInputs();

    });

    bar_code_input.select();

    fillCustomerSelect(getCustomers);
    fillcustomersTable(getCustomers);

})()