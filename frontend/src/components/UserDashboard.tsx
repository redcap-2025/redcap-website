import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Truck, Package, MapPin, Clock, Mail, Phone } from 'lucide-react';
import axios from 'axios';
interface UserDashboardProps {
  onStartBooking: () => void;
  onTrackPackage: () => void;
  onViewAllBookings: () => void;
}

/** Shape from your /api/bookings rows */
interface DBBooking {
  id?: number;
  userId?: number;
  trackingCode: string;
  status: string;

  pickupName?: string;
  pickupPhone?: string;
  pickupDoorNumber?: string;
  pickupBuildingName?: string;
  pickupStreet?: string;
  pickupCity?: string;
  pickupState?: string;
  pickupPincode?: string;

  dropoffName?: string;
  dropoffPhone?: string;
  dropoffDoorNumber?: string;
  dropoffBuildingName?: string;
  dropoffStreet?: string;
  dropoffCity?: string;
  dropoffState?: string;
  dropoffPincode?: string;

  packageContents?: string;
  packageType?: string;
  vehicleType?: string;
  pickupAt?: string | null;
  createdAt?: string | null;

  
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const formatCityState = (city?: string | null, state?: string | null) => {
  const c = (city || '').trim();
  const s = (state || '').trim();
  if (c && s) return `${c}, ${s}`;
  return c || s || '—';
};

const formatDate = (iso?: string | null) => {
  if (!iso) return '—';
  // expect "YYYY-MM-DD..." from DB
  return iso.slice(0, 10);
};

const UserDashboard: React.FC<UserDashboardProps> = ({ onStartBooking, onTrackPackage, onViewAllBookings  }) => {
  const { user } = useAuth();

  const [bookings, setBookings] = useState<DBBooking[]>([]);

  // fetch bookings (and refresh every 10s)
  useEffect(() => {
    let cancelled = false;

    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('redcap_token');
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
        const res = await axios.get(`${API_BASE_URL}/bookings`, { headers });
        if (!cancelled) {
          const rows: DBBooking[] = res.data?.bookings ?? res.data ?? [];
          setBookings(Array.isArray(rows) ? rows : []);
        }
      } catch (err) {
        console.error('Error fetching bookings:', err);
      }
    };

    if (user) {
      fetchBookings();
      const t = setInterval(fetchBookings, 10000);
      return () => {
        cancelled = true;
        clearInterval(t);
      };
    }
  }, [user?.id]);

  // derive stats
  const totalBookings = bookings.length;
  const activeDeliveries = bookings.filter(b =>
    ['In Transit', 'Out for Delivery', 'Accepted', 'Assigned'].includes((b.status || '').trim())
  ).length;
  const pendingOrders = bookings.filter(b => (b.status || '').trim() === 'Pending').length;

  // keep same UI structure for stats
  const stats = useMemo(
    () => [
      { icon: <Package className="h-6 w-6" />, label: 'Total Bookings', value: String(totalBookings), color: 'text-blue-600' },
      { icon: <Truck className="h-6 w-6" />, label: 'Active Deliveries', value: String(activeDeliveries), color: 'text-green-600' },
      { icon: <Clock className="h-6 w-6" />, label: 'Pending Orders', value: String(pendingOrders), color: 'text-orange-600' },
    ],
    [totalBookings, activeDeliveries, pendingOrders]
  );

  // Keep the same UI shape for recentBookings, just map from DB
  const recentBookings = useMemo(() => {
    return bookings
      .slice()
      .sort((a, b) => {
        const da = new Date(a.createdAt || a.pickupAt || 0).getTime();
        const db = new Date(b.createdAt || b.pickupAt || 0).getTime();
        return db - da;
      })
      .slice(0, 3)
      .map(b => ({
        id: String(b.id ?? b.trackingCode),
        from: formatCityState(b.pickupCity, b.pickupState),
        to: formatCityState(b.dropoffCity, b.dropoffState),
        date: formatDate(b.pickupAt || b.createdAt || undefined),
        status: b.status || 'Pending',
       
      }));
  }, [bookings]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'text-green-600 bg-green-100';
      case 'In Transit':
      case 'Out for Delivery':
        return 'text-yellow-600 bg-blue-100';
      case 'Pending':
      case 'Accepted':
        return 'text-blue-600 bg-green-100';
      case 'Assigned':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-8 border border-red-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.fullName || 'User'}! 👋
              </h1>
              <p className="text-gray-600 text-base sm:text-lg">
                Ready to book your next delivery? Let's get started!
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

        {/* Stats Grid */}
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
  {stats.map((stat, index) => (
    <div
      key={index}
      className="bg-white rounded-xl shadow-lg p-6 border border-red-100 hover:shadow-xl transition-shadow duration-300"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
        </div>
        <div className={`${stat.color} bg-red-50 p-3 rounded-lg`}>{stat.icon}</div>
      </div>
    </div>
  ))}
</div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Recent Bookings */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-red-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Recent Bookings</h2>
              

<button
  onClick={onViewAllBookings}   // 👈 use the prop here
  className="text-red-500 hover:text-red-600 font-medium"
>
  View All
</button>

            </div>
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:border-red-200 transition-colors">
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
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {recentBookings.length === 0 && (
                <p className="text-gray-600 text-sm">No recent bookings found.</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-red-100">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
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

        {/* About and Contact Sections */}
        <div className="mt-12">
          <div id="about" className="mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-6 sm:mb-8 text-gray-900 px-4">
              About RedCap
            </h2>
            <p className="text-center max-w-4xl mx-auto mb-8 sm:mb-12 text-base sm:text-lg lg:text-xl text-gray-700 leading-relaxed px-4">
              RedCap is a dynamic logistics company specializing in on-demand transportation and intercity courier services
              across India. Acting as a versatile platform, RedCap connects individuals and businesses with a wide fleet of
              vehicles from mini-trucks and tempos to two-wheelers to meet diverse delivery requirements efficiently and reliably.
            </p>

            <div className="grid gap-4 sm:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 px-4">
              {[
                {
                  icon: <Truck className="h-8 w-8 text-red-500" />,
                  title: "On-demand Transportation",
                  description: "Flexible vehicle options for transporting goods of varying sizes with quick and convenient service."
                },
                {
                  icon: <Package className="h-8 w-8 text-red-500" />,
                  title: "Enterprise Logistics",
                  description: "End-to-end logistics management for businesses, covering bulk transportation, distribution, and supply chain optimization."
                },
                {
                  icon: <MapPin className="h-8 w-8 text-red-500" />,
                  title: "Packers and Movers",
                  description: "Comprehensive residential relocation services, including professional packing and safe moving."
                },
                {
                  icon: <Clock className="h-8 w-8 text-red-500" />,
                  title: "Intercity Courier Services",
                  description: "Reliable delivery solutions connecting cities to facilitate smooth and timely parcel movement."
                }
              ].map((service, index) => (
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
          </div>

          <div id="contact" className="max-w-6xl mx-auto w-full px-4">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-gray-900 mb-4 sm:mb-6">
              Contact Our Support Team
            </h2>
            <p className="text-center text-gray-700 mb-8 sm:mb-12 max-w-2xl mx-auto text-base sm:text-lg px-4">
              We're here to help! Reach out with any questions, feedback, or support inquiries.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 max-w-5xl mx-auto">
              {/* Contact Form */}
              <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-8 border border-red-100">
                <h3 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-gray-900">Send Us a Message</h3>
                <form className="space-y-4 sm:space-y-6">
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-sm sm:text-base"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-sm sm:text-base"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Subject"
                    className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-sm sm:text-base"
                    required
                  />
                  <textarea
                    placeholder="Your Message"
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all resize-none text-sm sm:text-base"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full bg-red-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-red-600 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl text-sm sm:text-base"
                  >
                    <Mail className="h-5 w-5" />
                    Submit Message
                  </button>
                </form>
              </div>

              {/* Contact Information */}
              <div className="bg-gradient-to-br from-red-500 to-red-600 text-white shadow-xl rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Contact Information</h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center gap-3 text-sm sm:text-base">
                      <Mail className="h-5 w-5" />
                      <span>support@redcap.com</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm sm:text-base">
                      <Phone className="h-5 w-5" />
                      <span>+91 9629333135, +91 7010344469</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm sm:text-base">
                      <MapPin className="h-5 w-5 mt-0.5" />
                      <span>123, Vehicle Booking Hub, Namakkal, Tamil Nadu</span>
                    </div>
                  </div>

                  <hr className="my-4 sm:my-6 border-red-400" />

                  <div>
                    <h4 className="font-semibold mb-2 text-base sm:text-lg">FAQ</h4>
                    <p className="text-red-100 text-sm sm:text-base">
                      Check our FAQ section for quick answers before reaching out.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserDashboard;
