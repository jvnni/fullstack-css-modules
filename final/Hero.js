import React from 'react';
import Styles from './hero.css';

const Hero = function render() {
  return (
    <section className={Styles.hero}>
      <h1 className={Styles.heroTitle}>Building done right</h1>
    </section>
  );
};

module.exports = Hero;
