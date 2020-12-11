const invTable = document.querySelector("table");
const createInvBtn = document.querySelector(".create");

//creates new invoice from existing project
createInvBtn.addEventListener("click", function (evt) {
  if (evt.target.dataset.projectId) {
    const projectID = evt.target.dataset.projectId;
    createInv(evt, projectID);
  }
});

//deletes invoice
invTable.addEventListener("click", function (evt) {
  if (evt.target.classList.contains("delete")) {
    const targetRow = getTargetRow(evt)
    const invId = targetRow.dataset.invoiceId;
    sendDeleteInvRequest(targetRow, invId);
  }
});

//request to delete invoice from db. handles ui post-request
async function sendDeleteInvRequest(targetRow, id) {
  await axios
    .delete(`${BASE}/${username}/invoice/${id}/delete`)
    .then(function (response) {
      // handle success
      removeRow(targetRow);
      makeAlert(response, "danger");
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
      addNewInvoiceRow(evt, response);
      makeAlert(response, "success");
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

//makes new row and populates it with response data
function addNewInvoiceRow(evt, response) {
  const newRow = document.createElement("tr");
  newRow.setAttribute('data-invoice-id', response.data.id)
  newRow.innerHTML = `<th scope="row">${response.data.pretty_date}</th>
  <td>${response.data.client_name}</td>
  <td>${evt.target.innerText}</td>
  <td>${response.data.amount_in_curr_of_rate}</td>
  <td>${response.data.amount_in_curr_of_inv}</td>
  <td>
  <a href='/${username}/invoice/${response.data.id}'><i class="ph-printer ph-lg"></i></a>
  <button class='delete icon'><i class="ph-trash-simple delete ph-lg"></i></button>
  </td>`;
  invTable.lastElementChild.append(newRow);
  console.log(response);
}

function removeRow(targetRow) {
  targetRow.remove();
}
