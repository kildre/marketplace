
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import { Home } from './pages/Home';
import { About } from './pages/About';
import './styles/main.scss';

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

