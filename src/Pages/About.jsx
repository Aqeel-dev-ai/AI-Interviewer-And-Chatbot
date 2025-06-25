import React from "react";

const About = () => {
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
      </div>
      <p className="mb-8 text-blue-200 text-base md:text-lg font-semibold">Developed by Muhammad Aqeel</p>
    </div>
  );
};

export default About; 