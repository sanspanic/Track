let startBtn = document.querySelector("#start");
let stopBtn = document.querySelector('#stop')
let BASE = "http://127.0.0.1:5000";
let username = document.querySelector("#navbarDropdown").innerText;
let table = document.querySelector("table");
let project_id = document.querySelector('h1').getAttribute('id')

stopBtn.setAttribute('disabled', 'disabled')

startBtn.addEventListener('click', function(evt) {
    sendCreateLogEntryRequest()
    stopBtn.removeAttribute('disabled')
    startBtn.setAttribute('disabled', 'disabled')
})

stopBtn.addEventListener('click', function(evt){
    let log_entry_id = table.lastElementChild.lastElementChild.getAttribute('id')
    log_entry_id = table.lastElementChild.lastElementChild.getAttribute('id').split('-')[1]
    sendUpdateLogEntryRequest(log_entry_id)
    stopBtn.setAttribute('disabled', 'disabled')
    startBtn.removeAttribute('disabled')
})

async function sendCreateLogEntryRequest() {
    await axios
      .post(`${BASE}/${username}/project/${project_id}/logentry/new`)
      .then(function (response) {
        // handle success
        console.log(response);
        document.querySelector('#time-started').innerText = response.data.pretty_start_time
        let tbody = document.querySelector('tbody')
        let tr = document.createElement('tr')
        let td_date = document.createElement('td')
        let td_start = document.createElement('td')
        let td_stop = document.createElement('td')
        let td_delta = document.createElement('td')
        let td_value = document.createElement('td')
        let date = response.data.date.split(' ')
        date.pop() 
        date.pop()
        date = date.join(' ')
        console.log(date)
        tr.appendChild(td_date).innerText = date
        tr.appendChild(td_start).innerText = response.data.pretty_start_time
        tr.appendChild(td_stop).innerHTML = '<i>tracking...</i>'
        tbody.append(tr)
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

async function sendCreateLogEntryRequest() {
    await axios
      .post(`${BASE}/${username}/project/${project_id}/logentry/new`)
      .then(function (response) {
        // handle success
        console.log(response);
        document.querySelector('#time-started').innerText = response.data.pretty_start_time
        let tbody = document.querySelector('tbody')
        let tr = document.createElement('tr')
        let td_date = document.createElement('td')
        let td_start = document.createElement('td')
        let td_stop = document.createElement('td')
        let td_delta = document.createElement('td')
        let td_value = document.createElement('td')
        let date = response.data.date.split(' ')
        date.pop() 
        date.pop()
        date = date.join(' ')
        tr.appendChild(td_date).innerText = date
        tr.setAttribute('id', `logentryid-${response.data.id}`)
        tr.appendChild(td_start).innerText = response.data.pretty_start_time
        tr.appendChild(td_stop).innerHTML = '<i>tracking...</i>'
        tr.appendChild(td_delta).classList.add('time-delta')
        tr.appendChild(td_value).classList.add('value')
        tbody.append(tr)
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

async function sendUpdateLogEntryRequest(log_entry_id) {
    await axios
      .patch(`${BASE}/${username}/project/${project_id}/logentry/${log_entry_id}/update`)
      .then(function (response) {
        // handle success
        console.log(response);
        document.querySelector('#time-stopped').innerText = response.data.pretty_stop_time
        let timeDeltaCell = document.querySelector('.time-delta')
        timeDeltaCell.innerText = `${response.data.time_delta} min`
        let valueCell = document.querySelector('.value')
        valueCell.innerText = response.data.value_in_curr_of_rate
        let stopCell = timeDeltaCell.previousElementSibling
        stopCell.innerText = response.data.pretty_stop_time
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