import React, { useState } from 'react';

function DataCollection({ onDataCollected }) {
    const [pushUps, setPushUps] = useState('');
    const [difficulty, setDifficulty] = useState('');

    const handleSubmit = () => {
        if (pushUps && difficulty) {
            const data = { pushUps: parseFloat(pushUps), difficulty: parseInt(difficulty) };
            onDataCollected(data);
            setPushUps('');
            setDifficulty('');
        } else {
            alert('Please enter valid data.');
        }
    };

    return (
        <div>
            <input
                type="number"
                placeholder="Number of Push-ups"
                value={pushUps}
                onChange={e => setPushUps(e.target.value)}
            />
            <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                <option value="">Select Difficulty</option>
                <option value="1">Easy</option>
                <option value="2">Good</option>
                <option value="3">Hard</option>
            </select>
            <button onClick={handleSubmit}>Submit</button>
        </div>
    );
}

export default DataCollection;
