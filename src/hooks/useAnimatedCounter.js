import { useState, useEffect } from 'react';

const useAnimatedCounter = (value, duration = 800) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = value / (duration / 16);
    const interval = setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplay(value);
        clearInterval(interval);
      } else {
        setDisplay(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(interval);
  }, [value, duration]);

  return display;
};

export default useAnimatedCounter;
