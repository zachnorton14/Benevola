import { useState } from "react";
import { photonSearch, formatPhotonAddress } from "./photonHelper"

export default function AddressCompletion({ address, setAddress, setPosition, editing }) {
  const [results, setResults] = useState([]);


  async function handleChange(e) {
    const value = e.target.value;
    setAddress(value);

    if (value.length < 3) {
      setResults([]);
      return;
    }

    const features = await photonSearch(value);
    setResults(features);
  }


  function selectResult(feature) {
    const [lng, lat] = feature.geometry.coordinates;

    setPosition({ lat, lng });
    setAddress(formatPhotonAddress(feature.properties));
    setResults([]);
  }

  return (
    <div className="address-search">
      <input
        className= {"address-textbox "  + (editing ? "event-editing" : "event-reading")}
        value={address}
        onChange={handleChange}
        placeholder="Enter address"
        name="address"
        readOnly={!editing}
        onKeyDown={e => e.key === "Enter" && e.preventDefault()}
      />

      {results.length > 0 && (
        <ul className="address-results">
          {results.map(feature => (
            <li
              key={feature.properties.osm_id}
              onClick={() => selectResult(feature)}
            >
              {formatPhotonAddress(feature.properties)}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
};