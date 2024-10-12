import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import React, { useState, useEffect, useRef } from 'react';
import { format, addMonths } from 'date-fns';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const formatDate = (date) => {
  if (!date) return '';
  return format(date, 'MMMM d, yyyy');
};

const formatTime = (date) => {
  if (!date) return '';
  return format(date, 'h:mm a');
};

const CURRENT_HOST = window.location.origin;

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: (CURRENT_HOST + '/marker.png'),
  iconUrl: (CURRENT_HOST + '/marker.png'),
  shadowUrl: (CURRENT_HOST + '/marker-shadow.png'),
});

function MapEventHandler({ onMoveEnd }) {
  const map = useMapEvents({
    moveend: () => {
      const bounds = map.getBounds();
      onMoveEnd(bounds);
    },
  });
  return null;
}

export function MobileMap({ isMapExpanded, toggleMapExpansion, selectedCity, setMap, handleMapMoveEnd, debouncedHandleMapMoveEnd, filteredPromotions, visiblePromotions, handlePromoClick }) {
  return (
    <div className="mobile-view">
      <div 
        className={`z-10 map-container ${isMapExpanded ? 'expanded' : ''}`}
      >
        <div className="absolute right-0" style={{zIndex: 5000}} onClick={toggleMapExpansion}> ZOOM </div>
        <MapContainer 
          center={[(selectedCity.coordinates?.latitude || '52.2297'), (selectedCity.coordinates?.longitude || '21.0122')]}
          zoom={11} 
          style={{ height: '100%', width: '100%' }}
          ref={setMap}
          scrollWheelZoom={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <MapEventHandler onMoveEnd={debouncedHandleMapMoveEnd} />
          {filteredPromotions.map((promo, index) => (
            <Marker
              key={index}
              position={[promo.latitude, promo.longitude]}
            >
              <Popup>
                <h2>{promo.title}</h2>
                <p>{promo.description}</p>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      <div className="list-container">
        <h2 className="text-xl font-bold mb-4">Promotions</h2>
        {visiblePromotions.map((promo, index) => (
          <div 
            key={index} 
            className="mb-4 p-2 bg-white rounded shadow cursor-pointer hover:bg-gray-50"
            onClick={() => handlePromoClick(promo)}
          >
            <div className="flex justify-between w-full">
              <div className="w-3/4">
                <h3 className="font-bold">{promo.title}</h3>
                <p>{promo.storeName}</p>
              </div>
              <div className="w-1/4 flex flex-col">
                <small className="text-gray-600 group-hover:text-white">{format(promo.start, 'LLL d, Y')}</small>
                <small className="text-gray-600 group-hover:text-white">{formatTime(promo.start)} - {formatTime(promo.end)}</small>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
};

export function DesktopMap ({ isMapExpanded, toggleMapExpansion, selectedCity, setMap, handleMapMoveEnd, debouncedHandleMapMoveEnd, filteredPromotions, visiblePromotions, handlePromoClick }) {
  return (
    <div className="z-10 flex flex-col md:flex-row bg-white p-2 rounded-md" style={{ height: '800px' }}>
      <div className="w-full md:w-1/3 p-4 overflow-y-auto bg-gray-100 mb-4 md:mb-0 md:mr-4">
        <h2 className="text-xl font-bold mb-4">Promotions</h2>
        {visiblePromotions.map((promo, index) => (
          <div 
            key={index} 
            className="mb-4 w-full p-2 group bg-white rounded shadow cursor-pointer hover:text-white hover:bg-purple-700 transition duration-300"
            onClick={() => handlePromoClick(promo)}
          >
            <div className="flex justify-between w-full">
              <div>
                <h3 className="font-bold">{promo.title}</h3>
                <p>{promo.storeName}</p>
              </div>
              <div className="flex flex-col">
                <small className="text-gray-600 group-hover:text-white">{formatDate(promo.start)}</small>
                <small className="text-gray-600 group-hover:text-white">{formatTime(promo.start)} - {formatTime(promo.end)}</small>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="z-10  w-full md:w-2/3 h-full">
        <MapContainer 
          center={[(selectedCity.coordinates?.latitude || '52.2297'), (selectedCity.coordinates?.longitude || '21.0122')]}
          zoom={11} 
          style={{ height: '100%', width: '100%' }}
          ref={setMap}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <MapEventHandler onMoveEnd={handleMapMoveEnd} />
          {filteredPromotions.map((promo, index) => (
            <Marker
              key={index}
              position={[promo.latitude, promo.longitude]}
            >
              <Popup>
                <h2>{promo.title}</h2>
                <p>{promo.description}</p>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};
