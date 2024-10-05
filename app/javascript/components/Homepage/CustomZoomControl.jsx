// CustomZoomControl.js
import React from 'react';
import { useMap } from 'react-leaflet';

function CustomZoomControl() {
  const map = useMap();

  return (
    <div className="leaflet-top leaflet-right">
      <div className="leaflet-control leaflet-bar">
        <a 
          className="leaflet-control-zoom-in" 
          href="#" 
          title="Zoom in"
          onClick={(e) => {
            e.preventDefault();
            map.zoomIn();
          }}
          aria-label="Zoom in"
        >
          +
        </a>
        <a 
          className="leaflet-control-zoom-out" 
          href="#" 
          title="Zoom out"
          onClick={(e) => {
            e.preventDefault();
            map.zoomOut();
          }}
          aria-label="Zoom out"
        >
          −
        </a>
      </div>
    </div>
  );
}

export default CustomZoomControl;
