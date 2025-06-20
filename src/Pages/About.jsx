import React, { useState, useEffect } from "react";
import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG } from '../utilities/emailConfig';

const About = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Initialize EmailJS when component mounts
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

      // Log configuration before sending
      console.log('Attempting to send email with:', {
        serviceId: EMAILJS_CONFIG.serviceId,
        templateId: EMAILJS_CONFIG.templateId,
        hasPublicKey: !!EMAILJS_CONFIG.publicKey,
        templateParams
      });

      const response = await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        templateParams
      );

      console.log('Email sent successfully:', response);
      setSubmitted(true);
      setForm({ name: "", email: "", message: "" });
      
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } catch (err) {
      console.error('Failed to send email:', err);
      let errorMessage = "Failed to send message. ";
      
      if (err.text && err.text.includes('template ID not found')) {
        errorMessage += "Template not found. Please check your EmailJS configuration.";
      } else if (err.text && err.text.includes('service ID not found')) {
        errorMessage += "Email service not found. Please check your EmailJS configuration.";
      } else {
        errorMessage += err.text || "Please try again later.";
      }
      
      setError(errorMessage);
      
      setTimeout(() => {
        setError("");
      }, 7000);
    }
    
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#040E1A] flex flex-col items-center justify-start py-0 overflow-hidden">
      <div className="w-full max-w-5xl mx-auto flex flex-col items-start justify-start gap-0 p-4 md:p-12 z-10 relative">
        <div className="w-full">
          <h1 className="text-4xl font-extrabold text-white mb-6">About Us</h1>
          <p className="mb-4 text-gray-200 text-base md:text-lg">
            <span className="font-bold text-blue-300">AI Interviewer & ChatBot – Your Smart Interview Partner</span><br/>
            AI Interviewer & ChatBot is a next-generation AI-powered platform designed to redefine the interview preparation process. With a unique blend of artificial intelligence, human-centered design, and real-time analytics, our application provides users with interactive mock interviews, intelligent chat-based career coaching, and instant performance feedback—all within an intuitive, secure environment.
          </p>
          <p className="mb-4 text-gray-200 text-base md:text-lg">
            Whether you're preparing for your first internship, your dream job, or a career transition, we help you gain confidence, improve communication, and master the art of interviewing.
          </p>

          <h2 className="text-2xl font-bold text-blue-300 mt-8 mb-2">Our Mission</h2>
          <p className="mb-4 text-gray-200 text-base md:text-lg">
            To empower individuals at every stage of their career journey through accessible, realistic, and AI-enhanced interview practice—bridging the gap between potential and opportunity.
          </p>

          <h2 className="text-2xl font-bold text-blue-300 mt-8 mb-2">Our Vision</h2>
          <p className="mb-4 text-gray-200 text-base md:text-lg">
            We envision a future where AI becomes your personalized career mentor, democratizing access to high-quality interview coaching and career development tools—making career readiness an achievable goal for everyone, anywhere.
          </p>

          <h2 className="text-2xl font-bold text-blue-300 mt-8 mb-2">What Sets Us Apart</h2>
          <p className="mb-4 text-gray-200 text-base md:text-lg">
            Personalized, realistic interview simulations: Every interview experience is uniquely crafted based on your skills, resume, and chosen job role. Our AI adapts to different industries and levels, mimicking real interviewers from HR to technical leads.
          </p>
          <p className="mb-4 text-gray-200 text-base md:text-lg">
            Real-time feedback with actionable insights: Get immediate analysis of your responses, tone, body language (in video mode), and language structure—so you know what to improve and how.
          </p>
          <p className="mb-4 text-gray-200 text-base md:text-lg">
            Conversational AI that listens and learns: Our intelligent chatbot doesn't just reply—it understands context, adjusts follow-up questions, and provides guidance based on behavioral and technical evaluation.
          </p>
          <p className="mb-4 text-gray-200 text-base md:text-lg">
            Clean, modern, and intuitive interface: A distraction-free, user-first design helps you focus on learning and self-improvement. Suitable for both desktop and mobile users.
          </p>
          <p className="mb-4 text-gray-200 text-base md:text-lg">
            Privacy-centric by design: Your data is safe, encrypted, and never shared. We prioritize your privacy with built-in security protocols and ethical data use.
          </p>
          <p className="mb-4 text-gray-200 text-base md:text-lg">
            Adaptive learning and continuous growth: As you improve, so does the platform. With your feedback, we continuously enhance our models and features to offer an even smarter experience.
          </p>

          <h2 className="text-2xl font-bold text-blue-300 mt-8 mb-2">Who We Serve</h2>
          <p className="mb-4 text-gray-200 text-base md:text-lg">
            <span className="font-bold">Students & Fresh Graduates</span> – Build confidence before stepping into the professional world.<br/>
            <span className="font-bold">Job Seekers & Professionals</span> – Prepare for technical, HR, or executive-level interviews.<br/>
            <span className="font-bold">Career Coaches & Institutions</span> – Use our tools to support learners in structured mock interview sessions.<br/>
            <span className="font-bold">Remote & Global Talent</span> – Practice interviews in multiple languages and cultural contexts.
          </p>

          <h2 className="text-2xl font-bold text-blue-300 mt-8 mb-2">Core Values</h2>
          <p className="mb-4 text-gray-200 text-base md:text-lg">
            <span className="font-bold">Innovation:</span> We believe in leveraging AI to create transformative learning experiences.<br/>
            <span className="font-bold">Integrity:</span> Transparency and trust are central to everything we build.<br/>
            <span className="font-bold">Empowerment:</span> Everyone deserves access to quality interview preparation tools.<br/>
            <span className="font-bold">User-Centricity:</span> Every feature is built with the user's success in mind.
          </p>

        </div>
        {/* Contact Us Form Section */}
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
            <div className="mt-8 text-center text-gray-400 text-sm">
              Or email us directly: <a href="https://mail.google.com/mail/?view=cm&fs=1&to=aqeel032035@gmail.com" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline font-semibold">aqeel032035@gmail.com</a>
            </div>
            <div className="mt-2 flex justify-center gap-4">
              <a href="https://www.linkedin.com/in/muhammad-aqeel-786855358" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline font-semibold flex items-center gap-1">LinkedIn</a>
              <a href="https://instagram.com/aqeeldev" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline font-semibold flex items-center gap-1">Instagram</a>
              <a href="https://twitter.com/aqeeldev" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline font-semibold flex items-center gap-1">Twitter</a>
            </div>
            
          </div>
        </div>
      </div><p className="mb-8 text-blue-200 text-base md:text-lg font-semibold">Developed by Muhammad Aqeel</p>
    </div>
  );
};

export default About; 