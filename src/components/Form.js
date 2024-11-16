import React, { useRef } from 'react';
import { Autocomplete } from '@react-google-maps/api';

/**
 * Form component for location input and travel mode selection
 * @param {Object} props - The component props
 * @param {boolean} props.isLoaded - Indicates if Google Maps API is loaded
 * @param {string} props.location - The input location
 * @param {function} props.handleInputChange - Function to handle input changes
 * @param {function} props.handleFormSubmit - Function to handle form submission
 * @param {function} props.handleUseCurrentLocation - Function to handle using current location
 * @param {function} props.setTravelMode - Function to set the travel mode
 * @param {string} props.travelMode - The selected travel mode
 * @param {function} props.setUserLocation - Function to set the user location
 * @param {function} props.setLocation - Function to set the location
 * @param {Object} props.autocomplete - Ref object for the autocomplete input
 * @returns {JSX.Element} The rendered form component
 */
const Form = ({
  isLoaded,
  location,
  handleInputChange,
  handleFormSubmit,
  handleUseCurrentLocation,
  setTravelMode,
  travelMode,
  setUserLocation,
  setLocation,
  autocomplete,
}) => {
  const formRef = useRef(null);

  return (
    <div className="form-container">
      <button type="button" onClick={handleUseCurrentLocation}>
        Use Current Location
      </button>
      <div className="or-divider">Or</div>
      <form ref={formRef} onSubmit={handleFormSubmit}>
        <label className="location-label">Enter a location:</label>
        <div className="location-input-group">
          {isLoaded && (
            <Autocomplete
              onLoad={(autocompleteInstance) => {
                autocomplete.current = autocompleteInstance;
              }}
              onPlaceChanged={() => {
                if (autocomplete.current) {
                  const place = autocomplete.current.getPlace();
                  if (place && place.geometry) {
                    const newLocation = {
                      lat: place.geometry.location.lat(),
                      lng: place.geometry.location.lng(),
                    };
                    setLocation(place.formatted_address);
                    setUserLocation(newLocation);
                    formRef.current.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                  }
                }
              }}
              options={{
                bounds: new window.google.maps.LatLngBounds(
                  new window.google.maps.LatLng(55.41047539469532, -4.884194390407234),
                  new window.google.maps.LatLng(56.123522064762966, -3.719643636516836)
                ),
                strictBounds: true,
                componentRestrictions: { country: 'uk' },
              }}
            >
              <input
                type="text"
                value={location}
                placeholder="e.g. Buchanan Street"
                onChange={handleInputChange}
              />
            </Autocomplete>
          )}
          <button type="submit">Go</button>
        </div>
      </form>
      <div>
        <label>
          Travel Mode:
          <select value={travelMode} onChange={(e) => setTravelMode(e.target.value)}>
            <option value="WALKING">Walking</option>
            <option value="DRIVING">Driving</option>
          </select>
        </label>
      </div>
    </div>
  );
};

export default Form;
