# n8n-nodes-pandoc

This package provides an n8n node for using Pandoc to convert documents between different formats.

## Installation

### Installation in n8n
1. Go to your n8n instance settings
2. Navigate to "Community Nodes"
3. Click "Install"
4. Enter `@neayi/n8n-pandoc`

### Prerequisites
**Important:** Pandoc must be installed on the system where n8n is running.

#### Installing Pandoc in Docker
To install Pandoc in n8n on Docker:

```dockerfile
FROM docker.n8n.io/n8nio/n8n

USER root

# Download and install static pandoc binary
# Using a multi-stage build approach with Alpine to download
FROM alpine:latest AS downloader
RUN apk add --no-cache wget tar && \
    wget https://github.com/jgm/pandoc/releases/download/3.1.11.1/pandoc-3.1.11.1-linux-amd64.tar.gz && \
    tar xvzf pandoc-3.1.11.1-linux-amd64.tar.gz --strip-components 1 -C /usr/local/

# Final image
FROM docker.n8n.io/n8nio/n8n

USER root

# Copy pandoc binary from downloader stage
COPY --from=downloader /usr/local/bin/pandoc /usr/local/bin/pandoc

USER node
```

## Usage

### Main Parameters

#### Input Type
- **Binary Data:** Uses a binary file from a previous node
- **Text:** Uses plain text directly from a parameter

#### Supported Formats

**Input Formats:**
- Markdown (Pandoc, GFM, CommonMark, strict, PHP Extra)
- HTML
- LaTeX
- DocBook
- DOCX
- ODT
- EPUB
- MediaWiki
- DokuWiki
- Org-mode
- reStructuredText
- Textile
- Jupyter Notebook
- And many more...

**Output Formats:**
- HTML (4, 5)
- Markdown (various variants)
- LaTeX
- PDF (requires a PDF engine like XeLaTeX)
- DOCX
- ODT
- EPUB (2, 3)
- MediaWiki
- PowerPoint (PPTX)
- Plain Text
- And many more...

#### Output Type
- **Binary Data:** Produces a binary file (useful for PDF, DOCX, etc.)
- **Text:** Returns the converted text in JSON

### Additional Options

- **Standalone:** Produces a complete document with header and footer
- **Table of Contents:** Includes a table of contents
- **Number Sections:** Numbers the sections
- **Self Contained:** Produces a self-contained document (embedded images and CSS)
- **Wrap:** Line wrapping mode (auto, none, preserve)
- **Columns:** Column width for line wrapping
- **Custom Pandoc Arguments:** Custom arguments for Pandoc


## Configuration for your instance

For your instance at https://n8n.dev.tripleperformance.fr/, make sure that:

1. Pandoc is installed in the Docker container
2. The package is installed via npm in the container
3. n8n has been restarted after installation


## Development

### Build
```bash
npm install
npm run build
```

### Lint
```bash
npm run lint
npm run lintfix  # To automatically fix issues
```

### Format
```bash
npm run format
```

## License

MIT

## Support

For issues and questions:
- Create an issue on GitHub: https://github.com/neayi/n8n_pandoc/issues
- Check the Pandoc documentation: https://pandoc.org/

## Links

- GitHub : https://github.com/neayi/n8n_pandoc
- npm : https://www.npmjs.com/package/@neayi/n8n-pandoc

## Contributors

Developped by Neayi for Triple Performance

