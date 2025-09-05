import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Truck, Package, MapPin, Clock } from "lucide-react";
import { apiService } from "../services/api";

interface UserDashboardProps {
  onStartBooking: () => void;
  onTrackPackage: () => void;
  onViewAllBookings: () => void;
}

interface DBBooking {
  id?: number;
  userId?: number;
  trackingCode: string;
  status: string;
  pickupCity?: string;
  pickupState?: string;
  dropoffCity?: string;
  dropoffState?: string;
  pickupAt?: string | null;
  createdAt?: string | null;
}

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

const UserDashboard: React.FC<UserDashboardProps> = ({
  onStartBooking,
  onTrackPackage,
  onViewAllBookings,
}) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<DBBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // fetch bookings every 10s (fixed)
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval>;

    const fetchBookings = async () => {
      try {
        setError(null);
        const data = await apiService.getUserBookings();
        if (!cancelled) {
          setBookings(Array.isArray(data.bookings) ? data.bookings : []);
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error("Error fetching bookings:", err);
          setError(err.message || "Failed to load bookings. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchBookings();
    intervalId = setInterval(fetchBookings, 10000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [user]); // ✅ only when user changes

  // stats
  const totalBookings = bookings.length;
  const activeDeliveries = bookings.filter((b) =>
    ["In Transit", "Out for Delivery", "Accepted", "Assigned"].includes(
      (b.status || "").trim()
    )
  ).length;
  const pendingOrders = bookings.filter(
    (b) => (b.status || "").trim() === "Pending"
  ).length;

  const stats = useMemo(
    () => [
      {
        icon: <Package className="h-6 w-6" />,
        label: "Total Bookings",
        value: String(totalBookings),
        color: "text-blue-600",
      },
      {
        icon: <Truck className="h-6 w-6" />,
        label: "Active Deliveries",
        value: String(activeDeliveries),
        color: "text-green-600",
      },
      {
        icon: <Clock className="h-6 w-6" />,
        label: "Pending Orders",
        value: String(pendingOrders),
        color: "text-orange-600",
      },
    ],
    [totalBookings, activeDeliveries, pendingOrders]
  );

  // recent bookings
  const recentBookings = useMemo(() => {
    return bookings
      .slice()
      .sort((a, b) => {
        const da = new Date(a.createdAt || a.pickupAt || 0).getTime();
        const db = new Date(b.createdAt || b.pickupAt || 0).getTime();
        return db - da;
      })
      .slice(0, 3)
      .map((b) => ({
        id: String(b.id ?? b.trackingCode),
        from: formatCityState(b.pickupCity, b.pickupState),
        to: formatCityState(b.dropoffCity, b.dropoffState),
        date: formatDate(b.pickupAt || b.createdAt || undefined),
        status: b.status || "Pending",
      }));
  }, [bookings]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "text-green-600 bg-green-100";
      case "In Transit":
      case "Out for Delivery":
        return "text-yellow-600 bg-blue-100";
      case "Pending":
      case "Accepted":
        return "text-blue-600 bg-green-100";
      case "Assigned":
        return "text-orange-600 bg-orange-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-red-100 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="text-gray-600 font-medium mt-4">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-8 border border-red-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.fullName || "User"}! 👋
              </h1>
              <p className="text-gray-600 text-base sm:text-lg">
                Ready to book your next delivery? Let&apos;s get started!
              </p>
            </div>
            <button
              onClick={onStartBooking}
              className="inline-flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-full text-lg font-semibold shadow-lg hover:bg-red-600 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Truck className="h-5 w-5" />
              Start Booking
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg p-6 border border-red-100 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} bg-red-50 p-3 rounded-lg`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Recent */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-red-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Recent Bookings
              </h2>
              <button
                onClick={onViewAllBookings}
                className="text-red-500 hover:text-red-600 font-medium"
              >
                View All
              </button>
            </div>
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-red-200 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-red-500 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-900">
                          {booking.from} → {booking.to}
                        </p>
                        <p className="text-sm text-gray-600">{booking.date}</p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
              {recentBookings.length === 0 && (
                <p className="text-gray-600 text-sm">
                  No recent bookings found.
                </p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-red-100">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
              Quick Actions
            </h2>
            <div className="space-y-4">
              <button
                onClick={onTrackPackage}
                className="w-full bg-gray-100 text-gray-700 p-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center gap-3"
              >
                <Package className="h-5 w-5" />
                Track Package
              </button>
              <button
                onClick={onStartBooking}
                className="w-full bg-red-500 text-white p-4 rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center gap-3"
              >
                <Truck className="h-5 w-5" />
                New Booking
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
