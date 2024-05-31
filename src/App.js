import React, { useState, useEffect } from 'react';
import DataCollection from './components/DataCollection';
import * as tf from '@tensorflow/tfjs';

function App() {
    const [data, setData] = useState([]);
    const [recommendation, setRecommendation] = useState('');
    const [difficulty, setDifficulty] = useState('');
    const [model, setModel] = useState(null);

    useEffect(() => {
        const fetchGlobalModel = async () => {
            try {
                const response = await fetch('http://localhost:3001/global-model');
                if (response.ok) {
                    const modelJSON = await response.json();
                    const globalModel = await tf.models.modelFromJSON(modelJSON);
                    setModel(globalModel);
                    console.log('Fetched global model:', globalModel);
                } else {
                    console.log('Failed to fetch global model:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching global model:', error);
            }
        };

        fetchGlobalModel();
    }, []);

    const handleDataCollected = async (newData) => {
        setData(prevData => [...prevData, newData]);

        // Create a local model
        const localModel = tf.sequential();
        localModel.add(tf.layers.dense({ units: 10, activation: 'relu', inputShape: [1] }));
        localModel.add(tf.layers.dense({ units: 1 }));
        localModel.compile({
            optimizer: tf.train.adam(),
            loss: 'meanSquaredError'
        });

        const inputs = tf.tensor2d([...data, newData].map(d => [d.difficulty]), [data.length + 1, 1]);
        const labels = tf.tensor2d([...data, newData].map(d => [d.pushUps]), [data.length + 1, 1]);

        await localModel.fit(inputs, labels, { epochs: 10 });

        const weights = localModel.getWeights().map(w => w.arraySync());

        try {
            const response = await fetch('http://localhost:3001/update-model', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ weights }),
            });
            const result = await response.json();
            console.log(result.message);

            const globalModelResponse = await fetch('http://localhost:3001/global-model');
            if (globalModelResponse.ok) {
                const modelJSON = await globalModelResponse.json();
                const updatedModel = await tf.models.modelFromJSON(modelJSON);
                setModel(updatedModel);
                console.log('Updated global model:', updatedModel);
            } else {
                console.log('Failed to fetch updated global model:', globalModelResponse.statusText);
            }
        } catch (error) {
            console.error('Failed to update the model. Please try again.', error);
        }
    };

    const handleRecommendation = async () => {
        if (model) {
            try {
                const input = tf.tensor2d([[parseInt(difficulty)]]);
                const prediction = model.predict(input).dataSync()[0];
                setRecommendation(`Recommended number of push-ups: ${prediction.toFixed(2)}`);
                console.log('Model prediction:', prediction);
            } catch (error) {
                console.error('Error making prediction:', error);
            }
        } else {
            console.log('Model not available for prediction.');
        }
    };

    return (
        <div className="App">
            <h1>Personalized Fitness Coach</h1>
            <DataCollection onDataCollected={handleDataCollected} />
            <div>
                <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                    <option value="">Select Difficulty</option>
                    <option value="1">Easy</option>
                    <option value="2">Good</option>
                    <option value="3">Hard</option>
                </select>
                <button onClick={handleRecommendation}>Get Workout Recommendation</button>
            </div>
            {recommendation && <p>{recommendation}</p>}
        </div>
    );
}

export default App;
