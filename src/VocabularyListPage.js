import React, { useState, useEffect } from 'react';

function VocabularyListPage() {
    const [vocabList, setVocabList] = useState([]);
    const [groupedVocab, setGroupedVocab] = useState({});
    const [groupBy, setGroupBy] = useState('month'); // Default grouping by month

    // Function to load all vocabularies from local storage
    useEffect(() => {
        const allVocab = [];
        
        // Loop through localStorage keys
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            
            // Check if key starts with 'notes-' indicating it's a vocabulary entry
            if (key.startsWith('notes-')) {
                const vocabData = JSON.parse(localStorage.getItem(key));
                
                // Ensure it's vocab data and add to list
                if (vocabData && Array.isArray(vocabData)) {
                    allVocab.push(...vocabData.filter(item => item.type === 'vocabulary'));
                }
            }
        }
        
        setVocabList(allVocab);
    }, []);

    // Function to group vocabularies by selected time period
    useEffect(() => {
        const grouped = {};
        
        vocabList.forEach((item) => {
            const date = new Date(item.date); // Assuming each item has a 'date' field
            let key;

            // Determine the grouping key based on the selected grouping
            if (groupBy === 'year') {
                key = date.getFullYear();
            } else if (groupBy === 'month') {
                key = `${date.getFullYear()}-${date.getMonth() + 1}`;
            } else if (groupBy === 'week') {
                const startOfYear = new Date(date.getFullYear(), 0, 1);
                const weekNumber = Math.ceil(((date - startOfYear) / (1000 * 60 * 60 * 24) + startOfYear.getDay() + 1) / 7);
                key = `${date.getFullYear()}-W${weekNumber}`;
            }

            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(item);
        });

        setGroupedVocab(grouped);
    }, [vocabList, groupBy]);

    // Function to change grouping option
    const handleGroupByChange = (event) => {
        setGroupBy(event.target.value);
    };

    return (
        <div>
            <h1>Vocabulary List</h1>
            <div>
                <label>Group By:</label>
                <select value={groupBy} onChange={handleGroupByChange}>
                    <option value="year">Year</option>
                    <option value="month">Month</option>
                    <option value="week">Week</option>
                </select>
            </div>

            {Object.keys(groupedVocab).map((groupKey) => (
                <div key={groupKey}>
                    <h2>{groupKey}</h2>
                    <ul>
                        {groupedVocab[groupKey].map((word, index) => (
                            <li key={index}>
                                <strong>{word.vocab}</strong>: {word.definitions} <br />
                                Pronunciation: {word.pronunciation} <br />
                                Example: {word.examples}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}

export default VocabularyListPage;
