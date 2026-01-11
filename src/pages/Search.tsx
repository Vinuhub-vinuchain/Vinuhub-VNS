import React, { useState } from 'react';

const Search: React.FC = () => {
  const [domain, setDomain] = useState('');

  const checkAvailability = () => {
    // Your original checkAvail logic here
    console.log('Checking:', domain);
  };

  return (
    <section id="search" className="card">
      <h2>Search .vc Domains</h2>
      <div className="input-group">
        <label htmlFor="domainInput">Domain Name</label>
        <input
          type="text"
          id="domainInput"
          placeholder="Enter name (e.g., example)"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
        />
        <button onClick={checkAvailability}>
          <i className="fas fa-search"></i> Check
        </button>
      </div>
      <p id="availStatus"></p>
    </section>
  );
};

export default Search;
