
import { GISTDAHotspot, GISTDAStats, GISTDAData } from '../useGISTDAData';

export const calculateGISTDAStats = (
  combinedHotspots: GISTDAHotspot[],
  modisData?: GISTDAData,
  viirs3DaysData?: GISTDAData,
  viirs1DayData?: GISTDAData
): GISTDAStats => {
  const modisCount = modisData?.features?.length || 0;
  const viirsCount = viirs3DaysData?.features?.length || 0;
  const viirs1DayCount = viirs1DayData?.features?.length || 0;
  const totalHotspots = combinedHotspots.length;
  
  // Calculate high confidence count
  const highConfidenceCount = combinedHotspots.filter(h => {
    const confidence = h.properties?.confidence || h.CONFIDENCE;
    if (typeof confidence === 'number') {
      return confidence >= 80;
    } else if (typeof confidence === 'string') {
      return confidence === 'nominal' || confidence === 'high';
    }
    return false;
  }).length;
  
  // Calculate average confidence
  const numericConfidences = combinedHotspots
    .map(h => h.properties?.confidence || h.CONFIDENCE)
    .filter(c => typeof c === 'number') as number[];
  
  const averageConfidence = numericConfidences.length > 0 
    ? numericConfidences.reduce((sum, c) => sum + c, 0) / numericConfidences.length 
    : 0;

  return {
    totalHotspots,
    modisCount,
    viirsCount,
    highConfidenceCount,
    averageConfidence: Math.round(averageConfidence),
    last24Hours: viirs1DayCount,
    last7Days: totalHotspots
  };
};
