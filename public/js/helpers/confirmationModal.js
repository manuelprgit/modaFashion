let modalContainerBackground = document.getElementById('modalContainerBackground');
let textHeader = document.getElementById('textHeader');
let textP = document.getElementById('textP');
let acceptButtton = document.getElementById('acceptButtton');
let rejectButton = document.getElementById('rejectButton');

function showConfirmationModal(headerText, message) {
    return new Promise((resolve, reject) => {

        modalContainerBackground.classList.add('show');
        textHeader.textContent = headerText;
        textP.innerHTML = message;

        acceptButtton.addEventListener('click', e => {
            resolve(true);
            hideRejectModal()
        })
        rejectButton.addEventListener('click', e => {
            resolve(false);
            hideRejectModal();
        })

    })
}

const hideRejectModal = () => {
    modalContainerBackground.classList.remove('show');
}

export default showConfirmationModal;