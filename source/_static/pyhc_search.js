// PyHC Documentation Hub - Unified Search
document.addEventListener('DOMContentLoaded', function() {
  // Elements
  const searchInput = document.getElementById('pyhc-search-input');
  const searchButton = document.getElementById('pyhc-search-button');
  const resultsContainer = document.getElementById('pyhc-search-results');
  
  // Project configuration - these should match the list in conf.py
  const projects = [
    'sunpy',
    'ndcube',
    'pysat',
    'pyspedas', 
    'plasmapy'
  ];

  // Base API URL
  const apiBaseUrl = 'https://readthedocs.org/api/v3/search/';
  
  // Format projects for query string
  const projectsQuery = projects.map(project => `project:${project}`).join('+');
  
  // Event listeners for search
  if (searchInput && searchButton) {
    // Listen for Enter key in search input
    searchInput.addEventListener('keyup', function(event) {
      if (event.key === 'Enter') {
        performSearch();
      }
    });
    
    // Listen for click on search button
    searchButton.addEventListener('click', performSearch);
  }
  
  // Perform the search
  function performSearch() {
    const query = searchInput.value.trim();
    
    if (!query) {
      showMessage('Please enter a search term.');
      return;
    }
    
    // Show loading state
    showMessage('Searching...');
    
    // Build the full query URL
    const queryUrl = `${apiBaseUrl}?q=${encodeURIComponent(projectsQuery)}+${encodeURIComponent(query)}`;
    
    // Fetch results
    fetch(queryUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        displayResults(data, query);
      })
      .catch(error => {
        console.error('Search error:', error);
        showMessage('An error occurred while searching. Please try again later.');
      });
  }
  
  // Display search results
  function displayResults(data, query) {
    if (!data.results || data.results.length === 0) {
      showMessage(`No results found for "${query}".`);
      return;
    }
    
    // Clear previous results
    resultsContainer.innerHTML = '';
    
    // Create results header
    const resultHeader = document.createElement('h2');
    resultHeader.textContent = `Search Results (${data.count})`;
    resultsContainer.appendChild(resultHeader);
    
    // Display query information
    const queryInfo = document.createElement('p');
    queryInfo.innerHTML = `Results for: <strong>${escapeHtml(query)}</strong>`;
    resultsContainer.appendChild(queryInfo);
    
    // Create results container
    const resultsList = document.createElement('div');
    resultsList.className = 'pyhc-results-list';
    
    // Process results
    data.results.forEach(result => {
      const resultItem = createResultItem(result);
      resultsList.appendChild(resultItem);
    });
    
    // Add results to the page
    resultsContainer.appendChild(resultsList);
    
    // Add pagination if needed
    if (data.next) {
      addPagination(data);
    }
  }
  
  // Create a single result item
  function createResultItem(result) {
    const item = document.createElement('div');
    item.className = 'pyhc-result-item';
    
    // Title with link
    const title = document.createElement('h3');
    const titleLink = document.createElement('a');
    titleLink.href = result.domain + result.path;
    titleLink.target = '_blank';
    
    // Use highlighted title if available, otherwise use regular title
    if (result.highlights && result.highlights.title && result.highlights.title.length > 0) {
      titleLink.innerHTML = result.highlights.title[0];
    } else {
      titleLink.textContent = result.title;
    }
    
    title.appendChild(titleLink);
    item.appendChild(title);
    
    // Project and version info
    const projectInfo = document.createElement('div');
    projectInfo.className = 'pyhc-result-project';
    projectInfo.innerHTML = `<strong>${result.project.slug}</strong> - ${result.version.slug}`;
    item.appendChild(projectInfo);
    
    // Add content blocks if available
    if (result.blocks && result.blocks.length > 0) {
      const blocksContainer = document.createElement('div');
      blocksContainer.className = 'pyhc-result-blocks';
      
      result.blocks.forEach(block => {
        if (block.highlights && 
           (block.highlights.content || block.highlights.title)) {
          
          const blockItem = document.createElement('div');
          blockItem.className = 'pyhc-result-block';
          
          // Only add block title if it exists and has highlights
          if (block.title && block.highlights.title && block.highlights.title.length > 0) {
            const blockTitle = document.createElement('div');
            blockTitle.className = 'pyhc-block-title';
            blockTitle.innerHTML = block.highlights.title[0];
            blockItem.appendChild(blockTitle);
          }
          
          // Add content highlights
          if (block.highlights.content && block.highlights.content.length > 0) {
            const blockContent = document.createElement('div');
            blockContent.className = 'pyhc-block-content';
            blockContent.innerHTML = '...' + block.highlights.content[0] + '...';
            blockItem.appendChild(blockContent);
          }
          
          blocksContainer.appendChild(blockItem);
        }
      });
      
      item.appendChild(blocksContainer);
    }
    
    return item;
  }
  
  // Add pagination controls
  function addPagination(data) {
    const paginationDiv = document.createElement('div');
    paginationDiv.className = 'pyhc-pagination';
    
    if (data.next) {
      const nextButton = document.createElement('button');
      nextButton.textContent = 'Load more results';
      nextButton.className = 'pyhc-load-more';
      nextButton.addEventListener('click', function() {
        loadNextPage(data.next);
      });
      paginationDiv.appendChild(nextButton);
    }
    
    resultsContainer.appendChild(paginationDiv);
  }
  
  // Load the next page of results
  function loadNextPage(nextUrl) {
    // Show loading state for more results
    const loadingMsg = document.createElement('p');
    loadingMsg.className = 'pyhc-loading-more';
    loadingMsg.textContent = 'Loading more results...';
    resultsContainer.appendChild(loadingMsg);
    
    fetch(nextUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        // Remove loading message
        const loadingElement = resultsContainer.querySelector('.pyhc-loading-more');
        if (loadingElement) {
          resultsContainer.removeChild(loadingElement);
        }
        
        // Remove existing pagination
        const existingPagination = resultsContainer.querySelector('.pyhc-pagination');
        if (existingPagination) {
          resultsContainer.removeChild(existingPagination);
        }
        
        // Get the results container
        const resultsList = resultsContainer.querySelector('.pyhc-results-list');
        
        // Add new results
        data.results.forEach(result => {
          const resultItem = createResultItem(result);
          resultsList.appendChild(resultItem);
        });
        
        // Update count in header
        const resultHeader = resultsContainer.querySelector('h2');
        resultHeader.textContent = `Search Results (${data.count})`;
        
        // Add pagination if needed
        if (data.next) {
          addPagination(data);
        }
      })
      .catch(error => {
        console.error('Error loading more results:', error);
        const loadingElement = resultsContainer.querySelector('.pyhc-loading-more');
        if (loadingElement) {
          loadingElement.textContent = 'Error loading more results. Please try again.';
        }
      });
  }
  
  // Show a message in the results container
  function showMessage(message) {
    resultsContainer.innerHTML = `<p class="pyhc-message">${message}</p>`;
  }
  
  // Helper function to escape HTML
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});

// Add styles for search UI
document.addEventListener('DOMContentLoaded', function() {
  // Create style element
  const style = document.createElement('style');
  style.textContent = `
    .pyhc-search-container {
      margin: 20px 0;
      display: flex;
      max-width: 600px;
    }
    
    #pyhc-search-input {
      flex: 1;
      padding: 10px;
      font-size: 16px;
      border: 1px solid #ccc;
      border-radius: 4px 0 0 4px;
    }
    
    #pyhc-search-button {
      background-color: #2980b9;
      color: white;
      border: none;
      padding: 10px 15px;
      cursor: pointer;
      font-size: 16px;
      border-radius: 0 4px 4px 0;
    }
    
    #pyhc-search-button:hover {
      background-color: #3498db;
    }
    
    #pyhc-search-results {
      margin-top: 20px;
    }
    
    .pyhc-result-item {
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 1px solid #eee;
    }
    
    .pyhc-result-item h3 {
      margin-bottom: 5px;
    }
    
    .pyhc-result-project {
      color: #555;
      font-size: 14px;
      margin-bottom: 10px;
    }
    
    .pyhc-result-blocks {
      margin-top: 10px;
    }
    
    .pyhc-result-block {
      margin-top: 8px;
      background-color: #f9f9f9;
      padding: 10px;
      border-radius: 4px;
    }
    
    .pyhc-block-title {
      font-weight: bold;
      margin-bottom: 5px;
    }
    
    .pyhc-block-content {
      font-size: 14px;
      line-height: 1.4;
    }
    
    .pyhc-pagination {
      margin-top: 20px;
    }
    
    .pyhc-load-more {
      background-color: #2980b9;
      color: white;
      border: none;
      padding: 8px 15px;
      cursor: pointer;
      font-size: 14px;
      border-radius: 4px;
    }
    
    .pyhc-load-more:hover {
      background-color: #3498db;
    }
    
    .pyhc-message {
      padding: 10px;
      background-color: #f9f9f9;
      border-radius: 4px;
    }
    
    /* Highlight styling */
    span {
      background-color: rgba(255, 255, 0, 0.3);
      padding: 1px 2px;
      border-radius: 2px;
    }
  `;
  
  // Add style to document
  document.head.appendChild(style);
});