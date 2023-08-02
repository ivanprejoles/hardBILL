const fileIn = document.createElement('input');
fileIn.setAttribute('type', 'file');
fileIn.style.display = 'none';
fileIn.accept = ".csv";
fileIn.addEventListener("click", function() {
  this.value = null;
});
fileIn.addEventListener('change', function (event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function (event) {
        const csvData = event.target.result;
        const dataArray = convertCSVToArray(csvData,0);
        csvMakeRow(dataArray.convertedData, dataArray.colorCoding);
    };
    reader.readAsText(file);
});
function addCSV(){
  fileIn.click();
}
function convertCSVToArray(csvData, checking) {
    csvData = csvData.replace(/\r/g, '');
    const lines = csvData.split('\n');
    const convertedData = [];
    const reference = data.init_table.my_cell;
    const referenceKey = Object.keys(data.init_table.my_cell);
    const colorCoding = [];
    for (let i = 0; i < lines.length; i++) {
        const currentLine = parseCSVLine(lines[i]);
        const nonEmptyLine = currentLine.some(cell => cell.trim() !== '');
        if (nonEmptyLine) {
            let rowData = {
                data: [],
                newData: {},
                super: null
            }
            if(checking){
              rowData.data.push(currentLine)
            }else{
              for(let j = 0; j < referenceKey.length; j++){
                const temp = {
                    value: currentLine[j],
                    type: reference[referenceKey[j]].type,
                    adapt: reference[referenceKey[j]].adapt
                }
                rowData.data.push(temp);
                if(reference[referenceKey[j]].adapt == 'super'){
                  if(Object.keys(data.reference.current_reference).includes(currentLine[j])){
                    rowData.super = currentLine[j];
                    colorCoding.push(data.reference.reference_color[currentLine[j]])
                  }else{
                    colorCoding.push('#f5f5f5');
                  }
                }
                rowData.newData[j] = currentLine[j];
            }
          }
            convertedData.push(rowData);
        }
    }
    return {convertedData,colorCoding};
}

  function parseCSVLine(line) {
    const cells = [];
    let currentCell = '';
    const openingQuotePositions = [];

    for (let i = 0; i < line.length; i++) {
      const char = line.charAt(i);

      if (char === '"' && line.charAt(i + 1) === '"') {
        currentCell += '"';
        i++;
      } else if (char === '"') {
        if (openingQuotePositions.length === 0) {
          openingQuotePositions.push(i);
        } else {
          const openQuoteIndex = openingQuotePositions.pop();
          const wordInQuotes = line.substring(openQuoteIndex + 1, i);
          const cleanedWord = wordInQuotes.replace(/,/g, '');
          currentCell = currentCell.slice(0, openQuoteIndex) + cleanedWord + currentCell.slice(i + 1);
          
        }
      } else if (char === ',' && openingQuotePositions.length === 0) {
        cells.push(currentCell);
        currentCell = '';
      } else {
        currentCell += char;
      }
    }

    cells.push(currentCell);

    return cells;
  }
function csvMakeRow(csv_data, csv_color){
  for(let row = 0; row < csv_color.length; row++){
    let lobby_data = data.table_data.lobby_data;
    let lobby_color = data.table_data.lobby_color;
    let temp = {};
    lobby_data.push(temp);
    lobby_color.push(csv_color[row]);
    let data_post = lobby_data.length - 1;
    lobby_data[data_post]['super'] = csv_data[row].super;
    lobby_data[data_post]['data'] = [];
    lobby_data[data_post]['newData'] = {};
    for(let keys in csv_data[row].newData){
      lobby_data[data_post]['newData'][keys] = csv_data[row].newData[keys];
    }
    let rowElement = document.createElement('tr');
    rowElement.style.background = csv_color[row];
    rowElement.setAttribute('class', 'csv-row');
    let selectedIndex = (csv_data[row].super == null)? null : Object.keys(data.reference.current_reference).indexOf(csv_data[row].super)

    makeColumn(rowElement, lobby_data, data_post, lobby_data[data_post].newData, selectedIndex, 0, lobby_color, row, false, csv_data);
    document.querySelector('.add-on-tbody').appendChild(rowElement);
  }
}

const fileCheck = document.createElement('input');
fileCheck.setAttribute('type', 'file');
fileCheck.style.display = 'none';
fileCheck.accept = ".csv";
fileCheck.addEventListener("click", function() {
  this.value = null;
});
fileCheck.addEventListener('change', function (event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function (event) {
        const csvData = event.target.result;
        const dataArray = convertCSVToArray(csvData,1);
        visualiseBill(dataArray.convertedData)
    };
    reader.readAsText(file);
});
function check_bill(){
  fileCheck.click();
}
function visualiseBill(convertedData){
  if(convertedData.length <= 0){
    return
  }
  let checkPage = document.querySelector('.check-page');
  if(checkPage.classList.contains('dropdown-active')){
    checkPage.classList.remove('dropdown-active');
  }
  const thead = document.querySelector('.check-thead');
  const tbody = document.querySelector('.check-tbody');
  thead.innerHTML = '';
  tbody.innerHTML = '';
  

  data.check.column = convertedData[0].data[0].length;
  let trh = document.createElement('tr');
  thead.appendChild(trh);
  for(let i = 0; i < convertedData[0].data[0].length; i++){
    let td = document.createElement('th');
    const normalizedNumber = i % 26;
    td.innerHTML = String.fromCharCode('a'.charCodeAt(0) + normalizedNumber).toUpperCase();
    trh.appendChild(td);
  }
  for(let i = 0; i < convertedData.length; i++){
    data.check.data.push(convertedData[i].data);
    let tr = document.createElement('tr');
    tr.setAttribute('class','csv-row')
    tbody.appendChild(tr);
    for(let j = 0; j < convertedData[i].data[0].length; j++){
      let td = document.createElement('td');
      td.setAttribute('class','csv-col')
      td.textContent = convertedData[i].data[0][j];
      tr.appendChild(td);
    }
  }
  checkPage.classList.add('dropdown-active');
}

document.querySelector('.automate-box').addEventListener('click', () =>{
    document.querySelector('.check-data').classList.toggle('dropdown-active');
})

document.querySelector('.check-escape').addEventListener('click', () => {
  document.querySelector('.check-page').classList.remove('dropdown-active')
  data.check = {
    column : [],
    data : []
  }
  document.querySelector('.check-table thead').innerHTML = '';
  document.querySelector('.check-table tbody').innerHTML = '';
  document.querySelector('.check-data-add-container').innerHTML = '';
  document.querySelector('.check-legend-tbody').innerHTML = '';
  document.querySelector('.check-legend').classList.remove('dropdown-active');
  document.querySelector('.check-data').classList.remove('dropdown-active');

})

document.querySelector('.check-data-add').addEventListener('click', () => {
  let checkMethod = document.querySelector('.check-select');
  let ownMethod = checkMethod.value;
  if(checkMethod.value == 'calculate' || checkMethod.value == 'matching'){
    if(checkMethod.value == 'calculate'){
      customAlert('Refer to the example equation for guidance:\n\n  A = B + 1\n  A = (B + A)', 4000);
    }else{
      customAlert('Refer to the example equation for guidance:\n\n  A = B = C\n  B', 4000);
    }
    var row = document.createElement('div');
    row.setAttribute('class', 'add-div');
    var addElement = document.createElement('div');
    var addTable = document.createElement('div');
    row.appendChild(addElement);
    row.appendChild(addTable);
    addElement.setAttribute('class', 'check-data-row1');
    addTable.setAttribute('class', 'check-data-row2');
    document.querySelector('.check-data-add-container').appendChild(row);
    var input = document.createElement('input');
    input.setAttribute('type', 'text');
    var inputColor = (checkMethod.value == 'calculate')? '#23ee19':'#14b6d9'
    input.style.boxShadow  = `
    inset -2px 0 0 ${inputColor},
    inset 0 -2px 0 ${inputColor},
    inset 2px 0 0 ${inputColor},
    inset 0 2px 0 ${inputColor}
    `
    var placeholder = (checkMethod.value == 'calculate')? 'Cell to calculate':'Cells to match'
    input.setAttribute('placeholder', placeholder);
    addElement.appendChild(input);
    var addButton = document.createElement('button');
    addButton.innerHTML = 'Add';
    addElement.appendChild(addButton);
    var removeButton = document.createElement('button');
    removeButton.innerHTML = 'X'
    addElement.appendChild(removeButton);
    removeButton.addEventListener('click', () => {
      row.remove();
    })
let ownTable = document.createElement('table');
  addTable.appendChild(ownTable);
  let tableHead = document.createElement('thead');
  ownTable.appendChild(tableHead);
  let tr = document.createElement('tr');
  tableHead.appendChild(tr);
  for(let i = 0; i < data.check.column; i++){
    let th = document.createElement('th');
    tr.appendChild(th);
    let normalizedNumber = i % 26;
    th.innerHTML = String.fromCharCode('a'.charCodeAt(0) + normalizedNumber).toUpperCase();
    tr.appendChild(th);
  }
  tableHead.addEventListener('mousedown', (event) => {
    event.preventDefault();
    const clickedCell = event.target;
    if (clickedCell.tagName === 'TH') {
      const tempInput = input.value.replace(/\s/g, '');
      const columnIndex = clickedCell.cellIndex;
      let value = columnIndex % 26;
      if(ownMethod == 'calculate' ){
        if(tempInput.length <= 1 || (!/^[A-Za-z]$/.test(tempInput[0])) || tempInput[1] != '='){
          input.value = String.fromCharCode('a'.charCodeAt(0) + value).toUpperCase()+'=';
        }else{
          insertLetter(String.fromCharCode('a'.charCodeAt(0) + value).toUpperCase(),input);
        }
      }else{
        if(tempInput.length < 1 ){
          input.value += String.fromCharCode('a'.charCodeAt(0) + value).toUpperCase()+'=';
        }else{
          let selectionStart = input.selectionStart;
          let selectionEnd = input.selectionEnd;
          while(selectionStart > 0 && input.value[selectionStart -1] === ' '){
            selectionStart--;
          }
          while(selectionEnd < input.length-1 && input[selectionEnd +1] === ' '){
            selectionEnd++;
          }
          if(input.value[selectionStart-1] != '=' && selectionStart != 0){
            insertLetter('=',input);
          }
          insertLetter(String.fromCharCode('a'.charCodeAt(0) + value).toUpperCase(),input)
          if(input.value[selectionEnd] != '=' && selectionEnd <input.value.length-1 ){
            insertLetter('=',input);
          }
        }
      }
    }
    input.focus();
  })
    addButton.addEventListener('click', () => {
      let approved = false;
      const tempInput = input.value.replace(/\s/g, '');
      if(ownMethod == 'calculate'){
        if(evaluateArithmeticEquation(tempInput, data.check.column)){
          approved = true;
        }else{
          customAlert('Refer to the example equation for guidance:\n\n  A = B + 1\n  A = (B + A)', 4000);
        }
      }else{
        if(isAlternateLettersAndEqualSigns(input.value, data.check.column)){
          approved = true;
        }else{
          customAlert('Refer to the example equation for guidance:\n\n  A = B = C\n  B', 4000);
        }
      }
      if(approved){
        tableHead.remove();
        input.style.cursor = 'not-allowed';
        const useButton = document.createElement('button');
        useButton.innerHTML = 'Use';
        addElement.prepend(useButton)
        addButton.remove();
        input.disabled = true;
        useButton.addEventListener('click', () => {
          checkTable(tempInput, ownMethod);
        })
      }
    })
  }else{
    customAlert("Error: Option not recommended.");
  }
})

function evaluateArithmeticEquation(str, numberOfLetters) {
  str = str.replace(/\s/g, '');
  let neededStr = str.slice(2);
  neededStr+=str[0];
  if(str.length < 3 || !(/^[A-Za-z]$/.test(str[0])) || str[1] != '='){
    return false;
  }
  const lastLetter = String.fromCharCode('a'.charCodeAt(0) + numberOfLetters - 1);
  const letters = neededStr.match(/[a-zA-Z]/g) || [];
  const anyLetterBeyondRange = letters.some(letter => letter.toUpperCase() > lastLetter.toUpperCase());
  if (anyLetterBeyondRange) {
    return false
  }
  neededStr = neededStr.substring(0, neededStr.length-1);
  const convertedStr = neededStr.replace(/[a-zA-Z]/g, '(1)');
  try {
    result = eval(convertedStr);
    if (typeof result !== 'number' || isNaN(result)) {
      return false;
    }
  } catch (error) {
    return false;
  }
  return true;
}

function isAlternateLettersAndEqualSigns(str, numberOfLetters) {
  if((str.length == 1 && str[0].match(/^[a-zA-Z]$/))  ){
    return true;
  }
  if(str.length < 1 || !(str[0].match(/^[a-zA-Z]$/))){
    return false;
  }
  const lastLetter = String.fromCharCode('a'.charCodeAt(0) + numberOfLetters - 1);
  const letters = str.match(/[a-zA-Z]/g) || [];
  const anyLetterBeyondRange = letters.some(letter => letter.toUpperCase() > lastLetter.toUpperCase());
  if (anyLetterBeyondRange) {
    return false;
  }
  const splitArr = str.split('=');
  
  const temp = {};
  for (const item of splitArr) {
    if (!item.match(/^[a-zA-Z]$/)) {
      return false;
    }
    const letter = item.toUpperCase();
    if (temp[letter]) {
      return false;
    }
    temp[letter] = true;
  }
  const patternRegex = /^[a-zA-Z]=([a-zA-Z]=)*[a-zA-Z]$/;
  return patternRegex.test(str);
}

function insertLetter(letter,input){
  const selectionStart = input.selectionStart;
  const inputValue = input.value;
  const updatedValue = inputValue.substring(0, selectionStart) + letter + inputValue.substring(input.selectionEnd);

  input.value = updatedValue;
  input.setSelectionRange(selectionStart + 1, selectionStart + 1);
}
function checkTable(input, method){
  if(method == 'calculate'){
    if(input[1] == '='){
      evaluateFormula(data.check.data, input);
    }
  }else{
    document.querySelector('.check-legend-tbody').innerHTML = '';
    const legend = document.querySelector('.check-legend');
    legend.classList.remove('dropdown-active');  
    legend.classList.add('dropdown-active');
    processArrayToObjects(data.check.data, input)
  }
}
document.querySelector('.check-legend-escape').addEventListener('click', () => {
  document.querySelector('.check-legend').classList.remove('dropdown-active')
})
function getColumnIndex(columnLetter) {
  return columnLetter.toUpperCase().charCodeAt(0) - 65;
}

function replaceColumnLettersWithValues(arr, formula, rowIndex) {
  formula = formula.replace(/([A-Za-z]+)/g, (_, columnLetter) => {
    const columnPosition = getColumnIndex(columnLetter);
    const columnValue = arr[rowIndex][0][columnPosition];
    return columnValue;
  });
  return formula;
}

function evaluateFormula(arr, formula) {
  const table = document.querySelector('.check-tbody');
  formula = formula.replace(/\s/g, '');
  let newf = formula.substring(0,2);
  formula = formula.substring (2,formula.length);
  for (let i = 0; i < arr.length; i++) {
    const convertedFormula = replaceColumnLettersWithValues(arr, formula, i);
    let condition = false;
    try {
      condition = arr[i][0][getColumnIndex(newf[0])] == eval(convertedFormula);
      console.log(arr[i][0][getColumnIndex(newf[0])]+','+eval(convertedFormula));
    } catch (error) {
      condition = false;
    }
    let color = (condition) ? 'green':'red';
    table.rows[i].cells[getColumnIndex(newf[0])].style.boxShadow  = `
    inset -5px 0 0 ${color},
    inset 0 -5px 0 ${color},
    inset 5px 0 0 ${color},
    inset 0 5px 0 ${color}
  `
  }
}

function getRandomLightColor(totalColors, currentIndex) {
  const hue = (360 / totalColors) * currentIndex;
  const lightness = 40 + 40 * Math.sin(currentIndex);
  return `hsl(${hue}, 50%, ${lightness}%)`;
}

function processArrayToObjects(data, columnsToMatch) {
  const result = {};
  const tBody = document.querySelector('.check-tbody');
  columnsToMatch = columnsToMatch.replace(/\s/g, '');
  columnsToMatch = columnsToMatch.split('=');
  columnsToMatch = columnsToMatch.map((letter) => getColumnIndex(letter));
  data.forEach((rowArray, rowIndex) => {
    const row = rowArray[0];
    const combinedValue = columnsToMatch.map((columnIndex) => row[columnIndex]).join('@@');
    if (result[combinedValue]) {
      result[combinedValue].count++;
    } else {
      result[combinedValue] = { count: 1, color: getRandomLightColor(Object.keys(result).length + 1, Object.keys(result).length) };
    }
    for(let i = 0; i < columnsToMatch.length; i++){
      tBody.rows[rowIndex].cells[columnsToMatch[i]].style.boxShadow = `
      inset -5px 0 0 ${result[combinedValue].color},
      inset 0 -5px 0 ${result[combinedValue].color},
      inset 5px 0 0 ${result[combinedValue].color},
      inset 0 5px 0 ${result[combinedValue].color}
    `
    }
  });
  const sortedKeys = Object.keys(result).sort((a, b) => result[b].count - result[a].count);
  const tbody = document.querySelector('.check-legend-tbody');
  for (const key of sortedKeys) {
    const { count, color } = result[key];
    const row = document.createElement('tr');
    tbody.appendChild(row)
    let rowColor = document.createElement('td');
    let colorDiv = document.createElement('div');
    colorDiv.style.padding = 'inherit';
    colorDiv.style.backgroundColor = color;
    rowColor.appendChild(colorDiv);
    let rowMatches = document.createElement('td');
    rowMatches.textContent = key.replace('@@', ' - ');
    let rowCount = document.createElement('td');
    rowCount.textContent = count
    row.appendChild(rowColor);
    row.appendChild(rowMatches);
    row.appendChild(rowCount);
  }
}


function customAlert(message, duration = 2000) {
  const alertContainer = document.createElement("div");
  alertContainer.style.position = "fixed";
  alertContainer.style.top = "50px";
  alertContainer.style.left = "50%";
  alertContainer.style.transform = "translate(-50%, 0)";
  alertContainer.style.backgroundColor = "#f2f2f2";
  alertContainer.style.padding = "20px";
  alertContainer.style.border = "1px solid #ddd";
  alertContainer.style.borderRadius = "5px";
  alertContainer.style.zIndex = "9999";

  const formattedMessage = message.replace(/\n/g, "<br>");
  alertContainer.innerHTML = formattedMessage;

  document.body.appendChild(alertContainer);

  setTimeout(function() {
    alertContainer.remove();
  }, duration);
}
customAlert('Clearing all browsing data may result in potential removal of your data stored in localStorage.', 6000);
function replaceColumnLettersWithValues(arr, formula) {
  formula = formula.replace(/([A-Za-z]+)/g, (_, columnLetter) => {
    const columnPosition = getColumnIndex(columnLetter);
    const columnValue = arr[columnPosition].value;
    return columnValue;
  });
  return formula;
}

function evaluateTotal(arr, formula) {
  formula = formula.replace(/\s/g, '');
  formula = formula.substring (2,formula.length);
    const convertedFormula = replaceColumnLettersWithValues(arr, formula);
    try {
        result = eval(convertedFormula);
      if (typeof result !== 'number' || isNaN(result)) {
        result = 'NaN';
      }
    } catch (error) {
      result = 'NaN';
    }
    return result
}
