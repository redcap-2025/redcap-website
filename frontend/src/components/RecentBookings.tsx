import React, { useEffect, useState } from "react";
import { ArrowLeft, Package, Truck, User, DollarSign } from "lucide-react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import About from "./About";
import Contact from "./Contact";

interface DBBooking {
  id?: number;
  trackingCode: string;
  status: string;
  pickupCity?: string | null;
  pickupState?: string | null;
  dropoffCity?: string | null;
  dropoffState?: string | null;
  pickupAt?: string | null;
  createdAt?: string | null;
  price?: number;
  vehicleType?: string;
  receiverName?: string;
}

const API_BASE_URL = "http://localhost:8000/api";

const formatCityState = (city?: string | null, state?: string | null) => {
  const c = (city || "").trim();
  const s = (state || "").trim();
  if (c && s) return `${c}, ${s}`;
  return c || s || "—";
};

const formatDate = (iso?: string | null) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case "Delivered":
      return {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        dot: "bg-emerald-500"
      };
    case "Pending":
      return {
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
        dot: "bg-amber-500"
      };
    case "In Transit":
    case "Shipped":
      return {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
        dot: "bg-blue-500"
      };
    default:
      return {
        bg: "bg-gray-50",
        text: "text-gray-700",
        border: "border-gray-200",
        dot: "bg-gray-500"
      };
  }
};

interface Props {
  onBack: () => void;
}

const RecentBookings: React.FC<Props> = ({ onBack}) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<DBBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("redcap_token");
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
        const res = await axios.get(`${API_BASE_URL}/bookings`, { headers });
        setBookings(res.data?.bookings ?? res.data ?? []);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchBookings();
    } else {
      setLoading(false);
    }
  }, [user]); // Can be [] if you want to only fetch on initial render

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#fee9e9" }}>

      {/* Header Bar */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-red-600 font-medium transition-colors duration-200 group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
              Back to Dashboard
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Package className="h-4 w-4" />
              {bookings.length} {bookings.length === 1 ? 'Booking' : 'Bookings'}
            </div>
          </div>
        </div>
      </div>

      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            My Bookings
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Track your packages and manage deliveries with real-time updates
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-red-100 rounded-full"></div>
                <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
              </div>
              <p className="text-gray-600 font-medium mt-4">Loading your shipments...</p>
              <p className="text-gray-400 text-sm mt-1">Please wait while we fetch your data</p>
            </div>
          </div>
        ) : bookings.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {bookings.map((booking) => {
              const statusConfig = getStatusConfig(booking.status);

              return (
                <div
                  key={booking.trackingCode} // Use trackingCode as key
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 overflow-hidden group"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <Package className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">
                            Shipment #{booking.trackingCode}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {formatDate(booking.pickupAt || booking.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                        <div className={`w-2 h-2 rounded-full ${statusConfig.dot}`}></div>
                        <span className="text-xs font-semibold">{booking.status}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 space-y-4">
                    {/* Route */}
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col items-center mt-1">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <div className="w-px h-8 bg-gray-300"></div>
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        </div>
                        <div className="flex-1 space-y-3">
                          <div>
                            <p className="text-sm font-medium text-gray-500">From</p>
                            <p className="text-base font-semibold text-gray-900">
                              {formatCityState(booking.pickupCity, booking.pickupState)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">To</p>
                            <p className="text-base font-semibold text-gray-900">
                              {formatCityState(booking.dropoffCity, booking.dropoffState)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                      {booking.price && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Price</p>
                            <p className="text-sm font-semibold text-gray-900">${booking.price.toFixed(2)}</p>
                          </div>
                        </div>
                      )}

                      {booking.vehicleType && (
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Vehicle</p>
                            <p className="text-sm font-semibold text-gray-900">{booking.vehicleType}</p>
                          </div>
                        </div>
                      )}

                      {booking.receiverName && (
                        <div className="flex items-center gap-2 col-span-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Receiver</p>
                            <p className="text-sm font-semibold text-gray-900">{booking.receiverName}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No shipments found</h3>
              <p className="text-gray-500 mb-6">
                You haven't created any shipments yet. Start by booking your first delivery.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* About Section */}
      <section className="border-t border-gray-200" style={{ backgroundColor: "#fee9e9" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <About />
        </div>
      </section>

      {/* Contact Section */}
      <section className="border-t border-gray-200" style={{ backgroundColor: "#fee9e9" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Contact />
        </div>
      </section>
    </div>
  );
};

export default RecentBookings;
