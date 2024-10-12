import React, { useState, useEffect, useRef } from 'react';
import { format, addMonths } from 'date-fns';
import { MobileCalendar, DesktopCalendar } from './Calendars.jsx';
import { MobileMap, DesktopMap } from './Maps.jsx';

import axios from 'axios';
import { debounce } from 'lodash';
import Cookies from 'js-cookie';

import './styles/Homepage.css';

const API_URL = "/api/v1";

function getPromotionsData(city, locale='en') { return axios.get(`${API_URL}/promotions.json?city_id=${city}&locale=${locale}`).then((response) => response.data); }
function getCitiesData() { return axios.get(`${API_URL}/cities.json`).then((response) => response.data); }

// Get today's date
const today = new Date();
// Get the date one month from today
const oneMonthLater = addMonths(today, 1);

function Homepage() {
  const [navbarOpen, setNavbarOpen] = useState(false);
  const [promotions, setPromotions] = useState([]);
  const [visiblePromotions, setVisiblePromotions] = useState([]);
  // const [selectedStore, setSelectedStore] = useState('All');
  // const [selectedType, setSelectedType] = useState('All');
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
      console.log(window.innerWidth);
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);

    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  useEffect(() => {
    if (selectedCity) {
      let mounted = true;
      getPromotionsData(selectedCity.id, locale).then((promotions) => {
        if (mounted) {
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

  const filteredPromotions = promotions.filter(promo => (promo.cityId === selectedCity?.id));

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

  return (
    <div>
      <div className="max-w-7xl mx-auto">
        <nav className="max-w-7xl mx-auto bg-white rounded-md shadow md:my-4 my-2 dark:bg-gray-800">
          <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-2 md:p-4">
            <a href="https://kalendarzpromocji.com/" className="flex items-center space-x-3 rtl:space-x-reverse">
              <img src="logo.png" className="md:block hidden h-10" alt="kalendarzpromocji Logo" />
              <img src="logo-mobile.png" className="md:hidden h-7" alt="kalendarzpromocji Logo" />
            </a>

            <button onClick={() => setNavbarOpen(!navbarOpen)} data-collapse-toggle="navbar-default" type="button" className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="navbar-default" aria-expanded="false">
              <span className="sr-only">Open main menu</span>
              <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15"/>
              </svg>
            </button>
            <div className={"w-full md:block md:w-auto" + (navbarOpen ? " block" : " hidden")} id="navbar-default">
              <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
                <li>
                  <select
                    value={locale}
                    onChange={(e) => setLocale(e.target.value)}
                    className="w-full block rounded-md border-purple-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                  >
                    <option value="en">English</option>
                    <option value="pl">Polish</option>
                  </select>
                </li>
              </ul>
            </div>
          </div>
        </nav>

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
                  <option key={city.id} data-value={`{"id": "${city.id}", "name": "${city.title}", "latitude": "${city.coordinates.latitude}", "longitude": "${city.coordinates.longitude}"}`}>
                    {city.title}
                  </option>
                ))
              }
            </select>

            {/*<select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full block rounded-md border-purple-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
            >
              <option value="All">All Types</option>
              <option value="Discount">Discount</option>
              <option value="BOGO">BOGO</option>
              <option value="Clearance">Clearance</option>
            </select>*/}
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
          isMobile ? 
          <MobileMap 
            isMapExpanded={isMapExpanded}
            toggleMapExpansion={toggleMapExpansion}
            selectedCity={selectedCity}
            setMap={setMap}
            handleMapMoveEnd={handleMapMoveEnd}
            debouncedHandleMapMoveEnd={debouncedHandleMapMoveEnd}
            filteredPromotions={filteredPromotions}
            visiblePromotions={visiblePromotions}
            handlePromoClick={handlePromoClick}
          /> : <DesktopMap
            isMapExpanded={isMapExpanded}
            toggleMapExpansion={toggleMapExpansion}
            selectedCity={selectedCity}
            setMap={setMap}
            handleMapMoveEnd={handleMapMoveEnd}
            debouncedHandleMapMoveEnd={debouncedHandleMapMoveEnd}
            filteredPromotions={filteredPromotions}
            visiblePromotions={visiblePromotions}
            handlePromoClick={handlePromoClick}
          />)
        : (
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
            <div className="flex md:gap-2 gap-1 jusify-between w-full">
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
