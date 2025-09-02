import React, { useState } from 'react';
import { Menu, X, User, LogOut, Edit } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Import the logo from assets
import logo from '/assets/images/RedCap.png'; // Adjust path if needed

interface HeaderProps {
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
  onProfileClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLoginClick, onRegisterClick, onProfileClick }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    closeMobileMenu();
  };

  const handleLogout = () => {
    logout();
    setIsProfileMenuOpen(false);
  };

  return (
    <header className="bg-gradient-to-r from-red-500 to-red-600 shadow-lg fixed w-full top-0 z-50">
      <div className="container mx-auto flex justify-between items-center py-4 px-6">
        {/* Logo with Image */}
        <div className="flex items-center gap-3 text-2xl font-bold text-white tracking-wide cursor-default">
          <img
            src={logo}
            alt="RedCap Logo"
            className="h-14 w-14 object-contain"
          />
          RedCap
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex space-x-4 lg:space-x-6 text-white font-medium justify-end flex-1 items-center">
          <button 
            onClick={() => {
              if (isAuthenticated) {
                window.location.hash = '';
                window.scrollTo(0, 0);
              } else {
                scrollToSection('home');
              }
            }}
            className="hover:text-red-100 transition-colors duration-200 flex items-center px-2 py-1"
          >
            {isAuthenticated ? 'Dashboard' : 'Home'}
          </button>
          <button 
            onClick={() => scrollToSection('about')} 
            className="hover:text-red-100 transition-colors duration-200 flex items-center px-2 py-1"
          >
            About
          </button>
          <button 
            onClick={() => scrollToSection('contact')} 
            className="hover:text-red-100 transition-colors duration-200 flex items-center px-2 py-1"
          >
            Contact
          </button>
          
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 border-2 border-white text-white px-3 py-1 lg:px-4 lg:py-1 rounded-full hover:text-red-600 hover:bg-white transition-all duration-200 text-sm lg:text-base"
              >
                <User className="h-4 w-4" />
                {user?.fullName}
              </button>
              
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <button
                    onClick={() => {
                      onProfileClick?.();
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button 
                onClick={onLoginClick}
                className="border-2 border-white text-white px-3 py-1 lg:px-4 lg:py-1 rounded-full hover:text-red-600 hover:bg-white transition-all duration-200 inline-flex items-center text-sm lg:text-base"
              >
                Login
              </button>
              <button 
                onClick={onRegisterClick}
                className="border-2 border-white text-white px-3 py-1 lg:px-4 lg:py-1 rounded-full hover:text-red-600 hover:bg-white transition-all duration-200 inline-flex items-center text-sm lg:text-base"
              >
                Register
              </button>
            </>
          )}
        </nav>

        {/* Mobile Hamburger */}
        <button 
          onClick={toggleMobileMenu}
          className="md:hidden text-white focus:outline-none" 
          aria-label="Open menu"
        >
          <Menu className="h-8 w-8" />
        </button>
      </div>

      {/* Mobile Nav */}
      <div className={`fixed top-0 right-0 h-full w-64 bg-gradient-to-b from-red-500 to-red-400 shadow-lg transform transition-transform duration-300 ease-in-out z-40 ${
        isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-4 flex justify-between items-center border-b border-red-400">
          <span className="font-bold text-lg text-white">Menu</span>
          <button 
            onClick={closeMobileMenu}
            className="text-white" 
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex flex-col p-4 space-y-4 text-white font-medium">
          <button 
            onClick={() => {
              if (isAuthenticated) {
                window.location.hash = '';
                window.scrollTo(0, 0);
                closeMobileMenu();
              } else {
                scrollToSection('home');
              }
            }}
            className="hover:text-red-100 transition-colors duration-200 text-left py-2"
          >
            {isAuthenticated ? 'Dashboard' : 'Home'}
          </button>
          <button 
            onClick={() => scrollToSection('about')}
            className="hover:text-red-100 transition-colors duration-200 text-left py-2"
          >
            About
          </button>
          <button 
            onClick={() => scrollToSection('contact')}
            className="hover:text-red-100 transition-colors duration-200 text-left py-2"
          >
            Contact
          </button>
          
          {isAuthenticated ? (
            <>
              <div className="border-t border-red-400 pt-4 mt-4">
                <p className="text-red-100 text-sm mb-2">Welcome, {user?.fullName}!</p>
                <button 
                  onClick={() => {
                    onProfileClick?.();
                    closeMobileMenu();
                  }}
                  className="w-full bg-red-600 border-2 border-white text-white px-4 py-2 rounded-full text-center hover:bg-white hover:text-red-600 transition-all duration-200 mb-2 flex items-center justify-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </button>
                <button 
                  onClick={() => {
                    handleLogout();
                    closeMobileMenu();
                  }}
                  className="w-full bg-red-600 border-2 border-white text-white px-4 py-2 rounded-full text-center hover:bg-white hover:text-red-600 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <button 
                onClick={() => {
                  onLoginClick?.();
                  closeMobileMenu();
                }}
                className="bg-red-600 border-2 border-white text-white px-4 py-2 rounded-full text-center hover:bg-white hover:text-red-600 transition-all duration-200 mt-2"
              >
                Login
              </button>
              <button 
                onClick={() => {
                  onRegisterClick?.();
                  closeMobileMenu();
                }}
                className="bg-red-600 border-2 border-white text-white px-4 py-2 rounded-full text-center hover:bg-white hover:text-red-600 transition-all duration-200"
              >
                Register
              </button>
            </>
          )}
        </nav>
      </div>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Profile Menu Overlay */}
      {isProfileMenuOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsProfileMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;
