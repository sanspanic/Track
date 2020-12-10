let table = document.querySelector("table");

//add event listeners to edit, delete and accept-changes icons
table.addEventListener("click", function (evt) {
  //handle edit project
  if (evt.target.classList.contains("edit")) {
    disableAllBtns();
    //retrieves names of clients that are associated with user
    sendRequestForClientNames(evt);
  } //handle delete project
  else if (evt.target.classList.contains("delete")) {
    let project_id = getProjectID(evt);
    sendDeleteRequest(project_id);
    //remove row
    evt.target.parentElement.parentElement.remove();
  } // handle accept-changes post-edit
  else if (evt.target.classList.contains("accept-changes")) {
    //grab user input and id of project, id needs transformed
    const clientName = document.querySelector("#client-name").value;
    const projectName = document.querySelector("#project-name").value;
    const project_id = getProjectID(evt);
    //send axios request to endpoint that handles edit
    sendRequestToEdit(evt, clientName, projectName, project_id);
    enableAllBtns();
    recreateIcons();
  }
});

async function sendRequestForClientNames(evt) {
  await axios
    .get(`${BASE}/user/${username}/projects/edit`)
    .then(function (response) {
      // handle success
      //change cell to only display accept changes button
      makeAcceptChangesBtn(evt);
      removeAllIcons();
      let names = response.data.names;
      //call functions that render HTML for inputs displaying current project name and clients associated with user
      makeClientDropdown(evt, names);
      makeProjectNameInput(evt);
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

async function sendRequestToEdit(evt, clientName, projectName, id) {
  await axios
    .put(`${BASE}/user/${username}/projects/edit`, {
      clientName,
      projectName,
      id,
    })
    .then(function (response) {
      showUpdatedValues(evt, clientName, projectName);
      makeActionBtns(evt);
      makeAlert(response);
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
      makeAlert(response);
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

function makeAlert(response) {
  let alert = document.createElement("div");
  let container = document.querySelector(".homepage").firstElementChild;
  alert.classList.add("alert", "alert-danger");
  alert.innerText = response.data.message;
  alert.setAttribute("id", "alert");
  container.insertBefore(alert, table);
}

function hideAlert() {
  document.getElementById("alert").remove();
}

//makes dropdown using response from axios with names of clients
function makeClientDropdown(evt, names) {
  //identifies correct td
  let clientNameCell =
    evt.path[1].previousElementSibling.previousElementSibling
      .previousElementSibling;
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
function makeProjectNameInput(evt) {
  let projectNameCell = evt.path[2].firstElementChild;
  let projectName = projectNameCell.innerText;
  let projectNameInput = document.createElement("input");
  projectNameInput.setAttribute("id", "project-name");
  projectNameInput.value = projectName;
  projectNameCell.innerText = "";
  projectNameCell.append(projectNameInput);
}

//changes cell to only display accept changes button
function makeAcceptChangesBtn(evt) {
  evt.target.parentElement.classList.add("align-middle", "text-center");
  evt.target.parentElement.innerHTML =
    "<i class='ph-check-circle accept-changes ph-lg'></i>";
}

//updates UI to display newly edited values for clientName and projectName
function showUpdatedValues(evt, clientName, projectName) {
  evt.target.parentElement.parentElement.firstElementChild.innerHTML = projectName;
  evt.target.parentElement.previousElementSibling.previousElementSibling.previousElementSibling.innerText = clientName;
}

//removes icons to disable editing or deleting other than current selection
function removeAllIcons() {
  let allIcons = document.querySelectorAll("i");
  for (x = 0; x < allIcons.length; x++) {
    if (
      allIcons[x].classList.contains("edit") ||
      allIcons[x].classList.contains("delete")
    ) {
      allIcons[x].remove();
    }
  }
}

//recreates previously deleted icons except for first row and empty rows (whyever they exist)
function recreateIcons() {
  let allRows = document.querySelectorAll("tr");
  for (x = 0; x < allRows.length; x++) {
    const editIcon = document.createElement("i");
    const delIcon = document.createElement("i");
    editIcon.classList.add("ph-pencil-simple", "ph-lg", "edit");
    delIcon.classList.add("ph-trash-simple", "ph-lg", "delete");
    if (allRows[x].childElementCount != 0 && x != 0) {
      allRows[x].lastElementChild.append(editIcon);
      allRows[x].lastElementChild.append(delIcon);
    }
  }
}

function disableAllBtns() {
  let allBtns = document.querySelectorAll(".btn");
  allBtns.forEach((btn) => btn.classList.add("disabled"));
}

function enableAllBtns() {
  let allBtns = document.querySelectorAll(".btn");
  allBtns.forEach((btn) => btn.classList.remove("disabled"));
}

//removes track and delete buttons
function removeCellBtns(evt) {
  evt.target.nextElementSibling.remove();
  evt.target.previousElementSibling.remove();
}

//creates track, edit and delete buttons
function makeActionBtns(evt) {
  let project_id = getProjectID(evt);
  evt.target.parentElement.innerHTML = `<a href='/{{user.username}}/project/{{project.id}}/track' class='btn btn-primary track'><i class="ph-timer"></i> Track</a>
  <i class="ph-pencil-simple ph-lg edit"></i>
  <i class="ph-trash-simple delete ph-lg"></i>`;
}

function getProjectID(evt) {
  return evt.target.parentElement.parentElement
    .getAttribute("id")
    .split("-")[2];
}
