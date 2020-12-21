const clientTable = document.querySelector("table");

//event listener to handle deleting client
clientTable.addEventListener("click", function (evt) {
  if (evt.target.classList.contains("delete")) {
    const targetRow = getTargetRow(evt);
    const clientId = targetRow.dataset.clientId;
    sendRequestToDeleteClient(clientId, targetRow);
  }
});

async function sendRequestToDeleteClient(clientId, targetRow) {
  await axios
    .delete(`${BASE}/${username}/clients/${clientId}`)
    .then(function (response) {
      // handle success
      makeAlert(response, "danger");
      targetRow.remove();
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

function hideAlert() {
  document.getElementById("alert").remove();
}
