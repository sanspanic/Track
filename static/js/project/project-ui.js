const projectTable = document.querySelector("table");

//add event listeners to edit, delete and accept-changes icons. differentiate between button and icon click
projectTable.addEventListener("click", function (evt) {
  //handle edit project
  if (evt.target.classList.contains("edit")) {
    disableAllBtns();
    const targetRow = getTargetRow(evt);
    //retrieves names of clients that are associated with user
    sendRequestForClientNames(targetRow);
  } //handle delete project
  else if (evt.target.classList.contains("delete")) {
    let projectId = getProjectID(evt);
    const targetRow = getTargetRow(evt);
    sendDeleteRequest(projectId, targetRow);
    //remove row
    targetRow.remove();
  } // handle accept-changes post-edit
  else if (evt.target.classList.contains("accept-changes")) {
    //grab user input and id of project, id needs transformed
    const clientName = document.querySelector("#client-name").value;
    const projectName = document.querySelector("#project-name").value;
    const projectId = getProjectID(evt);
    const targetRow = getTargetRow(evt);
    //send axios request to endpoint that handles edit
    sendRequestToEdit(targetRow, clientName, projectName, projectId);
    enableAllBtns();
  }
});

async function sendRequestForClientNames(targetRow) {
  await axios
    .get(`${BASE}/user/${username}/projects/edit`)
    .then(function (response) {
      // handle success
      //change cell to only display accept changes button
      makeAcceptChangesBtn(targetRow);
      handleTooltips()
      let names = response.data.names;
      //call functions that render HTML for inputs displaying current project name and clients associated with user
      makeClientDropdown(targetRow, names);
      makeProjectNameInput(targetRow);
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

async function sendRequestToEdit(
  targetRow,
  clientName,
  projectName,
  projectId
) {
  await axios
    .put(`${BASE}/user/${username}/projects/edit`, {
      clientName,
      projectName,
      projectId,
    })
    .then(function (response) {
      showUpdatedValues(targetRow, clientName, projectName);
      makeActionBtns(targetRow, projectId);
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

async function sendDeleteRequest(project_id) {
  await axios
    .delete(`${BASE}/user/${username}/projects/${project_id}/delete`)
    .then(function (response) {
      // handle success
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

//makes dropdown using response from axios with names of clients
function makeClientDropdown(targetRow, names) {
  //identifies correct td
  let clientNameCell = targetRow.firstElementChild.nextElementSibling;
  let clientNameInput = document.createElement("div");
  let dropdownHTMLStart = `<select id='client-name' class='browser-default custom-select'><option selected>Client</option>`;
  let dropdownHTMLEnd = `</select>`;
  let choices = [];
  for (i = 0; i < names.length; i++) {
    let str = `<option value="${names[i]}" href="#">${names[i]}</option>`;
    choices.push(str);
  }
  let dropdownHTMLMiddle = choices.join("");
  clientNameCell.innerText = "";
  clientNameInput.innerHTML = dropdownHTMLStart
    .concat(dropdownHTMLMiddle)
    .concat(dropdownHTMLEnd);
  clientNameCell.append(clientNameInput);
}

//makes input cell displaying current value of project name
function makeProjectNameInput(targetRow) {
  let projectNameCell = targetRow.firstElementChild;
  let projectName = projectNameCell.innerText;
  let projectNameInput = document.createElement("input");
  projectNameInput.setAttribute("id", "project-name");
  projectNameInput.value = projectName;
  projectNameCell.innerText = "";
  projectNameCell.append(projectNameInput);
}

//changes cell to only display accept changes button
function makeAcceptChangesBtn(targetRow) {
  targetRow.lastElementChild.innerHTML =
    `<button data-trigger='hover' data-container='button' data-toggle='tooltip' data-placement='top' title='Edit project details' class='icon accept-changes'><i class='ph-check-circle accept-changes ph-lg'></i></button>`;
}

//updates UI to display newly edited values for clientName and projectName
function showUpdatedValues(targetRow, clientName, projectName) {
  targetRow.firstElementChild.innerText = projectName;
  targetRow.firstElementChild.nextElementSibling.innerText = clientName;
}

function disableAllBtns() {
  let allBtns = document.querySelectorAll(".btn");
  allBtns.forEach((btn) => btn.classList.add("disabled"));
  allBtns.forEach((btn) => btn.setAttribute("disabled", "disabled"));
}

function enableAllBtns() {
  let allBtns = document.querySelectorAll(".btn");
  allBtns.forEach((btn) => btn.classList.remove("disabled"));
  allBtns.forEach((btn) => btn.removeAttribute("disabled"));
}

//creates track, edit and delete buttons
function makeActionBtns(targetRow, projectId) {
  targetRow.lastElementChild.innerHTML = `<a href='/{{user.username}}/project/${projectId}/track' class='btn btn-primary track'><i class="ph-timer ph-lg"></i> Track</a>
  <button data-trigger='hover' data-container='button' data-toggle="tooltip" data-placement='top' title="Edit project details" class='btn icon edit'><i class="ph-pencil-simple ph-lg edit"></i></button>
  <button data-trigger='hover' data-container='button' data-toggle="tooltip" data-placement='top' title="Delete" class='btn icon delete'><i class="ph-trash-simple delete ph-lg"></i></button>`;
  handleTooltips()
}

//differentiate between icon and button click and return projectId
function getProjectID(evt) {
  projectId =
    evt.target.tagName === "BUTTON"
      ? evt.target.parentElement.parentElement.dataset.projectId
      : evt.target.parentElement.parentElement.parentElement.dataset.projectId;
  return projectId;
}

//if new element is created tooltips won't show up unless manually initialised as below
function handleTooltips() {
  $(function () {
    $('[data-toggle="tooltip"]').tooltip()
  })

  //somehow tooltips stay after buttons are clicked and sometimes oddly float to top of page. this hides them on button click
  $('button').on('click', function () {
      $(this).tooltip('hide')
    })
}


