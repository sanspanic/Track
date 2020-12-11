const table = document.querySelector('table')

function makeAlert(response, category) {
    let alert = document.createElement("div");
    let container = document.querySelector(".alert-container");
    alert.classList.add("alert", `alert-${category}`);
    alert.innerText = response.data.message;
    alert.setAttribute("id", "alert");
    container.insertBefore(alert, table);
  }
  
  function hideAlert() {
    document.getElementById("alert").remove();
  }

//determines targeted row based on evt.tagname (icon vs button)
function getTargetRow(evt) {
    const row =
      (evt.target.tagName === "BUTTON")
        ? evt.target.parentElement.parentElement
        : evt.target.parentElement.parentElement.parentElement;
    return row;
  }
