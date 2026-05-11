

// alternate arrow icon import EastIcon from '@mui/icons-material/East';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import '../styles/ArrowButton.css';

import { useState } from 'react';

// ----------------------------------------------------------------------------------------- //
//
//    Creates a Dynamic Button that adds an arrow icon and expands the width when hovered
//
//                         ( Not Hovered )               ( Hovered -> )
//
//  color - the color of this button, add new colors in the style sheet ArrowButton.cs
//  title - the actual text inside the button
//   size - the size of the button, changes text and icon. 3 Sizes = {small, medium, large}
//  event - the function that is called when this button is clicked
// ----------------------------------------------------------------------------------------- //
function ArrowButton({ color, title, size, event}) {

  // is this button hovered
  const [hovered, setHovered] = useState(false);

  return (
    <button className={`${color} arrow-button ${size}`}
            onClick={event} 
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}>
      <span className={`text-box-${size}`}>
        {title}
        {/* Conditionally represent the arrow */}
        {hovered ? <> <span className="icon-container">
          <ArrowForwardIcon className={`button-icon ${size}`} fontSize={size}/>  </span> </> : <></>} 
      </span>
    </button>
  );
}

export default ArrowButton;