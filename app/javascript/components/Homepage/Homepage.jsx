import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { format, addMonths } from 'date-fns';
import allLocales from '@fullcalendar/core/locales-all';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { debounce } from 'lodash';
import Cookies from 'js-cookie';

import 'leaflet/dist/leaflet.css';
import './Homepage.css';

const API_URL = "/api/v1";

function getPromotionsData(city, locale='en') { return axios.get(`${API_URL}/promotions.json?city_id=${city}&locale=${locale}`).then((response) => response.data); }
function getCitiesData() { return axios.get(`${API_URL}/cities.json`).then((response) => response.data); }

// Get today's date
const today = new Date();
// Get the date one month from today
const oneMonthLater = addMonths(today, 1);

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
      validRange={{
        start: today,               // The user can navigate from today
        end: oneMonthLater          // Until one month later
      }}
      dateSet={(info) => {
        const currentDate = info.start;
        if (currentDate > oneMonthLater) {
          // Navigate back if user attempts to go beyond the valid range
          info.view.calendar.prev();
        } else if (currentDate < today) {
          // Navigate forward if user attempts to go before today
          info.view.calendar.next();
        }
      }}
    />
  );
}

function MobileCalendar({ filteredPromotions, locale, handleEventClick }) {
  return (
    <FullCalendar
      plugins={[listPlugin, dayGridPlugin, interactionPlugin]}
      initialView="listWeek"
      views={{
        listWeek: { buttonText: 'week' }
      }}
      locales={allLocales}
      locale={locale}
      headerToolbar={{
        left: 'title',
        center: 'listWeek dayGridMonth',
        right: 'prev,next'
      }}
      titleFormat={{
        month: 'short',  // Display full month name
        day: 'numeric', // Display day of the month
        // Exclude 'year' to omit the year from the title
      }}
      events={filteredPromotions}
      eventClick={handleEventClick}
      height={'auto'}
      contentHeight="auto"
      validRange={{
        start: today,               // The user can navigate from today
        end: oneMonthLater          // Until one month later
      }}
      dateSet={(info) => {
        const currentDate = info.start;
        if (currentDate > oneMonthLater) {
          // Navigate back if user attempts to go beyond the valid range
          info.view.calendar.prev();
        } else if (currentDate < today) {
          // Navigate forward if user attempts to go before today
          info.view.calendar.next();
        }
      }}
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
  const [availableCities, setAvailableCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedCityName, setSelectedCityName] = useState('Warsaw');

  const getLanguageCookie = () => {
    const lang = Cookies.get("locale");
    if(lang) { return lang }
  };

  useEffect(() => {
    if(getLanguageCookie()) {
      setLocale(getLanguageCookie())
    }
  }, []);

  useEffect(() => {
    Cookies.set('locale', locale);
  }, [locale])

  useEffect(() => {
    getCitiesData().then((cities) => {
      setAvailableCities(cities);
      if (cities.length > 0) {
        const defaultCity = cities[0]; // Set the first city as the default
        setSelectedCity(defaultCity);
        setSelectedCityName(defaultCity.title); // Display city name in the dropdown
      }
    });    
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (selectedCity) {
      let mounted = true;
      getPromotionsData(selectedCity.id, locale).then((promotions) => {
        if (mounted) {
          console.log(promotions);

          const processedPromotions = promotions.map(({ ...rest }) => ({
            title: rest.title,
            description: rest.description,
            latitude: rest.storeCoordinates?.latitude || (Math.random() * (41 - 40) + 51.9),
            longitude: rest.storeCoordinates?.longitude || (Math.random() * (-73 - -74) + 20.4),
            ...rest,
          }));
          setPromotions(processedPromotions);
          setVisiblePromotions(processedPromotions);
        }
      });
      return () => (mounted = false);
    }
  }, [selectedCity, locale]);

  const filteredPromotions = promotions.filter(promo => 
    (promo.cityId === selectedCity?.id) 
    // &&
    // (selectedType === 'All' || promo.type === selectedType)
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
    console.log(filteredPromotions);

    const visiblePromos = filteredPromotions.filter(promo => 
      bounds.contains([promo.storeCoordinates?.latitude, promo.storeCoordinates?.longitude])
    );
    setVisiblePromotions(visiblePromos);
  };

  const debouncedHandleMapMoveEnd = debounce(handleMapMoveEnd, 300);

  const handlePromoClick = (promo) => {
    setSelectedOffer(promo);
    if (map) { map.flyTo([promo.storeCoordinates?.latitude, promo.storeCoordinates?.longitude], 13); }
  };

  const handleCitySelect = (city) => {
    setSelectedCity(JSON.parse(city));
    setSelectedCityName(JSON.parse(city).name);
    if (map) { map.flyTo([JSON.parse(city).latitude, JSON.parse(city).longitude], 13); }
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
          center={[selectedCity.coordinates?.latitude, selectedCity.coordinates?.longitude]}
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
  );

  const renderDesktopView = () => (
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
          center={[selectedCity.coordinates?.latitude, selectedCity.coordinates?.longitude]}
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
          <h1 className="text-2xl font-bold text-purple-900 mb-6 text-center">Kalendarz Promocji</h1>
          
          {/* Language Selector */}
          <div className="mb-6 text-right">
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              className="block rounded-md border-purple-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
            >
              <option value="en">English</option>
              <option value="pl">Polish</option>
            </select>
          </div>
        </div>

        {/* Filters and View Toggle */}
        <div className="flex gap-2 justify-between mb-6">
          <div className="flex gap-2">
            <select
              value={selectedCityName}
              onChange={(e) => handleCitySelect(e.target.options[e.target.selectedIndex].dataset.value)}
              className="w-full block rounded-md border-purple-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
            >
              {
                availableCities.map((city, index) => (
                  <option data-value={`{"id": "${city.id}", "name": "${city.title}", "latitude": "${city.coordinates.latitude}", "longitude": "${city.coordinates.longitude}"}`}>
                    {city.title}
                  </option>
                ))
              }
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-10" onClick={() => setSelectedOffer(null)}>
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
