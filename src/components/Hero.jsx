import React from 'react';

// Atualizar a imagem para foto 2.png
import heroImageSrc from '../assets/foto 2.png';

const Hero = () => {
  return (
    <section className="relative w-full bg-black h-[60vh] md:h-[80vh]">
      <img
        src={heroImageSrc}
        alt="A&P Cosmética Hero Image"
        className="w-full h-full object-contain object-top md:object-center"
      />
    </section>
  );
};

export default Hero; 