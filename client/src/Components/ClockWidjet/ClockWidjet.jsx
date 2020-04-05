import React, { useState, useEffect } from 'react';
import Clock from 'react-clock';

const ClockWidjet = () => {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="clockWrapper">
      <Clock value={date} />
    </div>
  );
};

export default ClockWidjet;
