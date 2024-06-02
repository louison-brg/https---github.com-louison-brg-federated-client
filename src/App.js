import React, { useState, useEffect } from 'react';
import DataCollection from './components/DataCollection';
import * as tf from '@tensorflow/tfjs';
import {
    Container,
    Typography,
    Box,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Paper,
    CssBaseline,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Création d'un thème personnalisé pour l'application
const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
});

function App() {
    // États pour stocker les données collectées, la recommandation, la difficulté et le modèle
    const [data, setData] = useState([]);
    const [recommendation, setRecommendation] = useState('');
    const [difficulty, setDifficulty] = useState('');
    const [model, setModel] = useState(null);

    // Utiliser useEffect pour récupérer le modèle global du serveur lorsque le composant est monté
    useEffect(() => {
        const fetchGlobalModel = async () => {
            try {
                const response = await fetch('/global-model'); // Récupère le modèle global du serveur
                if (response.ok) {
                    const modelJSON = await response.json();
                    console.log('Modèle global récupéré du serveur:', modelJSON);

                    // Charger le modèle global à partir des données reçues
                    const globalModel = await tf.loadLayersModel(tf.io.fromMemory({
                        modelTopology: modelJSON.modelTopology,
                        weightSpecs: modelJSON.weightSpecs,
                        weightData: new Uint8Array(modelJSON.weightData).buffer,
                    }));

                    setModel(globalModel); // Stocke le modèle global dans l'état
                    console.log('Modèle global chargé:', globalModel);
                } else {
                    console.log('Échec de la récupération du modèle global:', response.statusText);
                }
            } catch (error) {
                console.error('Erreur lors de la récupération du modèle global:', error);
            }
        };

        fetchGlobalModel(); // Appelle la fonction pour récupérer le modèle global
    }, []);

    // Fonction appelée lorsque de nouvelles données sont collectées
    const handleDataCollected = async (newData) => {
        setData(prevData => [...prevData, newData]); // Ajoute les nouvelles données à l'état

        // Normaliser les données collectées
        const normalizedData = [...data, newData].map(d => ({
            difficulty: parseInt(d.difficulty) / 3, // Normaliser la difficulté entre 0 et 1
            pushUps: d.pushUps / 100 // Normaliser le nombre de pompes, supposant un maximum de 100 pompes
        }));

        // Créer un modèle local
        const localModel = tf.sequential();
        localModel.add(tf.layers.dense({ units: 10, activation: 'relu', inputShape: [1] })); // Couche dense avec 10 unités
        localModel.add(tf.layers.dense({ units: 1 })); // Couche de sortie avec 1 unité
        localModel.compile({
            optimizer: tf.train.adam(), // Utilise l'optimiseur Adam
            loss: 'meanSquaredError' // Utilise l'erreur quadratique moyenne comme fonction de perte
        });

        // Crée des tenseurs pour les entrées et les labels à partir des données normalisées
        const inputs = tf.tensor2d(normalizedData.map(d => [d.difficulty]), [normalizedData.length, 1]);
        const labels = tf.tensor2d(normalizedData.map(d => [d.pushUps]), [normalizedData.length, 1]);

        // Entraîner le modèle local avec les données normalisées
        await localModel.fit(inputs, labels, {
            epochs: 100, // Nombre d'époques d'entraînement
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    console.log(`Epoch ${epoch}: loss = ${logs.loss}`); // Affiche la perte à chaque époque
                }
            }
        });

        // Récupérer les poids du modèle local après l'entraînement
        const weights = localModel.getWeights().map(w => ({
            data: w.arraySync(), // Convertit les poids en tableau de nombres
            shape: w.shape, // Conserve la forme des poids
            dtype: w.dtype // Conserve le type de données des poids
        }));

        console.log('Envoi des poids au serveur:', weights);

        // Envoyer les poids au serveur pour mettre à jour le modèle global
        try {
            const response = await fetch('/update-model', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ weights }), // Envoie les poids sous forme de JSON
            });
            const result = await response.json();
            console.log(result.message);

            // Récupérer le modèle global mis à jour depuis le serveur
            const globalModelResponse = await fetch('/global-model');
            if (globalModelResponse.ok) {
                const modelJSON = await globalModelResponse.json();
                console.log('Modèle global mis à jour récupéré du serveur:', modelJSON);

                // Charger le modèle global mis à jour à partir des données reçues
                const updatedModel = await tf.loadLayersModel(tf.io.fromMemory({
                    modelTopology: modelJSON.modelTopology,
                    weightSpecs: modelJSON.weightSpecs,
                    weightData: new Uint8Array(modelJSON.weightData).buffer,
                }));

                setModel(updatedModel); // Stocke le modèle global mis à jour dans l'état
                console.log('Modèle global mis à jour chargé:', updatedModel);
            } else {
                console.log('Échec de la récupération du modèle global mis à jour:', globalModelResponse.statusText);
            }
        } catch (error) {
            console.error('Échec de la mise à jour du modèle. Veuillez réessayer.', error);
        }
    };

    // Fonction pour obtenir une recommandation de pompes
    const handleRecommendation = async () => {
        if (model) {
            try {
                const normalizedDifficulty = parseInt(difficulty) / 3; // Normaliser la difficulté
                const input = tf.tensor2d([[normalizedDifficulty]]); // Crée un tenseur pour l'entrée
                const prediction = model.predict(input).dataSync()[0]; // Effectue la prédiction
                const denormalizedPrediction = prediction * 100; // Dénormaliser la prédiction

                const finalPrediction = Math.max(0, denormalizedPrediction); // S'assurer que la prédiction est positive

                const roundedPrediction = Math.round(finalPrediction); // Arrondir la valeur renvoyé

                setRecommendation(`Nombre de pompes recommandé: ${roundedPrediction}`); // Affiche la recommandation
                console.log('Prédiction du modèle:', finalPrediction);
            } catch (error) {
                console.error('Erreur lors de la prédiction:', error);
            }
        } else {
            console.log('Modèle non disponible pour la prédiction.');
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Container maxWidth="sm">
                <Box my={4}>
                    <Paper elevation={3} style={{ padding: '16px' }}>
                        <Typography variant="h4" component="h1" gutterBottom>
                            GymBro AI
                        </Typography>
                        <DataCollection onDataCollected={handleDataCollected} />
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="difficulty-label">Sélectionnez la difficulté</InputLabel>
                            <Select
                                labelId="difficulty-label"
                                value={difficulty}
                                onChange={e => setDifficulty(e.target.value)}
                            >
                                <MenuItem value=""><em>Aucune</em></MenuItem>
                                <MenuItem value="1">Facile</MenuItem>
                                <MenuItem value="2">Adapté</MenuItem>
                                <MenuItem value="3">Difficile</MenuItem>
                            </Select>
                        </FormControl>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleRecommendation}
                            fullWidth
                        >
                            Obtenir une recommandation d'entraînement
                        </Button>
                        {recommendation && (
                            <Box mt={2}>
                                <Typography variant="h6">{recommendation}</Typography>
                            </Box>
                        )}
                    </Paper>
                </Box>
            </Container>
        </ThemeProvider>
    );
}

export default App;
