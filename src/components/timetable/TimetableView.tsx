import React, { useState } from 'react';
import {
  CalendarDays,
  Clock,
  MapPin,
  User,
  BookOpen,
  Filter,
} from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { TimetableSlot } from '../../types';

export const TimetableView: React.FC = () => {
  const [timetable] = useState<TimetableSlot[]>(() => StorageService.getTimetable());
  const [selectedDay, setSelectedDay] = useState<string>('All');

  const days = ['All', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const filteredSlots = timetable.filter(
    (slot) => selectedDay === 'All' || slot.day === selectedDay
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Department Weekly Timetable & Room Schedule
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            5th Semester B.Tech Computer Science & Engineering · Lecture Halls & Laboratories
          </p>
        </div>

        {/* Day Selector Segmented Control */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                selectedDay === day
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSlots.map((slot) => (
          <div
            key={slot.id}
            className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Day & Time header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-sm">
                  {slot.day}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-mono font-medium text-slate-600">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{slot.time}</span>
                </span>
              </div>

              {/* Subject Info */}
              <div>
                <span className="text-xs font-mono font-bold text-slate-900 block">
                  {slot.subjectCode}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5 leading-snug">
                  {slot.subjectName}
                </h3>
              </div>
            </div>

            {/* Room & Instructor footer */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1 text-slate-700 font-medium">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate max-w-[130px]">{slot.facultyName}</span>
              </span>

              <span className="flex items-center gap-1 font-mono font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-sm">
                <MapPin className="w-3 h-3 text-slate-500" />
                <span>{slot.roomNumber}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
