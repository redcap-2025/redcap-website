// components/BookingConfirmation.tsx
import React from 'react';
import {
  CheckCircle,
  MessageCircle,
  Phone,
  Mail,
  ArrowLeft,
  Package,
  MapPin,
  Calendar,
  User,
  Truck,
} from 'lucide-react';

interface BookingConfirmationProps {
  onBackToDashboard: () => void;
  bookingId: string;
  bookingData: any;
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  onBackToDashboard,
  bookingId,
  bookingData,
}) => {
  const trackingCode = bookingData?.trackingCode || `RC${bookingId}`;
  const whatsappNumber = "+919629333135";
  const supportEmail = "support@redcap.com";
  const expectedPickup = new Date(bookingData.pickupDate).toLocaleString();

  // Handle browser back button
  React.useEffect(() => {
    window.history.pushState({ page: 'confirmation' }, '', '');
    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      onBackToDashboard();
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [onBackToDashboard]);

  const handleWhatsAppContact = () => {
    const message = `Hi RedCap Team! I have submitted a booking request with Tracking ID: ${trackingCode}. Please confirm my booking and share pickup details.`;
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6 shadow-md">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Booking Confirmed! 🎉
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Your delivery request has been successfully submitted. Our team will contact you shortly to confirm pickup and provide live tracking.
          </p>
        </div>

        {/* Tracking ID Banner */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl p-6 mb-8 shadow-lg text-center">
          <p className="text-red-100 text-sm uppercase tracking-wider font-medium">Tracking ID</p>
          <p className="text-3xl font-bold mt-1">{trackingCode}</p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Truck className="h-6 w-6 text-red-500" />
              Delivery Summary
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Pickup Section */}
              <div className="space-y-5">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 border-gray-200">
                  🏠 Pickup Details
                </h3>
                <div className="space-y-4 text-sm">
                  <div className="flex gap-3">
                    <MapPin className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Address</p>
                      <p className="text-gray-600">
                        {bookingData.pickupDoorNumber}
                        {bookingData.pickupBuildingName && `, ${bookingData.pickupBuildingName}`}
                        , {bookingData.pickupStreet}, {bookingData.pickupCity}, {bookingData.pickupState} - {bookingData.pickupPincode}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <User className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Contact</p>
                      <p className="text-gray-600">{bookingData.senderName} • {bookingData.senderPhone}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Calendar className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Expected Pickup</p>
                      <p className="text-gray-600">{expectedPickup}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Section */}
              <div className="space-y-5">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 border-gray-200">
                  📦 Delivery Details
                </h3>
                <div className="space-y-4 text-sm">
                  <div className="flex gap-3">
                    <MapPin className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Address</p>
                      <p className="text-gray-600">
                        {bookingData.deliveryDoorNumber}
                        {bookingData.deliveryBuildingName && `, ${bookingData.deliveryBuildingName}`}
                        , {bookingData.deliveryStreet}, {bookingData.deliveryCity}, {bookingData.deliveryState} - {bookingData.deliveryPincode}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <User className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Receiver</p>
                      <p className="text-gray-600">{bookingData.receiverName} • {bookingData.receiverPhone}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Package className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Package Info</p>
                      <p className="text-gray-600">
                        Type: {bookingData.packageType}<br />
                        Notes: {bookingData.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-lg">
                <Truck className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="font-semibold text-blue-900">Vehicle Type</p>
                  <p className="text-blue-700">
                    {bookingData.vehicleType === 'bike' ? 'Two Wheeler' :
                     bookingData.vehicleType === 'auto' ? 'Auto Rickshaw' :
                     bookingData.vehicleType === 'mini-truck' ? 'Mini Truck' :
                     bookingData.vehicleType === 'truck' ? 'Truck' : 'Not specified'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mt-8 shadow-inner">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">!</span>
            </div>
            <div>
              <h3 className="font-bold text-yellow-800 text-lg">Next Steps</h3>
              <ul className="text-yellow-700 mt-2 space-y-1">
                <li>• Our team will call or WhatsApp you within 2 hours to confirm pickup</li>
                <li>• You'll receive a live tracking link once the delivery starts</li>
                <li>• Share this tracking ID for updates: <strong>{trackingCode}</strong></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mt-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            Need Immediate Help?
          </h2>
          <p className="text-gray-600 text-center mb-6">
            Contact our support team for faster confirmation
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleWhatsAppContact}
              className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white px-6 py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
            >
              <MessageCircle className="h-5 w-5" />
              WhatsApp Us
            </button>

            <a
              href={`tel:${whatsappNumber}`}
              className="inline-flex items-center gap-3 bg-blue-500 hover:bg-blue-600 text-white px-6 py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
            >
              <Phone className="h-5 w-5" />
              Call Support
            </a>

            <a
              href={`mailto:${supportEmail}`}
              className="inline-flex items-center gap-3 bg-gray-500 hover:bg-gray-600 text-white px-6 py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
            >
              <Mail className="h-5 w-5" />
              Email Us
            </a>
          </div>
        </div>

        {/* Back to Dashboard */}
        <div className="text-center mt-8">
          <button
            onClick={onBackToDashboard}
            className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;