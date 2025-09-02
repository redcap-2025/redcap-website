import React from 'react';
import { Truck, Building2, Package, MapPin } from 'lucide-react';

const About: React.FC = () => {
  const services = [
    {
      icon: <Truck className="h-8 w-8 text-red-500" />,
      title: "On-demand Transportation",
      description: "Flexible vehicle options for transporting goods of varying sizes with quick and convenient service."
    },
    {
      icon: <Building2 className="h-8 w-8 text-red-500" />,
      title: "Enterprise Logistics",
      description: "End-to-end logistics management for businesses, covering bulk transportation, distribution, and supply chain optimization."
    },
    {
      icon: <Package className="h-8 w-8 text-red-500" />,
      title: "Packers and Movers",
      description: "Comprehensive residential relocation services, including professional packing and safe moving."
    },
    {
      icon: <MapPin className="h-8 w-8 text-red-500" />,
      title: "Intercity Courier Services",
      description: "Reliable delivery solutions connecting cities to facilitate smooth and timely parcel movement."
    }
  ];

  return (
    <section id="about" className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-10 w-full mt-12 sm:mt-16">
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-6 sm:mb-8 text-gray-900 px-4">
        About RedCap
      </h2>
      <p className="text-center max-w-4xl mx-auto mb-8 sm:mb-12 text-base sm:text-lg lg:text-xl text-gray-700 leading-relaxed px-4">
        RedCap is a dynamic logistics company specializing in on-demand transportation and intercity courier services
        across India. Acting as a versatile platform, RedCap connects individuals and businesses with a wide fleet of
        vehicles from mini-trucks and tempos to two-wheelers to meet diverse delivery requirements efficiently and reliably.
      </p>

      <div className="grid gap-4 sm:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 px-4">
        {services.map((service, index) => (
          <div
            key={index}
            className="bg-white p-4 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-red-100 hover:border-red-200"
          >
            <div className="mb-3 sm:mb-4 flex justify-center sm:justify-start">
              {service.icon}
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-900 text-center sm:text-left">
              {service.title}
            </h3>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base text-center sm:text-left">
              {service.description}
            </p>
          </div>
        ))}
      </div>

      <p className="text-center max-w-4xl mx-auto mt-8 sm:mt-12 text-gray-600 text-base sm:text-lg leading-relaxed px-4">
        With a focus on real-time tracking and seamless supply chain management, RedCap strives to simplify logistics and
        empower customers with transparent, efficient, and scalable transportation solutions.
      </p>
    </section>
  );
};

export default About;