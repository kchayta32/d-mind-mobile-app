import { useState } from 'react';
import { DisasterType } from '../types';

export const useDisasterMapState = () => {
  const [selectedType, setSelectedType] = useState<DisasterType>('wildfire');
  const [magnitudeFilter, setMagnitudeFilter] = useState(1.0);
  const [humidityFilter, setHumidityFilter] = useState(0);
  const [rainTimeFilter, setRainTimeFilter] = useState('realtime');
  const [pm25Filter, setPm25Filter] = useState(0);
  const [wildfireTimeFilter, setWildfireTimeFilter] = useState<'1day' | '3days' | '7days' | '30days'>('1day');
  const [showBurnFreq, setShowBurnFreq] = useState(false);
  const [showBurnScar, setShowBurnScar] = useState(false);
  const [droughtLayers, setDroughtLayers] = useState<string[]>(['dri']);
  const [floodTimeFilter, setFloodTimeFilter] = useState<'1day' | '3days' | '7days' | '30days'>('3days');
  const [showFloodFrequency, setShowFloodFrequency] = useState(true);
  const [showWaterHyacinth, setShowWaterHyacinth] = useState(false);
  const [tileFormat, setTileFormat] = useState<'wmts' | 'tms'>('tms');
  const [layerOpacity, setLayerOpacity] = useState(0.7);

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
    showBurnScar,
    setShowBurnScar,
    droughtLayers,
    setDroughtLayers,
    floodTimeFilter,
    setFloodTimeFilter,
    showFloodFrequency,
    setShowFloodFrequency,
    showWaterHyacinth,
    setShowWaterHyacinth,
    tileFormat,
    setTileFormat,
    layerOpacity,
    setLayerOpacity
  };
};
