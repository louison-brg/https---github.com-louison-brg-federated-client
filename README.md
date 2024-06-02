# GymBro AI

GymBro AI est une application de coach personnel basée sur l'apprentissage fédéré. L'application recommande un nombre optimal de pompes en fonction des entrées utilisateur, tout en garantissant que les données personnelles restent privées.

## Fonctionnalités

- Collecte de données utilisateur (nombre de pompes et difficulté)
- Entraînement d'un modèle local sur les données utilisateur
- Mise à jour d'un modèle global en utilisant les poids des modèles locaux
- Recommandation personnalisée du nombre de pompes

## Prérequis

- Node.js (version 14 ou supérieure)
- npm (version 6 ou supérieure)

## Installation

### Cloner le dépôt

```sh
git clone https://github.com/votre-utilisateur/gymbro-ai.git
cd gymbro-ai
```

### Installer les dépendances
Côté serveur
```sh
cd federated-learning-server
npm install
```
Côté client
```sh
cd ../federated-learning-client
npm install
```
### Configuration
#### Serveur
Assurez-vous que le modèle global est initialisé. Si vous n'avez pas encore de modèle, il sera créé automatiquement au démarrage du serveur.

#### Client
Aucune configuration spécifique n'est nécessaire pour le client.

## Lancer l'application
### Serveur
```sh
cd federated-learning-server
node server.js
```
Le serveur démarre sur le port 3001.

### Client
```sh

cd ../federated-learning-client
npm start
```
Le client démarre sur le port 3000.

## Utilisation
Ouvrez votre navigateur et allez à http://localhost:3000.
Entrez le nombre de pompes et sélectionnez la difficulté.
Cliquez sur "Envoyer" pour soumettre les données.
Cliquez sur "Obtenir une recommandation d'entraînement" pour recevoir une recommandation personnalisée du nombre de pompes.
### Structure du projet
```
gymbro-ai/
├── federated-learning-server/
│   ├── node_modules/
│   ├── model/
│   ├── package.json
│   ├── server.js
│   └── README.md
└── federated-learning-client/
    ├── node_modules/
    ├── public/
    │   ├── AIcoach.webp
    │   ├── index.html
    │   └── ...
    ├── src/
    │   ├── components/
    │   │   └── DataCollection.js
    │   ├── App.js
    │   ├── App.css
    │   └── ...
    ├── package.json
    └── README.md
```
### Technologies utilisées
React.js pour le client
Node.js et Express pour le serveur
TensorFlow.js pour l'apprentissage automatique

