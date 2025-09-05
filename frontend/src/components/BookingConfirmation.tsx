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
  User 
} from 'lucide-react';

interface BookingConfirmationProps {
  onBackToDashboard: () => void;
  bookingId: string;
  bookingData: any;
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({ 
  onBackToDashboard, 
  bookingId, 
  bookingData 
}) => {
  const whatsappNumber = "+919629333135";
  const supportEmail = "support@redcap.com";
  const supportPhone = "+91 9629333135";

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
    const message = `Hi RedCap Team! I have submitted a booking request with Tracking ID: ${bookingId}. Please confirm my booking details and provide further updates.`;
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Booking Request Submitted!
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Thank you for choosing RedCap! Your booking request has been received and our team will contact you shortly for confirmation.
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-8 border border-red-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
            <div className="bg-red-100 text-red-800 px-4 py-2 rounded-full font-semibold">
              Tracking ID: {bookingData?.trackingCode || bookingId}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Pickup Location</h3>
                  <p className="text-gray-600 text-sm">
                    {bookingData?.pickupDoorNumber}, {bookingData?.pickupBuildingName}, {bookingData?.pickupStreet}<br />
                    {bookingData?.pickupCity}, {bookingData?.pickupState} - {bookingData?.pickupPincode}
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    Contact: {bookingData?.pickupName} ({bookingData?.pickupPhone})
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Pickup Date & Time</h3>
                  <p className="text-gray-600 text-sm">
                    {bookingData?.pickupAt ? new Date(bookingData.pickupAt).toLocaleString() : "Not scheduled"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Delivery Location</h3>
                  <p className="text-gray-600 text-sm">
                    {bookingData?.dropoffDoorNumber}, {bookingData?.dropoffBuildingName}, {bookingData?.dropoffStreet}<br />
                    {bookingData?.dropoffCity}, {bookingData?.dropoffState} - {bookingData?.dropoffPincode}
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    Contact: {bookingData?.dropoffName} ({bookingData.dropoffPhone})
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Package Details</h3>
                  <p className="text-gray-600 text-sm">
                    {bookingData?.packageContents}<br />
                  <br />
                    {bookingData?.fragile ? "(Fragile)" : ""}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Receiver Info */}
          <div className="flex items-start gap-3 mb-6">
            <User className="h-5 w-5 text-purple-500 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900">Receiver Name</h3>
              <p className="text-gray-600 text-sm">{bookingData?.dropoffName}</p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-sm font-bold">!</span>
              </div>
              <div>
                <h3 className="font-semibold text-yellow-800 mb-1">Booking Confirmation Pending</h3>
                <p className="text-yellow-700 text-sm">
                  Your booking is currently under review. Our team will contact you within 2-4 hours to confirm the details and provide final pricing.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Team Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-8 border border-red-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Get Quick Confirmation via WhatsApp
          </h2>
          <p className="text-gray-600 text-center mb-6">
            For faster confirmation and updates, contact our team directly
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleWhatsAppContact}
              className="inline-flex items-center justify-center gap-3 bg-green-500 text-white px-6 py-4 rounded-xl font-semibold hover:bg-green-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <MessageCircle className="h-5 w-5" />
              Contact via WhatsApp
            </button>
            
            <a
              href={`tel:${supportPhone}`}
              className="inline-flex items-center justify-center gap-3 bg-blue-500 text-white px-6 py-4 rounded-xl font-semibold hover:bg-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Phone className="h-5 w-5" />
              Call Support
            </a>
            
            <a
              href={`mailto:${supportEmail}`}
              className="inline-flex items-center justify-center gap-3 bg-gray-500 text-white px-6 py-4 rounded-xl font-semibold hover:bg-gray-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Mail className="h-5 w-5" />
              Email Support
            </a>
          </div>
        </div>

        {/* Back to Dashboard */}
        <div className="text-center">
          <button
            onClick={onBackToDashboard}
            className="inline-flex items-center gap-2 bg-red-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-red-600 transition-all duration-200 shadow-lg hover:shadow-xl"
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
