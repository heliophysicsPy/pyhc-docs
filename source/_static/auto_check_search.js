document.addEventListener("DOMContentLoaded", function() {
    const subprojectCheckbox = document.querySelector("#filter-0");
    if (subprojectCheckbox && !subprojectCheckbox.checked) {
        subprojectCheckbox.checked = true;
    }
});
