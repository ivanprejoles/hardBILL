
function sortNestedArrays(arr, indices) {
    function compareFunc(a, b) {
      for (let i = 0; i < indices.length; i++) {
        const index = indices[i];
        const valueA = a[index];
        const valueB = b[index];
  
        if (typeof valueA === 'number' && typeof valueB === 'number') {
          if (valueA < valueB) return -1;
          if (valueA > valueB) return 1;
        } else if (typeof valueA === 'string' && typeof valueB === 'string') {
          const comparison = valueA.localeCompare(valueB);
          if (comparison !== 0) return comparison;
        } else {
          if (typeof valueA === 'number') return -1;
          if (typeof valueB === 'number') return 1;
        }
      }
  
      return 0;
    }
  
    return arr.sort(compareFunc);
  }
    
  function processData(dataStorage, sortingIndices, clusteringIndex) {
    const table = document.querySelector('.table-body');
    const tbodyElements = table.getElementsByTagName('tbody');
    for(let i = tbodyElements.length-1; i >= 0; i--){
      const tbody = tbodyElements[i];
      tbody.parentNode.removeChild(tbody);
    }
    const resultData = {};
    const tempContainer = [];
    for (let group in dataStorage) {
      tempContainer.push(...dataStorage[group].data);
    }

    sortNestedArrays(tempContainer, sortingIndices);
  
    if (clusteringIndex.length > 0) {
      const my_cell = data.init_table.my_cell
      const cellKey = Object.keys(my_cell);
      for (let datas of tempContainer) {
        const clusterKey = datas[clusteringIndex];
        if (!resultData[clusterKey]) {
          const parentElement = document.createElement('tbody');
          parentElement.setAttribute('class', 'csv-cluster');
          document.querySelector('.table-body').appendChild(parentElement);
          const totalRow = document.createElement('tr');
          totalRow.setAttribute('class', 'csv-row');
          const totalElement = [];
          const totalValue = [];
          for(let i = 0; i < cellKey.length; i++){
            const totalColumn = document.createElement('td');
            totalColumn.setAttribute('class', 'csv-column csv-total');
            totalRow.appendChild(totalColumn);
            totalElement.push(totalColumn);
            totalValue.push(0);
          }
          parentElement.appendChild(totalRow);
          resultData[clusterKey] = {  
            data: [],
            parentElement,
            elementTotal: {totalElement,totalValue}
          };
        }
        resultData[clusterKey].data.push(datas);
        for(let i = 0; i < datas.length; i++){
          let addingValue = 0;
          if(my_cell[cellKey[i]].type == 'number'){
            let converted =  Number(datas[i]);
            addingValue = Number((converted % 1 !== 0) ? converted.toFixed(3) : converted);
          }else{
            addingValue = 1;
          }
          if(my_cell[cellKey[i]].adapt != 'dynamic'){
            let current_value = Number(resultData[clusterKey].elementTotal.totalElement[i].innerHTML);
            current_value = Number(current_value.toFixed(3));
            resultData[clusterKey].elementTotal.totalElement[i].innerHTML = current_value + addingValue;
            resultData[clusterKey].elementTotal.totalValue[i] += addingValue;
          }   
        }
        const rowElement = document.createElement('tr');
        rowElement.setAttribute('class', 'csv-row');
        for(let value of datas){  
            const columnElement = document.createElement('td');
            columnElement.setAttribute('class','csv-column');
            columnElement.innerHTML = value;
            rowElement.appendChild(columnElement);
        }
        resultData[clusterKey].parentElement.insertBefore(rowElement, resultData[clusterKey].parentElement.lastChild);
      }
    } else {
      const parentElement = document.createElement('tbody');
      parentElement.setAttribute('class', ' csv-cluster');
      document.querySelector('.table-body').appendChild(parentElement);
  
      const totalRow = document.createElement('tr');
      totalRow.setAttribute('class', 'csv-row');
      const totalElement = [];
      const totalValue = [];
      for(let i = 0; i < cellKey.length; i++){
        const totalColumn = document.createElement('td');
        totalColumn.setAttribute('class', 'csv-column csv-total');
        totalRow.appendChild(totalColumn);
        totalElement.push(totalColumn);
        totalValue.push(0);
      }
      parentElement.appendChild(totalRow);
      resultData['non-cluster'] = {
        data: tempContainer,
        parentElement,
        elementTotal : {totalElement, totalValue}
      };
      for(let i = 0; i < tempContainer.length; i++){
        for(let j = 0; j < tempContainer[i].length; j++){
          let addingValue = 0;
          if(my_cell[cellKey[j]].type == 'number'){
            let converted = Number(tempContainer[i][j]);
            addingValue = Number((converted % 1 !== 0) ? converted.toFixed(3) : converted);
          }else{
            addingValue = 1;
          }
          if(my_cell[cellKey[j]].adapt != 'dynamic'){
            let current_value = Number(resultData['non-cluster'].elementTotal.totalElement[j].innerHTML);
            current_value = Number(current_value.toFixed(3));
            resultData['non-cluster'].elementTotal.totalElement[j].innerHTML = current_value + addingValue;
            resultData['non-cluster'].elementTotal.totalValue[j] += addingValue;
          }
        }
      }
    }
    data.table_data.current_data.data = resultData; 
  }
  
  
  document.querySelector('.update').addEventListener('click', () => {
    const current_data = data.table_data.current_data
    if(Object.keys(current_data.data).length > 0){
      processData(current_data.data, current_data.sortingReference, current_data.groupingReference);
    }else{
      customAlert('no data')
    }
  });
  document.querySelector('.sort-and-cluster').addEventListener('click', () => {
    indexZPost(document.querySelector('.sort-cluster'));
    document.querySelector('.sort-cluster').classList.toggle('dropdown-active');
  });
  
  const toggle = () => {
    indexZPost(document.querySelector('.sort-and-cluster'));
    document.querySelector('.sort-cluster').classList.toggle('dropdown-active');
  };
  const select_cluster = document.querySelector('.select-cluster');
  select_cluster.addEventListener('click', () => {
    makeCluster();
  });
  
  function makeCluster(){
    if(data.init_table.cell_num > 0){
      select_cluster.innerHTML = '';
      const cells = Object.keys(data.init_table.my_cell)
      for(let i = 0; i < cells.length; i++){
        let option = document.createElement('option');
        option.value = cells[i];
        option.textContent = cells[i];
        select_cluster.appendChild(option);
      }
      select_cluster.selectedIndex = data.table_data.current_data.groupingReference[0]
    }
  }
  makeCluster();
  select_cluster.addEventListener('change', (e) => {
    data.table_data.current_data.groupingReference[0] = select_cluster.selectedIndex;
    select_cluster.value = select_cluster.selectedIndex;
  });
  
  const container = document.querySelector('.container');
  function addDragAndDrop(draggable){
    draggable.addEventListener('dragstart', () => {
        draggable.classList.add('dragging');
        data.sortAndCluster.draggableIndex = Array.from(draggable.parentNode.children).indexOf(draggable);
    })
  
    draggable.addEventListener('dragend', () => {
        draggable.classList.remove('dragging');
        const draggableIndex = data.sortAndCluster.draggableIndex;
        if(draggableIndex != Array.from(draggable.parentNode.children).indexOf(draggable)){
            let sortingReference = data.table_data.current_data.sortingReference;
            let temp = sortingReference[draggableIndex];
            let dragAfter = data.sortAndCluster.dragAfter;
            sortingReference.splice(draggableIndex, 1);
            if(dragAfter < 0){
                sortingReference.push(temp);
            }else{
                sortingReference.splice(dragAfter-1, 0, temp);
            }
        }
    })
  }
  container.addEventListener('dragover', e => {
      e.preventDefault()
      const afterElement = getDragAfterElement(container, e.clientY)
      const draggable = document.querySelector('.dragging')
      let sortingReference = data.table_data.current_data.sortingReference;
      data.sortAndCluster.dragAfter = Array.from(draggable.parentNode.children).indexOf(afterElement);
      if (afterElement == null) {
          container.appendChild(draggable)
      } else {
          container.insertBefore(draggable, afterElement);
      }
  })
  function getDragAfterElement(container, y) {
      const draggableElements = [...container.querySelectorAll('.draggable:not(.dragging)')]
    
      return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect()
        const offset = y - box.top - box.height / 2
        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child }
        } else {
          return closest
        }
      }, { offset: Number.NEGATIVE_INFINITY }).element
    }
  
  let button = document.getElementById('addButton');
  function addSort(){
    let myColumn = Object.keys(data.init_table.my_cell);
    if(data.table_data.current_data.sortingReference.length < myColumn.length && data.sortAndCluster.pickedIndex > -1){
        let newDraggable = document.createElement('div');
        let selectSort = document.querySelector('.select-sort');
        newDraggable.setAttribute('draggable', 'true');
        newDraggable.setAttribute('class', 'draggable');
        newDraggable.innerHTML = myColumn[data.sortAndCluster.pickedIndex]
  
        const container = document.getElementById('container');
        container.appendChild(newDraggable);
        data.table_data.current_data.sortingReference.push(Number(data.sortAndCluster.pickedIndex));
        addDragAndDrop(newDraggable);
        let removeDraggable = document.createElement('button');
        removeDraggable.innerHTML = 'X';
        removeDraggable.style.float = 'right';
        newDraggable.appendChild(removeDraggable);
        removeDraggable.addEventListener('click', () => {
          let removedIndex = data.table_data.current_data.sortingReference.splice(Array.from(newDraggable.parentNode.children).indexOf(newDraggable), 1);
          newDraggable.remove();
          let newOpt = document.createElement('option');
          newOpt.value = removedIndex[0];
          newOpt.textContent = Object.keys(data.init_table.my_cell)[removedIndex[0]]
          selectSort.appendChild(newOpt);
          if(data.sortAndCluster.unsortedIndices <= 0){
            selectSort.selectedIndex = 0;
            data.sortAndCluster.pickedIndex = selectSort.value;
          }
          data.sortAndCluster.unsortedIndices.push(removedIndex[0]);
        })
        selectSort.innerHTML = '';
        makeSort();
    }
  }
  const selectSort = document.querySelector('.select-sort');
  selectSort.addEventListener('click',() => {
     makeSort()
  })
  function makeSort(){
    if(selectSort.options.length === 0){
      let myColumn = Object.keys(data.init_table.my_cell)
      data.sortAndCluster.unsortedIndices = myColumn
      .map((_, index) => index)
      .filter(index => !data.table_data.current_data.sortingReference.includes(index));
      for(let i = 0; i < data.sortAndCluster.unsortedIndices.length; i++){
          let option = document.createElement('option');
          option.textContent = myColumn[data.sortAndCluster.unsortedIndices[i]];
          option.value = data.sortAndCluster.unsortedIndices[i];
          selectSort.appendChild(option);
      }
      selectSort.selectedIndex = 0;
      data.sortAndCluster.pickedIndex = selectSort.value;
    }
  }
  makeSort()
  
  selectSort.addEventListener('change', () => {
    data.sortAndCluster.pickedIndex = selectSort.value;
  })
  function makeAddSort(){
    if(storedData !== null){
      let stored = JSON.parse(storedData);
      let sort = stored.sortingReference;
      for(let i = 0; i < sort.length; i++){
        console.log('dsadsa')
        data.sortAndCluster.pickedIndex = sort[i];
        addSort();
      }
        console.log('22')
    }
  }
  makeAddSort()
