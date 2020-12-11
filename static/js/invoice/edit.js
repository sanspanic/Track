const saveBtn = document.querySelector('#save')
const fromSection = document.querySelector('#from')
const datesSection = document.querySelector('#dates')
const extrasTable = document.querySelector('#extras')
const invoiceID = getID(document.querySelector('.card-header').id)
const cardHeader = document.querySelector('.card-header')

//saves pdf of invoice on click
saveBtn.addEventListener('click', function(){
    const invoice = document.getElementById('invoice');
    html2pdf(invoice);  
})

//cardHeader event listener for invoice nr manipulation
cardHeader.addEventListener('click', function(evt){
    //handles add user input
    if (evt.target.classList.contains('add')) {
        const invoiceNr = grabInvoiceNr()
        sendRequestToAddInvoiceNr(invoiceNr)
    }
    //handles render input form
    else if (evt.target.classList.contains('make-input')){
        const targetSpan = getTargetSpan(evt)
        makeInputForInvoiceNr(targetSpan)
    }
    //handles delete
    else if (evt.target.classList.contains('delete')){
        const invNrRow = document.querySelector('.invoice-nr')
        invNrRow.remove()
    }
})

//fromSection event listener for billing address change
fromSection.addEventListener('click', function(evt) {
    if (evt.target.classList.contains('billing-info-dropdown')) {
        const billingInfoID = getID(evt.target.id)
        sendRequestToRetrieveBillingInfo(evt, billingInfoID)
    } else if (evt.target.classList.contains('accept-bi')) {
        // removes superfluous row of btns
        const btnsRow = document.querySelector('.billing-details-btns')
        btnsRow.remove()
    }
})

//date section for adding date and due dates
datesSection.addEventListener('click', function(evt){
    if (evt.target.classList.contains('delete-dates')) {
        const targetRow = getTargetRow(evt)
        targetRow.remove()
    } else if (evt.target.classList.contains('add-dates')) {
        evt.preventDefault()
        const dateOfIssue = document.querySelector("input[name='date-of-issue']").value
        const dueDate = document.querySelector("input[name='due-date']").value
        //make sure request is only triggered if both fields filled out
        if (dateOfIssue && dueDate) {
            sendRequestToUpdateDates(evt, dateOfIssue, dueDate)
        }
    }
})

//handling adding extras after total (extra charge, discount, VAT)
extrasTable.addEventListener('click', function(evt){
    //handle remove
    if (evt.target.classList.contains('delete')) {
        const targetRow = getTargetRow(evt)
        targetRow.remove()
    //handle creating inputs
    } else if (evt.target.classList.contains('add')) {
        const extraType = evt.target.dataset.extraType
        makeExtraInput(extraType)
    }
    //handle accepting changes
    else if (evt.target.classList.contains('accept-changes')) {
        const userInput = retrieveUserInput()
        console.log(userInput)
        sendRequestToUpdateExtras(evt, ...userInput)
    } // handle remove inputs 
    else if (evt.target.classList.contains('delete-input')) {
      removeExtrasInput(evt)
    }
})

async function sendRequestToRetrieveBillingInfo(evt, billingInfoID) {
    await axios
      .get(`${BASE}/${username}/billing_info/${billingInfoID}`)
      .then(function (response) {
        console.log(response)
        // handle success
        populateDetails(response)
        makeAcceptBillingDetailsBtn(evt)
      })
      .catch(function (error) {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          console.log(error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log("Error", error.message);
        }
        console.log(error.config);
      });
  }
  
async function sendRequestToUpdateDates(evt, dateOfIssue, dueDate) {
    await axios
      .patch(`${BASE}/${username}/invoice/${invoiceID}/edit`, {
          dateOfIssue, 
          dueDate
      })
      .then(function (response) {
        // handle success
        renderDates(evt, response)
      })
      .catch(function (error) {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          console.log(error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log("Error", error.message);
        }
        console.log(error.config);
      });
  }

async function sendRequestToUpdateExtras(evt, extra, discount, VAT) {
    await axios
      .patch(`${BASE}/${username}/invoice/${invoiceID}/edit`, {
        extra, 
        discount, 
        VAT
      })
      .then(function (response) {
        // handle success
        console.log(response)
        updateUIWithExtras(response)
        removeRow(evt)
      })
      .catch(function (error) {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          console.log(error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log("Error", error.message);
        }
        console.log(error.config);
      });
  }

async function sendRequestToAddInvoiceNr(invoiceNr) {
    await axios
      .patch(`${BASE}/${username}/invoice/${invoiceID}/edit`, {
        invoiceNr
      })
      .then(function (response) {
        // handle success
        updateUIWithInvoiceNr(response)
      })
      .catch(function (error) {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          console.log(error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log("Error", error.message);
        }
        console.log(error.config);
      });
  }

function makeInputForInvoiceNr(targetSpan) {
    targetSpan.innerHTML = `<div class='ml-1 row align-items-center'> <div class='col'><input id='invoice-nr'class='form-control' type='text'></input></div> <div class='col'><button class='add icon'><i class="ph-check-circle ph-xl add float-left"></i></button><button class='delete icon'><i class="ph-trash-simple ph-xl delete float-left"></i></button></div></div>`
}

function getID(id) {
    return id.split('-')[3]
}

function populateDetails(response) {
    document.querySelector('#billing-details-div').innerText = ''
    const formDiv = document.createElement('div')
    formDiv.innerHTML = `<div><strong>${response.data.name}</strong></div>
    <div>${response.data.street}</div>
    <div>${response.data.postcode} ${response.data.city}</div>
    <div>${response.data.country}</div>
    <div>${response.data.email}</div>
    <div class='mb-2'>${response.data.phone}</div>`
    document.querySelector('#billing-details-div').append(formDiv)
}

function makeAcceptBillingDetailsBtn(evt) {
    document.querySelector('#accept-div').innerHTML = `<button class='icon accept-bi'><i class='ph-check-circle ph-xl accept-bi'></i></button>`
  }

function renderDates(evt, response) {
    //prettify dates
    const date = response.data.date.split(' ').slice(0, 4).join(' ')
    const dueDate = response.data.date.split(' ').slice(0, 4).join(' ')
    evt.path[4].innerHTML = `<div>Date of Issue: ${date}</div>
                                <div>Due Date: <strong>${dueDate}</strong></div>`
}

function removeRow(evt) {
    //handle exception for small buttons next to extras input
    if (evt.target.classList.contains('extra-input')) {
        evt.target.parentElement.parentElement.parentElement.parentElement.remove()
    }
    //handle exception for invoice number input
    else if (evt.target.classList.contains('invoice-nr')) {
        evt.target.parentElement.previousElementSibling.remove()
        evt.target.parentElement.remove()
    }  //all other remove actions
    else {
    evt.target.parentElement.parentElement.remove()
    }

}

function makeExtraInput(extraType) {
    makeAcceptChangesBtn()
    if (extraType === 'VAT' || extraType === 'discount') {
        const targetRow = document.querySelector(`.${extraType}`);
        targetRow.innerHTML = `<div class='row align-items-center'><div class='col-10'><input id=${extraType} type="text" class="form-control" placeholder='enter %, e.g. 10' id="formControlRange"></div><div class='col-2'><button class='icon delete-input'><i class="ph-trash-simple ph-lg delete-input extra-input"></i></button></div></div>`
    } else if (extraType === 'extra') {
        const targetRow = document.querySelector('.extra')
        targetRow.innerHTML = `<div class='row align-items-center'> <div class='col-10'><input id='${extraType}' type="text" class='form-control' placeholder='enter number, e.g. 120.50'></div><div class='col-2'><button class='icon delete-input'><i class="ph-trash-simple ph-lg delete-input extra-input"></i></button></div></div>` 
    }
}

function makeAcceptChangesBtn() {
    if (document.querySelector('#accept-changes-td')) {
        document.querySelector('#accept-changes-td').innerText = ''
    } //for when accept button has previously been used and row was removed after update
    else {
        const newRow = document.createElement('tr')
        document.querySelector('#extras').appendChild(newRow)
        newRow.innerHTML = `<td class='left'></td>
                            <td id='accept-changes-td' class='right'></td>`
    }
    const acceptBtn = document.createElement('button')
    acceptBtn.classList.add('btn', 'btn-success', 'accept-changes')
    acceptBtn.innerText='Accept Changes'
    document.querySelector('#accept-changes-td').append(acceptBtn)
}

function retrieveUserInput() {
    let extra; 
    let discount; 
    let VAT;
    if (document.querySelector('#extra')) {
        extra = document.querySelector('#extra').value
    }
    if (document.querySelector('#discount')) {
        discount = document.querySelector('#discount').value
    }
    if (document.querySelector('#VAT')) {
        VAT = document.querySelector('#VAT').value
    }
    return [extra, discount, VAT]
}

function grabInvoiceNr() {
    return document.querySelector('#invoice-nr').value
} 

function updateUIWithExtras(response) {
    //checks whether response contains data and if so, renders aamounts
    if (response.data.extra) {
        document.querySelector('.extra').innerText= response.data.extra
    }
    if (response.data.discount) {
        document.querySelector('.discount').innerText= `${response.data.discount} %`
    }
    if (response.data.VAT) {
        document.querySelector('.VAT').innerText= `${response.data.VAT} %`
    }
    document.querySelector('#final-amount').innerHTML = `<strong>${response.data.amount_after_extras_in_curr_of_inv} ${response.data.curr_of_inv}</strong>`
} 

function updateUIWithInvoiceNr(response) {
    const invNrRow = document.querySelector('.invoice-nr')
    invNrRow.innerHTML = `<div class='ml-3'>Invoice Number</div><strong class='ml-3'>${response.data.invoice_nr}</strong>`
}

function getTargetSpan(evt) {
  const span =
  evt.target.tagName === "BUTTON"
    ? evt.target.parentElement
    : evt.target.parentElement.parentElement;

  return span
}

//distinguish between clicking on button and icon for delete-input
function removeExtrasInput(evt) {
  if (evt.target.tagName === 'BUTTON') {
    evt.target.parentElement.parentElement.parentElement.parentElement.remove()
  } else {
    evt.target.parentElement.parentElement.parentElement.parentElement.parentElement.remove()
  }
}
