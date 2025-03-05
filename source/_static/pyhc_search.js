// PyHC Documentation Hub - Unified Search
document.addEventListener('DOMContentLoaded', function() {
  // Create the search modal
  createSearchModal();
  
  // Find the RTD search form
  const rtdSearchForm = document.getElementById('rtd-search-form');
  const rtdSearchInput = rtdSearchForm ? rtdSearchForm.querySelector('input[type="text"]') : null;
  
  // Base API URL
  const apiBaseUrl = 'https://readthedocs.org/api/v3/search/';
  
  // Modal elements (will be defined after createSearchModal)
  const searchModal = document.getElementById('pyhc-search-modal');
  const searchDialog = document.getElementById('pyhc-search-dialog');
  const searchInput = document.getElementById('pyhc-search-input');
  const clearButton = document.getElementById('pyhc-search-clear');
  const resultsContainer = document.getElementById('pyhc-search-content');
  
  // Debounce timer for real-time search
  let searchDebounceTimer = null;
  let searchIcon = null; // Will be set after modal creation

  // If the RTD search form exists, intercept it
  if (rtdSearchForm && rtdSearchInput) {
    // When user clicks on the search input, show our modal instead
    rtdSearchInput.addEventListener('click', function(event) {
      event.preventDefault();
      event.stopPropagation();
      showSearchModal();
    });
    
    // Also intercept the form submission
    rtdSearchForm.addEventListener('submit', function(event) {
      event.preventDefault();
      showSearchModal();
    });
  }
  
  // Event listeners for search modal
  if (searchModal && searchInput) {
    // Get reference to the search icon for state changes
    searchIcon = document.querySelector('#pyhc-search-form label svg');
    
    // Real-time search with debounce
    searchInput.addEventListener('input', function() {
      const query = searchInput.value.trim();
      
      // Cancel any existing timer
      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = null;
      }
      
      // If query is too short, show recent searches instead
      if (query.length < 3) {
        resetSearchIcon();
        // Show recent searches
        displayRecentSearches();
        return;
      }
      
      // Show loading state by changing icon to spinning circle notch
      if (searchIcon) {
        searchIcon.innerHTML = `<title id="svg-search-icon">Searching...</title>
        <path d="M222.7 32.1c5 16.9-4.6 34.8-21.5 39.8C121.8 95.6 64 169.1 64 256c0 106 86 192 192 192s192-86 192-192c0-86.9-57.8-160.4-137.1-184.1c-16.9-5-26.6-22.9-21.5-39.8s22.9-26.6 39.8-21.5C434.9 42.1 512 140 512 256c0 141.4-114.6 256-256 256S0 397.4 0 256C0 140 77.1 42.1 182.9 10.6c16.9-5 34.8 4.6 39.8 21.5z"></path>`;
        searchIcon.classList.add('fa-spin');
      }
      
      // Set a 1 second timer - only for queries with 3+ characters
      searchDebounceTimer = setTimeout(function() {
        performSearch(true); // Pass true to indicate this is from the debounce timer
        // Reset the timer
        searchDebounceTimer = null;
      }, 1000);
    });
    
    // Close modal when clicking outside the dialog
    searchModal.addEventListener('click', function(event) {
      if (event.target === searchModal) {
        hideSearchModal();
      }
    });
    
    // Handle Up/Down/Enter/Escape keyboard navigation
    document.addEventListener('keydown', function(event) {
      // Only process keyboard events when the search modal is visible
      if (searchModal.style.display !== 'block') {
        return;
      }
      
      switch (event.key) {
        case 'Escape':
          hideSearchModal();
          break;
          
        case 'ArrowDown':
          event.preventDefault();
          navigateSearchResults('down');
          break;
          
        case 'ArrowUp':
          event.preventDefault();
          navigateSearchResults('up');
          break;
          
        case 'Enter':
          // If a search result is focused, click it
          const focusedElement = document.querySelector('.hit.focused');
          if (focusedElement) {
            event.preventDefault();
            focusedElement.click();
          } else if (document.activeElement === searchInput) {
            event.preventDefault();
            
            // Cancel any pending debounce timer
            if (searchDebounceTimer) {
              clearTimeout(searchDebounceTimer);
              searchDebounceTimer = null;
            }
            
            performSearch(false); // This is a manual search, show the searching message
          }
          break;
      }
    });
    
    // Listen for Enter key in search input
    searchInput.addEventListener('keydown', function(event) {
      if (event.key === 'Enter' && searchModal.style.display === 'block') {
        event.preventDefault(); // Prevent form submission
        
        // Cancel any pending debounce timer
        if (searchDebounceTimer) {
          clearTimeout(searchDebounceTimer);
          searchDebounceTimer = null;
        }
        
        performSearch(false); // This is a manual search, show the searching message
      }
    });
    
    // Add submit handler to our search form
    const searchForm = document.getElementById('pyhc-search-form');
    if (searchForm) {
      searchForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent form submission
        performSearch(false); // This is a manual search, show the searching message
      });
    }
    
    // Clear button
    if (clearButton) {
      clearButton.addEventListener('click', function() {
        searchInput.value = '';
        searchInput.focus();
        
        // Cancel any pending debounce timer
        if (searchDebounceTimer) {
          clearTimeout(searchDebounceTimer);
          searchDebounceTimer = null;
        }
        
        // Reset search icon to magnifying glass
        resetSearchIcon();
        
        // Show recent searches
        displayRecentSearches();
      });
    }
  }
  
  // Create and inject the search modal HTML
  function createSearchModal() {
    const modalHtml = `
      <div id="pyhc-search-modal" class="pyhc-search-modal">
        <div id="pyhc-search-dialog" class="pyhc-search-dialog">
          <div role="search">
            <div class="background"></div>
            <div class="content">
              <form class="focus" id="pyhc-search-form" onsubmit="return false;">
                <label>
                  <svg aria-labelledby="svg-search-icon" data-prefix="fas" data-icon="magnifying-glass" class="svg-inline--fa fa-magnifying-glass" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                    <title id="svg-search-icon">Search</title>
                    <path fill="currentColor" d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"></path>
                  </svg>
                </label>
                <input type="search" id="pyhc-search-input" placeholder="Search docs" autocomplete="off">
                <span id="pyhc-search-clear" class="clear-icon" title="Clear search">×</span>
              </form>
              
              <div id="pyhc-search-content" class="results">
                <!-- Search results will be inserted here -->
              </div>
              
              <div class="footer">
                <ul class="help">
                  <li><code>Enter</code> to select</li>
                  <li><code>Up</code>/<code>Down</code> to navigate</li>
                  <li><code>Esc</code> to close</li>
                </ul>
                <div class="credits">
                  Search powered by
                  <a href="https://about.readthedocs.com/?utm_source=pyhc-docs&utm_content=search">
                    <img alt="Read the Docs" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJzdmciIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSI2OTQgMTk3IDIwMDAgNDAwIj4KPGcgaWQ9ImxvZ28iIHRyYW5zZm9ybT0ibWF0cml4KDAuNTU3NTM2NDQsMCwwLDAuNTU3NTM2NDQsNjguMzA4MTM1LDEwNTAuMTI2MikiPgoJPHBhdGggc3R5bGU9ImZpbGw6IzMyMzIyQSIgZD0iTTE0MDguMS0xMTgxLjdjLTcuNSwxLTEyLjcsNy44LTExLjcsMTUuMyAgIGMwLjcsNS40LDQuNiw5LjksOS45LDExLjNjMCwwLDMzLjIsMTEsODkuNywxNS42YzQ1LjQsMy43LDk2LjktMy4yLDk2LjktMy4yYzcuNS0wLjIsMTMuNS02LjUsMTMuMi0xNHMtNi41LTEzLjUtMTQtMTMuMiAgIGMtMC45LDAtMS44LDAuMS0yLjYsMC4zYzAsMC01MC40LDYuMi05MS4zLDIuOWMtNTQtNC40LTgzLjQtMTQuMy04My40LTE0LjNDMTQxMi42LTExODEuNywxNDEwLjMtMTE4MiwxNDA4LjEtMTE4MS43eiAgICBNMTQwOC4xLTEyNDkuM2MtNy41LDEtMTIuNyw3LjgtMTEuNywxNS4zYzAuNyw1LjQsNC42LDkuOSw5LjksMTEuM2MwLDAsMzMuMiwxMSw4OS43LDE1LjZjNDUuNCwzLjcsOTYuOS0zLjIsOTYuOS0zLjIgICBjNy41LTAuMiwxMy41LTYuNSwxMy4yLTE0cy02LjUtMTMuNS0xNC0xMy4yYy0wLjksMC0xLjgsMC4xLTIuNiwwLjNjMCwwLTUwLjQsNi4yLTkxLjMsMi45Yy01NC00LjQtODMuNC0xNC4zLTgzLjQtMTQuMyAgIEMxNDEyLjYtMTI0OS4zLDE0MTAuMy0xMjQ5LjYsMTQwOC4xLTEyNDkuM3ogTTE0MDguMS0xMzE2LjljLTcuNSwxLTEyLjcsNy44LTExLjcsMTUuM2MwLjcsNS40LDQuNiw5LjksOS45LDExLjMgICBjMCwwLDMzLjIsMTEsODkuNywxNS42YzQ1LjQsMy43LDk2LjktMy4yLDk2LjktMy4yYzcuNS0wLjIsMTMuNS02LjUsMTMuMi0xNHMtNi41LTEzLjUtMTQtMTMuMmMtMC45LDAtMS44LDAuMS0yLjYsMC4zICAgYzAsMC01MC40LDYuMi05MS4zLDIuOWMtNTQtNC40LTgzLjQtMTQuMy04My40LTE0LjNDMTQxMi42LTEzMTYuOSwxNDEwLjMtMTMxNy4yLDE0MDguMS0xMzE2Ljl6IE0xNDA4LjEtMTM4NC40ICAgYy03LjUsMS0xMi43LDcuOC0xMS43LDE1LjNjMC43LDUuNCw0LjYsOS45LDkuOSwxMS4zYzAsMCwzMy4yLDExLDg5LjcsMTUuNmM0NS40LDMuNyw5Ni45LTMuMiw5Ni45LTMuMmM3LjUtMC4yLDEzLjUtNi41LDEzLjItMTQgICBzLTYuNS0xMy41LTE0LTEzLjJjLTAuOSwwLTEuOCwwLjEtMi42LDAuM2MwLDAtNTAuNCw2LjItOTEuMywyLjljLTU0LTQuNC04My40LTE0LjMtODMuNC0xNC4zICAgQzE0MTIuNi0xMzg0LjUsMTQxMC4zLTEzODQuNywxNDA4LjEtMTM4NC40eiBNMTMxMy40LTE0NTUuN2MtNzEsMC41LTk3LjUsMjIuMy05Ny41LDIyLjN2NTMwLjNjMCwwLDI1LjgtMjIuMywxMDktMTguOSAgIGM4My4yLDMuNCwxMDAuMywzMi42LDIwMi41LDM0LjZjMTAyLjIsMi4xLDEyNy45LTE1LjcsMTI3LjktMTUuN2wxLjUtNTQwLjZjMCwwLTQ2LDEzLTEzNS41LDEzLjdzLTExMS0yMi44LTE5My4yLTI1LjUgICBDMTMyMy0xNDU1LjYsMTMxOC4xLTE0NTUuNywxMzEzLjQtMTQ1NS43eiBNMTM3Mi44LTE0MjEuMWMwLDAsNDMsMTQuMiwxMjIuNSwxOC4yYzY3LjIsMy4zLDEzNC41LTYuNiwxMzQuNS02LjZ2NDgwLjUgICBjMCwwLTM0LjEsMTcuOS0xMTkuMywxMS44Yy02Ni00LjctMTM4LjctMjkuNy0xMzguNy0yOS43TDEzNzIuOC0xNDIxLjF6IE0xMzMxLjMtMTQwOC42YzcuNiwwLDEzLjcsNi4yLDEzLjcsMTMuNyAgIHMtNi4yLDEzLjctMTMuNywxMy43YzAsMC0yMi4zLDAuMS0zNS44LDEuNWMtMjIuOCwyLjMtMzguMywxMC42LTM4LjMsMTAuNmMtNi43LDMuNS0xNSwxLTE4LjUtNS43cy0xLTE1LDUuNy0xOC41YzAsMCwwLDAsMCwwICAgYzAsMCwyMC4yLTEwLjcsNDguNC0xMy41QzEzMDkuMS0xNDA4LjUsMTMzMS4zLTE0MDguNiwxMzMxLjMtMTQwOC42eiBNMTMxOC4xLTEzNDAuOGM3LjYtMC4yLDEzLjMsMCwxMy4zLDAgICBjNy41LDAuOSwxMi45LDcuOCwxMiwxNS4zYy0wLjgsNi4zLTUuNywxMS4yLTEyLDEyYzAsMC0yMi4zLDAuMS0zNS44LDEuNWMtMjIuOCwyLjMtMzguMywxMC42LTM4LjMsMTAuNmMtNi43LDMuNS0xNSwwLjktMTguNS01LjggICBjLTMuNS02LjctMC45LTE1LDUuOC0xOC41YzAsMCwyMC4yLTEwLjcsNDguNC0xMy41QzEzMDAuOS0xMzQwLjEsMTMxMC41LTEzNDAuNiwxMzE4LjEtMTM0MC44eiBNMTMzMS4zLTEyNzMuMyAgIGM3LjYsMCwxMy43LDYuMiwxMy43LDEzLjdjMCw3LjYtNi4yLDEzLjctMTMuNywxMy43YzAsMC0yMi4zLTAuMS0zNS44LDEuMmMtMjIuOCwyLjMtMzguMywxMC42LTM4LjMsMTAuNiAgIGMtNi43LDMuNS0xNSwwLjktMTguNS01LjhjLTMuNS02LjctMC45LTE1LDUuOC0xOC41YzAsMCwyMC4yLTEwLjcsNDguNC0xMy41QzEzMDkuMS0xMjczLjQsMTMzMS4zLTEyNzMuMywxMzMxLjMtMTI3My4zeiIvPgo8L2c+CjxnIGlkPSJ0ZXh0Ij4KCTxwYXRoIHN0eWxlPSJmaWxsOiMzMjMyMkEiIGQ9Ik0xMTI4LjYsNDkxLjlWNDcwbDguOS0wLjhjNS4yLTAuNSw3LjgtMy4xLDcuOC03LjZWMzM2bC0xNS40LTAuOHYtMjNoNzMuOCAgIGMyMC45LDAsMzYuOSwzLjksNDguMSwxMS42YzExLjIsNy43LDE2LjgsMjAuNSwxNi44LDM4LjFjMCwxMi4zLTMuMiwyMi4zLTkuNywzMC4zYy02LjMsNy45LTEzLjksMTMuNy0yMi43LDE3LjMgICBjNi41LDIuMywxMS42LDcuOCwxNS40LDE2LjVsMTkuNSw0Mi40bDE1LjQsMC41djIzaC02Ni44VjQ3MGw3LjgtMC44YzQuMS0wLjUsNi4yLTIuMiw2LjItNC45YzAtMS4xLTAuNC0yLjMtMS4xLTMuOGwtMTIuNy0yNyAgIGMtMi00LjUtNC4yLTcuNy02LjgtOS41Yy0yLjMtMi01LjgtMy0xMC4zLTNoLTI0LjZ2NDdsMTcuNiwwLjh2MjNMMTEyOC42LDQ5MS45IE0xMTc4LjMsMzk1LjRoMjMuNWMyMi4yLDAsMzMuMi05LjksMzMuMi0yOS43ICAgYzAtMTEuNC0zLTE4LjctOC45LTIyLjJjLTUuOC0zLjQtMTUuMS01LjEtMjguMS01LjFoLTE5LjdWMzk1LjQiLz4KCTxwYXRoIHN0eWxlPSJmaWxsOiMzMjMyMkEiIGQ9Ik0xMzU2LDM1MS45YzEzLjUsMCwyNC4yLDMuMywzMi4yLDEwYzcuOSw2LjUsMTEuOSwxNS43LDExLjksMjcuNmMwLDcuOS0xLjcsMTUtNS4xLDIxLjEgICBjLTMuNCw1LjktNy43LDEwLjYtMTIuNywxNC4xYy01LDMuNC0xMS4yLDYuMi0xOC40LDguNGMtMTIuMSwzLjYtMjUuNyw1LjQtNDAuOCw1LjRjMC41LDkuNSwzLjUsMTcuMyw4LjksMjMuMiAgIGM1LjQsNS44LDEzLjcsOC42LDI0LjksOC42YzExLjIsMCwyMi4zLTQsMzMuNS0xMS45bDEwLjMsMjEuOWMtMy42LDMuMi05LjcsNi42LTE4LjQsMTBjLTguNSwzLjQtMTguMiw1LjEtMjkuMiw1LjEgICBjLTIyLDAtMzguMS02LTQ4LjQtMTguMWMtMTAuMy0xMi4zLTE1LjQtMjktMTUuNC01MC4zYzAtMjEuMyw1LjktMzkuMSwxNy42LTUzLjVDMTMxOC41LDM1OS4xLDEzMzQuOSwzNTEuOSwxMzU2LDM1MS45ICAgIE0xMzQzLjYsNDEzLjhjNi43LTEuMywxMi44LTMuOSwxOC40LTcuOGM1LjYtNC4xLDguNC05LDguNC0xNC42YzAtMTEtNS40LTE2LjUtMTYuMi0xNi41Yy0xMC4xLDAtMTcuOCw0LjEtMjMuMiwxMi4yICAgYy01LjQsNy45LTguNCwxNy41LTguOSwyOC42QzEzMjkuOSw0MTUuNSwxMzM3LjEsNDE0LjksMTM0My42LDQxMy44Ii8+Cgk8cGF0aCBzdHlsZT0iZmlsbDojMzIzMjJBIiBkPSJNMTUyOS42LDM2MS40djEwMC41YzAsMi45LDAuNSw0LjksMS40LDUuOWMxLjEsMS4xLDIuOSwxLjcsNS40LDEuOWw4LjYsMC41djIxLjZoLTQzdi0xNS43ICAgbC0wLjgtMC4zYy05LDEzLTIxLjQsMTkuNS0zNywxOS41Yy0xOC40LDAtMzItNS45LTQwLjgtMTcuNmMtOC44LTExLjctMTMuMi0yNy43LTEzLjItNDguMWMwLTI0LjUsNS45LTQzLjYsMTcuOC01Ny4zICAgYzExLjktMTMuNywyOS43LTIwLjUsNTMuNS0yMC41QzE0OTYuOCwzNTEuOSwxNTEyLjksMzU1LjEsMTUyOS42LDM2MS40IE0xNDk4LjMsNDQ4Ljl2LTcwYy01LTIuMy0xMi0zLjUtMjAuOC0zLjUgICBjLTEyLjEsMC0yMC44LDQuOS0yNi4yLDE0LjZjLTUuNCw5LjctOC4xLDIyLjYtOC4xLDM4LjdjMCwyOS4yLDkuNCw0My44LDI4LjEsNDMuOGM3LjksMCwxNC40LTIuMywxOS41LTcgICBDMTQ5NS43LDQ2MC42LDE0OTguMyw0NTUuMSwxNDk4LjMsNDQ4LjkiLz4KCTxwYXRoIHN0eWxlPSJmaWxsOiMzMjMyMkEiIGQ9Ik0xNjE2LjMsMzUxLjljNy43LDAsMTUuMSwxLjEsMjIuMiwzLjJ2LTI3LjNjMC00LTIuMy02LjEtNy02LjVsLTExLjYtMC44di0yMS40aDUwLjN2MTY0LjMgICBjMC4yLDQuMSwyLjQsNi4yLDYuOCw2LjJsOS41LDAuNXYyMS42aC00My44VjQ3NmwtMC44LTAuM2MtOC4xLDEzLjItMjAuNCwxOS43LTM2LjgsMTkuN2MtMjAuNSwwLTM1LTYuOC00My4yLTIwLjUgICBjLTcuNi0xMi40LTExLjQtMjcuNy0xMS40LTQ1LjdjMC0yMy40LDUuOC00Mi4yLDE3LjMtNTYuMkMxNTc5LjMsMzU4LjksMTU5NS41LDM1MS45LDE2MTYuMywzNTEuOSBNMTYzOC40LDQ0OS44di03MCAgIGMtNi41LTIuOS0xMy4zLTQuMy0yMC41LTQuM2MtMTEuOSwwLTIwLjYsNC44LTI2LjIsMTQuM2MtNS40LDkuNi04LjEsMjEuNy04LjEsMzYuNWMwLDMwLjMsOS43LDQ1LjQsMjkuMiw0NS40ICAgYzcuNCwwLDEzLjUtMi4xLDE4LjQtNi4yQzE2MzYsNDYxLjEsMTYzOC40LDQ1NS45LDE2MzguNCw0NDkuOCIvPgoJPHBhdGggc3R5bGU9ImZpbGw6IzMyMzIyQSIgZD0iTTE3OTEuNyw0NzAuNmMwLDAtMTIuNSw0LjctMTkuMiw0LjdzLTkuMi0zLjMtOS4yLTExLjhjMC0zLjgsMC41LTguOCwxLjQtMTQuOWwxMC4yLTYzLjFoMzIuNiAgIGwyLjgtMTcuN2gtMzIuNmw1LjctMzQuNUwxNzYwLDMzOGwtNC43LDI5LjhsLTIzLjYsMi40bC0yLjYsMTUuNGgyMy40TDE3NDIsNDUxYy0wLjksNS40LTEuNCwxMC42LTEuNCwxNS4xICAgYzAsMTguNyw3LjgsMjguMSwyMy45LDI4LjFjMTMuMiwwLDMxLTEwLjksMzEtMTAuOUwxNzkxLjcsNDcwLjYiLz4KCTxwYXRoIHN0eWxlPSJmaWxsOiMzMjMyMkEiIGQ9Ik0xODY1LDMwOS44bC00My4zLDEuMmwtMi4xLDEzbDE5LjksNC43bC0yNiwxNjMuMmgyMi41bDcuOC00Mi42YzAsMCwxOC43LTY1LDQ5LjQtNjUgICBjOS41LDAsMTIuMyw2LjksMTIuMywxNS42YzAsMy4zLTAuNSw2LjktMC45LDEwLjRsLTEzLjUsODEuNmw0My4zLTIuNGwyLjEtMTNsLTE5LjktMy41bDEwLjYtNjYuMmMwLjctNSwxLjItOS43LDEuMi0xNCAgIGMwLTE3LTYuOS0yOC42LTI1LjgtMjguNmMtMzUuOSwwLTU0LjksNDUuNi01NS44LDQ4LjJMMTg2NSwzMDkuOCIvPgoJPHBhdGggc3R5bGU9ImZpbGw6IzMyMzIyQSIgZD0iTTIwMzUsNDY0LjdjMCwwLTIxLjUsMTAuNi0zOC44LDEwLjZjLTE3LjcsMC0yNi03LjgtMjYtMjQuNmMwLTMuMSwwLjItNi42LDAuNy0xMC4yICAgYzQ5LDAsODMtMTguNCw4My00NS42YzAtMTguNy0xNS4xLTMwLjctMzktMzAuN2MtMzcuNiwwLTY4LjMsMzguNS02OC4zLDg3LjVjMCwyNiwxNi42LDQyLjYsNDIuNiw0Mi42YzI3LjksMCw1My0xNy41LDUzLTE3LjUgICBMMjAzNSw0NjQuNyBNMTk3Myw0MjRjNi4xLTI0LjgsMjMuNC00Mi4xLDQwLjctNDIuMWMxMi4xLDAsMTcuNyw1LDE3LjcsMTUuNEMyMDMxLjUsNDEyLjksMjAwNi42LDQyNCwxOTczLDQyNCIvPgoJPHBhdGggc3R5bGU9ImZpbGw6IzMyMzIyQSIgZD0iTTIwOTMuNyw0OTEuOVY0NzBsOC45LTAuOGM1LjItMC41LDcuOC0zLjEsNy44LTcuNlYzMzZsLTE1LjQtMC44di0yM2g3NC4xICAgYzI2LjUsMCw0Ny4xLDcsNjEuOSwyMS4xYzE1LDE0LjEsMjIuNCwzNC45LDIyLjQsNjIuNGMwLDE3LjEtMi4zLDMyLjEtNi44LDQ0LjljLTQuNSwxMi42LTEwLjYsMjIuNS0xOC40LDI5LjcgICBjLTE1LjUsMTQuNC0zNC44LDIxLjYtNTcuOCwyMS42TDIwOTMuNyw0OTEuOSBNMjE0My40LDMzOC40VjQ2NmgyNy42YzE1LjUsMCwyNy42LTUuNiwzNi4yLTE2LjhjOC42LTExLjIsMTMtMjcuNCwxMy00OC43ICAgYzAtNDEuNC0xNy42LTYyLjItNTIuNy02Mi4ySDIxNDMuNCIvPgoJPHBhdGggc3R5bGU9ImZpbGw6IzMyMzIyQSIgZD0iTTIzMzAsNDcyLjJjMTkuNiwwLDI5LjUtMTUuOSwyOS41LTQ3LjZjMC0xNi0yLjMtMjguMi02LjgtMzYuNWMtNC4zLTguMy0xMS43LTEyLjQtMjIuMi0xMi40ICAgYy0xMC4zLDAtMTcuOCw0LTIyLjcsMTEuOWMtNC45LDcuOS03LjMsMTguNy03LjMsMzIuNGMwLDI1LjQsNC43LDQxLjQsMTQuMSw0Ny44QzIzMTguOCw0NzAuNywyMzIzLjksNDcyLjIsMjMzMCw0NzIuMiAgICBNMjI2Ny45LDQyMy44YzAtMTMuMywyLTI0LjksNS45LTM0LjZjNC05LjksOS4zLTE3LjUsMTUuOS0yMi43YzEyLjgtOS43LDI2LjktMTQuNiw0Mi40LTE0LjZjMTAuOCwwLDE5LjksMS44LDI3LjMsNS40ICAgYzcuNiwzLjQsMTMuNCw3LjUsMTcuNiwxMi4yYzQuMyw0LjUsNy45LDExLjIsMTAuOCwyMGMzLjEsOC42LDQuNiwxOC45LDQuNiwzMC44YzAsMjQuOS02LDQzLjctMTguMSw1Ni41ICAgYy0xMi4xLDEyLjgtMjcuNiwxOS4yLTQ2LjUsMTkuMmMtMTguNywwLTMzLjQtNi00NC4xLTE4LjFDMjI3My4yLDQ2NS42LDIyNjcuOSw0NDcuNiwyMjY3LjksNDIzLjgiLz4KCTxwYXRoIHN0eWxlPSJmaWxsOiMzMjMyMkEiIGQ9Ik0yNDM4LjIsNDIyLjVjMCwxNS4zLDIuOSwyNy4yLDguNiwzNS43YzUuOCw4LjUsMTQuMSwxMi43LDI0LjksMTIuN2MxMSwwLDIxLjgtMy45LDMyLjQtMTEuNiAgIGwxMS42LDIwLjhjLTEyLjgsMTAuNS0yOC44LDE1LjctNDguMSwxNS43Yy0xOS4zLDAtMzQuNS02LTQ1LjctMTguMWMtMTEtMTIuMy0xNi41LTMwLjMtMTYuNS01NC4xczYuMy00MS42LDE4LjktNTMuNSAgIGMxMi44LTEyLjEsMjcuMS0xOC4xLDQzLTE4LjFjMTYsMCwzMC45LDMuNyw0NC42LDExLjF2MzUuMWwtMjQuOSwxLjl2LTEzYzAtNC45LTEuOC03LjgtNS40LTguOWMtMy40LTEuMy03LTEuOS0xMC44LTEuOSAgIEMyNDQ5LjEsMzc2LjIsMjQzOC4yLDM5MS42LDI0MzguMiw0MjIuNSIvPgoJPHBhdGggc3R5bGU9ImZpbGw6IzMyMzIyQSIgZD0iTTI1OTIuOSwzNzYuNWMtNC4zLTEuNi05LjYtMi40LTE1LjctMi40Yy02LjEsMC0xMS4xLDEuNC0xNC45LDQuM2MtMy42LDIuNy01LjQsNi4xLTUuNCwxMC4zICAgYzAsNCwwLjYsNy4xLDEuOSw5LjVjMS40LDIuMiwzLjYsNC4xLDYuNSw1LjdjNC41LDIuMyw5LjksNC40LDE2LjIsNi4yYzYuMywxLjYsMTEsMywxNC4xLDQuMWMzLjEsMC45LDYuOCwyLjUsMTEuNCw0LjkgICBjNC43LDIuMyw4LjIsNC45LDEwLjUsNy42YzYuMyw2LjcsOS41LDE1LjIsOS41LDI1LjdjMCwxMy41LTUsMjQuMS0xNC45LDMxLjljLTkuNyw3LjYtMjIuMiwxMS40LTM3LjMsMTEuNCAgIGMtMjIsMC0zOC42LTIuOC00OS43LTguNHYtMzcuNmwyNC4zLTEuOXYxM2MwLDcuOSw3LjYsMTEuOSwyMi43LDExLjlzMjIuNy01LjUsMjIuNy0xNi41YzAtNC0xLjQtNy4yLTQuMS05LjcgICBjLTIuNS0yLjUtNS00LjItNy42LTUuMWMtMi41LTAuOS01LjYtMS44LTkuMi0yLjdjLTMuNC0wLjktNi44LTEuOC0xMC4zLTIuN2MtMy4yLTAuOS02LjgtMi4xLTEwLjgtMy41Yy0zLjgtMS42LTgtMy45LTEyLjctNi44ICAgYy05LjItNS45LTEzLjgtMTUuOS0xMy44LTI5LjdjMC0xNC4xLDUtMjQuOSwxNC45LTMyLjRjOS45LTcuNiwyMi4zLTExLjQsMzcuMy0xMS40YzE1LjEsMCwzMC4xLDMuNiw0NC45LDEwLjh2MzIuNGwtMjQuMywxLjkgICB2LTExLjRDMjU5OS4xLDM4MS4yLDI1OTcsMzc4LjEsMjU5Mi45LDM3Ni41Ii8+CjwvZz4KPGRpdiB4bWxucz0iIiBpZD0ic2FrYS1ndWktcm9vdCI+PGRpdj48ZGl2PjxzdHlsZS8+PC9kaXY+PC9kaXY+PC9kaXY+PC9zdmc+">
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Create a div to hold our modal
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;
    
    // Add it to the document
    document.body.appendChild(modalContainer.firstElementChild);
    
    // Also add a script element to hold the project data
    const projectsScript = document.createElement('script');
    projectsScript.id = 'pyhc-projects-data';
    projectsScript.type = 'application/json';
    
    // Try to get the project data from Python
    const pythonData = document.querySelector('script[data-projects]');
    if (pythonData) {
      projectsScript.textContent = pythonData.getAttribute('data-projects');
    } else {
      // Fallback
      projectsScript.textContent = JSON.stringify(['sunpy', 'ndcube', 'pysat', 'pyspedas', 'plasmapy']);
    }
    
    document.body.appendChild(projectsScript);
  }
  
  // Show the search modal
  function showSearchModal() {
    if (!searchModal) return;
    
    searchModal.style.display = 'block';
    searchInput.focus();
    
    console.log('Opening search modal');
    
    // If the RTD search input has a value, copy it
    if (rtdSearchInput && rtdSearchInput.value) {
      searchInput.value = rtdSearchInput.value;
      console.log('RTD search input has value:', rtdSearchInput.value);
      performSearch();
    } else {
      // If no search term, show recent searches
      console.log('No search term, showing recent searches');
      displayRecentSearches();
    }
  }
  
  // Hide the search modal
  function hideSearchModal() {
    if (!searchModal) return;
    searchModal.style.display = 'none';
  }
  
  // Get the project array from the data attribute set by Sphinx template
  function getProjects() {
    const projectsScript = document.getElementById('pyhc-projects-data');
    if (!projectsScript) {
      console.error('Project data not found! Make sure pyhc_projects is defined in conf.py');
      return [];
    }
    
    try {
      return JSON.parse(projectsScript.textContent);
    } catch (e) {
      console.error('Failed to parse project data:', e);
      return [];
    }
  }
  
  // Create a properly formatted project query string with spaces
  function getProjectsQuery() {
    const projects = getProjects();
    if (projects.length === 0) {
      console.error('No projects defined for search');
      return '';
    }
    
    // Use spaces between project directives
    return projects.map(project => `project:${project}`).join(' ');
  }
  
  // Store recently clicked search results
  const recentSearches = {
    searches: [],
    
    // Add a search result to recent searches
    add: function(result) {
      console.log('Adding to recent searches:', result);
      
      // Check if this result is already in recent searches
      const exists = this.searches.findIndex(item => 
        item.url === result.url && item.title === result.title
      );
      
      // If it exists, remove it so we can add it to the top
      if (exists !== -1) {
        console.log('Found existing entry at index', exists, 'removing it');
        this.searches.splice(exists, 1);
      }
      
      // Add to the beginning of the array
      this.searches.unshift(result);
      console.log('Added to recent searches, new count:', this.searches.length);
      
      // Only keep the most recent 10 searches
      if (this.searches.length > 10) {
        this.searches.pop();
      }
      
      // Save to localStorage
      this.save();
    },
    
    // Remove a search result from recent searches
    remove: function(index) {
      console.log('Removing recent search at index:', index);
      if (index >= 0 && index < this.searches.length) {
        this.searches.splice(index, 1);
        this.save();
        console.log('Removed, new count:', this.searches.length);
      }
    },
    
    // Save recent searches to localStorage
    save: function() {
      try {
        localStorage.setItem('pyhc-recent-searches', JSON.stringify(this.searches));
        console.log('Saved recent searches to localStorage');
      } catch (e) {
        console.error('Failed to save recent searches to localStorage:', e);
      }
    },
    
    // Load recent searches from localStorage
    load: function() {
      try {
        const saved = localStorage.getItem('pyhc-recent-searches');
        if (saved) {
          this.searches = JSON.parse(saved);
          console.log('Loaded', this.searches.length, 'recent searches from localStorage');
          
          // Debug: log loaded searches
          this.searches.forEach((item, i) => {
            console.log(`[${i}] ${item.title} - ${item.url}`);
          });
        } else {
          console.log('No saved recent searches found');
        }
      } catch (e) {
        console.error('Failed to load recent searches from localStorage:', e);
        this.searches = [];
      }
    }
  };
  
  // Load recent searches when the page loads
  recentSearches.load();
  
  // Perform the search
  function performSearch(fromDebounce = false) {
    const query = searchInput.value.trim();
    
    if (!query) {
      // Reset search icon to magnifying glass
      resetSearchIcon();
      // Show recent searches
      displayRecentSearches();
      return;
    }
    
    // Check for minimum length
    if (query.length < 3) {
      // Reset search icon to magnifying glass
      resetSearchIcon();
      // Show recent searches
      displayRecentSearches();
      return;
    }
    
    // Get the project query string
    const projectsQuery = getProjectsQuery();
    if (!projectsQuery) {
      // Reset search icon to magnifying glass
      resetSearchIcon();
      showMessage('No projects defined for search. Please check your configuration.');
      return;
    }
    
    // Only show the loading message if this is not from the debounce timer
    if (!fromDebounce) {
      showMessage('Searching...');
    }
    
    // Build the full search query with space between project list and search term
    const fullQuery = `${projectsQuery} ${query}`;
    
    // Build the URL with the correctly encoded query parameter
    const queryUrl = `${apiBaseUrl}?q=${encodeURIComponent(fullQuery)}`;
    
    console.log('Search URL:', queryUrl);
    console.log('Decoded URL:', apiBaseUrl + '?q=' + fullQuery);
    
    // Fetch results
    fetch(queryUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Search response:', data);
        // Reset search icon to magnifying glass
        resetSearchIcon();
        displayResults(data, query);
      })
      .catch(error => {
        console.error('Search error:', error);
        // Reset search icon to magnifying glass
        resetSearchIcon();
        showMessage(`An error occurred while searching: ${error.message}. Please try again later.`);
      });
  }
  
  // Display recent searches
  function displayRecentSearches() {
    console.log('Displaying recent searches, count:', recentSearches.searches.length);
    
    // Add a test entry if none exist and we're in development
    if (window.location.hostname === 'localhost' && (!recentSearches.searches || recentSearches.searches.length === 0)) {
      console.log('Adding test recent search entry for development');
      recentSearches.add({
        title: 'Test Recent Search',
        url: 'https://example.com/test',
        project: 'test-project',
        preview: 'This is a test recent search entry to verify the feature works correctly.'
      });
    }
    
    // If no recent searches, leave the results container empty
    if (!recentSearches.searches || recentSearches.searches.length === 0) {
      console.log('No recent searches to display');
      resultsContainer.innerHTML = '';
      return;
    }
    
    // Clear previous results
    resultsContainer.innerHTML = '';
    
    // Add the "Recent" header
    const recentHeader = document.createElement('div');
    recentHeader.className = 'project-header';
    recentHeader.innerHTML = `
      <h3>Recent:</h3>
    `;
    resultsContainer.appendChild(recentHeader);
    
    // Add each recent search
    recentSearches.searches.forEach((search, index) => {
      console.log('Rendering recent search item:', search);
      const recentItem = document.createElement('div');
      recentItem.className = 'hit-block';
      
      // Create the link to the search result
      const link = document.createElement('a');
      link.className = 'hit-block-heading';
      link.href = search.url;
      link.addEventListener('click', function(event) {
        console.log('Recent search item clicked');
        hideSearchModal(); // Close the modal when a result is clicked
      });
      
      // Create the icon (clock for recent searches)
      const icon = document.createElement('div');
      icon.style.marginRight = '10px';
      icon.innerHTML = `<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="clock-rotate-left" class="svg-inline--fa fa-clock-rotate-left header icon" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M75 75L41 41C25.9 25.9 0 36.6 0 57.9V168c0 13.3 10.7 24 24 24H134.1c21.4 0 32.1-25.9 17-41l-30.8-30.8C155 85.5 203 64 256 64c106 0 192 86 192 192s-86 192-192 192c-40.8 0-78.6-12.7-109.7-34.4c-14.5-10.1-34.4-6.6-44.6 7.9s-6.6 34.4 7.9 44.6C151.2 495 201.7 512 256 512c141.4 0 256-114.6 256-256S397.4 0 256 0C185.3 0 121.3 28.7 75 75zm181 53c-13.3 0-24 10.7-24 24V256c0 6.4 2.5 12.5 7 17l72 72c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-65-65V152c0-13.3-10.7-24-24-24z"></path></svg>`;
      
      // Create the title
      const title = document.createElement('h2');
      title.textContent = search.title;
      
      // Create the subtitle with project info
      if (search.project) {
        const subtitle = document.createElement('small');
        subtitle.className = 'subtitle';
        subtitle.textContent = ` (from project ${search.project})`;
        title.appendChild(subtitle);
      }
      
      // Create the close button
      const closeButton = document.createElement('div');
      closeButton.style.marginLeft = 'auto';
      closeButton.style.cursor = 'pointer';
      closeButton.innerHTML = `<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="circle-xmark" class="svg-inline--fa fa-circle-xmark" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"></path></svg>`;
      closeButton.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        
        recentSearches.remove(index);
        displayRecentSearches();
      });
      
      // Assemble the header
      link.appendChild(icon);
      link.appendChild(title);
      link.appendChild(closeButton);
      recentItem.appendChild(link);
      
      // Add content preview if available
      if (search.preview) {
        // Create clickable preview section with same URL as the title
        const previewLink = document.createElement('a');
        previewLink.className = 'hit';
        previewLink.href = search.url;
        previewLink.innerHTML = `<p class="hit content">${search.preview}</p>`;
        
        // Add same click event as the title
        previewLink.addEventListener('click', function(event) {
          console.log('Recent search preview clicked');
          // For middle click (new tab) do nothing, for left click close the modal
          if (event.button === 0 && !event.ctrlKey && !event.metaKey) {
            hideSearchModal(); // Close the modal when a result is clicked
          }
        });
        
        recentItem.appendChild(previewLink);
      }
      
      resultsContainer.appendChild(recentItem);
    });
  }
  
  // Display search results
  function displayResults(data, query) {
    if (!data.results || data.results.length === 0) {
      // Show enhanced no results message with search tips
      const noResultsHtml = `
        <div class="no-results">
          <svg aria-labelledby="svg-inline--fa-title-no-results" data-prefix="fas" data-icon="binoculars" class="svg-inline--fa fa-binoculars" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <title id="svg-inline--fa-title-no-results">Not found</title>
            <path fill="currentColor" d="M128 32l32 0c17.7 0 32 14.3 32 32l0 32L96 96l0-32c0-17.7 14.3-32 32-32zm64 96l0 320c0 17.7-14.3 32-32 32L32 480c-17.7 0-32-14.3-32-32l0-59.1c0-34.6 9.4-68.6 27.2-98.3C40.9 267.8 49.7 242.4 53 216L60.5 156c2-16 15.6-28 31.8-28l99.8 0zm227.8 0c16.1 0 29.8 12 31.8 28L459 216c3.3 26.4 12.1 51.8 25.8 74.6c17.8 29.7 27.2 63.7 27.2 98.3l0 59.1c0 17.7-14.3 32-32 32l-128 0c-17.7 0-32-14.3-32-32l0-320 99.8 0zM320 64c0-17.7 14.3-32 32-32l32 0c17.7 0 32 14.3 32 32l0 32-96 0 0-32zm-32 64l0 160-64 0 0-160 64 0z"></path>
          </svg>
          <p class="title">No results for <strong>"${escapeHtml(query)}"</strong></p>
          <div class="tips">
            <p>Try using the following special queries:</p>
            <ul>
              <li>
                <strong>Exact phrase</strong>: use double quotes to match a whole
                phrase: <code>"adding a subproject"</code>.
              </li>
              <li>
                <strong>Prefix</strong>: use an asterisk at the end of any term to
                prefix a result: <code>environ*</code>.
              </li>
              <li>
                <strong>Fuzziness</strong>: add a tilde and a number to indicate
                the fuzziness of the word: <code>getter~2</code>.
              </li>
            </ul>
          </div>
          <div class="no-results-footer">
            <p>
              Learn more about the query syntax supported in our
              <a target="_blank" href="https://docs.readthedocs.com/platform/stable/server-side-search/syntax.html">documentation</a>.
            </p>
          </div>
        </div>
      `;
      resultsContainer.innerHTML = noResultsHtml;
      return;
    }
    
    // Clear previous results
    resultsContainer.innerHTML = '';
    
    // Group results by project
    const resultsByProject = {};
    
    data.results.forEach(result => {
      const projectSlug = result.project.slug;
      if (!resultsByProject[projectSlug]) {
        resultsByProject[projectSlug] = [];
      }
      resultsByProject[projectSlug].push(result);
    });
    
    // Process each project's results
    for (const [project, results] of Object.entries(resultsByProject)) {
      // Add a project header section
      const projectHeader = document.createElement('div');
      projectHeader.className = 'project-header';
      projectHeader.innerHTML = `
        <div class="project-icon">
          <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="book" class="svg-inline--fa fa-book" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
            <path fill="currentColor" d="M96 0C43 0 0 43 0 96V416c0 53 43 96 96 96H384h32c17.7 0 32-14.3 32-32s-14.3-32-32-32V384c17.7 0 32-14.3 32-32V32c0-17.7-14.3-32-32-32H384 96zm0 384H352v64H96c-17.7 0-32-14.3-32-32s14.3-32 32-32zm32-240c0-8.8 7.2-16 16-16H336c8.8 0 16 7.2 16 16s-7.2 16-16 16H144c-8.8 0-16-7.2-16-16zm16 48H336c8.8 0 16 7.2 16 16s-7.2 16-16 16H144c-8.8 0-16-7.2-16-16s7.2-16 16-16z"></path>
          </svg>
        </div>
        <h3>Results from ${project}</h3>
      `;
      resultsContainer.appendChild(projectHeader);
      
      // Add each result for this project
      results.forEach(result => {
        const resultItem = createResultItem(result);
        resultsContainer.appendChild(resultItem);
      });
    }
    
    // Add pagination if needed
    if (data.next) {
      const loadMoreBtn = document.createElement('button');
      loadMoreBtn.className = 'pyhc-load-more';
      loadMoreBtn.textContent = 'Load more results';
      loadMoreBtn.addEventListener('click', function() {
        loadNextPage(data.next);
      });
      resultsContainer.appendChild(loadMoreBtn);
    }
  }
  
  // Create a single result item using Read the Docs style
  function createResultItem(result) {
    // Create a hit block container for this result
    const hitBlock = document.createElement('div');
    hitBlock.className = 'hit-block';
    
    // Create the header section with project and title
    const headerLink = document.createElement('a');
    headerLink.className = 'hit-block-heading';
    headerLink.href = result.domain + result.path;
    
    // Fix: Use a proper protocol in the URL - check for http/https, add it if missing
    const url = headerLink.href;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      headerLink.href = 'https://' + url;
    }
    
    headerLink.addEventListener('click', function(event) {
      // Save this result to recent searches
      const searchResult = {
        title: result.title,
        url: headerLink.href, // Use the corrected URL with protocol
        project: result.project.slug,
        // Get a preview from the first highlight if available
        preview: result.blocks && result.blocks.length > 0 && 
                result.blocks[0].highlights && 
                result.blocks[0].highlights.content && 
                result.blocks[0].highlights.content.length > 0 ? 
                result.blocks[0].highlights.content[0] : null
      };
      
      console.log('Search result clicked, saving to recent searches:', searchResult);
      
      // Don't wait for event propagation, save right away
      recentSearches.add(searchResult);
      
      // For middle click (new tab) do nothing, for left click close the modal
      if (event.button === 0 && !event.ctrlKey && !event.metaKey) {
        hideSearchModal(); // Close the modal when a result is clicked
      }
    });
    
    // Create the icon
    const icon = document.createElement('i');
    icon.innerHTML = `<svg aria-labelledby="svg-inline--fa-title" data-prefix="fas" data-icon="bars-staggered" class="svg-inline--fa fa-bars-staggered header icon" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><title id="svg-inline--fa-title">Result</title><path fill="currentColor" d="M0 96C0 78.3 14.3 64 32 64l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 128C14.3 128 0 113.7 0 96zM64 256c0-17.7 14.3-32 32-32l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L96 288c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32L32 448c-17.7 0-32-14.3-32-32s14.3-32 32-32l384 0c17.7 0 32 14.3 32 32z"></path></svg>`;
    
    // Create the title
    const title = document.createElement('h2');
    // Always use the plain text title without highlights for h2 elements
    title.textContent = result.title;
    
    // Add subtitle with project info
    const subtitle = document.createElement('small');
    subtitle.className = 'subtitle';
    subtitle.textContent = ` (from project ${result.project.slug})`;
    title.appendChild(subtitle);
    
    // Assemble the header
    headerLink.appendChild(icon);
    headerLink.appendChild(title);
    hitBlock.appendChild(headerLink);
    
    // Add content blocks if available
    if (result.blocks && result.blocks.length > 0) {
      // Only show a maximum of 2 blocks per result to keep it clean
      let blockCount = 0;
      for (const block of result.blocks) {
        if (blockCount >= 2) break;
        
        if (block.highlights && block.highlights.content && block.highlights.content.length > 0) {
          const hitLink = document.createElement('a');
          hitLink.className = 'hit';
          hitLink.href = result.domain + result.path;
          
          // Fix: Use a proper protocol in the URL - check for http/https, add it if missing
          const hitUrl = hitLink.href;
          if (!hitUrl.startsWith('http://') && !hitUrl.startsWith('https://')) {
            hitLink.href = 'https://' + hitUrl;
          }
          
          hitLink.addEventListener('click', function(event) {
            // Also save this result to recent searches when content blocks are clicked
            const searchResult = {
              title: result.title,
              url: hitLink.href, // Use the corrected URL with protocol
              project: result.project.slug,
              preview: block.highlights.content[0]
            };
            console.log('Hit content clicked, saving to recent searches:', searchResult);
            
            // Don't wait for event propagation, save right away
            recentSearches.add(searchResult);
            
            // For middle click (new tab) do nothing, for left click close the modal
            if (event.button === 0 && !event.ctrlKey && !event.metaKey) {
              hideSearchModal(); // Close the modal when a result is clicked
            }
          });
          
          const hitContent = document.createElement('div');
          hitContent.id = `hit-${blockCount}-${result.id}`;
          
          // Add subheading if available
          if (block.title) {
            const subheading = document.createElement('p');
            subheading.className = 'hit subheading';
            subheading.textContent = block.title;
            hitContent.appendChild(subheading);
          }
          
          // Add content with highlights
          const content = document.createElement('p');
          content.className = 'hit content';
          
          if (block.highlights && block.highlights.content && block.highlights.content.length > 0) {
            let highlightedContent = block.highlights.content[0];
            
            // Fix common issues with Read the Docs API highlighting format
            
            // 1. Replace all newlines with spaces
            highlightedContent = highlightedContent.replace(/\n/g, ' ');
            
            // 2. Replace multiple spaces with a single space
            highlightedContent = highlightedContent.replace(/\s+/g, ' ');
            
            // 3. Make sure we have ellipses at start and end for consistency
            let prefix = highlightedContent.trim().startsWith('...') ? '' : '... ';
            let suffix = highlightedContent.trim().endsWith('...') ? ' ' : ' ... ';
            
            content.innerHTML = prefix + highlightedContent.trim() + suffix;
          } else {
            content.textContent = '...';
          }
          
          hitContent.appendChild(content);
          
          hitLink.appendChild(hitContent);
          hitBlock.appendChild(hitLink);
          blockCount++;
        }
      }
    }
    
    return hitBlock;
  }
  
  // Load the next page of results
  function loadNextPage(nextUrl) {
    // Find the load more button
    const loadMoreBtn = resultsContainer.querySelector('.pyhc-load-more');
    if (loadMoreBtn) {
      // Show loading state
      loadMoreBtn.textContent = 'Loading more results...';
      loadMoreBtn.disabled = true;
    }
    
    fetch(nextUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        // Remove the load more button
        if (loadMoreBtn) {
          loadMoreBtn.remove();
        }
        
        // Group new results by project
        const resultsByProject = {};
        
        data.results.forEach(result => {
          const projectSlug = result.project.slug;
          if (!resultsByProject[projectSlug]) {
            resultsByProject[projectSlug] = [];
          }
          resultsByProject[projectSlug].push(result);
        });
        
        // Process each project's results
        for (const [project, results] of Object.entries(resultsByProject)) {
          // Check if there's already a project header for this project
          let projectHeader = Array.from(resultsContainer.querySelectorAll('.project-header h3'))
            .find(h3 => h3.textContent === `Results from ${project}`)?.parentElement;
          
          // If not, create a new project header section
          if (!projectHeader) {
            projectHeader = document.createElement('div');
            projectHeader.className = 'project-header';
            projectHeader.innerHTML = `
              <div class="project-icon">
                <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="book" class="svg-inline--fa fa-book" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                  <path fill="currentColor" d="M96 0C43 0 0 43 0 96V416c0 53 43 96 96 96H384h32c17.7 0 32-14.3 32-32s-14.3-32-32-32V384c17.7 0 32-14.3 32-32V32c0-17.7-14.3-32-32-32H384 96zm0 384H352v64H96c-17.7 0-32-14.3-32-32s14.3-32 32-32zm32-240c0-8.8 7.2-16 16-16H336c8.8 0 16 7.2 16 16s-7.2 16-16 16H144c-8.8 0-16-7.2-16-16zm16 48H336c8.8 0 16 7.2 16 16s-7.2 16-16 16H144c-8.8 0-16-7.2-16-16s7.2-16 16-16z"></path>
                </svg>
              </div>
              <h3>Results from ${project}</h3>
            `;
            resultsContainer.appendChild(projectHeader);
          }
          
          // Add each result for this project
          results.forEach(result => {
            const resultItem = createResultItem(result);
            resultsContainer.appendChild(resultItem);
          });
        }
        
        // Add pagination if needed
        if (data.next) {
          const newLoadMoreBtn = document.createElement('button');
          newLoadMoreBtn.className = 'pyhc-load-more';
          newLoadMoreBtn.textContent = 'Load more results';
          newLoadMoreBtn.addEventListener('click', function() {
            loadNextPage(data.next);
          });
          resultsContainer.appendChild(newLoadMoreBtn);
        }
      })
      .catch(error => {
        console.error('Error loading more results:', error);
        if (loadMoreBtn) {
          loadMoreBtn.textContent = 'Error loading more results. Click to try again.';
          loadMoreBtn.disabled = false;
        }
      });
  }
  
  // Show a message in the results container
  function showMessage(message) {
    resultsContainer.innerHTML = `<div class="pyhc-search-message">${message}</div>`;
  }
  
  // Helper function to escape HTML
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  // Reset search icon to the default magnifying glass
  function resetSearchIcon() {
    if (searchIcon) {
      // Use the original magnifying glass icon from the search form creation
      searchIcon.innerHTML = `<title id="svg-search-icon">Search</title>
      <path fill="currentColor" d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"></path>`;
      searchIcon.classList.remove('fa-spin');
    }
  }
  
  // Handle keyboard navigation through search results
  function navigateSearchResults(direction) {
    // Get only the top-level 'a.hit' elements, not any inner children or titles
    // This ensures we only navigate between the main content items
    const searchResults = Array.from(resultsContainer.querySelectorAll('a.hit'));
    if (!searchResults.length) return;
    
    // Find currently focused element
    const focusedElement = resultsContainer.querySelector('.hit.focused');
    
    // Clear all focused elements
    searchResults.forEach(el => el.classList.remove('focused'));
    
    // Blur the search input to allow Enter key to work on focused items
    searchInput.blur();
    
    // Determine which element to focus next
    let nextIndex = 0;
    
    if (focusedElement) {
      // Find index of currently focused element
      const currentIndex = searchResults.indexOf(focusedElement);
      
      if (direction === 'down') {
        // Move down (or wrap to top)
        nextIndex = (currentIndex + 1) % searchResults.length;
      } else if (direction === 'up') {
        // Move up (or wrap to bottom)
        nextIndex = (currentIndex - 1 + searchResults.length) % searchResults.length;
      }
    } else {
      // No focused element yet
      if (direction === 'down') {
        nextIndex = 0; // Focus first element
      } else if (direction === 'up') {
        nextIndex = searchResults.length - 1; // Focus last element
      }
    }
    
    // Apply focus to the new element
    if (searchResults[nextIndex]) {
      const element = searchResults[nextIndex];
      element.classList.add('focused');
      
      // Ensure the focused element is visible in the scrollable container
      const container = resultsContainer;
      
      // Calculate element position relative to the container
      const elementTop = element.offsetTop;
      const elementBottom = elementTop + element.offsetHeight;
      
      // Get container's scroll position
      const containerTop = container.scrollTop;
      const containerBottom = containerTop + container.offsetHeight;
      
      // Scroll if the element is not fully visible
      if (elementTop < containerTop) {
        // Element is above the visible area - scroll up
        container.scrollTop = elementTop - 20; // Add some padding
      } else if (elementBottom > containerBottom) {
        // Element is below the visible area - scroll down
        container.scrollTop = elementBottom - container.offsetHeight + 20; // Add some padding
      }
    }
  }
});