import React from 'react';
import { GoogleMap, Marker, InfoWindow, DirectionsRenderer } from '@react-google-maps/api';

/**
 * Map component to display the map and markers
 * @param {Object} props - The component props
 * @param {boolean} props.isLoaded - Indicates if Google Maps API is loaded
 * @param {Object} props.map - The map instance
 * @param {function} props.setMap - Function to set the map instance
 * @param {Object} props.userLocation - The user's location
 * @param {Array} props.stations - The list of subway stations
 * @param {Array} props.nearestStations - The list of nearest stations
 * @param {Object} props.selectedStation - The selected station
 * @param {function} props.handleMarkerClick - Function to handle marker clicks
 * @param {function} props.generateGoogleMapsURL - Function to generate Google Maps URL
 * @param {Object} props.directions - The directions result
 * @param {string} props.travelMode - The selected travel mode
 * @param {function} props.setSelectedStation - Function to set the selected station
 * @returns {JSX.Element} The rendered map component
 */
const Map = ({
  isLoaded,
  map,
  setMap,
  userLocation,
  stations,
  nearestStations,
  selectedStation,
  handleMarkerClick,
  generateGoogleMapsURL,
  directions,
  travelMode,
  setSelectedStation,
}) => (
  <>
    {isLoaded && (
      <GoogleMap
        id="map"
        mapContainerStyle={{ width: '100%', height: '50vh' }}
        zoom={13.2}
        center={userLocation || { lat: 55.864, lng: -4.277 }}
        options={{ streetViewControl: false }}
        onLoad={(mapInstance) => setMap(mapInstance)}
      >
        {userLocation && (
          <Marker
            position={userLocation}
            icon={{
              url: `${process.env.PUBLIC_URL}/current-location.png`,
              scaledSize: new window.google.maps.Size(30, 45),
            }}
          />
        )}

        {stations.map((station, index) => {
          const isNearest = nearestStations.some((nearest) => nearest.name === station.name);
          if (isNearest) {
            return null;
          }
          return (
            <Marker
              key={index}
              position={{ lat: station.lat, lng: station.lng }}
              title={station.name}
              icon={{
                url: `${process.env.PUBLIC_URL}/subway-marker.png`,
                scaledSize: new window.google.maps.Size(30, 45),
              }}
              onClick={() => handleMarkerClick(station)}
            >
              {station === selectedStation && (
                <InfoWindow onCloseClick={() => setSelectedStation(null)}>
                  <div style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.5', textAlign: 'left', padding: '10px 0' }}>
                    <h2 style={{ fontSize: '16px', margin: '0 0 5px' }}>{station.name}</h2>
                    <p style={{ margin: '5px 0' }}><strong>Address:</strong> {station.address}</p>
                    <p style={{ margin: '5px 0' }}><strong>Accessibility:</strong> {station.accessibility}</p>
                    <p style={{ margin: '5px 0' }}><strong>Parking:</strong> {station.parking}</p>
                    <p style={{ margin: '5px 0' }}><strong>Bike Rack:</strong> {station.bikeRack}</p>
                    <p style={{ margin: '5px 0' }}><strong>Opening Times:</strong> Monday to Saturday: {station.schedule.openingTimes.mondayToSaturday}, Sunday: {station.schedule.openingTimes.sunday}</p>
                    <p style={{ margin: '5px 0' }}><strong>Train Frequency:</strong> On-Peak: {station.schedule.onPeakFrequency}, Off-Peak: {station.schedule.offPeakFrequency}</p>
                    <a
                      href={generateGoogleMapsURL({ lat: station.lat, lng: station.lng })}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'inline-block', marginTop: '10px', padding: '10px', backgroundColor: '#4285F4', color: '#fff', textDecoration: 'none', borderRadius: '4px' }}
                    >
                      Open on Google Maps
                    </a>
                  </div>
                </InfoWindow>
              )}
            </Marker>
          );
        })}

        {nearestStations.map((station, index) => {
          let iconUrl = '';
          switch (index) {
            case 0:
              iconUrl = `${process.env.PUBLIC_URL}/first-nearest.png`;
              break;
            case 1:
              iconUrl = `${process.env.PUBLIC_URL}/second-nearest.png`;
              break;
            case 2:
              iconUrl = `${process.env.PUBLIC_URL}/third-nearest.png`;
              break;
            default:
              iconUrl = `${process.env.PUBLIC_URL}/subway-marker.png`;
          }
          return (
            <Marker
              key={station.name}
              position={{ lat: station.lat, lng: station.lng }}
              title={station.label}
              icon={{
                url: iconUrl,
                scaledSize: new window.google.maps.Size(30, 45),
              }}
              onClick={() => handleMarkerClick(station)}
            >
              {station === selectedStation && (
                <InfoWindow onCloseClick={() => setSelectedStation(null)}>
                  <div style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.5', textAlign: 'left' }}>
                    <h2 style={{ fontSize: '16px', margin: '0 0 5px' }}>{station.label}</h2>
                    <p style={{ margin: '5px 0' }}><strong>Address:</strong> {station.address}</p>
                    <p style={{ margin: '5px 0' }}><strong>Accessibility:</strong> {station.accessibility}</p>
                    <p style={{ margin: '5px 0' }}><strong>Parking:</strong> {station.parking}</p>
                    <p style={{ margin: '5px 0' }}><strong>Bike Rack:</strong> {station.bikeRack}</p>
                    <p style={{ margin: '5px 0' }}><strong>Opening Times:</strong> Monday to Saturday: {station.schedule.openingTimes.mondayToSaturday}, Sunday: {station.schedule.openingTimes.sunday}</p>
                    <p style={{ margin: '5px 0' }}><strong>Train Frequency:</strong> On-Peak: {station.schedule.onPeakFrequency}, Off-Peak: {station.schedule.offPeakFrequency}</p>
                    <a
                      href={generateGoogleMapsURL({ lat: station.lat, lng: station.lng })}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'inline-block', marginTop: '10px', padding: '10px', backgroundColor: '#4285F4', color: '#fff', textDecoration: 'none', borderRadius: '4px' }}
                    >
                      Open on Google Maps
                    </a>
                  </div>
                </InfoWindow>
              )}
            </Marker>
          );
        })}

        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              suppressMarkers: true,
            }}
          />
        )}
      </GoogleMap>
    )}
  </>
);

export default Map;
