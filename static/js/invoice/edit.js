console.log('c')
const saveBtn = document.querySelector('#save')

saveBtn.addEventListener('click', function(){
    const invoice = document.getElementById('invoice');
    html2pdf(invoice);  
})
