document.addEventListener("DOMContentLoaded", function() {
    console.log("auto_check_search.js loaded: attempting to check subproject checkbox.");

    const subprojectCheckbox = document.querySelector("#filter-0");
    if (subprojectCheckbox) {
        console.log("Checkbox found with id 'filter-0'. Current checked state:", subprojectCheckbox.checked);
        if (!subprojectCheckbox.checked) {
            subprojectCheckbox.checked = true;
            console.log("Checkbox checked by auto_check_search.js.");
        }
    } else {
        console.log("Checkbox with id 'filter-0' not found on this page.");
    }
});
