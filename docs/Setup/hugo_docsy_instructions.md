# Hosting Documentation with Hugo and Docsy

This project uses **Hugo** with the **Docsy** theme to build and host documentation. The following steps outline a basic setup and show how to enable Mermaid diagrams and other useful plugins.

## Prerequisites

* [Hugo](https://gohugo.io/) extended version
* `git` for cloning the Docsy theme
* `npm` (optional) for managing additional tooling

## Setup Steps

1. **Install Hugo**

   Follow the instructions on the [Hugo installation page](https://gohugo.io/getting-started/installing/). Make sure you install the **extended** version because Docsy relies on Sass/SCSS support.

2. **Create a Hugo Site**

   ```bash
   hugo new site docs-site
   cd docs-site
   ```

3. **Add the Docsy Theme**

   ```bash
   git submodule add https://github.com/google/docsy.git themes/docsy
   git submodule update --init --recursive
   ```

   Enable the theme in `config.toml`:

   ```toml
   theme = "docsy"
   ```

4. **Enable Mermaid Support**

   The Docsy theme can render Mermaid diagrams using the `hugo-mermaid` shortcode. Add the following to your `config.toml` to enable the plugin:

   ```toml
   [markup]
     [markup.goldmark]
       [markup.goldmark.renderer]
         unsafe = true
   ```

   Place diagrams in your Markdown using:

   ```markdown
   {{< mermaid >}}
   graph TD;
     A-->B;
   {{< /mermaid >}}
   ```

5. **Build and Serve**

   Run the Hugo server locally to preview your documentation:

   ```bash
   hugo server -D
   ```

   The site will be available at `http://localhost:1313`.

## Additional Plugins

Docsy supports many Hugo features such as syntax highlighting, search, and taxonomy. You can further extend functionality with community plugins by updating your `config.toml` and installing any required npm packages.

For detailed customization, consult the [Docsy documentation](https://www.docsy.dev/).
\n*Document last updated: 2025, June 7*
