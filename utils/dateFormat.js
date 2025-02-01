
const dateFormat = (date) => {
    if(!date){
        return null;
    }
    if(date instanceof Date){
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${year}-${month}-${day}`;
    }
     return null

    };

export default dateFormat;