import React, { useState } from "react";

function Phase({ playerRole, playerList, optionsNeeded, onSubmit }) {
  const [selectedOptions, setSelectedOptions] = useState([]);

  const handleOptionChange = (event) => {
    const value = event.target.value;
    if (event.target.checked) {
      setSelectedOptions((prev) => [...prev, value]);
    } else {
      setSelectedOptions((prev) => prev.filter((option) => option !== value));
    }
  };

  const handleSubmit = () => {
    if (selectedOptions.length === optionsNeeded) {
      onSubmit(selectedOptions);
    } else {
      alert(`Please select exactly ${optionsNeeded} options.`);
    }
  };

  return (
    <div className="phase-screen">
      <h1>Action Phase for:</h1>
      <h2>{playerRole}</h2>
      <p>Choose {optionsNeeded} number of options:</p>
      <div>
        <h3>Player List:</h3>
        <ul>
          {playerList.map((player, index) => (
            <li key={index}>
              <label>
                <input
                  type="checkbox"
                  value={player}
                  onChange={handleOptionChange}
                  disabled={
                    selectedOptions.length >= optionsNeeded &&
                    !selectedOptions.includes(player)
                  }
                />
                {player}
              </label>
            </li>
          ))}
        </ul>
      </div>
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}

export default Phase;