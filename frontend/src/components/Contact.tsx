import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    // Reset form
    setFormData({ name: '', email: '', subject: '', message: '' });
    alert('Thank you for your message! We\'ll get back to you soon.');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <section id="contact" className="max-w-6xl mx-auto mt-12 sm:mt-16 lg:mt-20 w-full px-4">
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
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
              className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-sm sm:text-base"
              required
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address"
              className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-sm sm:text-base"
              required
            />
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Subject"
              className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-sm sm:text-base"
              required
            />
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Your Message"
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all resize-none text-sm sm:text-base"
              required
            />
            <button
              type="submit"
              className="w-full bg-red-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-red-600 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              <Send className="h-5 w-5" />
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
    </section>
  );
};

export default Contact;