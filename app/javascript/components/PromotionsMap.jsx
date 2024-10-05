import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Leaflet icon fix to correctly load icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const PromotionsMap = ({ promotions, setVisiblePromotions, onPromotionClick }) => {
  const mapRef = useRef();  // Reference for programmatic map control

  // Function to handle bounds and visible promotions when map moves
  const MapEventHandler = () => {
    const map = useMapEvents({
      moveend: () => {
        const bounds = map.getBounds();
        const visiblePromos = promotions.filter(promo =>
          bounds.contains([promo.lat, promo.lng])
        );
        setVisiblePromotions(visiblePromos);
      },
    });
    return null;
  };

  // Zoom to specific promotion when clicked
  useEffect(() => {
    if (mapRef.current && onPromotionClick) {
      const { lat, lng } = onPromotionClick;
      mapRef.current.setView([lat, lng], 15); // Zoom in on the clicked promotion
    }
  }, [onPromotionClick]);

  return (
    <div className="w-full h-full">
      {/* MapContainer must wrap all map elements */}
      <MapContainer
        center={[51.505, -0.09]}  // Default center
        zoom={13}
        scrollWheelZoom={true}
        ref={mapRef}  // Attach mapRef to the MapContainer
        className="w-full h-full"
      >
        {/* Tile layer for the map */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Marker clustering for promotions */}
        <MarkerClusterGroup>
          {promotions.map((promo, index) => (
            <Marker key={index} position={[promo.lat, promo.lng]}>
              <Popup>
                <strong>{promo.name}</strong>
                <p>{promo.description}</p>
                <p><strong>Store:</strong> {promo.store}</p>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>

        {/* Custom map event handler for managing visible promotions */}
        <MapEventHandler />
      </MapContainer>
    </div>
  );
};

export default PromotionsMap;
