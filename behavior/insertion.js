function sortNestedArray(arr, indices, newItem) {
    const compareFunction = (a, b) => {
      for (let i = 0; i < indices.length; i++) {
        const index = indices[i];
        let valueA = (a[index] === undefined || a[index] === 'NaN')? 'undefine'.trim() : a[index].trim();
        let valueB = (b[index] === undefined || a[index] === 'NaN')? 'undefine'.trim() : b[index].trim();
        const typeA = getType(valueA);
        const typeB = getType(valueB);
  
        if (typeA === 'number' && typeB === 'string') {
          return -1;
        } else if (typeA === 'string' && typeB === 'number') {
          return 1;
        } else if (typeA === 'number' && typeB === 'number') {
          if (parseFloat(valueA) < parseFloat(valueB)) return -1;
          if (parseFloat(valueA) > parseFloat(valueB)) return 1;
        } else if (typeA === 'string' && typeB === 'string') {
          const result = valueA.localeCompare(valueB);
          if (result !== 0) return result;
        }
      }
  
      return 0;
    };
    const myCell = data.init_table.my_cell;
    const cellKey = Object.keys(myCell);
    for(let i = 0; i < newItem.length; i++){
      let addingValue = 0;
      if(myCell[cellKey[i]].type == 'number'){
        let converted = Number(newItem[i]);
        addingValue = Number((converted % 1 !== 0) ? converted.toFixed(3) : converted);
      }else{
        addingValue = 1;
      } 
      if(myCell[cellKey[i]].adapt != 'dynamic'){
        let current_value = Number(arr.elementTotal.totalElement[i].innerHTML);
        current_value = Number(current_value.toFixed(3));
        arr.elementTotal.totalElement[i].innerHTML = current_value + addingValue;
        arr.elementTotal.totalValue[i] += addingValue;
      }
    }
    const position = arr.data.findIndex((item) => compareFunction(newItem, item) < 0);
    arr.data.splice(position === -1 ? arr.data.length : position, 0, newItem);
  
    return position === -1 ? arr.data.length - 1 : position;
  }
  
  function getType(value) {
    if (typeof value === 'number') {
      return 'number';
    } else if (typeof value === 'string' && !isNaN(value)) {
      return 'number';
    } else {
      return 'string';
    }
  }
  
  function insertData(newdata, sortingIndices, clusteringIndices) {
      const dataStorage = data.table_data.current_data.data;
      const groupName = clusteringIndices.length > 0 ? newdata[clusteringIndices[0]] : 'non-cluster';
      let positionIndex = null;
    
      if (!dataStorage.hasOwnProperty(groupName)) {
        const parentElement = document.createElement('tbody');
        parentElement.setAttribute('class', 'csv-cluster');
        document.querySelector('.table-body').appendChild(parentElement);

        const totalRow = document.createElement('tr');
        totalRow.setAttribute('class', 'csv-row');
        const my_cell = data.init_table.my_cell
        const cellKey = Object.keys(my_cell);
        const totalType = [];
        const totalElement = [];
        const totalValue = [];
        for(let i = 0; i < cellKey.length; i++){
          const totalColumn = document.createElement('td');
          totalColumn.setAttribute('class', 'csv-column csv-total');
          totalRow.appendChild(totalColumn);
          totalElement.push(totalColumn);
          totalType.push(my_cell[cellKey[i]].type);
          totalValue.push(0);
        }
        parentElement.appendChild(totalRow);
        const groupData = { 
          data: [],
          parentElement, 
          elementTotal: {totalElement,totalType,totalValue}
        };

        dataStorage[groupName] = groupData;
      }
      positionIndex = sortNestedArray(dataStorage[groupName], sortingIndices, newdata);
      if (!dataStorage.hasOwnProperty(groupName)) {
        dataStorage[groupName] = groupData;
      }
      return { groupName, positionIndex, newdata };
  }
  
  function addToTable(saved){
    let lobby_data;
    if(saved){
      lobby_data = saved;
    }else{
      lobby_data = data.table_data.lobby_data;
    }
    const dataToElementContainer = {};
    for(let i = 0; i < lobby_data.length; i++){
      console.log('dsa')
      let dataArray = [];
      let eachdata = (saved)? lobby_data[i] : lobby_data[i].data;
      for(let j = 0; j < eachdata.length; j++){
        if(saved){
          dataArray.push(eachdata[j]);
        }else{
          dataArray.push(eachdata[j].value);
        }
      }
      let insertedData = insertData(dataArray, data.table_data.current_data.sortingReference, data.table_data.current_data.groupingReference);
      let groupName = insertedData.groupName;
     
      if(!dataToElementContainer.hasOwnProperty(groupName)){
        const groupData =  {data:[], positions:[], color:[]};
        dataToElementContainer[groupName] = groupData;
      }
      dataToElementContainer[groupName].data.push(insertedData.newdata);
      dataToElementContainer[groupName].positions.push(insertedData.positionIndex);
    }
    for(let groupName of Object.keys(dataToElementContainer)){
      const group = dataToElementContainer[groupName];
      const groupData = group.data;
      const groupPositions = group.positions;
      const parentElement = data.table_data.current_data.data[groupName].parentElement;
      for(let row_i = 0; row_i < groupData.length; row_i++){
        const child = document.createElement('tr');
        child.setAttribute('class', 'csv-row');
        for(let  col_i= 0; col_i < groupData[row_i].length; col_i++){
          const grandChild = document.createElement('td');
          grandChild.setAttribute('class', 'csv-column')
          grandChild.textContent = groupData[row_i][col_i];
          child.appendChild(grandChild);
        }
        parentElement.insertBefore(child, parentElement.children[groupPositions[row_i]]);
      }
    }
    data.table_data.lobby_data = [];
    data.table_data.lobby_color = [];
    const add_on_parent = document.querySelector('.add-on-tbody');
    add_on_parent.innerHTML = '';
  }
  function checkTable(){
    if(storedData !== null){
        let stored = JSON.parse(storedData);
        console.log('working')
        addToTable(stored.current_data);   
        console.log('worked')
    }
}
checkTable()
