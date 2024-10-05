import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { format } from 'date-fns';
import allLocales from '@fullcalendar/core/locales-all'; // Import all locales
import axios from 'axios';
import './Homepage.css';

const API_URL = "/api/v1/promotions";

function getAPIData() { return axios.get(API_URL).then((response) => response.data); }

function Homepage() {
  const [promotions, setPromotions] = useState([]);
  const [selectedStore, setSelectedStore] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [locale, setLocale] = useState('en'); // Add state for selected locale

  useEffect(() => {
    let mounted = true;
    getAPIData().then((promotions) => {
      if (mounted) {
        setPromotions(
          promotions.map(({ translations, starts_at, ends_at, ...rest }) => ({
            title: translations[locale].title,
            description: translations.en.description,
            start: starts_at,
            end: ends_at,
            ...rest,
          }))
        );
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

  return (
    <div className="min-h-screen bg-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-purple-900 mb-6 text-center">Weekly Store Promotions</h1>
        
        {/* Language Selector */}
        <div className="mb-6 text-right">
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value)} // Handle locale change
            className="block rounded-md border-purple-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
          >
            <option value="en">English</option>
            <option value="pl">Polish</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="zh-cn">中文</option>
            <option value="ja">日本語</option>
            {/* Add more language options as needed */}
          </select>
        </div>

        {/* Filters */}
        <div className="flex gap-2 space-y-4 md:space-y-0 md:flex-nowrap justify-between mb-6">
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            className="block w-1/2 md:w-auto rounded-md border-purple-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
          >
            <option value="All">All Stores</option>
            <option value="Store A">Store A</option>
            <option value="Store B">Store B</option>
            <option value="Store C">Store C</option>
          </select>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="block w-1/2 md:w-auto rounded-md border-purple-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
          >
            <option value="All">All Types</option>
            <option value="Discount">Discount</option>
            <option value="BOGO">BOGO</option>
            <option value="Clearance">Clearance</option>
          </select>
        </div>

        {/* Calendar */}
        <div className="p-2 bg-white shadow-lg rounded-lg">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            locales={allLocales} // Load all locales
            locale={locale}      // Set the selected locale
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
