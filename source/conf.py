# Configuration file for the Sphinx documentation builder.
# For the full list of built-in configuration values, see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

# -- Project information -----------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#project-information

project = 'PyHC Documentation Hub'
copyright = '2025, PyHC'
author = 'PyHC'

# -- General configuration ---------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#general-configuration

# Extensions for Sphinx
extensions = [
    'sphinx_rtd_theme',
    'sphinx_copybutton',
]

# Template and static paths
templates_path = ['_templates']
exclude_patterns = []

# -- Options for HTML output -------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#options-for-html-output

# Theme options
html_theme = 'sphinx_rtd_theme'
html_static_path = ['_static']
html_extra_path = ['_static/robots.txt']
html_js_files = ['pyhc_search.js']
html_css_files = ['custom.css']

html_theme_options = {
    'logo_only': False,
    'display_version': True,
    'collapse_navigation': False,
    'sticky_navigation': True,
    'navigation_depth': 4,
    'includehidden': True,
    'titles_only': False,
}

# Define the PyHC projects to search
pyhc_projects = [
    'sunpy',
    'plasmapy',
    'pysat',
    'pyspedas',
    'aacgmv2',
    'afino',
    'aiapy',
    'aidapy',
    'amisrsynthdata',
    'apexpy',
    'aurora-asi-lib',
    'cdflib',
    'ccsdspy',
    'enlilviz',
    'fiasco',
    'gcmprocpy',
    'geospacelab',
    'hermes-core',
    'irispy-lmsal',
    'kaipy-docs',
    'lofarsun',
    'mcalf',
    'ndcube',
    'ocbpy',
    'ommbv',
    'pycdfpp',
    'pydarn',
    'pyflct',
    'pyrfu',
    'pytplot',
    'regularizepsf',
    'sami2py',
    'sammi-cdf',
    'savic',
    'solarmach',
    'space-packet-parser',
    'speasy',
    'spiceypy',
    'sunkit-image',
    'sunkit-instruments',
    'sunraster',
    'swxsoc',
    'viresclient',
    'xrtpy',
]

# Make the project list available to the JavaScript
html_context = {
    'pyhc_projects': pyhc_projects
}

# Additional configuration (optional)
# Add any additional options you may need here as the project expands.
