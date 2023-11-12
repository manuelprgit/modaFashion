import { showAlertBanner } from "./helpers/alertBanner.js";

export const mainFunctions = {
    mainUrl: `http://localhost:5098/api/`,
    // mainUrl: `http://192.168.1.106:5098/api/`,
    
    formatter: Intl.NumberFormat("en-US",{
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }),

    /**
     * Esta funcion es para hacer un get
     * @param {URL} url URL del API para hacer el get 
     * @returns devuelve la data en JSON
     */
    getDataFromAPI: async (path) => {
        try {
            // return await fetch(`http://192.168.1.106:5098/api/${path}`)
            return await fetch(`http://localhost:5098/api/${path}`)
                .then(res => {
                    if (res.status >= 400) {
                        throw `Error al hacer la peticion. Error ${res.status}`;
                    }; 
                    return res.json();

                })
                .catch(async err => {
                    throw await err
                })
        } catch (error) {
            showAlertBanner('danger',error);
        }
    },

    /**
     * Funcion para llenar las etiquetas select en el HTML
     * @param {*} elementId Enviamos el Id del elemento select en el HTML
     * @param {*} dataObj Data del api
     * @param {*} textProperty nombre de la propiedad como se llama en el API
     * @param {*} valueProperty valor de la propiedad como se llama en el API
     */
    fillSelectElement: (elementId, dataObj, textProperty, valueProperty) => {
        let fragment = document.createDocumentFragment();
        for (let data of dataObj) {
            let option = document.createElement('option');
            option.innerText = data[textProperty];
            option.value = data[valueProperty];
            fragment.append(option);
        }
        elementId.append(fragment);
    },

    /**
     *  funcion para hacer put o post
     * @param {string} method metodo POST o PUT
     * @param {Object} data informacion a postear
     * @param {string} urlPath url del api
     * @param {string} dataId si es un PUT, mandar el ID. De lo contrario, no enviar nada.
     * @returns retorna la data del elemento creado 
     */
    sendDataByRequest: async (method, data, urlPath, dataId) => {
        urlPath = mainFunctions.mainUrl+urlPath;
        console.log(urlPath);
        let url = (method.toUpperCase() === 'PUT')
            ? `${urlPath}/${dataId}`
            : urlPath

        return await fetch(url, {
            method: method,
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(async res => {
                if (res.status >= 400) {
                    throw await res.text();
                };
                return res;
            })
            .catch(err => {
                
                return err
            })
    },

    /**
     * Recibe el ID del modal que se abrira
     * @param {HTMLElement} modal id del modal
     */
    showModal: (modal) => {
        modal.classList.add('show');
    },

    /**
     * Recibe el ID del modal que se abrira
     * @param {HTMLElement} modal id del modal
     */
    hideModal: (modal) => {
        modal.classList.remove('show');
    },

    /**
     * Recibe el elemento contenedor de los inputs
     * @param {HTMLElement} context 
     */
    clearAllInputs: (context) => {
        context.querySelectorAll('input, select, textarea').forEach(input => {
            input.value = '';
        })
    },

    /**
     * Funcion que renderiza la informacion de las tablas
     * @param {Array} dataList Informacion de la tabla
     * @param {Function} createRows Funcion que crea las filas
     * @param {HTMLElement} tbody cuerpo de la tabla o TBODY
     */
    renderTables: (dataList, createRows, tbody) => {
        let fragment = document.createDocumentFragment();
        for (let key in dataList) {
            let data = dataList[key];
            let row = createRows(key, data);
            fragment.append(row);
        }
        tbody.append(fragment);
    },

    setWrongInput: (input) => input.classList.add('input-danger'),
    
    removeWrongInput: (input) => input.classList.remove('input-danger'),
    
    /**
     * Valida si los inputs que tengan la clase 'required' esten vacios
     * @param {HTMLElement} context contenedor de inputs
     * @returns true: hay inputs vacios, false: no hay inputs vacios
     */
    validateInputsRequired: (context) => {
        let hasEmptyValue = false;
        context.querySelectorAll('.required')
            .forEach(input => {
                if (input.value == '' || input.value == 0) {
                    mainFunctions.setWrongInput(input);
                    hasEmptyValue = true;
                }
            })
        return hasEmptyValue;
    },

    cleanAllWrongInput: (context) => {
        context.querySelectorAll('input, select, textarea')
            .forEach(input=>{
                mainFunctions.removeWrongInput(input);
            })      
    }
    //validar que los inputs requeridos tengan valor

}