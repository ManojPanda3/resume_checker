"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Upload, File as FileIcon, Loader2, AlertCircle } from "lucide-react" // Renamed File to FileIcon to avoid conflict
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Interface for the data expected *after* analysis, received from either API endpoint
interface ResumeAnalysisData {
  name: string;
  email?: string;
  phone?: string;
  skills?: string[];
  experience?: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education?: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  strengths?: string[];
  weaknesses?: string[];
  overallScore: number; // Example field, adjust as needed based on your API
}

interface ResumeUploaderProps {
  // This function will receive the analysis data fetched from the API
  onResumeProcessed: (data: ResumeAnalysisData) => void
}

// Define allowed MIME types and corresponding file extensions
const ALLOWED_MIME_TYPES: Record<string, string> = {
  "application/pdf": ".pdf",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  "text/plain": ".txt"
};
const ALLOWED_EXTENSIONS = Object.values(ALLOWED_MIME_TYPES).join(","); // For the input accept attribute


export default function ResumeUploader({ onResumeProcessed }: ResumeUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Helper function to validate file type
  const isValidFileType = (fileToCheck: File): boolean => {
    return Object.keys(ALLOWED_MIME_TYPES).includes(fileToCheck.type);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (isValidFileType(selectedFile)) {
        setFile(selectedFile);
        setError(null); // Clear previous errors
        setProgress(0); // Reset progress
      } else {
        setError(`Invalid file type (${selectedFile.type || 'unknown'}). Please upload PDF, DOC, DOCX, or TXT.`);
        setFile(null);
         if (fileInputRef.current) fileInputRef.current.value = ""; // Reset input
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault() // Necessary to allow drop
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (isValidFileType(droppedFile)) {
        setFile(droppedFile);
        setError(null); // Clear previous errors
        setProgress(0); // Reset progress
      } else {
        setError(`Invalid file type (${droppedFile.type || 'unknown'}). Please upload PDF, DOC, DOCX, or TXT.`);
        setFile(null);
      }
    }
  }

  const handleUploadClick = () => {
    // Trigger the hidden file input
    fileInputRef.current?.click()
  }

  const clearFile = () => {
    setFile(null);
    setError(null);
    setProgress(0);
    // Reset the file input value so the same file can be re-selected if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  // Reads the selected file as text (only used for .txt files)
  const readFileAsText = (fileToRead: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Double check it's actually a text file before reading
      if (fileToRead.type !== 'text/plain') {
          return reject(new Error("Attempted to read non-text file as text."));
      }
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to read file as text."));
        }
      }
      reader.onerror = (errorEvent) => reject(errorEvent.target?.error || new Error("FileReader error"));
      reader.readAsText(fileToRead)
    })
  }

  // Processes the resume by calling the appropriate backend API based on file type
  const processResume = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setIsProcessing(true)
    setError(null)
    setProgress(10) // Initial progress

    let progressInterval: NodeJS.Timeout | null = null;
    let apiUrl: string;
    let requestOptions: RequestInit;

    try {
      // Start simulating API call progress sooner
      progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 5, 95)); // Simulate progress up to 95%
      }, 300); // Adjust timing as needed

      // --- Determine API endpoint and request options based on file type ---
      if (file.type === 'text/plain') {
        // ---- METHOD 1: Text file - Read content and send as JSON ----
        console.log("Processing text file:", file.name);
        apiUrl = '/api/analyze-resume'; // Endpoint expecting text content
        const resumeText = await readFileAsText(file)
        setProgress(30) // Progress after reading file

        requestOptions = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ resumeText: resumeText }), // Send text content
        };
        console.log("Sending resume text to", apiUrl);

      } else if (isValidFileType(file)) {
         // ---- METHOD 2: PDF, DOC, DOCX file - Send raw file using FormData ----
        console.log("Processing binary file:", file.name, file.type);
        apiUrl = '/api/analyze-resume-file'; // Endpoint expecting file upload
        const formData = new FormData();
        formData.append('resumeFile', file); // Key 'resumeFile' must match backend expectation

        requestOptions = {
            method: 'POST',
            body: formData,
            // IMPORTANT: Do NOT set Content-Type header manually for FormData,
            // the browser will set it correctly with the boundary.
        };
        setProgress(20) // Less progress initially as no reading needed here
        console.log("Sending file data to", apiUrl);

      } else {
          // This case should ideally not be reached due to prior validation, but included for safety
          throw new Error(`Unsupported file type for processing: ${file.type}`);
      }

      // --- Make the API call ---
      const response = await fetch('/api/analyze-resume', requestOptions);

      // --- Stop progress simulation ---
      if (progressInterval) clearInterval(progressInterval);
      progressInterval = null; // Ensure it's marked as cleared

      // --- Handle the API response ---
      if (!response.ok) {
        let errorMsg = `API Error (${response.status})`;
        let errorDetails = '';
        try {
          const errorData = await response.json();
          errorDetails = errorData.error || JSON.stringify(errorData); // Use API error message or full data
          console.error("API Error Response Body:", errorData);
        } catch (parseError) {
          try {
            errorDetails = await response.text(); // Get raw text if JSON parsing fails
            console.error("Could not parse API error response as JSON, raw text:", errorDetails);
          } catch (textError) {
             errorDetails = response.statusText || 'Failed to analyze resume.';
             console.error("Could not parse API error or get status text.");
          }
        }
         errorMsg = `${errorMsg}: ${errorDetails}`;
        throw new Error(errorMsg);
      }

      // --- Parse the successful JSON response ---
      const analysisResult: ResumeAnalysisData = await response.json();
      console.log("Received analysis result from API:", analysisResult);

      // --- Complete the progress and call the callback ---
      setProgress(100)
      setTimeout(() => {
        onResumeProcessed(analysisResult) // Pass the data received from API
        setIsProcessing(false)
        // Optionally clear the file after successful processing:
        // clearFile();
      }, 300) // Short delay to show 100% completion

    } catch (error: any) {
      console.error("Error processing resume:", error)
      setError(error.message || "An unexpected error occurred during processing. Please try again.")
      setIsProcessing(false)
      setProgress(0) // Reset progress on error
      // Ensure interval is cleared if an error occurred during setup or fetch
      if (progressInterval) {
          clearInterval(progressInterval);
          progressInterval = null; // Ensure it's marked as cleared
      }
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="pt-6">
        {/* Error Alert Display */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* File Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
            isProcessing ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-70' : 'hover:border-primary/50 cursor-pointer'
          } ${
            file ? "border-primary/70 bg-primary/5" : "border-gray-300 dark:border-gray-600"
          }`}
          onDragOver={isProcessing ? undefined : handleDragOver} // Disable drag/drop during processing
          onDrop={isProcessing ? undefined : handleDrop}
          onClick={!file && !isProcessing ? handleUploadClick : undefined} // Allow click to upload only when no file and not processing
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={ALLOWED_EXTENSIONS} // Use generated list of extensions
            className="hidden" // Hide the default input
            disabled={isProcessing}
          />

          {/* Content when NO file is selected */}
          {!file && !isProcessing && (
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium">Upload your resume</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Drag and drop file here, or click to browse</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Supported: PDF, DOC, DOCX, TXT</p>
              {/* Button to trigger file input (optional alternative to clicking the area) */}
              {/* <Button onClick={handleUploadClick} disabled={isProcessing} size="sm" variant="outline">Select File</Button> */}
            </div>
          )}

          {/* Content when a file IS selected */}
          {file && (
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <FileIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              {/* Display file name and size */}
              <h3 className="text-lg font-medium truncate px-4" title={file.name}>{file.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{(file.size / 1024).toFixed(2)} KB</p>

              {/* Content shown during processing */}
              {isProcessing ? (
                <div className="space-y-2 pt-2">
                  <Progress value={progress} className="w-full" aria-label="Upload progress" />
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing your resume... ({progress}%)
                  </p>
                </div>
              ) : (
                /* Buttons shown when file is selected but not processing */
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 justify-center pt-2">
                  <Button variant="outline" onClick={clearFile} disabled={isProcessing}>
                    Change File
                  </Button>
                  <Button onClick={processResume} disabled={isProcessing}>
                    Analyze with AI
                  </Button>
                </div>
              )}
            </div>
          )}

           {/* Fallback content if processing state is stuck (unlikely but safe) */}
           {isProcessing && !file && (
               <div className="space-y-2 pt-2">
                 <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center">
                   <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                   Processing...
                 </p>
               </div>
           )}
        </div>
      </CardContent>
    </Card>
  )
}
