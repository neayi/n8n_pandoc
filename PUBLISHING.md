# Guide de publication sur npm

## Pré-requis

1. Compte npm avec accès à l'organisation @neayi
2. Connexion à npm : `npm login`

## Étapes de publication

### 1. Vérifier le package.json

Assurez-vous que :
- La version est correcte (format semver: major.minor.patch)
- Le nom est `@neayi/n8n-pandoc`
- Les informations du repository sont correctes

### 2. Builder le package

```bash
cd /home/bertrand/n8n/n8n_pandoc
npm install
npm run build
```

### 3. Vérifier le contenu du package

```bash
npm pack --dry-run
```

Ceci affichera les fichiers qui seront inclus dans le package.

### 4. Tester localement (optionnel)

```bash
# Créer un fichier .tar.gz
npm pack

# Dans un autre projet ou conteneur Docker
npm install /chemin/vers/neayi-n8n-pandoc-0.1.0.tgz
```

### 5. Publier sur npm

```bash
# Publication publique
npm publish --access public

# Ou si vous voulez tester d'abord avec un tag
npm publish --access public --tag beta
```

### 6. Vérifier la publication

Allez sur https://www.npmjs.com/package/@neayi/n8n-pandoc

## Mise à jour de version

Pour publier une nouvelle version :

```bash
# Patch (0.1.0 -> 0.1.1) : corrections de bugs
npm version patch

# Minor (0.1.0 -> 0.2.0) : nouvelles fonctionnalités
npm version minor

# Major (0.1.0 -> 1.0.0) : breaking changes
npm version major

# Puis publier
npm publish --access public
```

## Configuration de l'organisation @neayi

Si vous n'avez pas encore créé l'organisation @neayi sur npm :

1. Allez sur https://www.npmjs.com/
2. Connectez-vous
3. Créez une nouvelle organisation "neayi"
4. Ajoutez les membres de l'équipe

## Dépannage

### Erreur "You do not have permission to publish"

```bash
npm login
# Vérifiez que vous êtes connecté avec le bon compte
npm whoami
```

### Erreur "Package name taken"

Vérifiez que le nom @neayi/n8n-pandoc n'est pas déjà pris :
https://www.npmjs.com/package/@neayi/n8n-pandoc

### Erreur de build

```bash
# Nettoyer et rebuilder
rm -rf dist node_modules
npm install
npm run build
```

## Checklist avant publication

- [ ] Le code compile sans erreurs : `npm run build`
- [ ] Le linting passe : `npm run lint`
- [ ] Le README est à jour
- [ ] La version est incrémentée
- [ ] Les tests fonctionnent (si applicable)
- [ ] Le fichier LICENSE existe
- [ ] Le .npmignore est configuré correctement

## Publication automatique avec GitHub Actions (optionnel)

Créez `.github/workflows/publish.yml` :

```yaml
name: Publish to npm

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: npm install
      - run: npm run build
      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

Ajoutez votre token npm dans les secrets GitHub :
1. Settings > Secrets and variables > Actions
2. New repository secret
3. Name: `NPM_TOKEN`
4. Value: votre token npm (créez-le sur npmjs.com)
