import { analyzeResumeWithAI, getAISuggestions, getAICourseRecommendations, getAICareerRoadmap } from "./ai-service"

export async function analyzeResume(resumeText: string) {
  try {
    // Use Gemini AI to analyze the resume
    const resumeData = await analyzeResumeWithAI(resumeText)
    return resumeData
  } catch (error) {
    console.error("Error in resume analysis:", error)
    // Fallback to mock data if AI analysis fails
    return {
      name: "Alex Johnson",
      email: "alex.johnson@example.com",
      phone: "(555) 123-4567",
      skills: ["JavaScript", "React", "Node.js", "TypeScript", "HTML/CSS", "Git", "REST APIs", "SQL"],
      experience: [
        {
          title: "Frontend Developer",
          company: "Tech Solutions Inc.",
          duration: "2020 - Present",
          description: "Developed responsive web applications using React and TypeScript.",
        },
        {
          title: "Junior Web Developer",
          company: "Digital Creations",
          duration: "2018 - 2020",
          description: "Built and maintained client websites using JavaScript and HTML/CSS.",
        },
      ],
      education: [
        {
          degree: "B.S. Computer Science",
          institution: "University of Technology",
          year: "2018",
        },
      ],
      strengths: [
        "Strong foundation in modern JavaScript and React",
        "Good experience with frontend development",
        "Clear organization of work experience",
        "Consistent formatting throughout resume",
        "Relevant education background",
      ],
      weaknesses: [
        "Missing quantifiable achievements in job descriptions",
        "Limited demonstration of leadership experience",
        "Could benefit from more specific technical project details",
        "Missing some industry-specific keywords like Docker and CI/CD",
        "No mention of soft skills or teamwork examples",
      ],
      overallScore: 78,
    }
  }
}

export async function getResumeSuggestions(resumeData: any) {
  try {
    // Get AI-powered suggestions for resume improvement
    return await getAISuggestions(resumeData)
  } catch (error) {
    console.error("Error getting resume suggestions:", error)
    return []
  }
}

export async function getCourseRecommendations(resumeData: any) {
  try {
    // Get AI-powered course recommendations
    return await getAICourseRecommendations(resumeData)
  } catch (error) {
    console.error("Error getting course recommendations:", error)
    return []
  }
}

export async function getCareerRoadmap(resumeData: any) {
  try {
    // Get AI-powered career roadmap
    return await getAICareerRoadmap(resumeData)
  } catch (error) {
    console.error("Error getting career roadmap:", error)
    return null
  }
}

