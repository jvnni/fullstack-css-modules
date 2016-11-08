import React from 'react';
import ReactDOM from 'react-dom';
import Hero from './components/hero/Hero';
import Highlights from './components/highlights/Highlights';

const App = function render() {
  return (
    <main role="main">
      <Hero />
      <Highlights />
    </main>
  );
};

ReactDOM.render(
  <App />,
  document.getElementById('app')
);

export default App;
