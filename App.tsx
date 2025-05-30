
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './app/src/components/Header';
import { Home } from './app/src/pages/Home';
import { About } from './app/src/pages/About';
import './app/src/styles/main.scss';

function App(): React.ReactElement {
  return (
    <div>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

