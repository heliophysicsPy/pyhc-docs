document.addEventListener("DOMContentLoaded", function() {

    function checkSubprojectCheckbox() {
        // Locate the shadow DOM root for the search element
        const shadowHost = document.querySelector("readthedocs-search");
        if (shadowHost && shadowHost.shadowRoot) {
            const subprojectCheckbox = shadowHost.shadowRoot.querySelector("#filter-0");
            
            if (subprojectCheckbox) {
                if (!subprojectCheckbox.checked) {
                    subprojectCheckbox.checked = true;
                }
            } else {
                setTimeout(checkSubprojectCheckbox, 500); // Retry after 500ms
            }
        } else {
            setTimeout(checkSubprojectCheckbox, 500); // Retry after 500ms
        }
    }

    checkSubprojectCheckbox();
});
