import React, { useMemo } from 'react';
import { Marker, Popup, useMap } from 'react-map-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export interface MapLibreMarkerProps {
    longitude: number;
    latitude: number;
    color?: string;
    onClick?: () => void;
    children?: React.ReactNode;
    popupContent?: React.ReactNode;
    showPopup?: boolean;
    onClosePopup?: () => void;
    zIndex?: number;
    className?: string; // For custom styling
}

export const MapLibreMarker: React.FC<MapLibreMarkerProps> = ({
    longitude,
    latitude,
    color = '#FF0000',
    onClick,
    children,
    popupContent,
    showPopup = false,
    onClosePopup,
    zIndex,
    className
}) => {
    const { current: map } = useMap();

    const handleMarkerClick = (e: any) => {
        // Stop propagation to prevent map click events
        e.originalEvent.stopPropagation();
        if (onClick) {
            onClick();
        }
    };

    return (
        <>
            <Marker
                longitude={longitude}
                latitude={latitude}
                anchor="bottom"
                onClick={handleMarkerClick}
                style={{ zIndex }}
                className={className}
                color={children ? undefined : color} // Only use default color if no children (custom element) provided
            >
                {children}
            </Marker>

            {showPopup && popupContent && (
                <Popup
                    longitude={longitude}
                    latitude={latitude}
                    anchor="bottom"
                    offset={children ? 40 : 25} // Adjust offset based on marker size
                    onClose={onClosePopup}
                    closeOnClick={false}
                    className="z-[2000]"
                >
                    {popupContent}
                </Popup>
            )}
        </>
    );
};
