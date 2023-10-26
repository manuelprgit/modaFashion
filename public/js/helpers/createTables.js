 
let createTableData = (data, key, props) => {
    return `<div class="td ${props.className}">${data[key]}</div>`;
}

let createTableRow = (key, data, dataObj) => {
    let row = document.createElement('div');
    row.classList.add('tr')
    row.setAttribute('data-key', key)
    let td = '';
    for (let objKey in dataObj) {
        td += createTableData(data, objKey, dataObj[objKey]);
    }
    row.insertAdjacentHTML('afterbegin', td);
    return row;
}

let createHeadTableData = (props) => {
    return `<div class="th ${props.className}">${props.headDescription}</div>`
}

let createHeaderTableRow = (dataObj) => {
    let thead = document.createElement('div');
    thead.classList.add('thead');
    let row = document.createElement('div');
    row.classList.add('tr');
    let th = '';
    for (let objKey in dataObj) {
        th += createHeadTableData(dataObj[objKey]);
    }
    row.insertAdjacentHTML('afterbegin', th);
    thead.insertAdjacentElement('afterbegin', row);
    return thead;
}

let createTable = (dataTable, dataObj) => {
    let fragment = document.createDocumentFragment();
    let head = createHeaderTableRow(dataObj);
    let tbody = document.createElement('div');
    tbody.classList.add('tbody')
    fragment.append(head);
    for (let key in dataTable) {
        let data = dataTable[key]
        let row = createTableRow(key, data, dataObj);
        tbody.insertAdjacentElement('afterbegin', row);
    }
    fragment.append(tbody);
    console.log(fragment);
    return fragment;
}

export default createTable;