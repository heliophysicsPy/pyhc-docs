document.addEventListener("DOMContentLoaded", function() {
    console.log("auto_check_search.js loaded: attempting to check subproject checkbox.");

    function checkSubprojectCheckbox() {
        // Locate the shadow DOM root for the search element
        const shadowHost = document.querySelector("readthedocs-search");
        if (shadowHost && shadowHost.shadowRoot) {
            const subprojectCheckbox = shadowHost.shadowRoot.querySelector("#filter-0");
            
            if (subprojectCheckbox) {
                console.log("Checkbox found within shadow DOM with id 'filter-0'. Current checked state:", subprojectCheckbox.checked);
                if (!subprojectCheckbox.checked) {
                    subprojectCheckbox.checked = true;
                    console.log("Checkbox checked by auto_check_search.js.");
                }
            } else {
                console.log("Checkbox with id 'filter-0' not found within shadow DOM. Retrying...");
                setTimeout(checkSubprojectCheckbox, 500); // Retry after 500ms
            }
        } else {
            console.log("Shadow DOM root not found. Retrying...");
            setTimeout(checkSubprojectCheckbox, 500); // Retry after 500ms
        }
    }

    checkSubprojectCheckbox();
});
