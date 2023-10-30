import { showAlertBanner } from '../helpers/alertBanner.js';
import loaderController from '../helpers/loader.js';
import showConfirmationModal from '../helpers/confirmationModal.js';
import { mainFunctions } from '../main.js';
import createTable from '../helpers/createTables.js';

(async () => {

    loaderController.enable();

    let productBarcode = document.getElementById('productBarcode');
    let productName = document.getElementById('productName');
    let productCode = document.getElementById('productCode');
    let productCost = document.getElementById('productCost');
    let productQuantity = document.getElementById('productQuantity');
    let productSuplier = document.getElementById('productSuplier');
    let productCategory = document.getElementById('productCategory');
    let productFamily = document.getElementById('productFamily');
    let productStatus = document.getElementById('productStatus');
    let productDescription = document.getElementById('productDescription');
    let productPrice = document.getElementById('productPrice');
    let productModal = document.getElementById('productModal');
    let closeModal = document.getElementById('closeModal');
    let articleForm = document.getElementById('articleForm');
    let linkUrl = document.getElementById('linkUrl');

    let productTable = document.getElementById('productTable');
    let tbodyProduct = productTable.querySelector('.tbody');

    let searchProduct = document.getElementById('searchProduct');
    let clearInputs = document.getElementById('clearInputs');
    let saveProduct = document.getElementById('saveProduct');

    let getProducts;
    let getCategories;
    let getFamilies;
    let getStatus;


    let idProductForPut = 0;

    let baseUrl = mainFunctions.mainUrl;

    try {
        await Promise.all([
            mainFunctions.getDataFromAPI('product'),
            mainFunctions.getDataFromAPI('category'),
            mainFunctions.getDataFromAPI('family'),
            mainFunctions.getDataFromAPI('productstatus')
        ])
            .then(async ([products, categories, families, productStatus]) => {
                getProducts = await products;
                getCategories = await categories.filter(category => {
                    return category.categoryStatusId == 1
                });
                getFamilies = await families.filter(family => {
                    return family.familyStatusId == 1
                });
                console.log(getFamilies);
                getStatus = await productStatus;
            })
            .catch(err => {
                console.log(err);
                showAlertBanner('danger', err)
            })

    } catch (error) {
        console.log(error);
        showAlertBanner('danger', error)
    }

    let getDataForRequest = () => {
        return {
            productId: idProductForPut,
            productCode: productCode.value,
            barCode: productBarcode.value,
            name: productName.value,
            price: productPrice.value || 0,
            cost: productCost.value || 0,
            quantity: productQuantity.value,
            suplierId: productSuplier.value,
            categoryId: productCategory.value,
            familyId: productFamily.value,
            status: productStatus.value,
            linkUrl: linkUrl.value,
            description: productDescription.value,
        }
    }

    let fillAllInputs = (article) => {
        idProductForPut = article.productId;
        productBarcode.value = article.productBarCode;
        productName.value = article.productName;
        productCode.value = article.productId;
        productCost.value = article.productCost;
        productCategory.value = article.productCategory;
        productFamily.value = article.productFamily;
        productStatus.value = article.productStatusId;
        productDescription.value = article.productDetail;
        productPrice.value = article.productPrice;
        linkUrl.value = article.linkUrl;
        // productQuantity.value = article.product
        // productSuplier.value = article.product
        productBarcode.disabled = true;
    }

    let clearAllMyInputs = (context) => {
        mainFunctions.clearAllInputs(context)
        productBarcode.disabled = false;
        productCode.value = 'Nuevo'

    }

    saveProduct.addEventListener('click', async e => {
        let hasEmptyvalue = mainFunctions.validateInputsRequired(articleForm);
        if (hasEmptyvalue) {
            showAlertBanner('warning', 'Faltan parametros')
            return
        };
        let wasAccepted = await showConfirmationModal('Guardar', 'Desea guardar el articulo?');
        if (!wasAccepted) return;

        let productData = getDataForRequest();
        let resultRequest
        //TODO: no se estan tomando en cuenta los errores
        if (productData.productId == 0) {
            resultRequest = await mainFunctions.sendDataByRequest('POST', productData, `${baseUrl}product`);
            console.log(resultRequest);
            resultRequest = JSON.parse(resultRequest)
            if (resultRequest.error == 405) {
                showAlertBanner('warning', 'El codigo de barra ya existe');
                return;
            } 
            resultRequest = await resultRequest.json();
            showAlertBanner('success', `Se ha creado el articulo numero ${resultRequest.productId} con éxito!`)
            clearAllMyInputs(articleForm);
        } else {
            await mainFunctions.sendDataByRequest('PUT', productData, `${baseUrl}product`, productData.productId);
            console.log(productData);
            showAlertBanner('success', `Se ha modificado el articulo ${productData.name} con éxito!`)
            clearAllMyInputs(articleForm); 
        }
    })

    searchProduct.addEventListener('click', e => {
        mainFunctions.showModal(productModal);
    });

    productTable.addEventListener('click', e => {

        if (e.target.closest('.tbody .tr')) {
            let key = e.target.closest('.tbody .tr').getAttribute('data-key');
            let product = getProducts[key];
            fillAllInputs(product);
            mainFunctions.hideModal(productModal);

        }

    });

    clearInputs.addEventListener('click', e => {
        clearAllMyInputs(articleForm);
    });

    closeModal.addEventListener('click', e => {
        mainFunctions.hideModal(productModal);
    });

    articleForm.addEventListener('change', e => {
        if (e.target.matches('.required')) {
            mainFunctions.removeWrongInput(e.target)
        }
    })

    let objectProduct = {
        productId: {
            className: 'text-center',
            headDescription: 'Código del producto'
        },
        productName: {
            className: 'text-left',
            headDescription: 'Descripción'
        },
        productBarCode: {
            className: 'text-left',
            headDescription: 'Código de barra'
        },
        productPrice: {
            className: 'text-right',
            headDescription: 'Precio'
        },
        productCost: {
            className: 'text-right',
            headDescription: 'Costo'
        }
    }

    productTable.append(createTable(getProducts, objectProduct)); 

    mainFunctions.fillSelectElement(productCategory, getCategories, 'categoryDescription', 'categoryId');
    mainFunctions.fillSelectElement(productFamily, getFamilies, 'familyDescription', 'familyId');
    mainFunctions.fillSelectElement(productStatus, getStatus, 'statusDescription', 'statusId');

    loaderController.disabled();

})()