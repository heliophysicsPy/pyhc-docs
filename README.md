# PyHC Documentation Hub

A unified documentation search hub for Python Heliophysics Community (PyHC) packages.

## About

The Python Heliophysics Community (PyHC) Documentation Hub allows searching across documentation for all core PyHC packages from a single interface. Instead of having to search each package's documentation individually, users can perform a unified search and see results from all packages.

## Features

- Unified search across multiple PyHC packages
- Direct links to official documentation pages
- Highlighted search results showing context
- Responsive, user-friendly interface

## How It Works

The PyHC Documentation Hub leverages the Read The Docs Server-Side Search API to query multiple project documentations simultaneously. The search is performed client-side using JavaScript, which constructs queries to the Read The Docs API and presents the results in a unified interface.

## Included Projects

- SunPy - Core library for solar physics
- NDCube - Multi-dimensional data handling
- PySat - Satellite data analysis toolkit
- PySPEDAS - Space Physics Environment Data Analysis Software
- PlasmaPy - Plasma physics calculations and tools

## Development

### Requirements

- Python 3.7+
- Sphinx
- sphinx-rtd-theme
- sphinx-copybutton

### Building the Documentation

1. Clone this repository
2. Install the dependencies: `pip install -r source/requirements.txt`
3. Build the documentation: `make html`
4. Open `build/html/index.html` in your browser

## License

This project is licensed under the terms of the LICENSE file included in this repository.
