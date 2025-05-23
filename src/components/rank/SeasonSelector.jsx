import React from 'react';
import '../../style/season-selector.css';

const SeasonSelector = ({ seasonList, selectedSeason, onChange }) => {
    return (
        <select className="season-select" value={selectedSeason} onChange={onChange}>
            {seasonList.map(season => (
                <option key={season.value} value={season.value}>
                    {season.label}
                </option>
            ))}
        </select>
    );
};

export default SeasonSelector;
