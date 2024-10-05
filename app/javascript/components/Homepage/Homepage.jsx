import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { format } from 'date-fns';
import allLocales from '@fullcalendar/core/locales-all';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { debounce } from 'lodash';
import 'leaflet/dist/leaflet.css';
import './Homepage.css';

const API_URL = "/api/v1/promotions";

function getAPIData() { return axios.get(API_URL).then((response) => response.data); }

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
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

function Homepage() {
  const [promotions, setPromotions] = useState([]);
  const [visiblePromotions, setVisiblePromotions] = useState([]);
  const [selectedStore, setSelectedStore] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [locale, setLocale] = useState('en');
  const [showMap, setShowMap] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const mapRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let mounted = true;
    getAPIData().then((promotions) => {
      if (mounted) {
        const processedPromotions = promotions.map(({ translations, starts_at, ends_at, ...rest }) => ({
          title: translations[locale].title,
          description: translations.en.description,
          start: starts_at,
          end: ends_at,
          latitude: rest.latitude || (Math.random() * (41 - 40) + 40),
          longitude: rest.longitude || (Math.random() * (-73 - -74) + -74),
          ...rest,
        }));
        setPromotions(processedPromotions);
        setVisiblePromotions(processedPromotions);
      }
    });
    return () => (mounted = false);
  }, []);

  const filteredPromotions = promotions.filter(promo => 
    (selectedStore === 'All' || promo.store === selectedStore) &&
    (selectedType === 'All' || promo.type === selectedType)
  );

  const handleEventClick = (info) => {
    const { start, end, ...rest } = info.event.extendedProps;
    setSelectedOffer({
      ...rest,
      start: info.event.start,
      end: info.event.end,
      title: info.event.title
    });
  };

  const formatDate = (date) => {
    if (!date) return '';
    return format(date, 'MMMM d, yyyy');
  };

  const formatTime = (date) => {
    if (!date) return '';
    return format(date, 'h:mm a');
  };

  const handleMapMoveEnd = (bounds) => {
    const visiblePromos = filteredPromotions.filter(promo => 
      bounds.contains([promo.latitude, promo.longitude])
    );
    setVisiblePromotions(visiblePromos);
  };

  const debouncedHandleMapMoveEnd = debounce(handleMapMoveEnd, 300);

  const handlePromoClick = (promo) => {
    setSelectedOffer(promo);
    if (mapRef.current) {
      mapRef.current.setView([promo.latitude, promo.longitude], 13);
    }
  };

  const toggleMapExpansion = () => {
    setIsMapExpanded(!isMapExpanded);
  };

  const renderMobileView = () => (
    <div className="mobile-view">
      <div 
        className={`z-10 map-container ${isMapExpanded ? 'expanded' : ''}`}
      >
        <div className="absolute right-0" style={{zIndex: 5000}} onClick={toggleMapExpansion}> ZOOM </div>
        <MapContainer 
          center={[40.7128, -74.0060]} 
          zoom={11} 
          style={{ height: '100%', width: '100%' }}
          whenCreated={mapInstance => { mapRef.current = mapInstance; }}
          scrollWheelZoom={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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
            <h3 className="font-bold">{promo.title}</h3>
            <p>{promo.store}</p>
            <p>{formatDate(promo.start)}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDesktopView = () => (
    <div className="flex flex-col md:flex-row" style={{ height: '600px' }}>
      <div className="w-full md:w-1/3 p-4 overflow-y-auto bg-gray-100 mb-4 md:mb-0 md:mr-4">
        <h2 className="text-xl font-bold mb-4">Promotions</h2>
        {visiblePromotions.map((promo, index) => (
          <div 
            key={index} 
            className="mb-4 p-2 bg-white rounded shadow cursor-pointer hover:bg-gray-50"
            onClick={() => handlePromoClick(promo)}
          >
            <h3 className="font-bold">{promo.title}</h3>
            <p>{promo.store}</p>
            <p>{formatDate(promo.start)}</p>
          </div>
        ))}
      </div>
      <div className="w-full md:w-2/3 h-full">
        <MapContainer 
          center={[40.7128, -74.0060]} 
          zoom={11} 
          style={{ height: '100%', width: '100%' }}
          whenCreated={mapInstance => { mapRef.current = mapInstance; }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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

  return (
    <div className="min-h-screen bg-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between">
          <h1 className="text-3xl font-bold text-purple-900 mb-6 text-center">Promotions</h1>
          
          {/* Language Selector */}
          <div className="mb-6 text-right">
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              className="block rounded-md border-purple-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
            >
              <option value="en">English</option>
              <option value="pl">Polish</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="zh-cn">中文</option>
              <option value="ja">日本語</option>
            </select>
          </div>
        </div>

        {/* Filters and View Toggle */}
        <div className="flex gap-2 justify-between mb-6">
          <div className="flex gap-2">
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="w-full block rounded-md border-purple-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
            >
              <option value="All">All Stores</option>
              <option value="Store A">Store A</option>
              <option value="Store B">Store B</option>
              <option value="Store C">Store C</option>
            </select>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full block rounded-md border-purple-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
            >
              <option value="All">All Types</option>
              <option value="Discount">Discount</option>
              <option value="BOGO">BOGO</option>
              <option value="Clearance">Clearance</option>
            </select>
          </div>
          <button
            onClick={() => setShowMap(!showMap)}
            className="w-1/3 md:w-fit bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition duration-300"
          >
            {showMap ? 'Calendar' : 'Map'}
          </button>
        </div>

        {/* Calendar/Map View */}
        {showMap ? (
          isMobile ? renderMobileView() : renderDesktopView()
        ) : (
          <div className="p-2 bg-white shadow-lg rounded-lg">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              locales={allLocales}
              locale={locale}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              events={filteredPromotions}
              eventClick={handleEventClick}
              height="auto"
              slotMinTime="08:00:00"
              slotMaxTime="22:00:00"
              contentHeight="auto"
            />
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedOffer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-10">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-purple-900 mb-4">{selectedOffer.title}</h2>
            <p><strong>Store:</strong> {selectedOffer.store}</p>
            <p><strong>Type:</strong> {selectedOffer.type}</p>
            <p><strong>Date:</strong> {formatDate(selectedOffer.start)}</p>
            <p><strong>Time:</strong> {formatTime(selectedOffer.start)} - {formatTime(selectedOffer.end)}</p>
            <p><strong>Description:</strong> {selectedOffer.description}</p>
            <button 
              onClick={() => setSelectedOffer(null)}
              className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition duration-300 w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Homepage;