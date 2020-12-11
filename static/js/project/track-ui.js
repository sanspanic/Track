const startBtn = document.querySelector("#start");
const stopBtn = document.querySelector("#stop");
const table = document.querySelector("table");
const project_id = document.querySelector("h1").getAttribute("id");

stopBtn.setAttribute("disabled", "disabled");

//start tracking time
startBtn.addEventListener("click", function (evt) {
  disableAllBtns();
  deenhanceSpans();
  stopBtn.removeAttribute("disabled");
  sendCreateLogEntryRequest();
});

//stop tracking time
stopBtn.addEventListener("click", function () {
  enableTableBtns();
  //log_entry_id is needed to identify which le is being updated. in this case will be last row by default
  const log_entry_id = getLogEntryIdLastRow();
  sendRequestToAddStopTime(log_entry_id);
  stopBtn.setAttribute("disabled", "disabled");
  startBtn.removeAttribute("disabled");
  enhanceSpans();
});

//adds 3 event listeners to table, enablind: edit, accepting-changes & delete
table.addEventListener("click", function (evt) {
  //handle requesting to edit existing log entry
  if (evt.target.classList.contains("edit")) {
    disableAllBtns();
    emptySpans();
    //capture data needed to make inputs, change cell to include accept changes button, differentiate between button and icon click
    let targetRow;
    if (evt.target.tagName === "BUTTON") {
      targetRow = evt.target.parentElement.parentElement;
      evt.target.parentElement.innerHTML =
        "<button class='accept-changes icon'><i class='ph-check-circle ph-lg accept-changes'></i></button>";
    } else {
      targetRow = evt.target.parentElement.parentElement.parentElement;
      evt.target.parentElement.parentElement.innerHTML =
        "<button class='accept-changes icon'><i class='ph-check-circle ph-lg accept-changes'></i></button>";
    }
    makeDateInput(targetRow);
    makeTimeInputs(targetRow);
    makeDescriptionInput(targetRow);
  } //handle accepting edited changes
  else if (evt.target.classList.contains("accept-changes")) {
    enableTableBtns();
    startBtn.removeAttribute("disabled");
    const logEntryId = getLogEntryId(evt);
    //add back edit and delete buttons
    if (evt.target.tagName === "BUTTON") {
      makeEditAndDeleteBtns(evt.target.parentElement);
    } else {
      makeEditAndDeleteBtns(evt.target.parentElement.parentElement);
    }
    //grab user input intended to be sent to backend for updating
    const date = document.querySelector("input[type='date']").value;
    const startTime = document.querySelector("input[name='start_time']").value;
    const stopTime = document.querySelector("input[name='stop_time']").value;
    const description = document.querySelector("input[name='description']")
      .value;
    sendRequestToEditTimeAndDate(
      logEntryId,
      date,
      startTime,
      stopTime,
      description
    );
  } // handle deleting log entry
  else if (evt.target.classList.contains("delete")) {
    const logEntryId = getLogEntryId(evt);
    sendRequestToDeleteLogEntry(evt, logEntryId);
  }
});

async function sendCreateLogEntryRequest() {
  await axios
    .post(`${BASE}/${username}/project/${project_id}/logentry/new`)
    .then(function (response) {
      // handle success
      addNewRow(response);
      updateSpans(response);
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

async function sendRequestToAddStopTime(log_entry_id) {
  await axios
    .patch(
      `${BASE}/${username}/project/${project_id}/logentry/${log_entry_id}/update`
    )
    .then(function (response) {
      // handle success
      addStopInfoToRow(response);
      updateSpans(response);
      updateSubtotals(response);
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

async function sendRequestToEditTimeAndDate(
  log_entry_id,
  date,
  start_time,
  stop_time,
  description
) {
  await axios
    .patch(
      `${BASE}/${username}/project/${project_id}/logentry/${log_entry_id}/update`,
      {
        date,
        start_time,
        stop_time,
        description,
      }
    )
    .then(function (response) {
      // handle success
      emptySpans();
      updateUI(response);
      updateSubtotals(response);
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

async function sendRequestToDeleteLogEntry(evt, log_entry_id) {
  await axios
    .delete(
      `${BASE}/${username}/project/${project_id}/logentry/${log_entry_id}/delete`
    )
    .then(function (response) {
      // handle success
      deleteRow(evt);
      updateSubtotals(response);
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

//grabs input from targeted row and transforms it into inputs
function makeDateInput(targetRow) {
  let input = document.createElement("input");
  input.setAttribute("type", "date");
  input.setAttribute("name", "date");
  let inputValue = targetRow.firstElementChild.innerText;
  //handle case where day is single number - must have 0 in front in order to display correctly in input
  if (inputValue.split("-")[2].length < 2) {
    let inputValueArr = inputValue.split("-");
    inputValue = `${inputValueArr[0]}-${inputValueArr[1]}-0${inputValueArr[2]}`;
  }
  input.setAttribute("value", inputValue);
  targetRow.firstElementChild.innerText = "";
  targetRow.firstElementChild.append(input);
}

function makeTimeInputs(targetRow) {
  const startTime = targetRow.firstElementChild.nextElementSibling.innerText;
  const stopTime =
    targetRow.firstElementChild.nextElementSibling.nextElementSibling.innerText;
  targetRow.firstElementChild.nextElementSibling.innerText = "";
  targetRow.firstElementChild.nextElementSibling.nextElementSibling.innerText =
    "";
  const startTimeInput = document.createElement("input");
  const stopTimeInput = document.createElement("input");
  startTimeInput.setAttribute("type", "time");
  stopTimeInput.setAttribute("type", "time");
  startTimeInput.setAttribute("name", "start_time");
  stopTimeInput.setAttribute("name", "stop_time");
  startTimeInput.setAttribute("value", startTime);
  stopTimeInput.setAttribute("value", stopTime);
  targetRow.firstElementChild.nextElementSibling.append(startTimeInput);
  targetRow.firstElementChild.nextElementSibling.nextElementSibling.append(
    stopTimeInput
  );
}

function makeDescriptionInput(targetRow) {
  const currentDescriptionCell =
    targetRow.firstElementChild.nextElementSibling.nextElementSibling
      .nextElementSibling;
  const currentDescription = currentDescriptionCell.innerText;
  currentDescriptionCell.innerHTML = `<input type='text' name='description' value='${currentDescription}'></input>`;
}

function updateUI(response) {
  let startTimeInputCell = document.querySelector("input[name='start_time']")
    .parentElement;
  let stopTimeInputCell = document.querySelector("input[name='stop_time']")
    .parentElement;
  let dateInputCell = document.querySelector("input[name='date']")
    .parentElement;
  let descriptionInputCell = document.querySelector("input[name='description']")
    .parentElement;
  startTimeInputCell.innerText = response.data.pretty_start_time;
  stopTimeInputCell.innerText = response.data.pretty_stop_time;
  dateInputCell.innerText = response.data.pretty_date;
  descriptionInputCell.innerText = response.data.description;
  let valueCell =
    stopTimeInputCell.nextElementSibling.nextElementSibling.nextElementSibling;
  let timeDeltaCell = stopTimeInputCell.nextElementSibling.nextElementSibling;
  valueCell.innerText = response.data.value_in_curr_of_rate;
  timeDeltaCell.innerText = `${response.data.time_delta} min`;
}

function makeAlert(response, category) {
  let alert = document.createElement("div");
  let alertCont = document.querySelector(".alert-container");
  alert.classList.add("alert", `alert-${category}`);
  alert.innerText = response.data.message;
  alert.setAttribute("id", "alert");
  alertCont.insertBefore(alert, table);
}

function hideAlert() {
  document.getElementById("alert").remove();
}

function disableAllBtns() {
  let allBtns = document.querySelectorAll("button");
  for (i = 0; i < allBtns.length; i++) {
    allBtns[i].setAttribute("disabled", "disabled");
  }
}

function enableTableBtns() {
  let allEditBtns = document.querySelectorAll(".edit");
  let allDeleteBtns = document.querySelectorAll(".delete");
  for (i = 0; i < allEditBtns.length; i++) {
    allEditBtns[i].removeAttribute("disabled");
  }
  for (i = 0; i < allDeleteBtns.length; i++) {
    allDeleteBtns[i].removeAttribute("disabled");
  }
}

//grabs log entry if target is button or icon in row
function getLogEntryId(evt) {
  const targetRow =
    evt.target.tagName === "BUTTON"
      ? evt.target.parentElement.parentElement
      : evt.target.parentElement.parentElement.parentElement;
  return targetRow.dataset.logEntryId;
}

//grabs log entry ID of last row, which is by default the one being updated when stop time added
function getLogEntryIdLastRow() {
  return table.lastElementChild.lastElementChild.dataset.logEntryId;
}

function addNewRow(response) {
  let tbody = document.querySelector("tbody");
  let tr = document.createElement("tr");
  let td_date = document.createElement("td");
  let td_start = document.createElement("td");
  let td_stop = document.createElement("td");
  let td_description = document.createElement("td");
  let td_delta = document.createElement("td");
  let td_value = document.createElement("td");
  let td_actions = document.createElement("td");
  tr.appendChild(td_date).innerText = response.data.pretty_date;
  tr.setAttribute("data-log-entry-id", response.data.id);
  tr.appendChild(td_start).innerText = response.data.pretty_start_time;
  tr.appendChild(td_stop).innerHTML = "<i>tracking...</i>";
  tr.appendChild(td_description).classList.add("description");
  tr.appendChild(td_delta).classList.add("time-delta");
  tr.appendChild(td_value).classList.add("value");
  tr.appendChild(td_actions);
  tbody.append(tr);
}

function addStopInfoToRow(response) {
  //querySelectorAll is used in order to select fields in the LAST row where newest log_entry is being updated by default
  let timeDeltaNodes = document.querySelectorAll(".time-delta");
  let timeDeltaCell = timeDeltaNodes[timeDeltaNodes.length - 1];
  timeDeltaCell.innerText = `${response.data.time_delta} min`;
  let valueNodes = document.querySelectorAll(".value");
  let valueCell = valueNodes[valueNodes.length - 1];
  valueCell.innerText = response.data.value_in_curr_of_rate;
  let stopCell = timeDeltaCell.previousElementSibling.previousElementSibling;
  stopCell.innerText = response.data.pretty_stop_time;
  let actionsCell = valueCell.nextElementSibling;
  //add back edit and delete buttons
  makeEditAndDeleteBtns(actionsCell);
}

function makeEditAndDeleteBtns(target) {
  target.innerHTML = `<button class='icon edit'><i class="ph-pencil-simple ph-lg edit"></i></button>
    <button class='icon delete'><i class="ph-trash-simple ph-lg delete"></i></button> `;
}

function updateSpans(response) {
  let stopSpan = document.querySelector("#time-stopped");
  stopSpan.innerText = response.data.pretty_stop_time;
  let startSpan = document.querySelector("#time-started");
  startSpan.innerText = response.data.pretty_start_time;
}

function updateSubtotals(response) {
  const subtotalSpan = document.querySelector("#subtotal-rate");
  const subtotal = Number.parseFloat(response.data.subtotal).toFixed(2);
  subtotalSpan.innerText = `${subtotal} ${response.data.curr_of_rate}`;
  const convSubtotalSpan = document.querySelector("#subtotal-inv");
  const convSubtotal = Number.parseFloat(
    response.data.converted_subtotal
  ).toFixed(2);
  convSubtotalSpan.innerText = `${convSubtotal} ${response.data.curr_of_inv}`;
}

function emptySpans() {
  document.querySelector("#time-stopped").innerText = "";
  document.querySelector("#time-started").innerText = "";
}

function deleteRow(evt) {
  evt.target.parentElement.parentElement.remove();
}

//make spans stand out
function enhanceSpans() {
  const spans = document.querySelectorAll(".time-span");
  spans.forEach((span) => span.parentElement.classList.add("enhanced"));
}

//remove spans emphasis
function deenhanceSpans() {
  const spans = document.querySelectorAll(".time-span");
  if (spans[0].parentElement.classList.contains("enhanced")) {
    spans.forEach((span) => span.parentElement.classList.remove("enhanced"));
  }
}
