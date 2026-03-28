import React, { useState, useEffect, useMemo } from 'react';
import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Calendar, Filter, ArrowUpDown } from 'lucide-react';
import tideDataRaw from './data/tide_data.json';

const TideTable = ({ data, onSort, sortConfig }) => {
  const getSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? '↑' : '↓';
    }
    return '↕';
  };

  return (
    <div className="glass-panel animate-fade-in delay-3" style={{ overflowX: 'auto' }}>
      <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <ArrowUpDown size={20} className="text-accent" /> Tide Extremes
      </h3>
      <table className="tide-table">
        <thead>
          <tr>
            <th onClick={() => onSort('date')}>Date {getSortIcon('date')}</th>
            <th>High Tides</th>
            <th>Low Tides</th>
            <th onClick={() => onSort('maxHeight')}>Max Height {getSortIcon('maxHeight')}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((day, idx) => {
            const maxHeight = Math.max(...day.highTides.map(t => t.height));
            return (
              <tr key={idx}>
                <td>{day.date}</td>
                <td>
                  {day.highTides.map((t, i) => (
                    <div key={i} style={{ marginBottom: '4px' }}>
                      <span className="badge badge-high">{t.time}</span> {t.height}m
                    </div>
                  ))}
                </td>
                <td>
                  {day.lowTides.map((t, i) => (
                    <div key={i} style={{ marginBottom: '4px' }}>
                      <span className="badge badge-low">{t.time}</span> {t.height}m
                    </div>
                  ))}
                </td>
                <td style={{ fontWeight: 'bold', color: 'var(--accent)' }}>
                  {maxHeight > -Infinity ? maxHeight + 'm' : '-'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel" style={{ padding: '10px' }}>
        <p style={{ margin: 0, fontWeight: 'bold' }}>{label}</p>
        <p style={{ margin: 0, color: 'var(--accent)' }}>Height: {payload[0].value}m</p>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const [filterType, setFilterType] = useState('day'); // day, week, month, year
  const [selectedDate, setSelectedDate] = useState('2026-03-28'); // default requested
  
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'asc' });

  // Filter Data
  const filteredData = useMemo(() => {
    const targetDate = parseISO(selectedDate);
    
    return tideDataRaw.filter(day => {
      const dayDate = parseISO(day.date);
      if (filterType === 'day') {
        return day.date === selectedDate;
      } else if (filterType === 'week') {
        return isWithinInterval(dayDate, { start: startOfWeek(targetDate), end: endOfWeek(targetDate) });
      } else if (filterType === 'month') {
        return isWithinInterval(dayDate, { start: startOfMonth(targetDate), end: endOfMonth(targetDate) });
      } else if (filterType === 'year') {
        return isWithinInterval(dayDate, { start: startOfYear(targetDate), end: endOfYear(targetDate) });
      }
      return true;
    });
  }, [selectedDate, filterType]);

  // Sort Data
  const sortedData = useMemo(() => {
    let sortableItems = [...filteredData];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (sortConfig.key === 'date') {
          return sortConfig.direction === 'asc' 
            ? a.date.localeCompare(b.date)
            : b.date.localeCompare(a.date);
        } else if (sortConfig.key === 'maxHeight') {
          const aMax = Math.max(...a.highTides.map(t => t.height), -Infinity);
          const bMax = Math.max(...b.highTides.map(t => t.height), -Infinity);
          return sortConfig.direction === 'asc' ? aMax - bMax : bMax - aMax;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredData, sortConfig]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Preparation for Chart
  const chartData = useMemo(() => {
    if (filterType === 'day' && filteredData.length === 1) {
      // 24 hours view
      return filteredData[0].hours.map((val, i) => ({
        time: `${i}:00`,
        height: val
      }));
    } else {
      // Aggregate view (Max/Min per day)
      return sortedData.map(day => {
        const max = Math.max(...day.highTides.map(t => t.height));
        const min = Math.min(...day.lowTides.map(t => t.height));
        return {
          time: format(parseISO(day.date), 'MMM dd'),
          maxHeight: max > -Infinity ? max : null,
          minHeight: min < Infinity ? min : null
        };
      });
    }
  }, [filteredData, sortedData, filterType]);

  return (
    <div className="app-container">
      <header className="header animate-fade-in">
        <div>
          <h1>Tide Visualizer</h1>
          <p>Explore Vung Tau tidal data with ease</p>
        </div>
      </header>

      <div className="controls animate-fade-in delay-1">
        <div className="control-group">
          <Calendar size={20} color="var(--text-muted)"/>
          <input 
            type="date" 
            className="date-picker" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value || '2026-03-28')}
            min="2026-01-01" max="2026-12-31"
          />
        </div>
        
        <div className="control-group" style={{ marginLeft: 'auto' }}>
          <Filter size={20} color="var(--text-muted)"/>
          <button className={`btn ${filterType === 'day' ? 'active' : ''}`} onClick={() => setFilterType('day')}>Day</button>
          <button className={`btn ${filterType === 'week' ? 'active' : ''}`} onClick={() => setFilterType('week')}>Week</button>
          <button className={`btn ${filterType === 'month' ? 'active' : ''}`} onClick={() => setFilterType('month')}>Month</button>
          <button className={`btn ${filterType === 'year' ? 'active' : ''}`} onClick={() => setFilterType('year')}>Year</button>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="glass-panel animate-fade-in delay-2">
          <h3 style={{ marginBottom: '1.5rem' }}>
            {filterType === 'day' ? 'Hourly Tide Levels' : 'Tide Extemities Over Time'}
          </h3>
          <div className="chart-container">
            {chartData.length === 0 ? (
              <div className="empty-state">
                <p>No data available for this range</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                {filterType === 'day' ? (
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorHeight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis dataKey="time" stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)'}} />
                    <YAxis stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)'}} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="height" stroke="#3b82f6" fillOpacity={1} fill="url(#colorHeight)" />
                  </AreaChart>
                ) : (
                  <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                     <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                     <XAxis dataKey="time" stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)'}} />
                     <YAxis stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)'}} />
                     <Tooltip content={<CustomTooltip />} />
                     <Line type="monotone" dataKey="maxHeight" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} name="High Tide" />
                     <Line type="monotone" dataKey="minHeight" stroke="#10b981" strokeWidth={3} dot={{r: 4}} name="Low Tide" />
                  </LineChart>
                )}
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <TideTable data={sortedData} onSort={handleSort} sortConfig={sortConfig} />
      </div>
    </div>
  );
};

export default Dashboard;
