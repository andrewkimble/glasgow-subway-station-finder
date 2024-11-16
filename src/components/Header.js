import React from 'react';
import '../App.css';

/**
 * Header component for the application
 * @returns {JSX.Element} The rendered header component
 */
const Header = () => (
  <header className="App-header">
    <img src={`${process.env.PUBLIC_URL}/logo-solid.png`} alt="Logo" className="App-logo" />
    <h1>Glasgow Subway Station Finder</h1>
  </header>
);

export default Header;
