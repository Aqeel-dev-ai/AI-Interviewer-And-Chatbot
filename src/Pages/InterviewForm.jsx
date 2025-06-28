import { useState, useEffect } from "react";
import TagInput from "../Components/TagInput.jsx";
import { useInterviewContext } from "../Context/InterviewContext";
import { useAuth } from "../Context/AuthContext";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "../utilities/firebase";

const InterviewHistorySidebar = () => {
  const { User } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!User?.uid) return;
    const fetchInterview = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "Interview"),
          where("UserId", "==", User.uid),
          orderBy("timestamp", "desc")
        );
        const querySnapshot = await getDocs(q);
        const interviewsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setInterviews(interviewsData);
      } catch (error) {
        setInterviews([]);
      } finally {
        setLoading(false);
      }
    };
    fetchInterview();
  }, [User]);

  return (
    <div className="fixed top-[80px] left-0 h-[calc(100vh-80px)] w-[340px] z-30 bg-[#081229] border-r border-[#232b47] flex flex-col">
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
            <div key={item.id} className="mb-3 p-2 rounded bg-[#10192b] text-white">
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
  const {
    industriesAndJobs,
    handleIndustryChange,
    jobTitles,
    handleSubmit,
    onSubmit,
    register,
    GenerateQuestions,
    btndisable,
  } = useInterviewContext();

  const [formMode, setFormMode] = useState("manual"); // 'manual' or 'resume'
  const [resumeText, setResumeText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [fileName, setFileName] = useState("");
  const [parseError, setParseError] = useState("");

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
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@latest/build/pdf.worker.min.mjs`;

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const loadingTask = pdfjs.getDocument({ data: event.target.result });
          const pdf = await loadingTask.promise;
          let text = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map((item) => item.str).join(" ");
          }
          setResumeText(text);
        } catch (error) {
          console.error("Error parsing PDF content:", error);
          setParseError("Could not read the content of the PDF.");
        } finally {
          setIsParsing(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error loading PDF.js:", error);
      setParseError("An unexpected error occurred while loading the PDF parser.");
      setIsParsing(false);
    }
  };

  const handleResumeSubmit = (data) => {
    if (!resumeText) {
      setParseError("Please upload a resume and wait for it to be processed.");
      return;
    }
    onSubmit({ ...data, resumeText }, "resume");
  };

  const ManualForm = (
    <form
      onSubmit={handleSubmit(onSubmit)}
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
          placeholder="Enter Job Description..."
          className="placeholder-black outline-none bg-slate-300 rounded-lg px-3 py-1 text-base font-semibold custom-sidebar"
          {...register("Description")}
        ></textarea>
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
      <div className="flex  w-full flex-col gap-1 text-black">
        <TagInput></TagInput>
      </div>
       <div className="mt-3 w-full flex items-center justify-center">
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
          htmlFor="resume"
          className="text-lg font-semibold text-gray-100"
        >
          Upload Your Resume (PDF only):
        </label>
        <input
          type="file"
          id="resume"
          accept=".pdf"
          onChange={handleFileChange}
          className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
        />
        {isParsing && <p className="text-sm text-yellow-400 mt-2">Parsing your resume, please wait...</p>}
        {fileName && !isParsing && <p className="text-sm text-green-400 mt-2">Ready to submit: {fileName}</p>}
        {parseError && <p className="text-sm text-red-500 mt-2">{parseError}</p>}
      </div>
       <div className="mt-3 w-full flex items-center justify-center">
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
    <div className="min-h-[100dvh] w-full flex items-center justify-center px-2">
      {/* Interview History Sidebar */}
      <InterviewHistorySidebar />
      {/* Main Content with left margin for sidebar */}
      <div className="w-full max-w-[900px] bg-[#040E1A] rounded-xl shadow-lg shadow-blue-300 flex flex-col py-6 h-full" style={{ marginLeft: '340px' }}>
        <div className="flex-1 flex flex-col justify-between w-full gap-7 px-1">
          <div>
            <h1 className="text-center text-3xl font-bold mb-4">
              Tell Us About Your Job Focus
            </h1>
            <div className="flex justify-center items-center p-1 bg-gray-800/50 rounded-lg mb-6">
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
            {formMode === 'manual' ? ManualForm : ResumeForm}
          </div>
          <div className="w-full lg:px-10 flex flex-col lg:flex-row gap-1 items-center justify-center px-3">
            <h1 className="self-start text-lg font-semibold">Note:</h1>
            <p className="lg:pl-2 text-base font-semibold text-gray-300">
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
