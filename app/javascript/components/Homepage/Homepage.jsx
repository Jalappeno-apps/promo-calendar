import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { format } from 'date-fns';
import allLocales from '@fullcalendar/core/locales-all';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { debounce } from 'lodash';
import 'leaflet/dist/leaflet.css';
import './Homepage.css';

const API_URL = "/api/v1/promotions.json";

function getAPIData() { return axios.get(API_URL).then((response) => response.data); }

function DesktopCalendar({ filteredPromotions, locale, handleEventClick }) {
  return (
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
      contentHeight="800"
      slotMinTime="00:00:00"
      slotMaxTime="24:00:00"
      scrollTime="00:00:00"
      allDaySlot={false}
      height={800}
      slotDuration="00:30:00"
      expandRows={true}
    />
  );
}

function MobileCalendar({ filteredPromotions, locale, handleEventClick }) {
  return (
    <FullCalendar
      plugins={[listPlugin, dayGridPlugin, interactionPlugin]}
      initialView="listWeek"
      locales={allLocales}
      locale={locale}
      headerToolbar={{
        left: 'prev,next',
        center: 'title',
        right: 'today'
      }}
      events={filteredPromotions}
      eventClick={handleEventClick}
      height={'auto'}
      contentHeight="auto"
    />
  );
}

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('../marker.png'),
  iconUrl: require('../marker.png'),
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
  const [map, setMap] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [selectedCity, setSelectedCity] = useState('warsaw');

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
        const processedPromotions = promotions.map(({ translations, ...rest }) => ({
          title: translations[locale].title,
          description: translations[locale].description,
          latitude: rest.latitude || (Math.random() * (41 - 40) + 51.9),
          longitude: rest.longitude || (Math.random() * (-73 - -74) + 20.4),
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
    if (map) { map.flyTo([promo.latitude, promo.longitude], 13); }
  };

  const handleCitySelect = (city) => {
    setSelectedCity(JSON.parse(city));
    if (map) { map.flyTo([selectedCity.latitude, selectedCity.longitude], 13); }
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
          center={[52.2297, 21.0122]} 
          zoom={11} 
          style={{ height: '100%', width: '100%' }}
          ref={setMap}
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
    <div className="z-10 flex flex-col md:flex-row" style={{ height: '800px' }}>
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
      <div className="z-10  w-full md:w-2/3 h-full">
        <MapContainer 
          center={[52.2297, 21.0122]} 
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

  return (
    <div className="min-h-screen bg-purple-50 p-1">
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
              value={selectedCity}
              onChange={(e) => handleCitySelect(e.target.options[e.target.selectedIndex].dataset.value)}
              className="w-full block rounded-md border-purple-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
            >
              <option data-value='{"latitude": "4", "longitude": "55"}'>All Stores</option>
              <option data-value='{"latitude": "42", "longitude": "55"}'>Store A</option>
              <option data-value='{"latitude": "1", "longitude": "55"}'>Store B</option>
              <option data-value='{"latitude": "65", "longitude": "55"}'>Store C</option>
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
            {isMobile ? (
              <MobileCalendar
                filteredPromotions={filteredPromotions}
                locale={locale}
                handleEventClick={handleEventClick}
              />
            ) : (
              <DesktopCalendar
                filteredPromotions={filteredPromotions}
                locale={locale}
                handleEventClick={handleEventClick}
              />
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedOffer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-10">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
            <button 
              onClick={() => setSelectedOffer(null)}
              className="absolute right-2 top-2 bg-purple-600 text-white text-sm w-8 h-8 ms-auto inline-flex justify-center items-center rounded hover:bg-purple-700 transition duration-300"
            >
             <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
              </svg>
              <span className="sr-only">Close modal</span> 
            </button>
            <h2 className="text-xl font-bold text-purple-900 mb-4">{selectedOffer.title}</h2>
            <p><strong>Store:</strong> {selectedOffer.storeName}</p>
            {
              selectedOffer.recurring ?
              <p><strong>Type:</strong> {selectedOffer.recurrence_frequency}</p> :
              ''
            }
            <p><strong>Date:</strong> {formatDate(selectedOffer.start)}</p>
            <p><strong>Time:</strong> {formatTime(selectedOffer.start)} - {formatTime(selectedOffer.end)}</p>
            <p><strong>Description:</strong> {selectedOffer.description}</p>
            <div className="flex gap-2 jusify-between w-full">
              <a 
                className="cursor-pointer mt-4 text-center bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition duration-300 w-full"
              >
                Menu
              </a>
              <a 
                className="cursor-pointer mt-4 text-center bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition duration-300 w-full"
              >
                Website
              </a>
              <a 
                className="cursor-pointer mt-4 text-center bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition duration-300 w-full"
              >
                Instagram
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Homepage;
