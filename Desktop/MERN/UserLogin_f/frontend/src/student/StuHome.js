import React, { useState } from 'react';
import { useLogout } from '../hooks/useLogout';
import { useAuthContext } from '../hooks/useAuthContext';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';

function StuHome() {
  const { user } = useAuthContext();
  const { logout } = useLogout();
  const [subject, setSubject] = useState('');
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [status, setStatus] = useState('');
  const [totalDay, setTotalDay] = useState(0);
  const [presentDay, setPresentDay] = useState(0);
  const [error, setError] = useState('');
  const studentId = user._id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('/api/attendance/studata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, subject, studentId }),
      });

      if (!response.ok) {
        setError('No data found');
        return;
      }
      const json = await response.json();
      setStatus(json.status);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };

  const attendanceCheck = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/attendance/monthly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, studentId }),
      });

      if (!response.ok) {
        setError('No data found');
        return;
      }
      const json = await response.json();
      setTotalDay(json.totalDays || 0);
      setPresentDay(json.presentDays || 0);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };

  const handleClick = () => {
    logout();
  };

  // Calculate Absent Days
  const absentDay = Math.max(totalDay - presentDay, 0); // Ensure no negative values

  // Data for Charts
  const attendanceData = [
    { name: 'Present Days', value: presentDay },
    { name: 'Absent Days', value: absentDay },
  ];

  // Colors for Pie Chart
  const COLORS = ['#4CAF50', '#FF5733'];

  return (
    <div>
      <h1>Student Dashboard</h1>
      <h2>Hello, {user.name}</h2>
      <br />
      <form onSubmit={handleSubmit}>
        <label>Select Subject:</label>
        <select onChange={(e) => setSubject(e.target.value)} value={subject}>
          <option value="">--select--</option>
          <option value="AI">AI</option>
          <option value="ML">ML</option>
          <option value="SE">SE</option>
        </select>
        <br />
        <label>Select date: </label>
        <input type="date" value={date} max={today} onChange={(e) => setDate(e.target.value)} />
        <br />
        <button type="submit">Search</button>
      </form>

      <h5>Status: {status ? <div>{status}</div> : <div>No Data</div>}</h5>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <br />

      <h3>Show Total Attendance</h3>
      <form onSubmit={attendanceCheck}>
        <label>Select Subject:</label>
        <select onChange={(e) => setSubject(e.target.value)} value={subject}>
          <option value="">--select--</option>
          <option value="AI">AI</option>
          <option value="ML">ML</option>
          <option value="SE">SE</option>
        </select>
        <button type="submit">Check</button>
      </form>

      {totalDay > 0 ? (
        <div>
          <p>
            Out of {totalDay} days, you were present on {presentDay} days and absent on {absentDay} days.
          </p>

          {/* Pie Chart */}
          <h3>Attendance Summary (Pie Chart)</h3>
          <PieChart width={300} height={300}>
            <Pie data={attendanceData} dataKey="value" cx="50%" cy="50%" outerRadius={80}>
              {attendanceData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
          
          <div style={{ marginLeft: '20px' }}>
              <h4>Legend:</h4>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ width: '20px', height: '20px', backgroundColor: '#4CAF50', marginRight: '10px' }}></div>
                <span>Present Days</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '20px', height: '20px', backgroundColor: '#FF5733', marginRight: '10px' }}></div>
                <span>Absent Days</span>
              </div>
          </div>
        </div>
      ) : (
        <p>No attendance data available.</p>
      )}
      <br />
      <button onClick={handleClick}>Log Out</button>
    </div>
  );
}

export default StuHome;
