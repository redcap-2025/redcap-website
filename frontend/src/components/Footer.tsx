import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  const cities = [
    'Delhi NCR', 'Chandigarh', 'Ahmedabad', 'Coimbatore', 'Visakhapatnam',
    'Mumbai', 'Bangalore', 'Chennai', 'Pune', 'Hyderabad'
  ];

  const companyLinks = [
    { name: 'About Us', href: '#' },
    { name: 'Careers', href: '#' },
    { name: 'Blog', href: '#' },
    { name: 'Press', href: '#' }
  ];

  const quickLinks = [
    { name: 'Book Now', href: '#' },
    { name: 'Track Order', href: '#' },
    { name: 'Pricing', href: '#' },
    { name: 'Services', href: '#' }
  ];

  const supportLinks = [
    { name: 'Help Center', href: '#' },
    { name: 'Contact Us', href: '#' },
    { name: 'Terms of Service', href: '#' },
    { name: 'Privacy Policy', href: '#' }
  ];

  return (
    <footer className="bg-gray-900 text-white mt-12 sm:mt-16 lg:mt-20">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Section */}
          <div className="space-y-6 sm:space-y-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-wide mb-3 sm:mb-4 text-red-400">RedCap°</h2>
              <div className="border-b border-dotted border-red-400 mb-4 sm:mb-6"></div>
            </div>

            {/* Social Icons */}
            <div>
              <h3 className="font-bold mb-3 sm:mb-4 text-red-300">Follow us on</h3>
              <div className="flex gap-3 sm:gap-4">
                <a href="#" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white text-gray-900 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors duration-200">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white text-gray-900 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors duration-200">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white text-gray-900 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors duration-200">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white text-gray-900 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors duration-200">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* App Download */}
            <div>
              <div className="mb-3 sm:mb-4">
                <h3 className="font-bold text-red-300">Download our app now!</h3>
                <p className="text-xs sm:text-sm text-gray-400">Scan the QR Code to download</p>
              </div>
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-lg p-2 flex items-center justify-center">
                <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center text-gray-500 text-xs sm:text-sm">
                  QR Code
                </div>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Company */}
            <div>
              <h3 className="font-bold mb-3 sm:mb-4 text-red-300">Company</h3>
              <ul className="space-y-1 sm:space-y-2">
                {companyLinks.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="text-gray-300 hover:text-red-400 transition-colors duration-200 text-sm sm:text-base">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-bold mb-3 sm:mb-4 text-red-300">Quick Links</h3>
              <ul className="space-y-1 sm:space-y-2">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="text-gray-300 hover:text-red-400 transition-colors duration-200 text-sm sm:text-base">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-bold mb-3 sm:mb-4 text-red-300">Support</h3>
              <ul className="space-y-1 sm:space-y-2">
                {supportLinks.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="text-gray-300 hover:text-red-400 transition-colors duration-200 text-sm sm:text-base">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Domestic Cities */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-700">
          <h3 className="font-bold mb-3 sm:mb-4 text-red-300">Domestic Cities</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4">
            {cities.map((city, index) => (
              <div key={index} className="text-gray-300 text-sm sm:text-base">
                {city}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="border-t border-red-900 bg-gray-950">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4 sm:py-6 text-xs sm:text-sm text-gray-400">
          <div className="mb-2">
            <strong className="text-red-300">Registered Office:</strong>
          </div>
          <div>
            © 2025 SmartShift Logistics Solutions Pvt. Ltd.<br />
            <span className="block sm:inline">No. A-501, A-502, B-504, B-505 and B-506, Fifth Floor at Universal Business Park, Chandivali Farm Road,</span>
            off. Saki Vihar Road, Andheri (East), Mumbai-400072, Maharashtra
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;