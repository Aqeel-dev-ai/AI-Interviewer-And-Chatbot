import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TagInput from "../Components/TagInput.jsx";
import { useInterviewContext } from "../Context/InterviewContext";
import { useAuth } from "../Context/AuthContext";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "../utilities/firebase";


const InterviewHistorySidebar = ({ onInterviewSelect }) => {
  const { User } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('User in sidebar:', User);
    console.log('User UID:', User?.uid);
    console.log('User ID:', User?.id);
    console.log('User email:', User?.email);
    console.log('User keys:', Object.keys(User || {}));
    console.log('User toString:', User?.toString());
    
    // Check if user is properly loaded
    if (!User || !User.uid) {
      console.log('User not loaded or no UID, skipping interview fetch');
      return;
    }
    const fetchInterview = async () => {
      setLoading(true);
      try {
        console.log('Fetching interviews for user:', User.uid);
        
        // First, let's try to get all interviews to see if we can access the collection
        const allInterviewsQuery = query(collection(db, "Interview"));
        const allInterviewsSnapshot = await getDocs(allInterviewsQuery);
        console.log('All interviews in collection:', allInterviewsSnapshot.docs.length);
        
        // Log all interviews to see their structure
        allInterviewsSnapshot.docs.forEach((doc, index) => {
          console.log(`Interview ${index}:`, doc.data());
        });
        
        // Now get user-specific interviews (without orderBy to avoid index requirement)
        const q = query(
          collection(db, "Interview"),
          where("UserId", "==", User.uid)
        );
        const querySnapshot = await getDocs(q);
        const interviewsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        // Sort by timestamp on the client side
        const sortedInterviews = interviewsData.sort((a, b) => {
          const timestampA = a.timestamp?.toDate?.() || new Date(0);
          const timestampB = b.timestamp?.toDate?.() || new Date(0);
          return timestampB - timestampA; // Descending order (newest first)
        });
        
        console.log('Fetched interviews:', sortedInterviews);
        console.log('Number of interviews found:', sortedInterviews.length);
        setInterviews(sortedInterviews);
      } catch (error) {
        console.error('Error fetching interviews:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        setInterviews([]);
      } finally {
        setLoading(false);
      }
    };
    fetchInterview();
  }, [User]);

  const handleInterviewClick = (interview) => {
    onInterviewSelect(interview);
  };

  return (
    <div className="fixed top-[80px] left-0 h-[calc(100vh-80px)] w-[340px] z-50 bg-[#081229] border-r border-[#232b47] flex flex-col shadow-lg">
      <div className="p-4 border-b border-[#232b47]">
        <span className="text-white font-semibold text-lg">Interview History</span>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {loading ? (
          <div className="text-white text-center mt-4">Loading...</div>
        ) : interviews.length === 0 ? (
          <div className="text-gray-400 text-center mt-4">No Interview History</div>
        ) : (
          interviews.map((item) => (
            <div 
              key={item.id} 
              className="mb-3 p-2 rounded bg-[#10192b] text-white cursor-pointer hover:bg-[#1a2332] transition-colors"
              onClick={() => handleInterviewClick(item)}
            >
              <div className="font-semibold">{item.jobTitle || "Untitled"}</div>
              <div className="text-xs text-gray-400">{item.timestamp?.toDate?.().toLocaleString?.() || ""}</div>
              <div className="text-sm mt-1">{item.Result ? `Result: ${item.Result.length} answers` : "No result"}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const InterviewForm = () => {
  const navigate = useNavigate();
  const {
    industriesAndJobs,
    handleIndustryChange,
    jobTitles,
    handleSubmit,
    onSubmit,
    register,
    GenerateQuestions,
    btndisable,
    selectedModel,
    setSelectedModel,
  } = useInterviewContext();

  const [formMode, setFormMode] = useState("manual"); // 'manual' or 'resume'
  const [resumeText, setResumeText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [fileName, setFileName] = useState("");
  const [parseError, setParseError] = useState("");
  const [formError, setFormError] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);

  const handleInterviewSelect = (interview) => {
    // Navigate to Result page with interview data
    navigate('/result', { 
      state: { 
        interviewData: interview,
        fromHistory: true 
      } 
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    setParseError("");
    setFileName("");
    setResumeText("");

    if (!file) return;

    if (file.type !== "application/pdf") {
      setParseError("Please upload a PDF file.");
      return;
    }

    setFileName(file.name);
    setIsParsing(true);

    try {
      const pdfjsLib = await import("pdfjs-dist");
      
      // For PDF.js v5.x with Vite, try to configure worker properly
      // If this fails, we'll catch it and fall back to main thread
      try {
        const workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url);
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc.href;
      } catch (workerError) {
        console.warn('Worker configuration failed, using main thread:', workerError);
        // Don't set workerSrc, let it use main thread
      }

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          // Add timeout to prevent hanging
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('PDF parsing timeout')), 60000); // 60 second timeout
          });

          const loadingTask = pdfjsLib.getDocument({ 
            data: event.target.result,
            disableFontFace: true,
            // Try to use worker if available, otherwise fall back to main thread
            disableWorker: false
          });
          
          console.log("Starting PDF parsing...");
          const pdf = await Promise.race([loadingTask.promise, timeoutPromise]);
          console.log(`PDF loaded successfully with ${pdf.numPages} pages`);
          
          let text = "";
          
          for (let i = 1; i <= pdf.numPages; i++) {
            try {
              console.log(`Parsing page ${i}/${pdf.numPages}...`);
              const page = await pdf.getPage(i);
              const content = await page.getTextContent();
              const pageText = content.items.map((item) => item.str).join(" ");
              text += pageText + " ";
              console.log(`Page ${i} parsed successfully, length: ${pageText.length}`);
            } catch (pageError) {
              console.warn(`Error parsing page ${i}:`, pageError);
              // Continue with other pages even if one fails
            }
          }
          
          console.log(`PDF parsing completed. Total text length: ${text.length}`);
          if (text.trim()) {
            setResumeText(text.trim());
            console.log("Resume text set successfully");
          } else {
            setParseError("No text content found in the PDF. The PDF might be image-based or corrupted. Please ensure your PDF contains selectable text.");
            console.log("No text content found in PDF");
          }
        } catch (error) {
          console.error("Error parsing PDF content:", error);
          
          // Provide more specific error messages
          let errorMessage = "Could not read the content of the PDF.";
          
          if (error.name === "InvalidPDFException") {
            errorMessage = "The PDF file appears to be corrupted or invalid.";
          } else if (error.name === "MissingPDFException") {
            errorMessage = "The PDF file is missing or could not be loaded.";
          } else if (error.name === "UnexpectedResponseException") {
            errorMessage = "Network error while loading PDF. Please check your connection.";
          } else if (error.message && error.message.includes("password")) {
            errorMessage = "This PDF is password protected. Please remove the password and try again.";
          } else if (error.message && error.message.includes("timeout")) {
            errorMessage = "PDF parsing took too long. The file might be too large or complex.";
          } else if (error.message && error.message.includes("worker")) {
            errorMessage = "PDF parser worker issue. Please try refreshing the page and uploading again.";
          } else if (error.message && error.message.includes("GlobalWorkerOptions")) {
            errorMessage = "PDF parser configuration issue. Please refresh the page and try again.";
          } else if (error.message && error.message.includes("workerSrc")) {
            errorMessage = "PDF parser worker configuration issue. Please refresh the page and try again.";
          } else if (error.message && error.message.includes("fake worker")) {
            errorMessage = "PDF parsing is running in compatibility mode. Large files may be slower to process.";
          }
          
          setParseError(errorMessage);
        } finally {
          setIsParsing(false);
        }
      };
      
      reader.onerror = () => {
        setParseError("Error reading the file. Please try again.");
        setIsParsing(false);
      };
      
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error loading PDF.js:", error);
      
      let errorMessage = "An unexpected error occurred while loading the PDF parser.";
      
      if (error.message && error.message.includes("workerSrc")) {
        errorMessage = "PDF parser worker configuration error. Please refresh the page and try again.";
      } else if (error.message && error.message.includes("Invalid `workerSrc` type")) {
        errorMessage = "PDF parser configuration issue. Please refresh the page and try again.";
      } else if (error.message && error.message.includes("network")) {
        errorMessage = "Network error while loading PDF parser. Please check your connection.";
      } else if (error.message && error.message.includes("import")) {
        errorMessage = "PDF parser module failed to load. Please refresh the page and try again.";
      }
      
      setParseError(errorMessage);
      setIsParsing(false);
    }
  };

  const handleResumeSubmit = (data) => {
    if (!resumeText) {
      setParseError("Please upload a resume and wait for it to be processed.");
      setFormError("Please upload a resume and wait for it to be processed.");
      return;
    }
    setFormError("");
    onSubmit({ ...data, resumeText }, "resume");
  };

  // Wrap onSubmit to catch errors and set formError
  const wrappedOnSubmit = async (data, mode) => {
    try {
      setFormError("");
      await onSubmit(data, mode);
    } catch (err) {
      setFormError("An error occurred while submitting the form. Please try again.");
    }
  };

  const ManualForm = (
    <form
      onSubmit={handleSubmit((data) => wrappedOnSubmit(data, "manual"))}
      className="w-full grid grid-cols-1 gap-6 lg:px-10 px-3"
    >
      <div className="flex flex-col gap-1 text-black">
        <label
          htmlFor="industries"
          className="text-lg font-semibold text-gray-100"
        >
          Select Industry:
        </label>
        <select
          id="industries"
          className="bg-slate-300 outline-none text-base font-semibold py-3 rounded-lg px-3"
          {...register("selectIndustry")}
          onChange={handleIndustryChange}
        >
          <option className="text-base font-semibold " value="">
            Choose Industry...
          </option>

          {industriesAndJobs.map((obj, index) => {
            return (
              <option
                key={index}
                className="text-base font-semibold "
                value={obj.industry}
              >
                {obj.industry}
              </option>
            );
          })}
        </select>
      </div>

      <div className="flex flex-col gap-1 text-black">
        <label
          htmlFor="Job-Title"
          className="text-lg font-semibold text-gray-100"
        >
          Job Title:
        </label>
        <select
          id="Job-Title"
          className="bg-slate-300 outline-none text-base font-semibold py-3 rounded-lg px-3"
          {...register("JobTitle")}
        >
          <option className="text-base font-semibold " value="">
            Choose Job Title...
          </option>
          {industriesAndJobs.flatMap((industry) => industry.jobs).map((job, index) => (
            <option
              className="text-base font-semibold "
              key={index}
              value={job.trim()}
            >
              {job.trim()}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1 text-black">
        <label
          htmlFor="description"
          className="text-lg font-semibold text-gray-100"
        >
          Job Description:
        </label>
        <textarea
          id="description"
          rows="4"
          placeholder="Describe the job role you're preparing for. Include key responsibilities, required technologies, tools, frameworks, and any specific requirements. This helps generate more relevant interview questions.

Examples:
• React Developer: Building responsive UIs, state management, API integration, testing
• Python Backend: REST APIs, database design, cloud deployment, microservices
• Data Scientist: Machine learning models, data analysis, statistical modeling, visualization"
          className="placeholder-gray-500 outline-none bg-slate-300 rounded-lg px-3 py-1 text-base font-semibold custom-sidebar"
          {...register("Description")}
        ></textarea>
        <p className="text-sm text-gray-400 mt-1">
          💡 Tip: The more specific you are about the role, technologies, and requirements, the better tailored your interview questions will be.
        </p>
      </div>

      <div className="flex flex-col gap-1 text-black">
        <label
          htmlFor="Experience"
          className="text-lg font-semibold text-gray-100"
        >
          What's Your Experince:
        </label>
        <select
          {...register("Experience")}
          id="Experience"
          className="bg-slate-300 outline-none text-base font-semibold py-3 rounded-lg px-3"
        >
          <option className="text-base font-semibold " value="">
            Choose Experience...
          </option>
          <option className="text-base font-semibold " value={"Student"}>
            Student
          </option>
          <option className="text-base font-semibold " value={"Fresher"}>
            Fresher
          </option>
          <option
            className="text-base font-semibold "
            value={"Intermediate"}
          >
            Intermediate
          </option>
          <option className="text-base font-semibold " value={"Senior"}>
            Senior
          </option>
        </select>
      </div>

      <div className="flex flex-col gap-1 text-black">
        <label
          htmlFor="interviewTime"
          className="text-lg font-semibold text-gray-100"
        >
          Interview Duration:
        </label>
        <select
          {...register("interviewTime")}
          id="interviewTime"
          className="bg-slate-300 outline-none text-base font-semibold py-3 rounded-lg px-3"
        >
          <option className="text-base font-semibold " value="">
            Select Interview Duration...
          </option>
          <option className="text-base font-semibold " value={15}>
            15 Minutes
          </option>
          <option className="text-base font-semibold " value={30}>
            30 Minutes
          </option>
          <option className="text-base font-semibold " value={45}>
            45 Minutes
          </option>
          <option className="text-base font-semibold " value={60}>
            60 Minutes
          </option>
        </select>
      </div>

      <div className="flex  w-full flex-col gap-1 text-black">
        <label className="text-lg font-semibold text-gray-100">
          Skills & Technologies:
        </label>
        <TagInput></TagInput>
      </div>
       <div className="mt-3 w-full flex items-center justify-center flex-col">
        {formError && (
          <div className="w-full text-red-400 text-sm bg-red-900/20 p-3 rounded border border-red-700 mb-2">
            {formError}
          </div>
        )}
        <button
          disabled={btndisable}
          type="submit"
          className="bg-cyan-600 text-xl w-full font-bold lg:px-6 rounded-xl py-2  text-white hover:bg-cyan-700 transition-all disabled:bg-gray-500"
        >
          {GenerateQuestions ? "Generating Questions..." : "Submit and Start"}
        </button>
      </div>
    </form>
  );

  const ResumeForm = (
     <form
      onSubmit={handleSubmit(handleResumeSubmit)}
      className="w-full grid grid-cols-1 gap-6 lg:px-10 px-3"
    >
        <div className="flex flex-col gap-1 text-black">
        <label
          htmlFor="Job-Title-Resume"
          className="text-lg font-semibold text-gray-100"
        >
          Job Title You're Applying For:
        </label>
        <select
          id="Job-Title-Resume"
          className="bg-slate-300 outline-none text-base font-semibold py-3 rounded-lg px-3"
          {...register("JobTitle", { required: true })}
        >
          <option className="text-base font-semibold " value="">
            Choose Job Title...
          </option>
          {industriesAndJobs.flatMap((industry) => industry.jobs).map((job, index) => (
            <option
              className="text-base font-semibold "
              key={index}
              value={job}
            >
              {job.trim()}
            </option>
          ))}
        </select>
      </div>
       <div className="flex flex-col gap-1 text-black">
        <label
          htmlFor="Experience-Resume"
          className="text-lg font-semibold text-gray-100"
        >
          Your Experience Level:
        </label>
        <select
          {...register("Experience", { required: true })}
          id="Experience-Resume"
          className="bg-slate-300 outline-none text-base font-semibold py-3 rounded-lg px-3"
        >
          <option className="text-base font-semibold " value="">
            Choose Experience...
          </option>
          <option className="text-base font-semibold " value={"Student"}>
            Student
          </option>
          <option className="text-base font-semibold " value={"Fresher"}>
            Fresher
          </option>
          <option
            className="text-base font-semibold "
            value={"Intermediate"}
          >
            Intermediate
          </option>
          <option className="text-base font-semibold " value={"Senior"}>
            Senior
          </option>
        </select>
      </div>
      <div className="flex flex-col gap-1 text-black">
        <label
          htmlFor="interviewTime"
          className="text-lg font-semibold text-gray-100"
        >
          Interview Duration:
        </label>
        <select
          {...register("interviewTime")}
          id="interviewTime"
          className="bg-slate-300 outline-none text-base font-semibold py-3 rounded-lg px-3"
        >
          <option className="text-base font-semibold " value="">
            Select Interview Duration...
          </option>
          <option className="text-base font-semibold " value={15}>
            15 Minutes
          </option>
          <option className="text-base font-semibold " value={30}>
            30 Minutes
          </option>
          <option className="text-base font-semibold " value={45}>
            45 Minutes
          </option>
          <option className="text-base font-semibold " value={60}>
            60 Minutes
          </option>
        </select>
      </div>
      <div className="flex flex-col gap-1 text-black">
        <label
          htmlFor="resume"
          className="text-lg font-semibold text-gray-100"
        >
          Upload Your Resume (PDF only):
        </label>
        <p className="text-xs text-gray-400 mb-2">
          📄 Upload a PDF resume with selectable text. Image-based PDFs won't work. 
          The parser will extract text content to help generate relevant interview questions.
          Note: Large PDF files may take longer to process as parsing runs in the main thread.
        </p>
        <input
          type="file"
          id="resume"
          accept=".pdf"
          onChange={handleFileChange}
          className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
        />
        {isParsing && (
          <div className="text-sm text-yellow-400 mt-2 flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>
            Parsing your resume, please wait...
          </div>
        )}
        {fileName && !isParsing && !parseError && (
          <p className="text-sm text-green-400 mt-2">✅ Ready to submit: {fileName}</p>
        )}
        {parseError && (
          <div className="text-sm text-red-500 mt-2 p-2 bg-red-900/20 rounded border border-red-700">
            <p className="font-semibold">Error parsing PDF:</p>
            <p>{parseError}</p>
            <p className="text-xs mt-1 text-gray-300">
              💡 Tip: Make sure your PDF contains selectable text (not just images). 
              Try copying text from your PDF to verify it's text-based.
            </p>
          </div>
        )}
      </div>
       <div className="mt-3 w-full flex items-center justify-center flex-col">
        {formError && (
          <div className="w-full text-red-400 text-sm bg-red-900/20 p-3 rounded border border-red-700 mb-2">
            {formError}
          </div>
        )}
        <button
          disabled={btndisable || isParsing}
          type="submit"
          className="bg-cyan-600 text-xl w-full font-bold lg:px-6 rounded-xl py-2  text-white hover:bg-cyan-700 transition-all disabled:bg-gray-500"
        >
          {GenerateQuestions ? "Generating Questions..." : "Submit and Start"}
        </button>
      </div>
    </form>
  )

  return (
    <div className="w-full flex items-start justify-center px-2" style={{ height: 'calc(100vh - 80px)', minHeight: 'calc(100vh - 80px)' }}>
      {/* Interview History Sidebar */}
      {showSidebar && <InterviewHistorySidebar onInterviewSelect={handleInterviewSelect} />}
      {/* Main Content with conditional left margin for sidebar */}
      <div 
        className="w-full max-w-[900px] bg-[#040E1A] rounded-xl shadow-lg shadow-blue-300 flex flex-col h-full" 
        style={{ marginLeft: showSidebar ? '340px' : '0' }}
      >
        {/* Fixed Header */}
        <div className="flex-shrink-0 p-2">
          <div className="flex justify-between items-center mb-2">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              {showSidebar ? 'Hide' : 'Show'} History
            </button>
            <h1 className="text-center text-2xl font-bold">
              Tell Us About Your Job Focus
            </h1>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
          <div className="flex justify-center items-center p-1 bg-gray-800/50 rounded-lg mb-2">
            <button
              onClick={() => setFormMode("manual")}
              className={`px-6 py-2 text-sm font-medium rounded-md ${
                formMode === "manual"
                  ? "bg-blue-600 text-white"
                  : "text-gray-300"
              }`}
            >
              Fill Form Manually
            </button>
            <button
              onClick={() => setFormMode("resume")}
              className={`px-6 py-2 text-sm font-medium rounded-md ${
                formMode === "resume"
                  ? "bg-blue-600 text-white"
                  : "text-gray-300"
              }`}
            >
              Upload Resume
            </button>
          </div>
          {/* Model selection dropdown */}
          <div className="mb-2 flex items-center justify-center gap-3">
            <label htmlFor="model-select" className="text-white font-semibold">Select AI Model:</label>
            <select
              id="model-select"
              value={selectedModel}
              onChange={e => setSelectedModel(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-700 bg-[#232b47] text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="gemini">Gemini</option>
              <option value="groq">Groq</option>
            </select>
          </div>
        </div>
        
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-6 pb-3">
          {formMode === 'manual' ? ManualForm : ResumeForm}
        </div>
        
        {/* Fixed Footer */}
        <div className="flex-shrink-0 p-3 border-t border-gray-700">
          <div className="w-full flex flex-col lg:flex-row gap-1 items-center justify-center">
            <h1 className="self-start text-base font-semibold">Note:</h1>
            <p className="lg:pl-2 text-sm font-semibold text-gray-300">
              Please fill out each section carefully. Your interview will be
              based on the information you provide.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewForm;
