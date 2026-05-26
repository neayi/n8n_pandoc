# Exemples de workflows n8n pour Pandoc

Ce dossier contient des exemples de workflows n8n utilisant le node Pandoc.

## Fichiers d'exemple

### 1. workflow-example.json

Workflow de base montrant différentes conversions :

- **Markdown → HTML** : Conversion simple avec table des matières
- **MediaWiki → Markdown** : Conversion de syntaxe wiki vers markdown GitHub
- **Markdown → DOCX** : Génération d'un document Word
- **HTML → Texte brut** : Extraction de texte depuis HTML

**Comment utiliser :**
1. Importez le fichier dans n8n
2. Cliquez sur "Test workflow"
3. Examinez les résultats de chaque node

### 2. binary-conversion-workflow.json

Workflow avancé pour la gestion de fichiers binaires :

- **HTTP Request → Markdown** : Télécharger un DOCX et le convertir en Markdown
- **Fichier local → PDF** : Lire un fichier DOCX et générer un PDF
- **Auto-détection** : Laisser Pandoc détecter le format d'entrée

**Comment utiliser :**
1. Importez le fichier dans n8n
2. Adaptez les chemins de fichiers selon votre environnement
3. Assurez-vous que XeLaTeX est installé pour la génération de PDF

## Cas d'usage courants

### Convertir MediaWiki en Markdown pour GitHub

Utile pour migrer du contenu wiki vers GitHub :

```json
{
  "inputType": "text",
  "fromFormat": "mediawiki",
  "toFormat": "gfm",
  "outputType": "text"
}
```

### Générer un PDF depuis Markdown

Pour créer des documents PDF professionnels :

```json
{
  "inputType": "text",
  "fromFormat": "markdown",
  "toFormat": "pdf",
  "outputType": "binary",
  "additionalOptions": {
    "customArgs": "--pdf-engine=xelatex --toc --number-sections"
  }
}
```

### Convertir DOCX en HTML pour le web

Pour publier des documents Word sur le web :

```json
{
  "inputType": "binary",
  "binaryPropertyName": "data",
  "fromFormat": "docx",
  "toFormat": "html5",
  "outputType": "text",
  "additionalOptions": {
    "standalone": true,
    "selfContained": true
  }
}
```

### Nettoyer du HTML en texte brut

Pour extraire le contenu textuel :

```json
{
  "inputType": "text",
  "fromFormat": "html",
  "toFormat": "plain",
  "outputType": "text",
  "additionalOptions": {
    "wrap": "none"
  }
}
```

## Intégration avec d'autres nodes

### Workflow complet : Email → Conversion → Stockage

```
Email Trigger → Extract Attachments → Pandoc (DOCX→PDF) → Google Drive
```

### Workflow de publication : Markdown → HTML → CMS

```
GitHub → Read Files → Pandoc (MD→HTML) → HTTP Request (POST to CMS)
```

### Workflow de documentation : Code → Markdown → PDF

```
HTTP Request (API docs) → JSON to Markdown → Pandoc → Email
```

## Formats particuliers

### Pour MediaWiki (Triple Performance)

Configuration recommandée pour convertir depuis/vers MediaWiki :

**MediaWiki → Markdown :**
```json
{
  "fromFormat": "mediawiki",
  "toFormat": "gfm",
  "additionalOptions": {
    "standalone": false,
    "wrap": "preserve"
  }
}
```

**Markdown → MediaWiki :**
```json
{
  "fromFormat": "markdown",
  "toFormat": "mediawiki",
  "additionalOptions": {
    "standalone": false,
    "wrap": "preserve"
  }
}
```

### Pour générer des EPUB

```json
{
  "fromFormat": "markdown",
  "toFormat": "epub3",
  "outputType": "binary",
  "additionalOptions": {
    "toc": true,
    "numberSections": true,
    "customArgs": "--epub-cover-image=cover.jpg"
  }
}
```

## Dépannage

### Le PDF ne se génère pas

Assurez-vous que XeLaTeX est installé :
```bash
apk add texlive-xetex
```

### Erreur "Unknown format"

Vérifiez que le format est bien dans la liste des formats supportés par Pandoc :
```bash
pandoc --list-input-formats
pandoc --list-output-formats
```

### Les images ne s'affichent pas

Utilisez l'option `selfContained` pour intégrer les images :
```json
{
  "additionalOptions": {
    "selfContained": true
  }
}
```

## Ressources

- [Documentation Pandoc](https://pandoc.org/MANUAL.html)
- [Guide des formats](https://pandoc.org/MANUAL.html#general-options)
- [Options de conversion](https://pandoc.org/MANUAL.html#general-writer-options)
