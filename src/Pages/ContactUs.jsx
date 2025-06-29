import React, { useState, useEffect } from "react";
import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG } from '../utilities/emailConfig';

const ContactUs = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    emailjs.init(EMAILJS_CONFIG.publicKey);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const templateParams = {
        from_name: form.name,
        from_email: form.email,
        to_name: "Aqeel",
        message: form.message,
        reply_to: form.email
      };
      await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        templateParams
      );
      setSubmitted(true);
      setForm({ name: "", email: "", message: "" });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      let errorMessage = "Failed to send message. ";
      if (err.text && err.text.includes('template ID not found')) {
        errorMessage += "Template not found. Please check your EmailJS configuration.";
      } else if (err.text && err.text.includes('service ID not found')) {
        errorMessage += "Email service not found. Please check your EmailJS configuration.";
      } else {
        errorMessage += err.text || "Please try again later.";
      }
      setError(errorMessage);
      setTimeout(() => setError(""), 7000);
    }
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#040E1A] flex flex-col items-center justify-start py-0 overflow-hidden">
      <div className="w-full max-w-2xl mx-auto mt-12">
        <div className="bg-[#10192b] rounded-3xl shadow-2xl border border-gray-700 p-8 md:p-10 z-10 relative">
          <h2 className="text-3xl font-bold text-pink-400 mb-6 text-center">Contact Us</h2>
          <p className="text-base text-gray-200 mb-6 text-center">We'd love to hear from you! Fill out the form below for support, feedback, or collaboration opportunities.</p>
          {submitted && (
            <div className="text-green-400 font-semibold text-center py-4 mb-6 bg-green-900/20 rounded-lg border border-green-700">
              Thank you for reaching out! We'll get back to you soon.
            </div>
          )}
          {error && (
            <div className="text-red-400 font-semibold text-center py-4 mb-6 bg-red-900/20 rounded-lg border border-red-700">
              {error}
            </div>
          )}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-gray-200 font-semibold mb-1" htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-[#232b47] text-white placeholder-gray-400 disabled:bg-gray-800 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-gray-200 font-semibold mb-1" htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-[#232b47] text-white placeholder-gray-400 disabled:bg-gray-800 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-gray-200 font-semibold mb-1" htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                disabled={loading}
                rows={5}
                className="w-full px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-[#232b47] text-white placeholder-gray-400 disabled:bg-gray-800 disabled:cursor-not-allowed"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-bold py-2 rounded-lg shadow-lg hover:scale-105 transition-transform duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
          
          {/* Email Link at the End */}
          <div className="mt-8 pt-6 border-t border-gray-700">
            <div className="text-center">
              <p className="text-gray-300 mb-3">Or contact us directly via email:</p>
              <a 
                href="mailto:aqeel032035@gmail.com" 
                className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 font-semibold text-lg transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-blue-900/20"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <span>aqeel032035@gmail.com</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs; 