function hideAlert() {
    document.getElementById("alert").remove()
}

if (document.getElementById("alert")) {
    setTimeout("hideAlert()", 5000)
}

