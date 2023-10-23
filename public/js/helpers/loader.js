let loaderContent = document.getElementById('loaderContent');

let loaderController = {
    enable: () => {
        loaderContent.classList.add('show')
    },
    disabled: () => {
        loaderContent.classList.remove('show')
    }
}

export default loaderController