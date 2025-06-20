import { NavLink } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import Button from "../Components/Button";

const Hero = () => {
  const { User } = useAuth();
  return (
    <div className="w-full min-h-[calc(100svh-80px)] flex flex-col items-center justify-center pb-8 lg:pb-0 bg-[#040E1A]">
      {/* Main Hero Section */}
      <div className="w-full flex items-center justify-center lg:flex-row flex-col-reverse gap-10 lg:gap-0">
        <div className="w-full lg:w-1/2 h-full flex items-center lg:items-start justify-center lg:px-20 px-5 flex-col gap-10">
          <h1 className="lg:text-5xl 2xl:text-6xl lg:font-bold text-center font-semibold text-4xl lg:text-left text-white">
            Ai-Interviewer and ChatBot.
          </h1>
          <h4 className="lg:text-xl 2xl:text-2xl text-lg font-semibold text-center lg:text-left text-gray-200">
            Boost your confidence and skills with our AI-powered mock interviews!
          </h4>
          <NavLink to={`${User ? "/app" : "/login"} `}>
            <Button text={"Get Started"} Class="!text-white" />
          </NavLink>
        </div>
        <div className="w-full lg:w-1/2 h-full flex items-center justify-center lg:px-0 mt-10 lg:mt-0 px-5">
          <img
            src="/assets/robot.png"
            alt="hero"
            className="rounded-xl shadow-lg shadow-blue-400"
          />
        </div>
      </div>
      <br />
      <br />
      <br />
      {/* AI Revolution Section - Image Left, Content Right */}
      <section className="w-full max-w-5xl mx-auto mt-16 px-4 flex flex-col lg:flex-row items-center gap-10">
        <div className="w-full lg:w-1/2 h-full flex items-center justify-center lg:px-0 mt-10 lg:mt-0 px-5">
          <img
            src="/assets/ai-revolution.webp"
            alt="hero"
            className="rounded-xl shadow-lg shadow-blue-400"
          />
        </div>
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-start">
          <h2 className="text-3xl font-bold text-blue-300 mb-4">The AI Revolution</h2>
          <p className="text-lg text-gray-200 mb-6">
            Artificial Intelligence is transforming the way we live, work, and learn. From automating repetitive tasks to providing personalized recommendations, AI is at the forefront of the next technological revolution. Our app harnesses the power of AI to make interview preparation smarter, more accessible, and more effective for everyone.
          </p>
        </div>
      </section>
      <br />
      <br />
      <br />
      {/* App Importance Section - Content Left, Image Right */}
      <section className="w-full max-w-5xl mx-auto mt-4 px-4 flex flex-col lg:flex-row-reverse items-center gap-10">
      <div className="w-full lg:w-1/2 h-full flex items-center justify-center lg:px-0 mt-10 lg:mt-0 px-5">
          <img
            src="/assets/app-importance.png"
            alt="hero"
            className="rounded-xl shadow-lg shadow-blue-400"
          />
        </div>
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-start">
          <h2 className="text-3xl font-bold text-pink-300 mb-4">Why Our App Matters</h2>
          <p className="text-lg text-gray-200 mb-6">
            In today's competitive world, standing out in interviews is more important than ever. Our AI Interviewer & ChatBot provides:
          </p>
          <ul className="list-disc text-left text-lg text-gray-200 mb-6 pl-6">
            <li>Personalized mock interviews tailored to your goals and industry.</li>
            <li>Instant, actionable feedback to help you improve with every session.</li>
            <li>24/7 access—practice anytime, anywhere, on any device.</li>
            <li>Secure, private, and user-friendly experience.</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default Hero;
