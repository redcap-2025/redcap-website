import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, MapPin, Package, Truck, CreditCard } from 'lucide-react';

const token = localStorage.getItem("redcap_token");
interface BookingPageProps {
  onBack: () => void;
  onBookingComplete?: (bookingId: string, bookingData: any) => void;
}

const BookingPage: React.FC<BookingPageProps> = ({ onBack, onBookingComplete }) => {
  const { user, fetchWithAuth } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    // Pickup Details
    pickupDoorNumber: '',
    pickupBuildingName: '',
    pickupStreet: '',
    pickupCity: '',
    pickupState: '',
    pickupPincode: '',
    pickupDate: '',
    
    // Delivery Details
    deliveryDoorNumber: '',
    deliveryBuildingName: '',
    deliveryStreet: '',
    deliveryCity: '',
    deliveryState: '',
    deliveryPincode: '',
    
    
    // Package Details
    packageType: '',
    description: '',
    
    // Vehicle Type
    vehicleType: '',
    
    // Contact Details
    senderName: user?.fullName || '',
    senderPhone: user?.phone || '',
    receiverName: '',
    receiverPhone: '',
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Handle browser back button
  React.useEffect(() => {
    // Push a new state when component mounts or step changes
    window.history.pushState({ page: 'booking', step: currentStep }, '', '');
    
    const handlePopState = (event: PopStateEvent) => {
      // Prevent default browser back behavior
      event.preventDefault();
      if (currentStep > 1) {
        setCurrentStep(prev => prev - 1);
      } else {
        onBack();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [currentStep, onBack]);

  const vehicleTypes = [
    { id: 'bike', name: 'Two Wheeler', capacity: 'Up to 20kg', price: '₹50-150', icon: '🏍️' },
    { id: 'auto', name: 'Auto Rickshaw', capacity: 'Up to 100kg', price: '₹100-300', icon: '🛺' },
    { id: 'mini-truck', name: 'Mini Truck', capacity: 'Up to 500kg', price: '₹500-1500', icon: '🚚' },
    { id: 'truck', name: 'Truck', capacity: 'Up to 2000kg', price: '₹1500-5000', icon: '🚛' },
  ];

  const packageTypes = [
    'Documents', 'Electronics', 'Clothing', 'Food Items', 'Furniture', 'Fragile Items', 'Other'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateStep = (step: number) => {
    const newErrors: {[key: string]: string} = {};

    if (step === 1) {
      // Pickup Details Validation
      if (!bookingData.pickupDoorNumber.trim()) newErrors.pickupDoorNumber = 'Door number is required';
      if (!bookingData.pickupStreet.trim()) newErrors.pickupStreet = 'Street is required';
      if (!bookingData.pickupCity.trim()) newErrors.pickupCity = 'Pickup city is required';
      if (!bookingData.pickupState.trim()) newErrors.pickupState = 'Pickup state is required';
      if (!bookingData.pickupPincode) newErrors.pickupPincode = 'Pickup pincode is required';
      else if (!/^\d{6}$/.test(bookingData.pickupPincode)) newErrors.pickupPincode = 'Invalid pincode';
      if (!bookingData.pickupDate) newErrors.pickupDate = 'Pickup date is required';

    } else if (step === 2) {
      // Delivery Details Validation
      if (!bookingData.deliveryDoorNumber.trim()) newErrors.deliveryDoorNumber = 'Door number is required';
      if (!bookingData.deliveryStreet.trim()) newErrors.deliveryStreet = 'Street is required';
      if (!bookingData.deliveryCity.trim()) newErrors.deliveryCity = 'Delivery city is required';
      if (!bookingData.deliveryState.trim()) newErrors.deliveryState = 'Delivery state is required';
      if (!bookingData.deliveryPincode) newErrors.deliveryPincode = 'Delivery pincode is required';
      else if (!/^\d{6}$/.test(bookingData.deliveryPincode)) newErrors.deliveryPincode = 'Invalid pincode';
    } else if (step === 3) {
      // Package Details Validation
      if (!bookingData.packageType) newErrors.packageType = 'Package type is required';
      if (!bookingData.description.trim()) newErrors.description = 'Package description is required';
    } else if (step === 4) {
      // Vehicle Type Validation
      if (!bookingData.vehicleType) newErrors.vehicleType = 'Vehicle type is required';
    } else if (step === 5) {
      // Contact Details Validation
      if (!bookingData.senderName.trim()) newErrors.senderName = 'Sender name is required';
      if (!bookingData.senderPhone) newErrors.senderPhone = 'Sender phone is required';
      else if (!/^[6-9]\d{9}$/.test(bookingData.senderPhone)) newErrors.senderPhone = 'Invalid phone number';
      if (!bookingData.receiverName.trim()) newErrors.receiverName = 'Receiver name is required';
      if (!bookingData.receiverPhone) newErrors.receiverPhone = 'Receiver phone is required';
      else if (!/^[6-9]\d{9}$/.test(bookingData.receiverPhone)) newErrors.receiverPhone = 'Invalid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 6));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (validateStep(5)) {
      try {
        // Convert pickupDate into proper datetime format
        const payload = {
          ...bookingData,
          pickupDate: new Date(bookingData.pickupDate).toISOString().slice(0, 19).replace("T", " "),
        };

        const response = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/api/bookings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        console.log("📦 Booking API response:", result); // debug

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Booking failed");
        }

        if (onBookingComplete) {
          onBookingComplete(result.booking.id, result.booking);
        }
      } catch (err) {
        console.error("❌ Booking error:", err);
        alert("Failed to create booking. Please try again.");
      }
    }
  };

  const handleCancelBooking = () => {
    if (window.confirm('Are you sure you want to cancel this booking? All entered data will be lost.')) {
      onBack();
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="h-6 w-6 text-red-500" />
              Pickup Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Door Number *</label>
                <input
                  type="text"
                  name="pickupDoorNumber"
                  value={bookingData.pickupDoorNumber}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all ${
                    errors.pickupDoorNumber ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter door/flat number"
                />
                {errors.pickupDoorNumber && <p className="mt-1 text-sm text-red-600">{errors.pickupDoorNumber}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Building Name (Optional)</label>
                <input
                  type="text"
                  name="pickupBuildingName"
                  value={bookingData.pickupBuildingName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                  placeholder="Enter building/apartment name"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Street *</label>
                <input
                  type="text"
                  name="pickupStreet"
                  value={bookingData.pickupStreet}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all ${
                    errors.pickupStreet ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter street name"
                />
                {errors.pickupStreet && <p className="mt-1 text-sm text-red-600">{errors.pickupStreet}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                <input
                  type="text"
                  name="pickupCity"
                  value={bookingData.pickupCity}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all ${
                    errors.pickupCity ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter city"
                />
                {errors.pickupCity && <p className="mt-1 text-sm text-red-600">{errors.pickupCity}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                <input
                  type="text"
                  name="pickupState"
                  value={bookingData.pickupState}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all ${
                    errors.pickupState ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter state"
                />
                {errors.pickupState && <p className="mt-1 text-sm text-red-600">{errors.pickupState}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
                <input
                  type="text"
                  name="pickupPincode"
                  value={bookingData.pickupPincode}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all ${
                    errors.pickupPincode ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter pincode"
                  maxLength={6}
                />
                {errors.pickupPincode && <p className="mt-1 text-sm text-red-600">{errors.pickupPincode}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Date *</label>
                <input
                  type="date"
                  name="pickupDate"
                  value={bookingData.pickupDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all ${
                    errors.pickupDate ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.pickupDate && <p className="mt-1 text-sm text-red-600">{errors.pickupDate}</p>}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="h-6 w-6 text-red-500" />
              Delivery Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Door Number *</label>
                <input
                  type="text"
                  name="deliveryDoorNumber"
                  value={bookingData.deliveryDoorNumber}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all ${
                    errors.deliveryDoorNumber ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter door/flat number"
                />
                {errors.deliveryDoorNumber && <p className="mt-1 text-sm text-red-600">{errors.deliveryDoorNumber}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Building Name (Optional)</label>
                <input
                  type="text"
                  name="deliveryBuildingName"
                  value={bookingData.deliveryBuildingName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                  placeholder="Enter building/apartment name"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Street *</label>
                <input
                  type="text"
                  name="deliveryStreet"
                  value={bookingData.deliveryStreet}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all ${
                    errors.deliveryStreet ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter street name"
                />
                {errors.deliveryStreet && <p className="mt-1 text-sm text-red-600">{errors.deliveryStreet}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                <input
                  type="text"
                  name="deliveryCity"
                  value={bookingData.deliveryCity}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all ${
                    errors.deliveryCity ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter city"
                />
                {errors.deliveryCity && <p className="mt-1 text-sm text-red-600">{errors.deliveryCity}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                <input
                  type="text"
                  name="deliveryState"
                  value={bookingData.deliveryState}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all ${
                    errors.deliveryState ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter state"
                />
                {errors.deliveryState && <p className="mt-1 text-sm text-red-600">{errors.deliveryState}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
                <input
                  type="text"
                  name="deliveryPincode"
                  value={bookingData.deliveryPincode}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all ${
                    errors.deliveryPincode ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter pincode"
                  maxLength={6}
                />
                {errors.deliveryPincode && <p className="mt-1 text-sm text-red-600">{errors.deliveryPincode}</p>}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="h-6 w-6 text-red-500" />
              Package Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Package Type *</label>
                <select
                  name="packageType"
                  value={bookingData.packageType}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all ${
                    errors.packageType ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select package type</option>
                  {packageTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.packageType && <p className="mt-1 text-sm text-red-600">{errors.packageType}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Package Description *</label>
                <textarea
                  name="description"
                  value={bookingData.description}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all resize-none ${
                    errors.description ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Describe the contents of your package"
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Truck className="h-6 w-6 text-red-500" />
              Select Vehicle Type
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vehicleTypes.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className={`border-2 rounded-lg p-6 cursor-pointer transition-all hover:shadow-lg ${
                    bookingData.vehicleType === vehicle.id
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300 hover:border-red-300'
                  }`}
                  onClick={() => setBookingData(prev => ({ ...prev, vehicleType: vehicle.id }))}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-3">{vehicle.icon}</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{vehicle.name}</h3>
                    <p className="text-sm text-gray-600 mb-1">{vehicle.capacity}</p>
                    <p className="text-sm font-medium text-red-600">{vehicle.price}</p>
                  </div>
                </div>
              ))}
            </div>
            {errors.vehicleType && <p className="text-sm text-red-600">{errors.vehicleType}</p>}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="h-6 w-6 text-red-500" />
              Contact Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sender Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sender Name *</label>
                    <input
                      type="text"
                      name="senderName"
                      value={bookingData.senderName}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all ${
                        errors.senderName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Enter sender name"
                    />
                    {errors.senderName && <p className="mt-1 text-sm text-red-600">{errors.senderName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sender Phone *</label>
                    <input
                      type="tel"
                      name="senderPhone"
                      value={bookingData.senderPhone}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all ${
                        errors.senderPhone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Enter sender phone"
                      maxLength={10}
                    />
                    {errors.senderPhone && <p className="mt-1 text-sm text-red-600">{errors.senderPhone}</p>}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Receiver Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Receiver Name *</label>
                    <input
                      type="text"
                      name="receiverName"
                      value={bookingData.receiverName}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all ${
                        errors.receiverName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Enter receiver name"
                    />
                    {errors.receiverName && <p className="mt-1 text-sm text-red-600">{errors.receiverName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Receiver Phone *</label>
                    <input
                      type="tel"
                      name="receiverPhone"
                      value={bookingData.receiverPhone}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all ${
                        errors.receiverPhone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Enter receiver phone"
                      maxLength={10}
                    />
                    {errors.receiverPhone && <p className="mt-1 text-sm text-red-600">{errors.receiverPhone}</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-red-500" />
              Booking Summary
            </h2>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Pickup Details</h3>
                  <p className="text-sm text-gray-600 mb-1">
                    {bookingData.pickupDoorNumber}
                    {bookingData.pickupBuildingName && `, ${bookingData.pickupBuildingName}`}
                    , {bookingData.pickupStreet}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">{bookingData.pickupCity}, {bookingData.pickupState} - {bookingData.pickupPincode}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Delivery Details</h3>
                  <p className="text-sm text-gray-600 mb-1">
                    {bookingData.deliveryDoorNumber}
                    {bookingData.deliveryBuildingName && `, ${bookingData.deliveryBuildingName}`}
                    , {bookingData.deliveryStreet}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">{bookingData.deliveryCity}, {bookingData.deliveryState} - {bookingData.deliveryPincode}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Package Details</h3>
                  <p className="text-sm text-gray-600 mb-1">Type: {bookingData.packageType}</p>
                  <p className="text-sm text-gray-600">{bookingData.description}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Vehicle & Contacts</h3>
                  <p className="text-sm text-gray-600 mb-1">Vehicle: {vehicleTypes.find(v => v.id === bookingData.vehicleType)?.name}</p>
                  <p className="text-sm text-gray-600 mb-1">Sender: {bookingData.senderName} ({bookingData.senderPhone})</p>
                  <p className="text-sm text-gray-600">Receiver: {bookingData.receiverName} ({bookingData.receiverPhone})</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-300">
                <p className="text-sm text-gray-600 mt-1">*Final cost may vary based on actual distance and additional services</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
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

        {/* Progress Bar */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-8 border border-red-100">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Book Your Delivery</h1>
            <span className="text-sm text-gray-600">Step {currentStep} of 6</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-red-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 6) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-red-100">
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <div className="flex gap-3">
              <button
                onClick={handleCancelBooking}
                className="px-6 py-3 border border-red-300 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors"
              >
                Cancel Booking
              </button>
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
            </div>
            
            {currentStep < 6 ? (
              <button
                onClick={nextStep}
                className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
              >
                Confirm Booking
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
