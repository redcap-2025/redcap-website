import React from 'react';
import { Rocket } from 'lucide-react';

interface HeroProps {
  onStartBooking?: () => void;
}

const Hero: React.FC<HeroProps> = ({ onStartBooking }) => {
  return (
    <section id="home" className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pt-20 sm:pt-24 lg:pt-28 min-h-screen">
      <div className="max-w-3xl text-center w-full">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4 sm:mb-6 leading-tight px-2">
          Welcome to <span className="text-red-500">RedCap</span>
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-700 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-4">
          Book trucks instantly for your delivery needs <span className="font-semibold text-red-500">quickly</span> and{' '}
          <span className="font-semibold text-red-500">easily</span> with our seamless booking system.
        </p>
        <button 
          onClick={onStartBooking}
          className="inline-flex items-center gap-2 bg-red-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold shadow-lg hover:bg-red-600 hover:shadow-xl transition-all duration-300 transform hover:scale-105 mx-4"
        >
          <Rocket className="h-5 w-5" />
          Start Booking
        </button>
      </div>
    </section>
  );
};

export default Hero;