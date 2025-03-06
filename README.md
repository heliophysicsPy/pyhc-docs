# PyHC Documentation Hub

A unified Read The Docs documentation search hub for Python in Heliophysics Community (PyHC) packages.

## About

The PyHC Documentation Hub allows searching across documentation for all PyHC packages that use Read The Docs from a single interface. Instead of having to search each package's documentation individually, users can perform a unified search and see results from all packages.

## Features

- Unified search across all PyHC packages that use Read The Docs
- Direct links to official documentation pages
- Highlighted search results showing context

## How It Works

The PyHC Documentation Hub leverages the Read The Docs Server-Side Search API to query multiple project documentations simultaneously. The search is performed client-side using JavaScript, which constructs queries to the Read The Docs API through a CORS proxy. The results are presented in a unified interface.

### CORS Handling

Due to CORS restrictions, browsers will block direct requests from client-side JavaScript to the Read The Docs API. To solve this, we use public CORS proxy services to add the appropriate CORS headers to the API responses.

The search functionality uses multiple CORS proxy services (in order of preference):
1. corsproxy.io
2. cors-anywhere.herokuapp.com
3. allorigins.win

If one proxy fails, the application automatically tries the next one. This provides redundancy and ensures the search functionality works consistently across different browsers and environments.

The implementation can be found in `source/_static/pyhc_search.js`.

## Development

### Python Requirements

- Python 3.7+
- Sphinx
- sphinx-rtd-theme
- sphinx-copybutton

### Building the Documentation

1. Clone this repository
2. Install the dependencies: `pip install -r source/requirements.txt`
3. Build the documentation: `make html`
4. Open `build/html/index.html` in your browser

For development, you can use Python's built-in HTTP server:

```bash
# Build and serve the documentation
make html
python -m http.server -d build/html
```

Then access the documentation at http://localhost:8000

## License

This project is licensed under the terms of the LICENSE file included in this repository.
