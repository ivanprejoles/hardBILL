const convert_to_csv = () => {
    const current_data = data.table_data.current_data.data;
    if(Object.keys(current_data).length <= 0){
        customAlert('no data converted')
        return 0;
    }
    let csvContent = '';
    csvContent += Object.keys(data.init_table.my_cell).join(',')+'\n';
    for(let group in current_data){
        for(let row = 0; row < current_data[group].data.length; row++){
            csvContent += current_data[group].data[row].join(',') + '\n';
        }
        csvContent += current_data[group].elementTotal.totalValue.join(',') + '\n';
        csvContent += ''+','+''+','+''+'\n';
    }
    const fileName = 'convertedCSV.csv';
    const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'})
    if (navigator.msSaveBlob) { // For IE
        navigator.msSaveBlob(blob, fileName);
      } else {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute('download', fileName);
    
        link.style.display = 'none';
        document.body.appendChild(link);
    
        link.click();
    
        // Cleanup
        window.URL.revokeObjectURL(link.href);
        document.body.removeChild(link);
      }
}
