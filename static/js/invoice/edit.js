const saveBtn = document.querySelector('#save')
const BASE = "http://127.0.0.1:5000";
const username = document.querySelector("#navbarDropdown").innerText;
const fromSection = document.querySelector('#from')
const datesSection = document.querySelector('#dates')
const extrasTable = document.querySelector('#extras')
const invoiceID = getID(document.querySelector('.card-header').id)

saveBtn.addEventListener('click', function(){
    const invoice = document.getElementById('invoice');
    html2pdf(invoice);  
})


fromSection.addEventListener('click', function(evt) {
    if (evt.target.classList.contains('billing-info-dropdown')) {
        const billingInfoID = getID(evt.target.id)
        sendRequestToRetrieveBillingInfo(evt, billingInfoID)
    } else if (evt.target.classList.contains('accept-bi')) {
        removeRow(evt)
    }
})

datesSection.addEventListener('click', function(evt){
    if (evt.target.classList.contains('delete-dates')) {
        removeRow(evt)
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

extrasTable.addEventListener('click', function(evt){
    //handle remove
    if (evt.target.classList.contains('btn-danger')) {
        removeRow(evt)
    //handle creating inputs
    } else if (evt.target.classList.contains('add')) {
        const extraType = evt.target.id
        makeExtraInput(evt, extraType)
    }
    //handle accepting changes
    else if (evt.target.classList.contains('accept-changes')) {
        const userInput = retrieveUserInput()
        console.log(userInput)
        sendRequestToUpdateExtras(evt, ...userInput)
    }
})

async function sendRequestToRetrieveBillingInfo(evt, billingInfoID) {
    await axios
      .get(`${BASE}/${username}/billing_info/${billingInfoID}`)
      .then(function (response) {
        // handle success
        populateDetails(response)
        makeAcceptChangesBtn(evt)
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
    <div>${response.data.phone}</div>`
    document.querySelector('#billing-details-div').append(formDiv)
}

function makeAcceptChangesBtn(evt) {
    document.querySelector('#accept-div').innerText=''
    const acceptBtn = document.createElement('button')
    acceptBtn.classList.add('btn', 'btn-success', 'accept-bi', 'd-inline')
    acceptBtn.innerText='Accept'
    document.querySelector('#accept-div').append(acceptBtn)
}

function renderDates(evt, response) {
    //prettify dates
    const date = response.data.date.split(' ').slice(0, 4).join(' ')
    const dueDate = response.data.date.split(' ').slice(0, 4).join(' ')
    evt.path[4].innerHTML = `<div>Date of Issue: ${date}</div>
                                <div>Due Date: <strong>${dueDate}</strong></div>`
}

function removeRow(evt) {
    evt.target.parentElement.parentElement.remove()
}

function makeExtraInput(evt, extraType) {
    makeAcceptChangesBtn()
    if (extraType === 'VAT' || extraType === 'discount') {
        evt.target.parentElement.innerHTML = `<input id=${extraType} type="text" class="form-control" placeholder='enter perc, e.g. 10' id="formControlRange">`
    } else if (extraType === 'extra') {
        evt.target.parentElement.innerHTML = `<input id='${extraType}' type="text" class='form-control' placeholder='enter number, e.g. 120.50'>` 
    }
}

function makeAcceptChangesBtn() {
    document.querySelector('#accept-changes-td').innerText = ''
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

function updateUIWithExtras(response) {
    //finish this tomorrow - render UI from response
    if (response.data.extra) {
        document.querySelector('.extra').innerText= response.data.extra
    }
} 
