# Configuration file for the Sphinx documentation builder.
# For the full list of built-in configuration values, see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

# -- Project information -----------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#project-information

project = 'PyHC Documentation Hub'
copyright = '2024, PyHC'
author = 'PyHC'

# -- General configuration ---------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#general-configuration

# Extensions for Sphinx
extensions = [
    'sphinx.ext.intersphinx',  # Enables linking to other projects
    'sphinx_rtd_theme',
]

# Template and static paths
templates_path = ['_templates']
exclude_patterns = []

# Intersphinx mappings for linking to PyHC subprojects
intersphinx_mapping = {
    'pysat-copy': ('https://pysat-copy.readthedocs.io/en/latest/', None),
    'pyspedas-copy': ('https://pyspedas-copy.readthedocs.io/en/latest/', None),
}

# -- Options for HTML output -------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#options-for-html-output

# Theme options
html_theme = 'sphinx_rtd_theme'
html_static_path = ['_static']
html_extra_path = ['_static/robots.txt']
html_js_files = ['auto_check_search.js']


# Additional configuration (optional)
# Add any additional options you may need here as the project expands.
