const invTable = document.querySelector("table");
const createInvBtn = document.querySelector('.create')

//creates new invoice from existing project
createInvBtn.addEventListener('click', function(evt) {
    if (evt.target.dataset.projectId) {
      const projectID = evt.target.dataset.projectId
      createInv(evt, projectID)
    }
})

//deletes invoice
invTable.addEventListener("click", function (evt) {
  if (evt.target.classList.contains("delete")) {
    let id = evt.target.parentElement.id;
    sendDeleteInvRequest(evt, id);
  }
});

//request to delete invoice from db. handles ui post-request
async function sendDeleteInvRequest(evt, id) {
  await axios
    .delete(`${BASE}/${username}/invoice/${id}/delete`)
    .then(function (response) {
      // handle success
      removeRow(evt)
      makeAlert(response, "danger")
      if (document.getElementById("alert")) {
        setTimeout("hideAlert()", 5000);
      }
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

//request to create invoice from project
async function createInv(evt, projectID) {
  await axios
    .post(`${BASE}/${username}/project/${projectID}/create-invoice`)
    .then(function (response) {
      // handle success
      addNewInvoiceRow(evt, response)
      makeAlert(response, "success")
      if (document.getElementById("alert")) {
        setTimeout("hideAlert()", 5000);
      }
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

function addNewInvoiceRow(evt, response) {
  const newRow = document.createElement('tr')
  newRow.innerHTML = `<th scope="row">${response.data.pretty_date}</th>
  <td>${response.data.client_name}</td>
  <td>${evt.target.innerText}</td>
  <td>${response.data.amount_in_curr_of_rate}</td>
  <td>${response.data.amount_in_curr_of_inv}</td>
  <td id="${response.data.id}">
  <a href='/${username}/invoice/${response.data.id}'><i class="ph-printer"></i></a>
  <i class="ph-trash-simple delete"></i>
  </td>`
  invTable.lastElementChild.append(newRow)
  console.log(response)

}


function makeAlert(response, category) {
  let alert = document.createElement("div");
  let container = document.querySelector("#invoices-container");
  alert.classList.add("alert", `alert-${category}`);
  alert.innerText = response.data.message;
  alert.setAttribute("id", "alert");
  container.insertBefore(alert, invTable);
}

function hideAlert() {
  document.getElementById("alert").remove();
}

function removeRow(evt) {
  evt.target.parentElement.parentElement.remove();
}


