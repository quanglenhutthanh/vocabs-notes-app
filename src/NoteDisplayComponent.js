import React, { useState } from 'react';
import './NoteDisplayComponent.css';
import axios from 'axios';

const NoteDisplayComponent = ({ notes, onNotesChange }) => {
  const [vocabularyInput, setVocabularyInput] = useState("");
  const [noteType, setNoteType] = useState("vocabulary");
  const [selectedMeaningIndex, setSelectedMeaningIndex] = useState(0);
  const [link, setLink] = useState("");
  const [linkDescription, setLinkDescription] = useState("");
  const [linkSummary, setLinkSummary] = useState("");
  const [chatGptResponse, setChatGptResponse] = useState("");

  const lookupWordInChatGPT = async (word) => {
    try {
      const apiKey = ''; // Replace with your actual API key
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo', // or 'gpt-4' based on your access
          messages: [
            { role: 'user', content: `Tell me about the word "${word}". Provide usage examples and definitions.` }
          ],
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setChatGptResponse(response.data.choices[0].message.content);
    } catch (error) {
      console.error('Error fetching data from ChatGPT:', error);
      setChatGptResponse('Error fetching data. Please try again.');
    }
  };
  const fetchLinkSummary = async (url) => {
    try {
      // Here you'd fetch the summary from a metadata API or a custom endpoint
      // For this example, we'll mock the summary response.
      const response = await fetch(`${process.env.REACT_APP_LINK_PREVIEW_API}&q=${url}`);
      const data = await response.json();
      setLinkSummary(data.description || "No summary available");
      const updatedLink = [{ url, description: data.description }, ...(notes.link || [])];
      onNotesChange({ ...notes, link: updatedLink });
    } catch (error) {
      console.error("Error fetching link summary:", error);
      setLinkSummary("Error fetching summary");
    }
  };

  const addLink = () => {
    if (link.trim()) {
      fetchLinkSummary(link.trim());
    }
  };

  // Remaining code from the component...
  const fetchWordData = async (word) => {
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      const data = await response.json();
      if (data && data[0]) {
        const { meanings, phonetic, phonetics } = data[0];

        let examples = [];
        if (meanings) {
          for (let meaning of meanings) {
            for (let def of meaning.definitions) {
              if (def.example && examples.length < 3) {
                examples.push(def.example);
              }
            }
          }
        }

        const newVocabEntry = {
          vocab: word,
          partOfSpeech: meanings[0]?.partOfSpeech || "",
          pronunciation: phonetic || (Array.isArray(phonetics) && phonetics.find(item => item?.text)?.text) || "",
          audio: phonetics[0] ? phonetics[0].audio : "",
          definitions: meanings[0].definitions
            .map(def => def.definition),
            examples: examples,
          meanings: meanings || []
        };
        console.log(newVocabEntry);
        const updatedVocabulary = [newVocabEntry, ...(notes.vocabulary || [])];
        onNotesChange({ ...notes, vocabulary: updatedVocabulary });
        setVocabularyInput("");
        setSelectedMeaningIndex(0);
      }
    } catch (error) {
      console.error("Error fetching word data:", error);
    }
  };

  const handleMeaningChange = (index, vocabIndex) => {
    const selectedMeaning = notes.vocabulary[vocabIndex].meanings[index];
    
    const selectedDefinition = selectedMeaning.definitions
      .map(def => def.definition);
    console.log(selectedMeaning.definitions)

    let examples = [];
    if (selectedMeaning) {
      for (let def of selectedMeaning.definitions) {
        //for (let def of meaning.definitions) {
          if (def.example && examples.length < 3) {
            examples.push(def.example);
          }
        //}
      }
    }
      
    const updatedVocabEntry = {
      ...notes.vocabulary[vocabIndex],
      partOfSpeech: selectedMeaning.partOfSpeech,
      definitions: selectedDefinition,
      example: examples || ""
    };
    const updatedVocabulary = notes.vocabulary.map((entry, i) => (i === vocabIndex ? updatedVocabEntry : entry));
    onNotesChange({ ...notes, vocabulary: updatedVocabulary });
    setSelectedMeaningIndex(index);
  };

  const addWord = () => {
    if (vocabularyInput.trim()) {
      fetchWordData(vocabularyInput.trim());
    }
  };
  const deleteVocabularyEntry = (vocabIndex) => {
    const updatedVocabulary = notes.vocabulary.filter((_, index) => index !== vocabIndex);
    onNotesChange({ ...notes, vocabulary: updatedVocabulary });
  };

  const deleteNote = () => {
    onNotesChange({ ...notes, text: "" });
  };
  return (
    <div className="container">
      <h2 className="heading">Notes for Selected Date</h2>

      <div className="section">
        <label className="label">Note Type:</label>
        <select className="select" value={noteType} onChange={(e) => setNoteType(e.target.value)}>
          <option value="vocabulary">Vocabulary</option>
          <option value="note">Note</option>
          <option value="link">Link</option>
        </select>
      </div>
      {noteType == "note" && (
        <div>
          {notes.text}
        </div>
      )
      }
      {noteType === "vocabulary" && (
        <div className="section">
          <input
            type="text"
            value={vocabularyInput}
            onChange={(e) => setVocabularyInput(e.target.value)}
            placeholder="Enter vocabulary word"
            className="input"
          />
          <button onClick={addWord} className="button">Add Vocabulary</button>
          <button onClick={() => lookupWordInChatGPT(vocabularyInput)} className="button">Lookup in ChatGPT</button>
          {notes.vocabulary && notes.vocabulary.length > 0 && (
            <div className="section">
              <h3>Vocabulary List</h3>
              {notes.vocabulary.map((entry, vocabIndex) => (
                <div key={vocabIndex} className="vocabulary-item">
                  <p><strong>Word:</strong> {entry.vocab}</p>
                  <p><strong>Pronunciation:</strong> {entry.pronunciation}</p>
                  {/* Check if audio exists, and render an audio element */}
                  {entry.audio && (
                    <div>

                      <audio key={entry.audio} controls>
                        <source src={entry.audio} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )}
                  {entry.meanings && entry.meanings.length > 0 && (
                    <>
                      <label className="label">Part of Speech:</label>
                      <select
                        className="select"
                        value={selectedMeaningIndex}
                        onChange={(e) => handleMeaningChange(e.target.value, vocabIndex)}
                      >
                        {entry.meanings.map((meaning, index) => (
                          <option key={index} value={index}>{meaning.partOfSpeech}</option>
                        ))}
                      </select>
                    </>
                  )}

                  <p><strong>Definition:</strong></p>
                  <ul>
                    {entry.definitions.map((definition, index) => (
                      <li key={index}>{definition}</li>
                    ))}
                  </ul>
                  

                  <p><strong>Example:</strong></p>
                  <ul>
                    {entry.examples.map((example, index) => (
                      <li key={index}>{example}</li>
                    ))}
                  </ul>

                  <button
                    onClick={() => deleteVocabularyEntry(vocabIndex)}
                    className="delete-button"
                  >
                    Delete Vocabulary
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {noteType === "note" && (
        <div className="section">
          <h3>Notes:</h3>
          <textarea
            value={notes.text}
            onChange={(e) => onNotesChange({ ...notes, text: e.target.value })}
            placeholder="Enter your notes here"
            className="text-area"
          />
        </div>
      )}
      {noteType === "link" && (
        <div className="section">
          <label className="label">Link URL:</label>
          <input
            type="text"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="Enter link URL"
            className="input"
          />
          <button onClick={addLink} className="button">Add Link</button>

          {/* {linkSummary && (
            <div className="link-summary">
              <p><strong>Summary:</strong> {linkSummary}</p>
            </div>
          )} */}

          <label className="label">Description:</label>
          <textarea
            value={linkSummary}
            onChange={(e) => setLinkDescription(e.target.value)}
            placeholder="Enter description"
            className="text-area"
          />

          {notes.link && notes.link.length > 0 && (
            <div>
              {notes.link.map((entry, linkIndex) => (
                <div key={linkIndex} className="vocabulary-item">


                  <p><strong>Url:</strong> <a href={entry.url} target='_blank'>{entry.url}</a></p>
                  <p><strong>Description:</strong> {entry.description}</p>

                </div>
              ))}
            </div>
          )}
          {chatGptResponse && (
            <div className="chatgpt-response">
              <h3>ChatGPT Response:</h3>
              <p>{chatGptResponse}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NoteDisplayComponent;
