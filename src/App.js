import React, { useState, useRef, useEffect } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import Header from './components/Header';
import Form from './components/Form';
import Map from './components/Map';
import LoadingMessage from './components/LoadingMessage';
import { stations } from './stations';
import './App.css';

const libraries = ['places'];

/**
 * Main application component
 * @returns {JSX.Element} The rendered application
 */
const App = () => {
  const [location, setLocation] = useState('');
  const [nearestStations, setNearestStations] = useState([]);
  const [map, setMap] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [travelMode, setTravelMode] = useState('WALKING');
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [directions, setDirections] = useState(null);
  const autocomplete = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_API_KEY,
    libraries,
  });

  useEffect(() => {
    if (userLocation) {
      setIsLoading(true);
      findNearestStations(userLocation);
    }
  }, [travelMode]);

  /**
   * Handles input change event for the location input field
   * @param {Event} event - The input change event
   */
  const handleInputChange = (event) => {
    setLocation(event.target.value);
    setUseCurrentLocation(false);
  };

  /**
   * Handles form submission to find nearest stations
   * @param {Event} event - The form submission event
   */
  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    if (useCurrentLocation) {
      if (!userLocation) {
        alert('Current location is not set. Please try again.');
        setIsLoading(false);
        return;
      }
      findNearestStations(userLocation);
      return;
    }

    if (!location.trim()) {
      alert('Please enter a location before submitting.');
      setIsLoading(false);
      return;
    }

    if (!autocomplete.current) {
      alert('Autocomplete is not properly initialised.');
      setIsLoading(false);
      return;
    }

    const place = autocomplete.current.getPlace();
    if (!place || !place.geometry || !place.geometry.location) {
      alert('Please select a location from the suggestions provided by the autocomplete dropdown.');
      setIsLoading(false);
      return;
    }

    const placeLocation = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };

    findNearestStations(placeLocation);
  };




  /**
   * Uses the current location to find the nearest stations
   */
  const handleUseCurrentLocation = () => {
    setIsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(userLocation);
          setUseCurrentLocation(true);
          findNearestStations(userLocation);
        },
        (error) => {
          alert('Error getting current location: ' + error.message);
          setIsLoading(false);
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
      setIsLoading(false);
    }
  };


  /**
   * Finds the nearest stations to the user's location
   * @param {Object} userLocation - The user's location with latitude and longitude
   */
  const findNearestStations = (userLocation) => {
    const service = new window.google.maps.DistanceMatrixService();
    const destinations = stations.map(station => ({ lat: station.lat, lng: station.lng }));

    service.getDistanceMatrix({
      origins: [userLocation],
      destinations: destinations,
      travelMode: travelMode,
    }, (response, status) => {
      setIsLoading(false);
      if (status === 'OK') {
        const distances = response.rows[0].elements.map((element, index) => ({
          ...stations[index],
          distance: element.distance.value,
          duration: element.duration.text,
        }));

        distances.sort((a, b) => a.distance - b.distance);

        const closestStations = distances.slice(0, 3).map((station, index) => ({
          ...station,
          label: `#${index + 1} ${station.name} (${travelMode === 'DRIVING' ? 'Driving Time:' : 'Walking Time:'} ${station.duration})`,
          number: index + 1,
        }));

        setNearestStations(closestStations);

        if (map) {
          const bounds = new window.google.maps.LatLngBounds();
          bounds.extend(new window.google.maps.LatLng(userLocation.lat, userLocation.lng));
          closestStations.forEach(station => {
            bounds.extend(new window.google.maps.LatLng(station.lat, station.lng));
          });
          map.fitBounds(bounds);
        }

        if (closestStations.length > 0) {
          calculateRoute(userLocation, closestStations[0]);
        }
      } else {
        alert('Distance Matrix request was not successful for the following reason: ' + status);
      }
    });
  };

  /**
   * Calculates the route from the origin to the destination
   * @param {Object} origin - The origin location with latitude and longitude
   * @param {Object} destination - The destination location with latitude and longitude
   */
  const calculateRoute = (origin, destination) => {
    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: origin,
        destination: { lat: destination.lat, lng: destination.lng },
        travelMode: travelMode,
      },
      (result, status) => {
        if (status === 'OK') {
          setDirections(result);
        } else {
          console.error(`error fetching directions ${result}`);
        }
      }
    );
  };

  /**
   * Handles marker click event to select a station
   * @param {Object} station - The selected station
   */
  const handleMarkerClick = (station) => {
    setSelectedStation(null);
    setTimeout(() => {
      setSelectedStation(station);
    }, 0);
    calculateRoute(userLocation, station);
  };

  /**
   * Generates a Google Maps URL for a given destination
   * @param {Object} destination - The destination location with latitude and longitude
   * @returns {string} The Google Maps URL
   */
  const generateGoogleMapsURL = (destination) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}&travelmode=${travelMode.toLowerCase()}`;
  };

  return (
    <div className="App">
      <Header />
      <Form
        isLoaded={isLoaded}
        location={location}
        handleInputChange={handleInputChange}
        handleFormSubmit={handleFormSubmit}
        handleUseCurrentLocation={handleUseCurrentLocation}
        setTravelMode={setTravelMode}
        travelMode={travelMode}
        setUserLocation={setUserLocation}
        setLocation={setLocation}
        autocomplete={autocomplete}
      />
      {isLoading && <LoadingMessage />}
      <Map
        isLoaded={isLoaded}
        map={map}
        setMap={setMap}
        userLocation={userLocation}
        stations={stations}
        nearestStations={nearestStations}
        selectedStation={selectedStation}
        handleMarkerClick={handleMarkerClick}
        generateGoogleMapsURL={generateGoogleMapsURL}
        directions={directions}
        travelMode={travelMode}
        setSelectedStation={setSelectedStation}
      />
      {loadError && <div>Error loading maps</div>}
    </div>
  );
};

export default App;
