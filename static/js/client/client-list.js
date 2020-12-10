const table = document.querySelector("table");

async function sendRequest(id) {
  await axios
    .delete(`${BASE}/${username}/client/${id}/delete`)
    .then(function (response) {
      // handle success
      let alert = document.createElement("div");
      let container = document.querySelector("#clients-container");
      alert.classList.add("alert", "alert-danger");
      alert.innerText = response.data.message;
      alert.setAttribute("id", "alert");
      console.log(table)
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

table.addEventListener("click", function (evt) {
  if (
    evt.target.classList.contains("delete")
  ) {
    debugger;
    let id = evt.target.parentElement.id;
    sendRequest(id);
    evt.target.parentElement.parentElement.remove();
  }
});

function hideAlert() {
  document.getElementById("alert").remove();
}
