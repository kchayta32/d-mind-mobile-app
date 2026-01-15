
import { useState } from 'react';
import { DisasterType } from '../types';

export const useDisasterMapState = () => {
  const [selectedType, setSelectedType] = useState<DisasterType>('wildfire');
  const [magnitudeFilter, setMagnitudeFilter] = useState(1.0);
  const [humidityFilter, setHumidityFilter] = useState(0);
  const [rainTimeFilter, setRainTimeFilter] = useState('realtime');
  const [pm25Filter, setPm25Filter] = useState(0);
  const [wildfireTimeFilter, setWildfireTimeFilter] = useState('3days');
  const [showBurnFreq, setShowBurnFreq] = useState(false);
  const [droughtLayers, setDroughtLayers] = useState(['dri']);
  const [floodTimeFilter, setFloodTimeFilter] = useState('3days');
  const [showFloodFrequency, setShowFloodFrequency] = useState(true);

  return {
    selectedType,
    setSelectedType,
    magnitudeFilter,
    setMagnitudeFilter,
    humidityFilter,
    setHumidityFilter,
    rainTimeFilter,
    setRainTimeFilter,
    pm25Filter,
    setPm25Filter,
    wildfireTimeFilter,
    setWildfireTimeFilter,
    showBurnFreq,
    setShowBurnFreq,
    droughtLayers,
    setDroughtLayers,
    floodTimeFilter,
    setFloodTimeFilter,
    showFloodFrequency,
    setShowFloodFrequency,
  };
};
