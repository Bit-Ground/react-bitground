import React from 'react';
import '../../styles/rank/season-selector.css';

export default function SeasonSelector({seasonList, selectedSeason, onChange}) {
    return (
        <select className="season-select" value={selectedSeason} onChange={onChange}>
            {seasonList.map(season => (
                <option key={season.id} value={season.id}>
                    {season.name}
                </option>
            ))}
        </select>
    );
};


