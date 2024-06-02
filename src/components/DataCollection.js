import React, { useState } from 'react';
import { Box, Button, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

function DataCollection({ onDataCollected }) {
    const [pushUps, setPushUps] = useState(''); // État pour stocker le nombre de pompes
    const [difficulty, setDifficulty] = useState(''); // État pour stocker la difficulté

    // Fonction pour gérer l'envoi des données
    const handleSubmit = (e) => {
        e.preventDefault(); // Empêche le rechargement de la page lors de l'envoi du formulaire
        if (pushUps && difficulty) { // Vérifie si les deux champs sont remplis
            const data = { pushUps: parseFloat(pushUps), difficulty: parseInt(difficulty) }; // Crée un objet avec les données
            onDataCollected(data); // Appelle la fonction de collecte des données
            setPushUps(''); // Réinitialise le champ des pompes
            setDifficulty(''); // Réinitialise le champ de la difficulté
        } else {
            alert('Veuillez entrer des données valides.'); // Alerte si les données ne sont pas valides
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <TextField
                label="Nombre de pompes"
                variant="outlined"
                fullWidth
                margin="normal"
                value={pushUps}
                onChange={(e) => setPushUps(e.target.value)}
            />
            <FormControl fullWidth margin="normal">
                <InputLabel id="difficulty-label">Sélectionnez la difficulté</InputLabel>
                <Select
                    labelId="difficulty-label"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                >
                    <MenuItem value=""><em>Aucune</em></MenuItem>
                    <MenuItem value="1">Facile</MenuItem>
                    <MenuItem value="2">Adapté</MenuItem>
                    <MenuItem value="3">Difficile</MenuItem>
                </Select>
            </FormControl>
            <Button
                type="submit"
                variant="contained"
                color="secondary"
                fullWidth
            >
                Envoyer
            </Button>
        </Box>
    );
}

export default DataCollection;
