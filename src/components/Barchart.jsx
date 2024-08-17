import {array, number} from 'prop-types';
import React, {useEffect, useState} from 'react';

import useLocalStore from '../utils/useLocalStore.js';

function getColors(value, theme) {
  if (theme === 'dark') {
    if (!value) {
      return {
        text: '#fff',
        background: 'black',
      };
    } else if (value <= 3) {
      return {
        text: '#fff',
        background: '#374151', // 700
      };
    } else if (value <= 6) {
      return {
        text: '#fff',
        background: '#4b5563', // 600
      };
    } else if (value <= 9) {
      return {
        text: 'white',
        background: '#6b7280', // 500
      };
    } else if (value <= 12) {
      return {
        text: '#333',
        background: '#9ca3af', // 400
      };
    } else if (value <= 15) {
      return {
        text: '#333',
        background: '#d1d5db', // 300
      };
    } else if (value <= 18) {
      return {
        text: '#000',
        background: '#e5e7eb', // 200
      };
    } else if (value <= 21) {
      return {
        text: '#000',
        background: '#f3f4f6', // 100
      };
    } else {
      return {
        text: '#000',
        background: '#f9fafb',
      };
    }
  } else {
    if (!value) {
      return {
        text: '#222',
        background: 'white',
      };
    } else if (value <= 3) {
      return {
        text: '#333',
        background: '#e5e7eb', // 200
      };
    } else if (value <= 6) {
      return {
        text: '#333',
        background: '#d1d5db', // 300
      };
    } else if (value <= 9) {
      return {
        text: 'white',
        background: '#9ca3af', // 400
      };
    } else if (value <= 12) {
      return {
        text: 'white',
        background: '#6b7280', // 500
      };
    } else if (value <= 15) {
      return {
        text: 'white',
        background: '#52525b', // 600
      };
    } else if (value <= 18) {
      return {
        text: 'white',
        background: '#374151', // 700
      };
    } else if (value <= 21) {
      return {
        text: 'white',
        background: '#1f2937', // 800
      };
    } else {
      return {
        text: 'white',
        background: '#18181b', // 900
      };
    }
  }
}

function compressValues(values, oldMin, oldMax, newMin, newMax) {
  // Apply linear transformation to all values
  return values.map(oldValue => {
    if (oldValue === 0) {
      return 0;
    } else if (oldMin === oldMax) {
      return newMin;
    } else {
      return newMin + ((oldValue - oldMin) * (newMax - newMin)) / (oldMax - oldMin);
    }
  });
}

const BarChart = ({values, min, max}) => {
  const [isInitialized, setIsInitialized] = useState(false);

  const theme = useLocalStore(st => st.theme);

  useEffect(() => {
    setIsInitialized(true);

    return () => {
      setIsInitialized(false);
    };
  }, []);

  const minPixels = 24;
  const maxPixels = 66;
  const pixelValues = compressValues(values, min, max, minPixels, maxPixels);

  // Make columns flex based on a 1/2 width container

  return (
    <div className={`flex w-full items-end`} style={{height: 66}}>
      {pixelValues.map((pixelValue, index) => {
        return (
          <div
            key={index}
            style={{
              width: '100%',
              marginLeft: '2px',
              borderRadius: '2px',
              backgroundColor: getColors(values[index], theme).background,
              height: isInitialized ? `${pixelValue}px` : '0px',
              color: getColors(values[index], theme).text,
              fontWeight: '500',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              transition: `height 0.25s ease ${index * 0.25}s`,
              opacity: index === pixelValues.length - 1 ? '0.6' : '1', // de-emphasize deload week
            }}
          >
            <span
              style={{
                transition: `opacity 0.25s ease ${index * 0.25}s`,
                opacity: isInitialized ? '100' : '0',
              }}
            >
              {values[index]}
            </span>
          </div>
        );
      })}
    </div>
  );
};

BarChart.propTypes = {
  values: array.isRequired,
  min: number.isRequired,
  max: number.isRequired,
};

export default BarChart;
