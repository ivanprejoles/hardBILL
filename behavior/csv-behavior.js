class Data{
    constructor(){
        this.cell_type = {
            neutral_variable : {dataName:'Indepentdent Text', type:'text',times:'0-i',adapt: 'dynamic'},
            dependent_variable : {dataName:'Dependent Text', type:'text', times:'0-i', adapt:'fixed'},
            influential_variable :{dataName:'Influential Text', type:'text', times:'1', adapt:'super'},
            total : {dataName:'total', type:'number', times:'0-1', adapt:'dynamic'},
            quantity : {dataName:'Independent Number', type:'number', times:'0-1', adapt:'dynamic'},
            value : {dataName:'Dependent Number', type:'number', times:'1', adapt:'fixed'},
        },
        this.init_table = {
            cell_num :0,
            my_cell : {
            },
            cellCalc: {
                columnCalc:{
                },
                selectedColumn: 0
            }
        },
        this.reference = {
            reference_color:{
            },
            reference_post:[],
            current_reference: {
            }
        },
        this.table_data = {
            adv_data: [],
            adv_color:[],
            lobby_data : [],
            lobby_color : [],
            current_data : {
                sortingReference: [],
                groupingReference: [0],
                data : {}
            },
        },
        this.sortAndCluster = {
            pickedIndex : -1,
            unsortedIndices : [],
            draggableIndex : null,
            dragAfter : null,
            index : ['1','2','3'],
            mousedown : null
        }
        this.increment = {
            cell : [],
            element : null
        },
        this.check = {
            data: [],
            column: 0
        }
    }
}

const data = new Data();
const storedData = localStorage.getItem('data');
function getLocal(){
    if(storedData !== null){
        let stored = JSON.parse(storedData)
        data.init_table = stored.init_table;
        data.reference = stored.reference;
        data.table_data.current_data.groupingReference = stored.groupingReference;
        data.sortAndCluster.unsortedIndices = stored.unsortedIndices;
    }
}
getLocal();
const init_btn = document.querySelector('.init-table');
init_btn.addEventListener('click', () => {
    const body = document.querySelector('.init-modal-body');
    if(body.querySelector('.init-row') !== null){   
        return
    }
    const column_num = document.querySelector('.column-num');
    if(column_num.value === '' || isNaN(column_num.value) || parseInt(column_num.value) >= 27||parseInt(column_num.value) <=1){
        customAlert('Inserted number of column is not recommended.',3000);
        return 0;
    }
    data.init_table.cell_num = column_num.value;
    const dataOptions = Object.keys(data.cell_type)
    const row = document.createElement('div');

    body.appendChild(row);
    row.setAttribute('class', 'init-row');
    for(let i = 0; i < column_num.value; i++){
        let column = document.createElement('div');
        row.appendChild(column);
        column.setAttribute('class', 'init-column');
        let table_label = document.createElement('div');
        const normalizedNumber = i % 26;
        table_label.textContent = String.fromCharCode('a'.charCodeAt(0) + normalizedNumber).toUpperCase();
        table_label.style.textAlign = 'center';
        let table_name = document.createElement('input');
        table_name.setAttribute('placeholder', 'Column Name');
        let table_select = document.createElement('select');
        table_select.setAttribute('class', 'select-init');
        for(let i = 0; i < dataOptions.length; i++){
            let option = document.createElement('option');
            option.textContent = data.cell_type[dataOptions[i]].dataName;
            option.value = dataOptions[i];
            table_select.appendChild(option);
        }
        column.appendChild(table_label);
        column.appendChild(table_name);
        column.appendChild(table_select);
        table_select.addEventListener('click', () => {
            let index = table_select.selectedIndex;
            let value = table_select.value;
            table_select.innerHTML = '';
            for(let i = 0; i < dataOptions.length; i++){
                let option = document.createElement('option');
                option.value = dataOptions[i];
                option.textContent = data.cell_type[dataOptions[i]].dataName;
                table_select.appendChild(option);
            }
            table_select.selectedIndex = index;
            table_select.value = value;
        })
        const init_calc = document.querySelector('.init-calc');
        table_select.addEventListener('change', (event) => {
            table_select.value = event.target.value;
            table_select.selectedIndex = event.target.selectedIndex;
            if(table_select.value == 'total'){
                const normalizedNumber = i % 26;
                const numberToString = String.fromCharCode('a'.charCodeAt(0) + normalizedNumber).toUpperCase()
                document.querySelector('.input-calc').value =  numberToString+ ' = ';
                init_calc.classList.add('dropdown-active');
                data.init_table.cellCalc.selectedColumn = i;
                if(!(table_select.disabled)){
                    document.querySelectorAll('.select-init').forEach(select => {
                        select.disabled = true;
                    })
                }
                customAlert(`Refer to the example equation for guidance:\n\n  ${numberToString} = B + 1\n  ${numberToString} = (B + A)`, 6000);
            }
        })
    }
})

document.querySelector('.calc-confirm').addEventListener('click', (event) => {
    const calc = data.init_table.cellCalc;
    const init_calc = document.querySelector('.init-calc');
    const input = document.querySelector('.input-calc').value.replace(/\s/g, '');
    const allSelect = document.querySelectorAll('.select-init')
    const convertedChar = input[0].toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0)
    if(evaluateArithmeticEquation(input,allSelect.length) && convertedChar == data.init_table.cellCalc.selectedColumn){
        allSelect.forEach(select => {
            select.disabled = false;
        })
        init_calc.classList.remove('dropdown-active');
        calc.columnCalc[calc.selectedColumn] = input.toUpperCase();
    }else{
        customAlert('Wrong Equation',3000);
    }
    renewEvent(event)
})

function renewEvent(event){
    event.currentTarget.removeEventListener("click", renewEvent);
}
document.querySelector('.clear-init').addEventListener('click',() => {
    document.querySelector('.init-modal-body').innerHTML = ''
})
const maketable = document.querySelector('.btn-make-table');
function checkNewData(){
    if(data.init_table.cell_num >= 2 && Object.keys(data.init_table.my_cell).length == data.init_table.cell_num){
        document.querySelector('.init-modal').classList.add('modal-deactive');
        returnHeader(document.querySelector('.add-on-thead'));
        returnHeader(document.querySelector('.table-thead'));
        returnHeader(document.querySelector('.adv-add-thead'));
        returnHeader(document.querySelector('.added-header'));
        returnHeader(document.querySelector('.adding-header'));
        const reference = data.reference.current_reference;
        const referenceKey = Object.keys(reference)
        for(let i = 0; i < referenceKey.length; i++){
            let tr = document.createElement('tr');  
            tr.setAttribute('class', 'csv-row');
            tr.style.backgroundColor = data.reference.reference_color[referenceKey[i]];
            document.querySelector('.added-list').appendChild(tr);
            data.reference.reference_post.push(referenceKey[i]);
            for(let j = 0; j < data.init_table.cell_num; j++){
                let td = document.createElement('td');
                td.setAttribute('class', 'csv-col');
                tr.appendChild(td);
                let input = document.createElement('input');
                input.value = reference[referenceKey[i]][j].value;
                input.disabled = true;
                input.setAttribute('type', 'text');
                input.style.width = '200px';
                td.appendChild(input);
            }
            let removeRow = document.createElement('button');
            removeRow.innerHTML = 'X';
            removeRow.style.width = '100%';
            removeRow.style.top = '50%';
            removeRow.style.transform = 'translateY(50%)'

            removeRow.addEventListener('click', () => {
                tr.remove();
                delete data.reference.reference_color[referenceKey[i]];
                delete data.reference.current_reference[referenceKey[i]];
                data.reference.reference_post.splice(data.reference.reference_post.indexOf(referenceKey[i]),1)
            })
            tr.appendChild(removeRow);
        }

        return
    }
}
checkNewData();
maketable.addEventListener('click', () => {
    const body = document.querySelector('.init-modal-body');
    if(body.querySelector('.init-row') == null){   
        const column_num = document.querySelector('.column-num');
        if(column_num.value === '' || isNaN(column_num.value) || parseInt(column_num.value) >= 20||parseInt(column_num.value) <=1){
            customAlert('Inserted number of column is not recommended.');
            return 0;
        }
    }
    const columns = document.querySelectorAll('.init-column');
    const tempCell = {};
    let existed = false;
    for(let i = 0; i < columns.length; i++){
        if(!(columns[i].querySelector('select').value in data.cell_type)||(columns[i].querySelector('input').value in tempCell)||(columns[i].querySelector('input').value == '')){
            customAlert('Possible Error:\n\n- Duplicate Column Names.\n- Column Names are empty', 4000);
            return;
        }
        if(columns[i].querySelector('select').value == 'influential_variable'){
            if(existed){
                customAlert('- Only one Influencial Variable is allowed.',4000);
                return;
            }
            existed = true;
        }
        tempCell[columns[i].querySelector('input').value] = data.cell_type[columns[i].querySelector('select').value];
    }
    if(!existed){
        customAlert('Possible Error:\n\n- No table built.\n- No influencial Variable created.',4000);
        return
    }
    data.init_table.my_cell = tempCell;
    document.querySelector('.init-modal').classList.add('modal-deactive')
    returnHeader(document.querySelector('.add-on-thead'));
    returnHeader(document.querySelector('.table-thead'));
    returnHeader(document.querySelector('.adv-add-thead'));
    returnHeader(document.querySelector('.added-header'));
    returnHeader(document.querySelector('.adding-header'));
})

const show_reference = () => {
    const refer_dropdown = document.querySelector('.reference-dd');
    indexZPost(refer_dropdown);
    refer_dropdown.classList.toggle('dropdown-active');
}
document.querySelector('.reference-escape').addEventListener('click', () => {
    document.querySelector('.reference-dd').classList.toggle('dropdown-active');
})
const new_reference = document.querySelector('.add-new-reference');
new_reference.addEventListener('click', () => {
    const dropdown_body = document.querySelector('.adding-list');
    const reference_row = document.createElement('tr');
    dropdown_body.appendChild(reference_row);
    reference_row.setAttribute('class', 'csv-row');
    const get_key = Object.keys(data.init_table.my_cell);
    let reference_data = [];
    let super_index = null;
    for(let i = 0; i < get_key.length; i++){
        let td = document.createElement('td');
        td.setAttribute('class', 'csv-col');
        let input = document.createElement('input');
        input.style
        td.appendChild(input)
        input.setAttribute('type', data.init_table.my_cell[get_key[i]].type);
        reference_row.appendChild(td);
        if(data.init_table.my_cell[get_key[i]].adapt == 'fixed' || data. init_table.my_cell[get_key[i]].adapt == 'super'){
            if(data.init_table.my_cell[get_key[i]].adapt == 'super'){
                super_index = i
                input.style.border = '1px dashed red'
            }
            reference_data.push(input);
            input.setAttribute('placeholder', 'input here');
        }else{
            input.disabled = true;
            let placeholder = 'disabled input';
            if(data.init_table.my_cell[get_key[i]].dataName == 'total'){
                const cellKey = Object.keys(data.init_table.my_cell);
                placeholder = data.init_table.cellCalc.columnCalc[i].replace(/[a-zA-Z]/g, char => `${cellKey[char.toUpperCase().charCodeAt(0) - 65]} `);
            }
            input.setAttribute('placeholder', placeholder);
            input.style.cursor = 'not-allowed'
            reference_data.push(0);
        }
    }
    const color = document.createElement('input')
    color.setAttribute('type', 'color');
    color.style.cursor = 'pointer'
    color.value = '#ffffff';
    reference_row.appendChild(color);
    const removeRow = document.createElement('button');
    removeRow.innerHTML = 'X';
    removeRow.style.width = '100%'
    reference_row.appendChild(removeRow);
    removeRow.addEventListener('click', () => {
        if(data.reference.current_reference.hasOwnProperty(reference_data[super_index].value)){
            delete data.reference.current_reference[reference_data[super_index].value];
            delete data.reference.reference_color[reference_data[super_index].value];
            data.reference.reference_post.splice(data.reference.reference_post.indexOf(reference_data[super_index].value),1);
        }
        reference_row.remove();
        reference_data = [];
         
    })
    const update_button = document.querySelector('.update-reference');
    update_button.addEventListener('click', () => {
        if(reference_data.length > 0){
            const current_reference = data.reference.current_reference;
            const current_container = []
            for(let i = 0; i < reference_data.length; i++){
                let single_data = {};
                single_data['name'] = get_key[i];
                single_data['value'] = reference_data[i].value;
                single_data['type'] = data.init_table.my_cell[get_key[i]].type;
                single_data['adapt'] = data.init_table.my_cell[get_key[i]].adapt;
                current_container.push(single_data);
            }
            const inputElements = reference_row.getElementsByTagName('input');
            for (let i = 0; i < inputElements.length; i++) {
                inputElements[i].disabled = true;
            }
            data.reference.reference_color[reference_data[super_index].value] = color.value;
            current_reference[reference_data[super_index].value] = current_container;
            reference_row.style.backgroundColor = color.value;
            if(color.parentNode === reference_row){
                reference_row.removeChild(color)
            }   
            const parent = document.querySelector('.added-list');
            
            if(reference_data[super_index].value in current_reference && data.reference.reference_post.includes(reference_data[super_index].value)){
                parent.removeChild(parent.childNodes[data.reference.reference_post.indexOf(reference_data[super_index].value)]);
                data.reference.reference_post.splice(data.reference.reference_post.indexOf(reference_data[super_index].value),1);
            }
            parent.appendChild(reference_row);
            data.reference.reference_post.push(reference_data[super_index].value)

        }
    })
})


const add_row_dd = document.querySelector('.adv-add-row-dd');
const escape_btn = document.querySelector('.escape');
escape_btn.addEventListener('click', () => {
    add_row_dd.classList.remove('dropdown-active');
})
const adv_add_on_row = () => {
    indexZPost(add_row_dd);
    add_row_dd.classList.toggle('dropdown-active');   
}
const element_container = document.querySelector('.adv-add-tbody');
const add_row = document.querySelector('.btn-adv-add-row');
const update_row = document.querySelector('.btn-to-add-container');
add_row.addEventListener('click', () => {
    if(Object.keys(data.reference.current_reference).length <= 0){
        indexZPost(document.querySelector('.reference-dd'))
        document.querySelector('.reference-dd').classList.add('dropdown-active');
        customAlert('No Entry Record', 4000);
        return
    }
    const number_input = document.querySelector(".number-input");
    const value_input = calculateTotalValues(number_input.value);
    if(value_input > 0){
        const reference = data.reference.current_reference;
        const selected_reference = Object.keys(reference);
        const adv_data = data.table_data.adv_data;
        const adv_color = data.table_data.adv_color;
        const temp = {};
        adv_data.push(temp);
        adv_color.push(data.reference.reference_color[selected_reference[0]])
        const data_post = adv_data.length - 1;
        adv_data[data_post]['number'] = value_input;
        adv_data[data_post]['super'] = selected_reference[0];
        adv_data[data_post]['data'] = [];
        adv_data[data_post]['newData'] = {};
        const rowElement = document.createElement('tr');
        rowElement.setAttribute('class', 'csv-row')
        rowElement.style.backgroundColor = data.reference.reference_color[selected_reference[0]]
        makeColumn(rowElement,adv_data, data_post, adv_data[data_post].newData, 0, value_input, adv_color, data_post, false);
        element_container.appendChild(rowElement);
    }else{
        customAlert('no data',4000);
    }   
});
function addToLobby(){
    if(data.table_data.adv_data.length > 0){
        makeRow(data.table_data.adv_data, data.table_data.adv_color);
        data.table_data.adv_data = [];
        data.table_data.adv_color = [];
        document.querySelector('.adv-add-tbody').innerHTML = '';
    }
};

function show_addOn(){
    document.querySelector('.add-on-container').classList.toggle('hide')
}
function close_addOn(event){
    document.querySelector('.add-on-container').classList.add('hide');
}
const makeRow = (adv_data,adv_color) => {
    const element_container = document.querySelector('.add-on-tbody');
    const selected_reference = Object.keys(data.reference.current_reference);
    for(let item = 0; item < adv_data.length; item++){
        for(let row_i = 0; row_i < adv_data[item].number; row_i++){
            let lobby_data = data.table_data.lobby_data
            let lobby_color = data.table_data.lobby_color;
            let temp = {};
            lobby_data.push(temp);
            lobby_color.push(adv_color[item]);
            let data_post = lobby_data.length - 1;
            lobby_data[data_post]['super'] = adv_data[item].super;
            lobby_data[data_post]['data'] = [];
            lobby_data[data_post]['newData'] = {};
            for(let keys in adv_data[item].newData){
                lobby_data[data_post]['newData'][keys] = adv_data[item].newData[keys]
            }
            let rowElement = document.createElement('tr');
            rowElement.style.backgroundColor = adv_color[item];
            rowElement.setAttribute('class', 'csv-row')
            makeColumn(rowElement, lobby_data, data_post, lobby_data[data_post].newData, selected_reference.indexOf(adv_data[item].super), 0, lobby_color, item, false);
            element_container.appendChild(rowElement);
        }
    }
}
const makeColumn = (rowElement, lobby_data, data_post,  newData, selected_opt_index, number_input,adv_color, color_post, changeSelect, csv_data) => {
    const current_references = data.reference.current_reference;
    let totalColumn = [];
    for(let col_i = 0; col_i < data.init_table.cell_num; col_i++){
        let object = {value: null, type: null, adapt: null};
        lobby_data[data_post].data.push(object);
        let columnElement = document.createElement('td');
        let ifSelectChange = false;
        lobby_data[data_post].data[col_i].value = (newData[col_i] == null) ? current_references[lobby_data[data_post].super][col_i]['value'] : newData[col_i];
        if(newData[col_i] === undefined){
            columnElement.innerHTML = (current_references[lobby_data[data_post].super][col_i]['value'] == undefined)? '' : current_references[lobby_data[data_post].super][col_i]['value'];
            lobby_data[data_post].data[col_i].value = current_references[lobby_data[data_post].super][col_i]['value'];
            newData[col_i] = current_references[lobby_data[data_post].super][col_i]['value'];
        }else{
            let isAdapt = (lobby_data[data_post]['super'] == null)? false : data.init_table.my_cell[Object.keys(data.init_table.my_cell)[col_i]]['adapt']
            if( changeSelect && isAdapt == 'fixed'){
                newData[col_i] = current_references[lobby_data[data_post].super][col_i]['value'];
                columnElement.innerHTML = current_references[lobby_data[data_post].super][col_i]['value'];
                lobby_data[data_post].data[col_i].value = current_references[lobby_data[data_post].super][col_i]['value']
            }else{
                columnElement.innerHTML = newData[col_i];
                lobby_data[data_post].data[col_i].value = newData[col_i];
            }
        }
        if(data.init_table.my_cell[Object.keys(data.init_table.my_cell)[col_i]].dataName == 'total' && lobby_data[data_post]['super'] != null){
            totalColumn.push(col_i);
        }
        let type;
        if(lobby_data[data_post]['super'] == null){
            type = csv_data[color_post].data[col_i];
        }else{
            type = (current_references.hasOwnProperty(lobby_data[data_post]['super'])) ? current_references[lobby_data[data_post].super][col_i] : data.init_table.my_cell[Object.keys(data.init_table.my_cell)[col_i]];
        }
        lobby_data[data_post].data[col_i].type = type.type;
        lobby_data[data_post].data[col_i].adapt = type.adapt;

        let input = (type.adapt == 'super')? document.createElement('select') : document.createElement('input');
        let tempHTML = columnElement.innerHTML;
        columnElement.addEventListener('click', () => {
            if(data.init_table.my_cell[Object.keys(data.init_table.my_cell)[col_i]].dataName == 'total'){
                return
            }
            if(!columnElement.classList.contains('editing')){
                columnElement.classList.add('editing');
                const currentValue = columnElement.innerHTML;
                columnElement.innerHTML = '';
                if(type.adapt == 'super'){
                    let key_reference = null;  
                    input.innerHTML = '';
                    input.innerHTML = tempHTML
                    key_reference = Object.keys(data.reference.current_reference);
                    let color_reference = Object.keys(data.reference.reference_color);
                    for(let key of key_reference){
                        let option = document.createElement('option');
                        option.textContent = key;
                        option.value = key;
                        input.appendChild(option);
                    }
                    columnElement.appendChild(input)
                    input.focus();
                    input.selectedIndex = selected_opt_index;
                    input.value = '';
                    input.addEventListener('change', () => {
                        ifSelectChange = true;
                        data_post = Array.from(rowElement.parentNode.children).indexOf(rowElement);
                        let selected_opt_index = input.selectedIndex;
                        let selected_opt_value = input.value;
                        if(selected_opt_value == key_reference[selected_opt_index]){
                            rowElement.innerHTML = '';
                            adv_color[color_post] = data.reference.reference_color[color_reference[selected_opt_index]];
                            rowElement.style.backgroundColor = data.reference.reference_color[color_reference[selected_opt_index]];
                            lobby_data[data_post].super = key_reference[selected_opt_index];
                            lobby_data[data_post].data = [];
                            newData[col_i] = input.value;
                            makeColumn(rowElement, lobby_data, data_post, newData, selected_opt_index, number_input, adv_color, color_post,true);
                        }
                    })
                }else if(type.adapt == 'dynamic'||type.adapt == 'fixed'){

                    input.setAttribute('type', 'text');
                    input.width = 'inherit';
                    columnElement.appendChild(input);
                    input.value = currentValue;
                    input.focus();
                    input.addEventListener('change', () => {
                        data_post = Array.from(rowElement.parentNode.children).indexOf(rowElement);
                        lobby_data[data_post].data[col_i]['value'] = input.value;
                        newData[col_i] = input.value;
                        const normalizedNumber = col_i % 26;
                        const columnCalc = data.init_table.cellCalc.columnCalc;
                        const numberToString = String.fromCharCode('a'.charCodeAt(0) + normalizedNumber).toUpperCase();
                        const includedCal = Object.keys(columnCalc).filter(key => columnCalc[key].includes(numberToString));
                        for(let j = 0; j < includedCal.length; j++){
                            let evalTotal = evaluateTotal(lobby_data[data_post].data, columnCalc[includedCal[j]])
                            lobby_data[data_post].data[includedCal[j]].value = evalTotal;
                            newData[includedCal[j]] = evalTotal
                            rowElement.querySelectorAll('.csv-column')[includedCal[j]].innerHTML =  evalTotal;
                        }
                    });
                }
            }
        });
        if(type.adapt != 'super'){
            input.addEventListener('focus', showIncrement);
        }
        columnElement.setAttribute('class', 'incrementable csv-column');
        columnElement.addEventListener('dragover', draggingOver);
        columnElement.addEventListener('drop', (event) => {
            drop(event, lobby_data);
        });
        if(!number_input){
            data.increment.method = false;
        }else{
            data.increment.method = true;
        }
        columnElement.addEventListener('keydown', numberKeyDown);
        input.addEventListener('keyup', (event) => {
            if(event.key == 'ArrowLeft' || event.key == 'ArrowRight' || event.key == 'ArrowUp' || event.key == 'ArrowDown'){
                let key;
                let caretPos;
                let condition;
                const { selectionStart, selectionEnd } = event.target;
                switch(event.key){
                    case 'ArrowLeft':
                        key = 0;
                        caretPos = selectionStart - 1;
                        condition = selectionStart > 0 && key == 0;
                        break;
                    case 'ArrowRight':
                        key = 1;
                        caretPos = selectionEnd + 1;
                        condition = selectionStart < input.value.length && key == 1;
                        break;
                    case 'ArrowUp':
                        key = 2;
                        caretPos = 0;
                        condition = selectionStart > 0 && key == 2;
                        break;
                    case 'ArrowDown':
                        key = 3;
                        caretPos = input.value.length
                        condition = selectionStart < input.value.length && key == 3;
                        break;
                }
                input.scrollLeft = input.scrollWidth * (selectionStart / input.value.length);
                let childrens = Array.from(columnElement.parentNode.children);
                let currentColumn = Array.from(columnElement.parentNode.children).indexOf(columnElement);
                let parents = Array.from(columnElement.parentNode.parentNode.children);  
                let currentParentElement;
                let currentCell;
                if(type.adapt !== 'super'){
                    if(selectionStart === selectionEnd && condition){
                        columnElement.children[0].setSelectionRange(caretPos, caretPos);
                        return;
                    }
                }
                event.preventDefault();
                let currentElement = columnElement;
                try{
                    switch(key){
                    case 0:
                        while(childrens.indexOf(currentElement) > 0){
                            currentElement = currentElement.previousElementSibling;
                            if(currentElement.tagName === 'TD'){
                                currentElement.click();
                                if(!(currentElement.children[0].tagName === 'SELECT')){
                                    currentElement.children[0].setSelectionRange(0,0);
                                }
                                break;
                            }
                        }
                        break;
                    case 1:
                        while(childrens.indexOf(currentElement) < childrens.length-1){
                            currentElement = currentElement.nextElementSibling;
                            if(currentElement.tagName === 'TD'){
                                currentElement.click();
                                if(!(currentElement.children[0].tagName === 'SELECT')){
                                    currentElement.children[0].selectionStart = currentElement.children[0].value.length;
                                    currentElement.children[0].selectionEnd = currentElement.children[0].value.length;
                                }
                                break;
                            }
                        }
                        break;
                    case 2:
                        if(parents.indexOf(columnElement.parentNode) <= 0){
                            return;
                        }
                        currentParentElement = columnElement.parentNode.previousElementSibling;
                        currentCell = currentParentElement.children[currentColumn];
                        if(currentCell.tagName != columnElement.tagName){
                            return;
                        }
                        currentCell.click();
                        if(!(currentCell.children[0].tagName === 'SELECT')){
                            currentCell.children[0].setSelectionRange(0,0);
                        };
                        break;
                    case 3:
                        if(parents.indexOf(columnElement.parentNode) >= parents.length-1){
                            return;
                        }
                        currentParentElement = columnElement.parentNode.nextElementSibling;
                        currentCell = currentParentElement.children[currentColumn];
                        if(currentCell.tagName != columnElement.tagName){
                            return 0;
                        }
                        currentCell.click();
                        if(!(currentCell.children[0].tagName === 'SELECT')){
                            currentCell.children[0].selectionStart = currentCell.children[0].value.length;
                            currentCell.children[0].selectionEnd = currentCell.children[0].value.length;
                        }
                        break;
                    }
                }catch(error){
                    
                }
            }
        })
        input.addEventListener('blur', (event) => {
            const parentCell = event.target.parentNode;
            const newValue = event.target.value;
            parentCell.removeChild(event.target);
            if(!(ifSelectChange) && type.adapt == 'super'){
                parentCell.innerHTML = tempHTML;
            }else{
                if(event.relatedTarget == parentCell.querySelector('.span-increment') && parentCell.querySelector('.span-increment') != null){
                    const span = parentCell.querySelector('.span-increment');
                    const { top, left } = span.getBoundingClientRect();
                    parentCell.removeChild(span);
                    span.style.top = `${top}px`;
                    span.style.left = `${left}px`;
                    document.body.appendChild(span);
                }
                parentCell.innerHTML = newValue;
            }
            parentCell.classList.remove('editing');  
        });
        rowElement.appendChild(columnElement);
    }
    if(number_input){
        const count = document.createElement('div');
        count.innerHTML = number_input;
        rowElement.appendChild(count);
    }
    const deleteRow = document.createElement('button');
    deleteRow.innerHTML ='X';
    deleteRow.addEventListener('click', () => {
        data_post = Array.from(rowElement.parentNode.children).indexOf(rowElement);
        rowElement.remove();
        lobby_data.splice(data_post, 1);
    })
    rowElement.appendChild(deleteRow);
    for(let i = 0; i < totalColumn.length; i++){
        const total = evaluateTotal(lobby_data[data_post].data, data.init_table.cellCalc.columnCalc[totalColumn[i]])
        lobby_data[data_post].data[totalColumn[i]].value = total;
        newData[totalColumn[i]] = total;
        rowElement.querySelectorAll('td')[totalColumn[i]].innerHTML = total;
    }
}

function adjustInputSize(input, cell) {
    const cellStyle = getComputedStyle(cell);
    const minWidth = parseFloat(cellStyle.paddingLeft) + parseFloat(cellStyle.paddingRight);
    if(input.offsetWidth >= cell.offsetWidth){
        input.style.width = Math.max(minWidth, input.scrollWidth) + 'px';
        cell.style.width = Math.max(minWidth, input.scrollWidth) + 'px';
    }
}
function setSelectionRange(input, start, end){
    if(input.setSelectionRange){
        input.focus();
        input.setSelectionRange(start, end);
    }else if(input.createTextRange){
        input.collapse(true);
        
    }
}
function transformToCSVDate(String) {
    const date = new Date(String);
    const isValid = !isNaN(date) && Object.prototype.toString.call(date) === '[object Date]' && isFinite(date);
  
    if (isValid) {
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const year = date.getFullYear().toString();
      return `${month}/${day}/${year}`;
    } else {
      return String;
    }
}
function numberKeyDown(event, method){
    const key = event.key || event.keyCode || event.which;
    if(key == 'Enter'){
        event.target.blur();
        return
    }
    if(method == 1){
        const allowedKeys = ['Backspace','Enter'];
        allowedKeys.push(...['ArrowUp','ArrowDown','ArrowLeft','ArrowRight', '-'])
        const isNumeric = key >= '0' && key <= '9';
        if((key === '-' && event.target.value.includes('-') || (event.target.value.length < 1 && key === '-'))){
            event.preventDefault();
            return
        }
        const isAllowedKey = allowedKeys.includes(key);
        if (!isNumeric && !isAllowedKey) {
            event.preventDefault();
        }
    }else{
        const disallowedKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
        if (disallowedKeys.includes(event.key)) {
            event.preventDefault();
        }else{
            adjustInputSize(event.target, event.target.parentNode);
        }
    }
}
const increment = document.querySelector('.span-increment');
function showIncrement(event){
    data.increment.element = event.target.parentNode;
    increment.classList.remove('hide')
    event.target.parentNode.appendChild(increment);
}
increment.addEventListener('dragstart', (event) => {
    data.increment.cell[0] = Array.from(data.increment.element.parentNode.parentNode.children).indexOf(data.increment.element.parentNode);
    data.increment.cell[1] = Array.from(data.increment.element.parentNode.children).indexOf(data.increment.element);
    data.increment.parent = data.increment.element.parentNode.parentNode;
});

increment.addEventListener('dragend', () => {
    increment.classList.remove('dragging');
    increment.classList.add('hide');
    increment.style.top ='';
    increment.style.left='';
})
increment.addEventListener('mouseup', () =>{
    increment.classList.remove('dragging');
    increment.classList.add('hide');
    increment.style.top ='';
    increment.style.left='';
})
function draggingOver(event){
    event.preventDefault();
}
function splittingValue(value){
    let number = '';
    let text = ''
    let post = value.length;
    let isNumeric = -1;
    for (let i = 0; i < value.length; i++) {
        if (!isNaN(Number(value[i])) && isNumeric == -1) {
            post = i;
            isNumeric = 1;
        }
        if(isNaN(Number(value[i]))){
            post = value.length;
            isNumeric = -1
        }
    }
    text = value.substring(0, post);
    number = (value.substring(post).length <= 0) ? '': Number(value.substring(post));
    return [text,number];
}
function calculateTotalValues(input) {
  const numbers = input.split('-').map(Number);
  if (numbers.length === 1) {
    if(numbers[0] > 1000){
        return 0;
    }
    return numbers[0];
  }
  const [start, end] = numbers;
  if (end < start) {
    return 0;
  }
  const total = end - start + 1;
  if (total > 1000) {
    return 0;
  }
  if (total <= 0) {
    return 0;
  }
  return total;
}
function drop(event, anyData){

    var value = data.increment.element.innerHTML.trim();
    var splitValue = splittingValue(value);
    var condition = (typeof splitValue[1] === 'number') ? 1 : 0;
    var end = Array.from(event.target.parentNode.parentNode.children).indexOf(event.target.parentNode);
    var start = data.increment.cell[0];
    var Index = data.increment.cell[1];
    const normalizedNumber = Index % 26;
    const columnCalc = data.init_table.cellCalc.columnCalc;
    const numberToString = String.fromCharCode('a'.charCodeAt(0) + normalizedNumber).toUpperCase();
    const includedCal = Object.keys(columnCalc).filter(key => columnCalc[key].includes(numberToString));

    if(start < end){
        start++
        for(let i = start; i <= end; i++){
            splitValue[1] = (condition) ? splitValue[1] + 1 : '';
            data.increment.parent.children[i].children[Index].innerHTML =  splitValue[0]+splitValue[1];
            anyData[i].data[Index].value = splitValue[0]+splitValue[1];
            anyData[i].newData[data.increment.cell[1]] = splitValue[0]+splitValue[1];
            for(let j = 0; j < includedCal.length; j++){
                let evalTotal = evaluateTotal(anyData[i].data, columnCalc[includedCal[j]])
                anyData[i].data[includedCal[j]].value = evalTotal;
                anyData[i].newData[includedCal[j]] = evalTotal
                data.increment.parent.children[i].children[includedCal[j]].innerHTML =  evalTotal;
            }
        }
    }
    if(start > end){
        start--
        for(let i = start; i >= end; i--){
            splitValue[1] = (condition) ? splitValue[1] - 1 : '';  
            data.increment.parent.children[i].children[Index].innerHTML =  splitValue[0]+splitValue[1];
            anyData[i].data[Index].value = splitValue[0]+splitValue[1];
            anyData[i].newData[Index] = splitValue[0]+splitValue[1];
            for(let j = 0; j < includedCal.length; j++){
                let evalTotal = evaluateTotal(anyData[i].data, columnCalc[includedCal[j]])
                anyData[i].data[includedCal[j]].value = evalTotal;
                anyData[i].newData[includedCal[j]] = evalTotal
                data.increment.parent.children[i].children[includedCal[j]].innerHTML =  evalTotal;
            }
        }
    }    const span = document.querySelector('.span-increment')
    span.classList.add('hide');
    span.style.top ='';
    span.style.left='';
}

function returnHeader(parent){
    let keys = Object.keys(data.init_table.my_cell);
    const row = document.createElement('tr');
    row.setAttribute('class', 'csv-row');
    for(let i = 0; i < keys.length; i++){
        let col = document.createElement('th');
        col.setAttribute('class', 'csv-col');
        col.innerHTML = keys[i];
        row.appendChild(col);
    }
    parent.appendChild(row);
}


dragWindow();
function dragWindow(){
    const windows = document.querySelectorAll('.drag-window');
    for(let i = 0; i < windows.length; i++){
        let isDragging = false;
        let offsetX, offsetY;
        const header = windows[i].querySelector(".drag-window-header");
        header.addEventListener('mousedown', (e) => {
            isDragging = true;
            offsetX = e.clientX - windows[i].offsetLeft;
            offsetY = e.clientY - windows[i].offsetTop;
            windows[i].style.cursor = 'move';
        });
        document.addEventListener('mouseup', () => {
            if(isDragging){
                const windowLeft = parseFloat(windows[i].style.left);
                const windowTop = parseFloat(windows[i].style.top);
                const windowWidth = windows[i].offsetWidth / 2;
                const windowHeight = windows[i].offsetHeight / 2;

                const windowRightLimit = window.innerWidth;
                const windowBottomLimit = window.innerHeight;

                if(windowLeft.length <= 0){
                    return
                }else{
                    if((windowLeft) <= 0){
                        windows[i].style.left = '0px';
                    }else if(((windowLeft)+windowWidth*2) >= windowRightLimit){
                        windows[i].style.left = (windowRightLimit - (windowWidth*2))+'px';
                    }
                    if((windowTop) <= 0){
                        windows[i].style.top = '0px';
                    }else if(((windowTop)+windowHeight*2) >= windowBottomLimit){
                        windows[i].style.top = (windowBottomLimit - (windowHeight*2))+'px';
                    }
                }
            }
            isDragging = false;
            windows[i].style.cursor = 'default';
            
        });
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                windows[i].style.left = e.clientX - offsetX + 'px';
                windows[i].style.top = e.clientY - offsetY + 'px';

            }
        });
    }  
}
function clearAll(){
    const tables = document.querySelectorAll('.clear');
    for(let i = 0; i < tables.length; i++){
        tables[i].addEventListener('click', () => {
            let alert = confirm('Do you want to clear all data?');
            if(!alert){
                return
            }
            if(tables[i].parentNode.classList.contains('add-on-header')){
                data.table_data.lobby_data = [];
                data.table_data.lobby_color = [];
                document.querySelector('tbody.add-on-tbody').innerHTML = '';
            }else{
                data.table_data.current_data.data = {};
                let table = document.querySelector('.table-body');
                let tbodies = table.querySelectorAll('tbody');
                tbodies.forEach(tbody => {
                    tbody.remove();
                });
            }
        })
    }
}
function insertAll(method){
    if(method){
        addToTable();
    }else{
        addToLobby();
    }
 
}
clearAll();
window.addEventListener('beforeunload', function(event) {

    event.returnValue = 's';
});

function indexZPost(dropdown, down){
    if(down || !(dropdown.classList.contains('dropdown-active'))){
        let Zindex = data.sortAndCluster.index.splice(data.sortAndCluster.index.indexOf(dropdown.dataset.z), 1);
        data.sortAndCluster.index.push(Zindex[0]);
        data.sortAndCluster.mousedown = Zindex[0];
        for(let i = 0; i < data.sortAndCluster.index.length; i++){
            let value = 20+i;
            let selector = `.dropdown[data-Z="${data.sortAndCluster.index[i]}"]`;
            document.querySelector(selector).style.zIndex = value.toString(); 
        }
    }
}

const dropdowns = document.querySelectorAll('.dropdown');
for(let i = 0; i < dropdowns.length; i++){
    if(dropdowns[i].classList.contains('check-dd') || dropdowns[i].classList.contains('check-data')){
        continue;
    }
    dropdowns[i].addEventListener('mousedown', () =>{
        if(dropdowns[i].dataset.z != data.sortAndCluster.mousedown){
            data.sortAndCluster.mousedown = dropdowns[i].dataset.z;
            indexZPost(dropdowns[i], true);
        }
    })
}
document.querySelector('.ResetAll').addEventListener('click', () => {
    let confirms = confirm('Once the data is reset, it becomes unavailable for further use.');
    if(confirms){
        if (localStorage.getItem('data') !== null) {
            localStorage.removeItem('data');
            customAlert('Data successfully deleted from LocalStorage.\n\nThe page will be automatically refreshed after a 3-second delay.',4000)
        }
        setTimeout(function() {
            location.reload();
          }, 3000);
    }
})
document.querySelector('.Save').addEventListener('click', () => {
    let confirms = confirm('When data is saved, it replaces the previous data.\nClearing the Chrome history would also delete the localStorage data.');
    if(confirms){
        let newArr = [];
        const tableData = data.table_data.current_data.data;
        const tableDataKey = Object.keys(tableData);
        for(let i = 0; i < tableDataKey.length; i++){
           let data = tableData[tableDataKey[i]].data;
           newArr.push(...data)
        }
        const dataToSave = {
            init_table : data.init_table,
            reference : data.reference,
            current_data : newArr,
            groupingReference: data.table_data.current_data.groupingReference,
            sortingReference: data.table_data.current_data.sortingReference,
            unsortedIndices: data.sortAndCluster.unsortedIndices,
        }
        localStorage.setItem('data', JSON.stringify(dataToSave));
        customAlert('Data is being saved to localStorage.', 4000)
    }
})
