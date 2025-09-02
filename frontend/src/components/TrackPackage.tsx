import React, { useState } from 'react';
import { Search, Package, MapPin, Clock, CheckCircle, Truck, ArrowLeft } from 'lucide-react';

interface TrackPackageProps {
  onBack: () => void;
}

const TrackPackage: React.FC<TrackPackageProps> = ({ onBack }) => {
  const [trackingId, setTrackingId] = useState('');
  const [trackingData, setTrackingData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle browser back button
  React.useEffect(() => {
    // Push a new state when component mounts
    window.history.pushState({ page: 'track' }, '', '');
    
    const handlePopState = (event: PopStateEvent) => {
      // Prevent default browser back behavior
      event.preventDefault();
      onBack();
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [onBack]);

  // Mock tracking data
  const mockTrackingData = {
    'RC123456': {
      id: 'RC123456',
      status: 'In Transit',
      currentLocation: 'Mumbai Distribution Center',
      estimatedDelivery: '2025-01-10 15:30',
      sender: 'John Doe',
      receiver: 'Jane Smith',
      from: 'Mumbai, MH',
      to: 'Pune, MH',
      packageType: 'Electronics',
      weight: '2.5kg',
      timeline: [
        {
          status: 'Booking Confirmed',
          location: 'Mumbai',
          time: '2025-01-09 10:00',
          completed: true,
          description: 'Your booking has been confirmed and vehicle assigned'
        },
        {
          status: 'Package Picked Up',
          location: 'Mumbai, Andheri East',
          time: '2025-01-09 14:30',
          completed: true,
          description: 'Package collected from pickup location'
        },
        {
          status: 'In Transit',
          location: 'Mumbai Distribution Center',
          time: '2025-01-09 18:00',
          completed: true,
          description: 'Package is on the way to destination'
        },
        {
          status: 'Out for Delivery',
          location: 'Pune Distribution Center',
          time: '2025-01-10 09:00',
          completed: false,
          description: 'Package will be delivered today'
        },
        {
          status: 'Delivered',
          location: 'Pune, Koregaon Park',
          time: '2025-01-10 15:30',
          completed: false,
          description: 'Package delivered successfully'
        }
      ]
    },
    'RC789012': {
      id: 'RC789012',
      status: 'Delivered',
      currentLocation: 'Delivered',
      estimatedDelivery: 'Delivered on 2025-01-08 16:45',
      sender: 'Alice Johnson',
      receiver: 'Bob Wilson',
      from: 'Delhi, DL',
      to: 'Gurgaon, HR',
      packageType: 'Documents',
      weight: '0.5kg',
      timeline: [
        {
          status: 'Booking Confirmed',
          location: 'Delhi',
          time: '2025-01-08 09:00',
          completed: true,
          description: 'Your booking has been confirmed and vehicle assigned'
        },
        {
          status: 'Package Picked Up',
          location: 'Delhi, Connaught Place',
          time: '2025-01-08 11:30',
          completed: true,
          description: 'Package collected from pickup location'
        },
        {
          status: 'In Transit',
          location: 'Delhi-Gurgaon Highway',
          time: '2025-01-08 13:00',
          completed: true,
          description: 'Package is on the way to destination'
        },
        {
          status: 'Out for Delivery',
          location: 'Gurgaon Distribution Center',
          time: '2025-01-08 15:30',
          completed: true,
          description: 'Package out for final delivery'
        },
        {
          status: 'Delivered',
          location: 'Gurgaon, Cyber City',
          time: '2025-01-08 16:45',
          completed: true,
          description: 'Package delivered successfully to receiver'
        }
      ]
    }
  };

  const handleTrack = async () => {
    if (!trackingId.trim()) {
      setError('Please enter a tracking ID');
      return;
    }

    setIsLoading(true);
    setError('');
    
    // Simulate API call
    setTimeout(() => {
      const data = mockTrackingData[trackingId as keyof typeof mockTrackingData];
      if (data) {
        setTrackingData(data);
        setError('');
      } else {
        setTrackingData(null);
        setError('Tracking ID not found. Please check and try again.');
      }
      setIsLoading(false);
    }, 1500);
  };

  const getStatusIcon = (status: string, completed: boolean) => {
    if (completed) {
      return <CheckCircle className="h-6 w-6 text-green-500" />;
    } else if (status === 'In Transit') {
      return <Truck className="h-6 w-6 text-blue-500" />;
    } else {
      return <Clock className="h-6 w-6 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'text-green-600 bg-green-100';
      case 'In Transit': return 'text-blue-600 bg-blue-100';
      case 'Out for Delivery': return 'text-orange-600 bg-orange-100';
      case 'Picked Up': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-red-600 hover:text-red-700 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Track Your Package
          </h1>
          <p className="text-lg text-gray-600">
            Enter your tracking ID to get real-time updates on your delivery
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-8 border border-red-100">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="trackingId" className="block text-sm font-medium text-gray-700 mb-2">
                Tracking ID
              </label>
              <input
                type="text"
                id="trackingId"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                placeholder="Enter your tracking ID (e.g., RC123456)"
                onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
              />
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>
            <div className="sm:pt-7">
              <button
                onClick={handleTrack}
                disabled={isLoading}
                className="w-full sm:w-auto bg-red-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Search className="h-5 w-5" />
                )}
                {isLoading ? 'Tracking...' : 'Track Package'}
              </button>
            </div>
          </div>

          {/* Sample IDs */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Try these sample tracking IDs:</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setTrackingId('RC123456')}
                className="text-sm bg-white border border-gray-300 px-3 py-1 rounded-full hover:bg-red-50 hover:border-red-300 transition-colors"
              >
                RC123456
              </button>
              <button
                onClick={() => setTrackingId('RC789012')}
                className="text-sm bg-white border border-gray-300 px-3 py-1 rounded-full hover:bg-red-50 hover:border-red-300 transition-colors"
              >
                RC789012
              </button>
            </div>
          </div>
        </div>

        {/* Tracking Results */}
        {trackingData && (
          <div className="space-y-6">
            {/* Package Info */}
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-red-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Package Information</h2>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(trackingData.status)}`}>
                  {trackingData.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Tracking ID</h3>
                    <p className="text-gray-600">{trackingData.id}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">From → To</h3>
                    <p className="text-gray-600">{trackingData.from} → {trackingData.to}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Package Type</h3>
                    <p className="text-gray-600">{trackingData.packageType} ({trackingData.weight})</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Current Location</h3>
                    <p className="text-gray-600 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-red-500" />
                      {trackingData.currentLocation}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Estimated Delivery</h3>
                    <p className="text-gray-600">{trackingData.estimatedDelivery}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Sender → Receiver</h3>
                    <p className="text-gray-600">{trackingData.sender} → {trackingData.receiver}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-red-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Delivery Timeline</h2>
              <div className="space-y-6">
                {trackingData.timeline.map((item: any, index: number) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {getStatusIcon(item.status, item.completed)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-semibold ${item.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                          {item.status}
                        </h3>
                        <span className={`text-sm ${item.completed ? 'text-gray-600' : 'text-gray-400'}`}>
                          {item.time}
                        </span>
                      </div>
                      <p className={`text-sm ${item.completed ? 'text-gray-600' : 'text-gray-400'}`}>
                        {item.description}
                      </p>
                      <p className={`text-sm ${item.completed ? 'text-gray-500' : 'text-gray-400'}`}>
                        📍 {item.location}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackPackage;