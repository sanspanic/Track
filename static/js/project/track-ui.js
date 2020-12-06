let startBtn = document.querySelector("#start");
let stopBtn = document.querySelector("#stop");
let BASE = "http://127.0.0.1:5000";
let username = document.querySelector("#navbarDropdown").innerText;
let table = document.querySelector("table");
let project_id = document.querySelector("h1").getAttribute("id");

stopBtn.setAttribute("disabled", "disabled");

startBtn.addEventListener("click", function (evt) {
  disableAllBtns();
  stopBtn.removeAttribute("disabled");
  sendCreateLogEntryRequest();
});

stopBtn.addEventListener("click", function (evt) {
  enableTableBtns();
  //log_entry_id is needed to identify which le is being updated
  let log_entry_id = getLogEntryId();
  sendRequestToAddStopTime(log_entry_id);
  stopBtn.setAttribute("disabled", "disabled");
  startBtn.removeAttribute("disabled");
});

table.addEventListener("click", function (evt) {
  if (evt.target.id === "edit") {
    disableAllBtns();
    emptySpans();
    //change cell to include accept changes button
    evt.target.parentElement.innerHTML =
      "<button id='accept-changes' class='btn btn-warning'>Accept Changes</button>";
    makeDateInput(evt);
    makeTimeInputs(evt);
  }
});

table.addEventListener("click", function (evt) {
  if (evt.target.id === "accept-changes") {
    enableTableBtns();
    startBtn.removeAttribute("disabled");
    //add back edit and delete buttons
    makeEditAndDeleteBtns(evt.target.parentElement);
    let log_entry_id = getLogEntryId();
    //grab user input intended to be sent to backend for updating
    let date = document.querySelector("input[type='date']").value;
    let startTime = document.querySelector("input[name='start_time']").value;
    let stopTime = document.querySelector("input[name='stop_time']").value;
    sendRequestToEditTimeAndDate(evt, log_entry_id, date, startTime, stopTime);
  }
});

table.addEventListener('click', function (evt) {
    if (evt.target.id === "delete") {
        let log_entry_id = getLogEntryIdForDel(evt);
        sendRequestToDeleteLogEntry(evt, log_entry_id)
    }
})

async function sendCreateLogEntryRequest() {
  await axios
    .post(`${BASE}/${username}/project/${project_id}/logentry/new`)
    .then(function (response) {
      // handle success
      addNewRow(response);
      updateSpans(response);
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

async function sendRequestToAddStopTime(log_entry_id) {
  await axios
    .patch(
      `${BASE}/${username}/project/${project_id}/logentry/${log_entry_id}/update`
    )
    .then(function (response) {
      // handle success
      addStopInfoToRow(response);
      updateSpans(response);
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

async function sendRequestToEditTimeAndDate(
  evt,
  log_entry_id,
  date,
  start_time,
  stop_time
) {
  await axios
    .patch(
      `${BASE}/${username}/project/${project_id}/logentry/${log_entry_id}/update`,
      {
        date,
        start_time,
        stop_time,
      }
    )
    .then(function (response) {
      // handle success
      emptySpans();
      updateUI(evt, response);
      updateSubtotals(response);
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

async function sendRequestToDeleteLogEntry(
    evt,
    log_entry_id
  ) {
    await axios
      .delete(
        `${BASE}/${username}/project/${project_id}/logentry/${log_entry_id}/delete`
      )
      .then(function (response) {
        // handle success
        console.log(response)
        deleteRow(evt)
        updateSubtotals(response)
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

function makeDateInput(evt) {
  let input = document.createElement("input");
  input.setAttribute("type", "date");
  input.setAttribute("name", "date");
  let inputValue = evt.path[2].firstElementChild.innerText;
  //handle case where day is single number - must have 0 in front in order to display correctly in input
  if (inputValue.split('-')[2].length < 2) {
      let inputValueArr = inputValue.split('-')
      inputValue = `${inputValueArr[0]}-${inputValueArr[1]}-0${inputValueArr[2]}`
  }
  input.setAttribute("value", inputValue);
  evt.path[2].firstElementChild.innerText = "";
  evt.path[2].firstElementChild.append(input);
}

function makeTimeInputs(evt) {
  let startTime = evt.path[2].firstElementChild.nextElementSibling.innerText;
  let stopTime =
    evt.path[2].firstElementChild.nextElementSibling.nextElementSibling
      .innerText;
  evt.path[2].firstElementChild.nextElementSibling.innerText = "";
  evt.path[2].firstElementChild.nextElementSibling.nextElementSibling.innerText =
    "";
  let startTimeInput = document.createElement("input");
  let stopTimeInput = document.createElement("input");
  startTimeInput.setAttribute("type", "time");
  stopTimeInput.setAttribute("type", "time");
  startTimeInput.setAttribute("name", "start_time");
  stopTimeInput.setAttribute("name", "stop_time");
  startTimeInput.setAttribute("value", startTime);
  stopTimeInput.setAttribute("value", stopTime);
  evt.path[2].firstElementChild.nextElementSibling.append(startTimeInput);
  evt.path[2].firstElementChild.nextElementSibling.nextElementSibling.append(
    stopTimeInput
  );
}

function updateUI(evt, response) {
  let startTimeInputCell = document.querySelector("input[name='start_time']")
    .parentElement;
  let stopTimeInputCell = document.querySelector("input[name='stop_time']")
    .parentElement;
  let dateInputCell = document.querySelector("input[name='date']")
    .parentElement;
  startTimeInputCell.innerText = response.data.pretty_start_time;
  stopTimeInputCell.innerText = response.data.pretty_stop_time;
  dateInputCell.innerText = response.data.pretty_date;
  console.log(evt);
  let valueCell = evt.path[1].previousElementSibling;
  console.log(valueCell);
  let timeDeltaCell = evt.path[1].previousElementSibling.previousElementSibling;
  console.log(timeDeltaCell);
  valueCell.innerText = response.data.value_in_curr_of_rate;
  timeDeltaCell.innerText = `${response.data.time_delta} min`;
}

function makeAlert(response) {
  let alert = document.createElement("div");
  let container = document.querySelector(".project-track").firstElementChild;
  let h1 = document.querySelector("h1");
  alert.classList.add("alert", "alert-danger");
  alert.innerText = response.data.message;
  alert.setAttribute("id", "alert");
  container.insertBefore(alert, h1);
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
  let allEditBtns = document.querySelectorAll("#edit");
  let allDeleteBtns = document.querySelectorAll("#delete");
  for (i = 0; i < allEditBtns.length; i++) {
    allEditBtns[i].removeAttribute("disabled");
  }
  for (i = 0; i < allDeleteBtns.length; i++) {
    allDeleteBtns[i].removeAttribute("disabled");
  }
}

function getLogEntryId() {
  return table.lastElementChild.lastElementChild
    .getAttribute("id")
    .split("-")[1];
}

function getLogEntryIdForDel(evt) {
    return evt.target.parentElement.parentElement.getAttribute('id').split('-')[1]
}

function addNewRow(response) {
  let tbody = document.querySelector("tbody");
  let tr = document.createElement("tr");
  let td_date = document.createElement("td");
  let td_start = document.createElement("td");
  let td_stop = document.createElement("td");
  let td_delta = document.createElement("td");
  let td_value = document.createElement("td");
  let td_actions = document.createElement("td");
  tr.appendChild(td_date).innerText = response.data.pretty_date;
  tr.setAttribute("id", `logentryid-${response.data.id}`);
  tr.appendChild(td_start).innerText = response.data.pretty_start_time;
  tr.appendChild(td_stop).innerHTML = "<i>tracking...</i>";
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
  let stopCell = timeDeltaCell.previousElementSibling;
  stopCell.innerText = response.data.pretty_stop_time;
  let actionsCell = valueCell.nextElementSibling;
  //add back edit and delete buttons
  makeEditAndDeleteBtns(actionsCell);
}

function makeEditAndDeleteBtns(target) {
  target.innerHTML =
    "<button id='edit' class='btn btn-success'>Edit</button> <button id='delete' class='btn btn-danger'>Delete</button>";
}

function updateSpans(response) {
  let stopSpan = document.querySelector("#time-stopped");
  stopSpan.innerText = response.data.pretty_stop_time;
  let startSpan = document.querySelector("#time-started");
  startSpan.innerText = response.data.pretty_start_time;
}

function updateSubtotals(response) {
    console.log(response)
    let subtotalSpan = document.querySelector('#subtotal-rate')
    subtotalSpan.innerText = `${response.data.subtotal} ${response.data.curr_of_rate}`
    let convSubtotalSpan = document.querySelector('#subtotal-inv')
    convSubtotalSpan.innerText = `${response.data.converted_subtotal} ${response.data.curr_of_inv}`
} 

function emptySpans() {
  document.querySelector("#time-stopped").innerText = "";
  document.querySelector("#time-started").innerText = "";
}

function deleteRow(evt) {
    console.log(evt)
    evt.path[2].remove()
}
