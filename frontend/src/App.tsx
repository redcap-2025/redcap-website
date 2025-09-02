import React, { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Components
import Header from "./components/Header";
import Hero from "./components/Hero";
import About from "./components/About";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Login from "./components/Login";
import Register from "./components/Register";
import UserDashboard from "./components/UserDashboard";
import UserProfile from "./components/UserProfile";
import BookingPage from "./components/BookingPage";
import BookingConfirmation from "./components/BookingConfirmation";
import TrackPackage from "./components/TrackPackage";
import RecentBookings from "./components/RecentBookings";
import ResetPassword from "./components/ResetPassword";
import ForgetPassword from "./components/ForgetPassword";

const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  // Current page view
  const [currentView, setCurrentView] = useState<
    | "home"
    | "login"
    | "register"
    | "dashboard"
    | "profile"
    | "booking"
    | "confirmation"
    | "track"
    | "recent-bookings"
    | "reset-password"
    | "forgot-password"
  >("home");

  const [bookingData, setBookingData] = useState<any>(null);
  const [bookingId, setBookingId] = useState<string>("");

  // Reset password params
  const [resetParams, setResetParams] = useState<{ token: string; email: string } | null>(null);

  // Detect reset-password link
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.pathname === "/reset-password") {
      const token = url.searchParams.get("token");
      const email = url.searchParams.get("email");
      if (token && email) {
        setResetParams({ token, email });
        setCurrentView("reset-password");
      }
    }
  }, []);

  // Smooth scrolling
  useEffect(() => {
    document.documentElement.style.scrollPaddingTop = "5rem";
    document.documentElement.style.scrollBehavior = "smooth";
  }, []);

  // Auth-based redirects
  useEffect(() => {
    if (
      isAuthenticated &&
      ["home", "login", "register", "reset-password", "forgot-password"].includes(currentView)
    ) {
      setCurrentView("dashboard");
    }
    if (!isAuthenticated && ["dashboard", "profile", "booking"].includes(currentView)) {
      setCurrentView("home");
    }
  }, [isAuthenticated, currentView]);

  // Browser navigation
  useEffect(() => {
    if (!loading) {
      window.history.pushState({ view: currentView }, "", "");
    }
  }, [currentView, loading]);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.view) {
        setCurrentView(event.state.view);
      } else {
        setCurrentView("home");
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // 🔹 Handlers
  const handleLoginClick = () => setCurrentView("login");
  const handleRegisterClick = () => setCurrentView("register");
  const handleBackToHome = () => setCurrentView("home");
  const handleSwitchToLogin = () => setCurrentView("login");
  const handleSwitchToRegister = () => setCurrentView("register");
  const handleStartBooking = () => setCurrentView(isAuthenticated ? "booking" : "login");
  const handleProfileClick = () => setCurrentView("profile");
  const handleBackToDashboard = () => setCurrentView("dashboard");
  const handleBookingComplete = (id: string, data: any) => {
    setBookingId(id);
    setBookingData(data);
    setCurrentView("confirmation");
  };
  const handleTrackPackage = () => setCurrentView("track");
  const handleRecentBookings = () => setCurrentView("recent-bookings");
  const handleForgotPassword = () => setCurrentView("forgot-password");

  // 🔹 Views
  if (currentView === "reset-password" && resetParams) {
    return (
      <ResetPassword
        token={resetParams.token}
        email={resetParams.email}
        setCurrentView={setCurrentView}
      />
    );
  }

  if (currentView === "forgot-password") {
    return <ForgetPassword onBack={handleBackToHome} />;
  }

  if (currentView === "login") {
    return (
      <Login
        onBack={handleBackToHome}
        onSwitchToRegister={handleSwitchToRegister}
        onForgotPassword={handleForgotPassword}
      />
    );
  }

  if (currentView === "register") {
    return (
      <Register onBack={handleBackToHome} onSwitchToLogin={handleSwitchToLogin} />
    );
  }

  if (currentView === "dashboard") {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-red-50 text-gray-800">
        <Header onProfileClick={handleProfileClick} />
        <UserDashboard
          onStartBooking={handleStartBooking}
          onTrackPackage={handleTrackPackage}
          onViewAllBookings={handleRecentBookings}
        />
        <Footer />
      </div>
    );
  }

  if (currentView === "profile") {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-red-50 text-gray-800">
        <Header onProfileClick={handleProfileClick} />
        <UserProfile onBack={handleBackToDashboard} />
        <Footer />
      </div>
    );
  }

  if (currentView === "booking") {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-red-50 text-gray-800">
        <Header onProfileClick={handleProfileClick} />
        <BookingPage onBack={handleBackToDashboard} onBookingComplete={handleBookingComplete} />
        <Footer />
      </div>
    );
  }

  if (currentView === "confirmation") {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-red-50 text-gray-800">
        <Header onProfileClick={handleProfileClick} />
        <BookingConfirmation
          onBackToDashboard={handleBackToDashboard}
          bookingId={bookingId}
          bookingData={bookingData}
        />
        <Footer />
      </div>
    );
  }

  if (currentView === "track") {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-red-50 text-gray-800">
        <Header onProfileClick={handleProfileClick} />
        <TrackPackage onBack={handleBackToDashboard} />
        <Footer />
      </div>
    );
  }

  if (currentView === "recent-bookings") {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-red-50 text-gray-800">
        <Header onProfileClick={handleProfileClick} />
        <RecentBookings onBack={handleBackToDashboard} />
        <Footer />
      </div>
    );
  }

  // 🔹 Default Home
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-red-50 text-gray-800">
      <Header
        onLoginClick={handleLoginClick}
        onRegisterClick={handleRegisterClick}
        onProfileClick={handleProfileClick}
      />
      <main className="flex-1">
        <Hero onStartBooking={handleStartBooking} />
        <About />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
