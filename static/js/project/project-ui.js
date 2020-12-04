//EDIT BUTTON

let editBtn = document.querySelector(".edit");
let BASE = "http://127.0.0.1:5000";
let username = document.querySelector("#navbarDropdown").innerText;
let table = document.querySelector("table");

async function sendRequestForClientNames(evt) {
  await axios
    .get(`${BASE}/user/${username}/projects/edit`)
    .then(function (response) {
      // handle success
      let names = response.data.names;
      makeDropdown(evt, names);
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

async function sendRequestToEdit(clientName, projectName, id) {
  await axios
    .put(`${BASE}/user/${username}/projects/edit`, {
      clientName,
      projectName,
      id,
    })
    .then(function (response) {
      // handle success
      console.log(response);
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

table.addEventListener("click", function (evt) {
  if (
    (evt.target.tagName === "BUTTON") &
    evt.target.classList.contains("edit")
  ) {
    let allBtns = document.querySelectorAll(".btn");
    allBtns.forEach((btn) => btn.setAttribute("disabled", "disabled"));
    sendRequestForClientNames(evt);
    console.log(evt);
    evt.target.nextElementSibling.remove();
    evt.target.previousElementSibling.remove();
    let acceptBtn = document.createElement("button");
    acceptBtn.classList.add("btn", "btn-warning", "accept-changes");
    acceptBtn.innerText = "Accept changes";
    evt.target.parentElement.append(acceptBtn);

    let projectNameCell =
      evt.target.parentElement.parentElement.firstElementChild;
    let projectNameInput = document.createElement("input");
    projectNameInput.setAttribute("id", "project-name");
    projectNameCell.innerText = "";
    projectNameCell.append(projectNameInput);
  }
});

table.addEventListener("click", function (evt) {
  if (
    (evt.target.tagName === "BUTTON") &
    evt.target.classList.contains("accept-changes")
  ) {
    let clientName = document.querySelector("#client-name").value;
    let projectName = document.querySelector("#project-name").value;
    let id = evt.target.parentElement.previousElementSibling.previousElementSibling.getAttribute(
      "id"
    );
    sendRequestToEdit(clientName, projectName, id);
    evt.target.parentElement.parentElement.firstElementChild.innerText = document.querySelector(
      "#project-name"
    ).value;
    evt.target.parentElement.previousElementSibling.previousElementSibling.previousElementSibling.innerText = document.querySelector(
      "#client-name"
    ).value;
    let delBtn = document.createElement("button");
    let trackBtn = document.createElement("button");
    let editBtn = document.querySelector(".edit").cloneNode(true);
    delBtn.classList.add("btn", "btn-danger", "delete", "mx-1");
    trackBtn.classList.add("btn", "btn-primary", "track", "mx-1");
    delBtn.innerText = "Delete";
    trackBtn.innerText = "Track";
    evt.target.parentElement.append(delBtn);
    evt.target.parentElement.insertBefore(trackBtn, delBtn);
    evt.target.parentElement.insertBefore(editBtn, delBtn);
    evt.target.previousElementSibling.remove();
    evt.target.remove();
    let allBtns = document.querySelectorAll(".btn");
    allBtns.forEach((btn) => btn.removeAttribute("disabled"));
  }
});

function hideAlert() {
  document.getElementById("alert").remove();
}

function makeDropdown(evt, names) {
  let clientNameCell =
    evt.target.parentElement.previousElementSibling.previousElementSibling
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

//DELETE BUTTON

table.addEventListener("click", function (evt) {
  if (
    (evt.target.tagName === "BUTTON") &
    evt.target.classList.contains("delete")
  ) {
    let project_id = evt.target.parentElement.previousElementSibling.previousElementSibling.getAttribute(
      "id"
    );
    sendDeleteRequest(project_id);
    evt.target.parentElement.parentElement.remove();
  }
});

async function sendDeleteRequest(project_id) {
  await axios
    .delete(`${BASE}/user/${username}/projects/${project_id}/delete`)
    .then(function (response) {
      // handle success
      console.log(response.data.message);
      let alert = document.createElement("div");
      let container = document.querySelector(".homepage").firstElementChild;
      alert.classList.add("alert", "alert-danger");
      alert.innerText = response.data.message;
      alert.setAttribute("id", "alert");
      container.insertBefore(alert, table);

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
