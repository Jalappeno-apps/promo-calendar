import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import allLocales from '@fullcalendar/core/locales-all';
import { format, addMonths } from 'date-fns';
import React, { useState, useEffect, useRef } from 'react';

// Get today's date
const today = new Date();
// Get the date one month from today
const oneMonthLater = addMonths(today, 1);


export function MobileCalendar({ filteredPromotions, locale, handleEventClick }) {
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
      datesSet={(info) => {
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


export function DesktopCalendar({ filteredPromotions, locale, handleEventClick }) {
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
      datesSet={(info) => {
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
