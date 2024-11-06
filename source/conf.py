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
]

# Template and static paths
templates_path = ['_templates']
exclude_patterns = []

# Intersphinx mappings for linking to PyHC subprojects
intersphinx_mapping = {
    'pysat': ('https://pysat.readthedocs.io/en/latest/', None),
    'pyspedas': ('https://pyspedas.readthedocs.io/en/latest/', None),
}

# -- Options for HTML output -------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#options-for-html-output

# Theme options
html_theme = 'alabaster'
html_static_path = ['_static']

# Additional configuration (optional)
# Add any additional options you may need here as the project expands.
