# n8n-nodes-pandoc

Ce package fournit un node personnalisé pour n8n permettant d'utiliser Pandoc pour convertir des documents entre différents formats.

## Installation

### Installation dans n8n

#### Option 1: Via l'interface n8n (recommandé pour les instances cloud)
1. Accédez aux paramètres de votre instance n8n
2. Allez dans "Community Nodes"
3. Cliquez sur "Install"
4. Entrez `@neayi/n8n-pandoc`

#### Option 2: Via npm (pour les installations locales/Docker)
```bash
npm install @neayi/n8n-pandoc
```

#### Option 3: Installation manuelle pour Docker
Ajoutez le package dans votre Dockerfile ou docker-compose.yml :

```dockerfile
# Dans votre Dockerfile
RUN cd /usr/local/lib/node_modules/n8n && npm install @neayi/n8n-pandoc
```

Ou dans docker-compose.yml :
```yaml
services:
  n8n:
    environment:
      - N8N_COMMUNITY_PACKAGES=@neayi/n8n-pandoc
```

### Prérequis
**Important:** Pandoc doit être installé sur le système où n8n s'exécute.

#### Installation de Pandoc dans Docker
Si vous utilisez n8n dans Docker, ajoutez Pandoc à votre image :

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

#### Installation de Pandoc sur le système hôte
- **Ubuntu/Debian:** `sudo apt-get install pandoc`
- **MacOS:** `brew install pandoc`
- **Windows:** Téléchargez depuis [pandoc.org](https://pandoc.org/installing.html)

## Utilisation

### Paramètres principaux

#### Type d'entrée
- **Binary Data:** Utilise un fichier binaire depuis un node précédent
- **Text:** Utilise du texte brut directement depuis un paramètre

#### Formats supportés

**Formats d'entrée:**
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
- Et beaucoup d'autres...

**Formats de sortie:**
- HTML (4, 5)
- Markdown (diverses variantes)
- LaTeX
- PDF (nécessite un moteur PDF comme XeLaTeX)
- DOCX
- ODT
- EPUB (2, 3)
- MediaWiki
- PowerPoint (PPTX)
- Plain Text
- Et beaucoup d'autres...

#### Type de sortie
- **Binary Data:** Produit un fichier binaire (utile pour PDF, DOCX, etc.)
- **Text:** Retourne le texte converti dans le JSON

### Options additionnelles

- **Standalone:** Produit un document complet avec en-tête et pied de page
- **Table of Contents:** Inclut une table des matières
- **Number Sections:** Numérote les sections
- **Self Contained:** Produit un document autonome (images et CSS intégrés)
- **Wrap:** Mode de retour à la ligne (auto, none, preserve)
- **Columns:** Largeur des colonnes pour le retour à la ligne
- **Custom Pandoc Arguments:** Arguments personnalisés pour Pandoc

### Exemples d'utilisation

#### Exemple 1: Markdown vers HTML
```
Input Type: Text
Input Text: # Mon titre\n\nMon contenu
From Format: markdown
To Format: html5
Output Type: Text
```

#### Exemple 2: DOCX vers PDF
```
Input Type: Binary Data
Binary Property: data
From Format: docx
To Format: pdf
Output Type: Binary Data
Additional Options:
  - Self Contained: true
  - Custom Args: --pdf-engine=xelatex
```

#### Exemple 3: MediaWiki vers Markdown
```
Input Type: Text
Input Text: == Section ==\n\n'''Gras''' et ''italique''
From Format: mediawiki
To Format: gfm
Output Type: Text
Additional Options:
  - Standalone: false
```

#### Exemple 4: HTML vers DOCX
```
Input Type: Text
Input Text: <h1>Titre</h1><p>Paragraphe</p>
From Format: html
To Format: docx
Output Type: Binary Data
Binary Property: document
```

## Workflow exemple

```json
{
  "nodes": [
    {
      "parameters": {
        "inputType": "text",
        "inputText": "# Mon Document\n\n## Introduction\n\nCeci est un test.",
        "fromFormat": "markdown",
        "toFormat": "docx",
        "outputType": "binary",
        "outputBinaryPropertyName": "data"
      },
      "name": "Pandoc",
      "type": "n8n-nodes-pandoc.pandoc",
      "position": [250, 300]
    }
  ]
}
```

## Configuration pour votre instance

Pour votre instance sur https://n8n.dev.tripleperformance.fr/, assurez-vous que :

1. Pandoc est installé dans le conteneur Docker
2. Le package est installé via npm dans le conteneur
3. n8n a été redémarré après l'installation

### Vérification de l'installation

Vous pouvez vérifier que Pandoc est disponible en utilisant un node "Execute Command" dans n8n :

```bash
pandoc --version
```

## Développement

### Build
```bash
npm install
npm run build
```

### Développement avec watch mode
```bash
npm run dev
```

### Lint
```bash
npm run lint
npm run lintfix  # Pour corriger automatiquement
```

### Format
```bash
npm run format
```

## Licence

MIT

## Support

Pour les problèmes et questions :
- Créez une issue sur GitHub : https://github.com/neayi/n8n_pandoc/issues
- Consultez la documentation Pandoc : https://pandoc.org/

## Liens

- GitHub : https://github.com/neayi/n8n_pandoc
- npm : https://www.npmjs.com/package/@neayi/n8n-pandoc

## Contributeurs

Développé par Neayi pour Triple Performance

---

**Note:** Ce node nécessite que Pandoc soit installé sur le système hôte. Il ne fonctionne pas dans les environnements où vous ne pouvez pas installer de logiciels supplémentaires.
