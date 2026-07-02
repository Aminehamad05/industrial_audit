import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api.service';

interface CalendarEvent {
  id: string;
  date: string;
  kind: 'schedule' | 'audit';
  state: 'planned' | 'in_progress' | 'done' | 'failed_ko';
  scheduleId: number | null;
  auditId: number | null;
  matchType: 'scheduleId' | 'heuristic' | null;
  title: string;
  auditType: string | null;
  auditTarget: string | null;
  auditorLogin: string | null;
  auditorFullName: string | null;
  plantId: number | null;
  plantName: string | null;
  score: number | null;
}

interface PlantOption {
  idPlant: number;
  designationPlant: string | null;
}

interface AuditCalendarProps {
  scoped?: boolean;
}

const STATE_STYLES: Record<CalendarEvent['state'], string> = {
  planned: 'bg-slate-100 text-slate-700 border-slate-200',
  in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
  done: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  failed_ko: 'bg-red-100 text-red-800 border-red-300 ring-1 ring-red-200',
};

function buildMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month - 1, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: Array<{ date: string | null; day: number | null }> = [];

  for (let i = 0; i < startOffset; i++) cells.push({ date: null, day: null });
  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    cells.push({ date, day });
  }
  return cells;
}

export const AuditCalendar: React.FC<AuditCalendarProps> = ({ scoped = false }) => {
  const { t } = useLanguage();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [plantId, setPlantId] = useState('');
  const [plants, setPlants] = useState<PlantOption[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  useEffect(() => {
    api.plants.list().then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        setPlants(data.plants || data || []);
      }
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    api.schedules
      .calendar({
        year,
        month,
        plantId: plantId ? Number(plantId) : undefined,
      })
      .then(async (res) => {
        if (!res.ok) throw new Error();
        const data = await res.json();
        setEvents(data.events || []);
      })
      .catch(() => setError(t('err_fetch_calendar')))
      .finally(() => setLoading(false));
  }, [year, month, plantId, t]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of events) {
      const list = map.get(event.date) ?? [];
      list.push(event);
      map.set(event.date, list);
    }
    return map;
  }, [events]);

  const monthCells = useMemo(() => buildMonthGrid(year, month), [year, month]);

  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  const shiftMonth = (delta: number) => {
    const d = new Date(year, month - 1 + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth() + 1);
    setSelectedEvent(null);
    setSelectedDay(null);
  };

  const dayEvents = selectedDay ? eventsByDate.get(selectedDay) ?? [] : [];

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{t('tab_calendar')}</h2>
            <p className="text-slate-500 text-xs mt-0.5">
              {scoped ? t('calendar_scoped_desc') : t('calendar_desc')}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={plantId}
              onChange={(e) => setPlantId(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
            >
              <option value="">{t('all')} {t('col_plant').toLowerCase()}</option>
              {plants.map((p) => (
                <option key={p.idPlant} value={p.idPlant}>
                  {p.designationPlant || `Plant ${p.idPlant}`}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-xl p-1">
              <button onClick={() => shiftMonth(-1)} className="p-2 rounded-lg hover:bg-white cursor-pointer">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 text-sm font-bold text-slate-800 min-w-[140px] text-center capitalize">
                {monthLabel}
              </span>
              <button onClick={() => shiftMonth(1)} className="p-2 rounded-lg hover:bg-white cursor-pointer">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-5 text-xs">
          {(['planned', 'in_progress', 'done', 'failed_ko'] as const).map((state) => (
            <span key={state} className={`inline-flex items-center px-2.5 py-1 rounded-full border font-semibold ${STATE_STYLES[state]}`}>
              {t(`calendar_state_${state}`)}
            </span>
          ))}
          <span className="inline-flex items-center px-2.5 py-1 rounded-full border font-semibold bg-violet-50 text-violet-700 border-violet-200">
            {t('calendar_unscheduled_audit')}
          </span>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-hutchinson-red px-4 py-3 rounded-xl text-sm font-medium mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-16 flex justify-center">
            <svg className="animate-spin h-8 w-8 text-hutchinson-red" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-7 gap-2 mb-2">
              {[0, 1, 2, 3, 4, 5, 6].map((d) => (
                <div key={d} className="text-center text-[10px] font-bold uppercase tracking-wider text-slate-400 py-2">
                  {new Date(2024, 0, d + 1).toLocaleDateString(undefined, { weekday: 'short' })}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {monthCells.map((cell, idx) => {
                if (!cell.date) return <div key={`empty-${idx}`} className="min-h-[96px]" />;
                const dayEventsList = eventsByDate.get(cell.date) ?? [];
                const isToday = cell.date === `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                return (
                  <button
                    key={cell.date}
                    type="button"
                    onClick={() => {
                      setSelectedDay(cell.date);
                      setSelectedEvent(null);
                    }}
                    className={`min-h-[96px] rounded-xl border p-2 text-left transition-colors cursor-pointer ${
                      selectedDay === cell.date
                        ? 'border-hutchinson-blue bg-blue-50/40'
                        : 'border-slate-100 bg-slate-50/30 hover:bg-white'
                    } ${isToday ? 'ring-2 ring-hutchinson-blue/30' : ''}`}
                  >
                    <div className="text-xs font-bold text-slate-700 mb-1">{cell.day}</div>
                    <div className="flex flex-col gap-1">
                      {dayEventsList.slice(0, 3).map((event) => (
                        <span
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(event);
                            setSelectedDay(cell.date);
                          }}
                          className={`block truncate text-[10px] font-semibold px-1.5 py-0.5 rounded border ${STATE_STYLES[event.state]} ${
                            event.kind === 'audit' && !event.scheduleId ? 'border-dashed border-violet-300 bg-violet-50 text-violet-700' : ''
                          }`}
                        >
                          {event.title}
                        </span>
                      ))}
                      {dayEventsList.length > 3 && (
                        <span className="text-[10px] text-slate-400 font-semibold">+{dayEventsList.length - 3}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {(selectedEvent || (selectedDay && dayEvents.length > 0)) && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-4">
            {selectedEvent ? t('calendar_event_detail') : t('calendar_day_events')}
            {selectedDay && !selectedEvent ? ` — ${selectedDay}` : ''}
          </h3>

          {selectedEvent ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div><span className="text-slate-400 text-xs font-bold uppercase">{t('col_status')}</span><div className="font-bold mt-1">{t(`calendar_state_${selectedEvent.state}`)}</div></div>
              <div><span className="text-slate-400 text-xs font-bold uppercase">{t('col_type')}</span><div className="font-bold mt-1">{selectedEvent.auditType || '—'}</div></div>
              <div><span className="text-slate-400 text-xs font-bold uppercase">{t('audit_target')}</span><div className="font-bold mt-1">{selectedEvent.auditTarget || '—'}</div></div>
              <div><span className="text-slate-400 text-xs font-bold uppercase">{t('auditor')}</span><div className="font-bold mt-1">{selectedEvent.auditorFullName || selectedEvent.auditorLogin || '—'}</div></div>
              <div><span className="text-slate-400 text-xs font-bold uppercase">{t('col_plant')}</span><div className="font-bold mt-1">{selectedEvent.plantName || '—'}</div></div>
              <div><span className="text-slate-400 text-xs font-bold uppercase">{t('score')}</span><div className="font-bold mt-1">{selectedEvent.score !== null ? `${selectedEvent.score}%` : '—'}</div></div>
              {selectedEvent.scheduleId && (
                <div><span className="text-slate-400 text-xs font-bold uppercase">{t('tab_schedules')}</span><div className="font-bold mt-1">#{selectedEvent.scheduleId}</div></div>
              )}
              {selectedEvent.auditId && (
                <div><span className="text-slate-400 text-xs font-bold uppercase">{t('audit_id')}</span><div className="font-bold mt-1">#{selectedEvent.auditId}</div></div>
              )}
              {selectedEvent.matchType && (
                <div className="sm:col-span-2 text-xs text-slate-500">
                  {t('calendar_match_type')}: {selectedEvent.matchType === 'scheduleId' ? t('calendar_match_fk') : t('calendar_match_heuristic')}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {dayEvents.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => setSelectedEvent(event)}
                  className={`text-left p-3 rounded-xl border cursor-pointer hover:shadow-sm transition-shadow ${STATE_STYLES[event.state]}`}
                >
                  <div className="font-bold text-sm">{event.title}</div>
                  <div className="text-xs mt-1 opacity-80">
                    {event.auditorFullName || event.auditorLogin} · {event.plantName}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AuditCalendar;
