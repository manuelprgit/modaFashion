let interval;
let counterLoader = 0; 

let alertMessage = document.getElementById('alertMessage');
let loaderBarPorcent = document.getElementById('loaderBarPorcent');
let contentIconAlert = document.getElementById('contentIconAlert');
let alertIcon = document.getElementById('alertIcon');
let loaderBar = document.getElementById('loaderBar');
let exitAlertBanner = document.getElementById('exitAlertBanner');

const closeModal = () => {
    loaderBar.classList.remove('show');
    counterLoader = 0;
}

/**
 * Funcion para llamar el banner de abajo para mostrar alertas
 * @param {string} alertType Error: danger, Advertencia: warning, Exitoso: success
 * @param {string} message Aqui iría el mensaje para mostrar
 */
const showAlertBanner = (alertType, message) => {
    
    loaderBar.classList.remove('show');
    setTimeout(() => {
        alertMessage.textContent = '';
        loaderBarPorcent.className = '';
        contentIconAlert.className = '';
        switch (alertType) {
            case 'danger':
                alertIcon.classList.add('fa-solid', 'fa-xmark');
                alertMessage.textContent = message;
                loaderBarPorcent.classList.add('loader-bar-danger');
                contentIconAlert.classList.add('icon-container-danger');
                break;
            case 'warning':
                alertIcon.classList.add('fa-solid', 'fa-exclamation');
                alertMessage.textContent = message;
                loaderBarPorcent.classList.add('loader-bar-warning');
                contentIconAlert.classList.add('icon-container-warning');
                break;
            case 'success':
                alertIcon.classList.add('fa-solid', 'fa-check');
                alertMessage.textContent = message;
                loaderBarPorcent.classList.add('loader-bar-success');
                contentIconAlert.classList.add('icon-container-success');
                break;
            case 'info':
                alertIcon.classList.add('fa-solid', 'fa-info'); 
                alertMessage.textContent = message;
                loaderBarPorcent.classList.add('loader-bar-info');
                contentIconAlert.classList.add('icon-container-info');
                break;
        }
        
        loaderBar.classList.add('show'); 

    }, 500);
}
 
//TODO: alert banner confirmation
    //?here is the code
//TODO: alert banner confirmation

exitAlertBanner.addEventListener('click', e => {
    closeModal();
});

export {
    showAlertBanner,
}
