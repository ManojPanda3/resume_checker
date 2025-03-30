import { NextResponse } from 'next/server';
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  Part, // Import the Part type
} from "@google/generative-ai";

// --- Response Schema - Remains the same ---
const responseSchema = {
  type: "object",
  properties: {
    name: { type: "string", description: "Full name of the candidate" },
    email: { type: "string", description: "Contact email address" },
    phone: { type: "string", description: "Contact phone number" },
    skills: { type: "array", items: { type: "string" }, description: "List of key technical and soft skills" },
    experience: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string", description: "Job title or position held" },
          company: { type: "string", description: "Name of the company" },
          duration: { type: "string", description: "Employment dates or duration (e.g., 'Jan 2020 - Present', '3 years')" },
          description: { type: "string", description: "Brief description of responsibilities and achievements" },
        },
        required: ["title", "company", "duration", "description"],
      },
      description: "Professional work experience"
    },
    education: {
      type: "array",
      items: {
        type: "object",
        properties: {
          degree: { type: "string", description: "Degree obtained (e.g., 'B.S. Computer Science')" },
          institution: { type: "string", description: "Name of the educational institution" },
          year: { type: "string", description: "Year of graduation or expected graduation" },
        },
        required: ["degree", "institution", "year"],
      },
      description: "Educational background"
    },
    strengths: { type: "array", items: { type: "string" }, description: "Key strengths identified in the resume" },
    weaknesses: { type: "array", items: { type: "string" }, description: "Potential areas for improvement or gaps" },
    overallScore: { type: "number", description: "An objective score from 0 to 100 evaluating the resume's quality and fit for a general software developer role" },
    atsAnalysis: {
        type: "object",
        properties: {
          atsScore: {
            type: "number"
          },
          keywordMatch: {
            type: "number"
          },
          formatScore: {
            type: "number"
          },
          contentScore: {
            type: "number"
          },
          matchedKeywords: {
            type: "array",
            items: {
              type: "string"
            }
          },
          missingKeywords: {
            type: "array",
            items: {
              type: "string"
            }
          },
          formatIssues: {
            type: "array",
            items: {
              type: "object",
              properties: {
                issue: {
                  type: "string"
                },
                severity: {
                  type: "string",
                  enum: [
                    "high",
                    "medium",
                    "low"
                  ]
                }
              },
              required: [
                "issue",
                "severity"
              ]
            }
          },
          contentIssues: {
            type: "array",
            items: {
              type: "object",
              properties: {
                issue: {
                  type: "string"
                },
                serverity: {
                  type: "string",
                  enum: [
                    "high",
                    "medium",
                    "low"
                  ]
                }
              },
              required: [
                "issue",
                "serverity"
              ]
            }
          }
        },
        required: [
          "atsScore",
          "keywordMatch",
          "formatScore",
          "contentScore",
          "matchedKeywords",
          "missingKeywords",
          "formatIssues"
        ]
      }
  },
  required: ["name", "skills", "experience", "education", "strengths", "weaknesses", "overallScore","atsAnalysis"], // Make required fields more comprehensive
};
// --------------------------------------------------------------


// --- Gemini AI Configuration ---
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("FATAL: GEMINI_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

// Use a model that explicitly supports multimodal input (like gemini-1.5-flash or pro)
// Ensure JSON output mode is still configured
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-latest", // Or "gemini-pro-vision" if flash doesn't suffice, but flash is good
  generationConfig: {
    temperature: 0.7, // Slightly lower temp might help with stricter schema adherence
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "application/json", // Crucial: Keep enforcing JSON output
    responseSchema: responseSchema,       // Crucial: Keep providing the schema
  },
  safetySettings: [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  ]
});
// --------------------------------------------------------------

// List of MIME types Gemini can directly process (consult Gemini docs for the latest list)
// Focus on common resume formats. Images could be added if needed.
const SUPPORTED_GEMINI_FILE_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/msword', // .doc (support might be less reliable than docx/pdf)
    // Add image types if you want to support image resumes, e.g.:
    // 'image/png',
    // 'image/jpeg',
];


export async function POST(request: Request) {
  if (!apiKey) {
    return NextResponse.json({ error: 'Server configuration error: API key not found.' }, { status: 500 });
  }

  const contentType = request.headers.get('content-type');
  console.log(`Received request with Content-Type: ${contentType}`);

  try {
    let requestParts: Part[] = []; // Array to hold parts for the Gemini API call

    // --- Prompt - Adjust based on whether text or a file is provided ---
    let analysisPrompt = "";

    // --- Handle different Content-Types ---
    if (contentType?.includes('application/json')) {
      // --- METHOD 1: Request contains JSON with pre-extracted text (likely from .txt file) ---
      console.log("Processing application/json request (expected text content)...");
      const body = await request.json();
      const resumeText = body.resumeText;

      if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length === 0) {
        return NextResponse.json({ error: 'Invalid JSON request: "resumeText" is missing, empty, or not a string.' }, { status: 400 });
      }
      console.log("Extracted resumeText from JSON body (length):", resumeText.length);

      // Construct the prompt for text input
      analysisPrompt = `Please analyze the following resume text thoroughly. Extract the requested information and provide an objective analysis based on common resume best practices for a software developer role. Structure your response strictly according to the provided JSON schema.

Resume Text:
---
${resumeText}
---

Analyze the text and return the JSON object.`;

      // Add the text prompt as the only part
      requestParts.push({ text: analysisPrompt });

    } else if (contentType?.includes('multipart/form-data')) {
      // --- METHOD 2: Request contains a file upload (PDF, DOCX, etc.) ---
      console.log("Processing multipart/form-data request (expected file)...");
      const formData = await request.formData();
      const file = formData.get('resumeFile') as File | null; // Key must match frontend

      if (!file) {
        return NextResponse.json({ error: 'Invalid FormData: "resumeFile" part is missing.' }, { status: 400 });
      }

      console.log(`Received file: ${file.name}, Type: ${file.type}, Size: ${file.size} bytes`);

      // --- Validate file type for direct Gemini processing ---
      if (!SUPPORTED_GEMINI_FILE_TYPES.includes(file.type)) {
           console.warn(`Unsupported file type for direct Gemini processing: ${file.type}. Frontend should prevent this.`);
           // Returning error as we are *not* parsing unsupported types server-side anymore
           return NextResponse.json({ error: `Unsupported file type: ${file.type}. Only PDF, DOCX, DOC are supported for direct analysis.` }, { status: 400 });
      }

      // --- Prepare file for Gemini API (inlineData) ---
      const fileBuffer = await file.arrayBuffer();
      const base64File = Buffer.from(fileBuffer).toString('base64');

      // Construct the prompt for file input
      analysisPrompt = `Please analyze the attached resume file (${file.name}) thoroughly. Extract the requested information and provide an objective analysis based on common resume best practices for a software developer role. Structure your response strictly according to the provided JSON schema. Return only the JSON object.`;

      // Add the file data part AND the text prompt part
      requestParts.push(
        { inlineData: { data: base64File, mimeType: file.type } }, // Part 1: The file itself
        { text: analysisPrompt }                                    // Part 2: Instructions
      );
      console.log(`Prepared file ${file.name} (${file.type}) as base64 for Gemini.`);

    } else {
      // --- Unsupported Content-Type ---
      console.error(`Unsupported Content-Type: ${contentType}`);
      return NextResponse.json({ error: `Unsupported request format. Use application/json (for text) or multipart/form-data (for files).` }, { status: 415 }); // 415 Unsupported Media Type
    }


    // --- *** Call Gemini API *** ---
    if (requestParts.length === 0) {
        // Should not happen if logic is correct
        console.error("Internal error: No request parts were generated.");
        return NextResponse.json({ error: 'Failed to prepare request for analysis.' }, { status: 500 });
    }

    console.log(`Sending ${requestParts.length} part(s) to Gemini AI...`);
    // Use generateContent directly with the parts array
    const result = await model.generateContent({ contents: [{ parts: requestParts }] });

    console.log("Received response from Gemini AI.");
    const responseText = result.response.text();

    // --- Parse and Return Response ---
    try {
        const parsedJson = JSON.parse(responseText);
        console.log("Successfully parsed AI response JSON.");

        // Optional: Add validation against the schema again here if desired
        // if (!validateSchema(parsedJson, responseSchema)) { ... }

        return NextResponse.json(parsedJson);
    } catch (parseError) {
        console.error("Error parsing AI response JSON:", parseError);
        console.error("Raw AI Response Text:", responseText); // Log the raw text for debugging
        // Include the raw text in the error response might help debugging, but be careful with sensitive data exposure
        const partialRawText = responseText.substring(0, 500) + (responseText.length > 500 ? "..." : "");
        return NextResponse.json({ error: 'Failed to parse AI analysis result into valid JSON.', rawResponsePreview: partialRawText }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Error processing request in POST handler:", error);
    let status = 500;
    let message = 'An error occurred during resume processing.';

    if (error instanceof Error) {
        message = error.message; // Use the specific error message
        // Check for common client-side errors vs server/API errors
        if (message.includes("Invalid") || message.includes("Unsupported") || message.includes("missing")) {
            status = 400;
        } else if (message.includes("API key") || message.includes("quota")) {
             status = 500; // Or 503 Service Unavailable
        } else if (error.message.includes("SAFETY") || error.message.includes("blocked")) {
             status = 400; // Request blocked due to safety settings
             message = "Analysis blocked due to safety settings. The content may violate policies.";
        }
    }

    return NextResponse.json({ error: message, details: error instanceof Error ? error.stack : String(error) }, { status });
  }
}
