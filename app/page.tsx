"use client"

import { useState } from "react"
import { FileText, BarChart, BookOpen, Award, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ResumeUploader from "@/components/resume-uploader"
import ResumeAnalysis from "@/components/resume-analysis"
import CareerRoadmap from "@/components/career-roadmap"
import CourseRecommendations from "@/components/course-recommendations"
import AtsScoreAnalyzer from "@/components/ats-score-analyzer"
import AISuggestions from "@/components/ai-suggestions"

export default function Home() {
  const [resumeData, setResumeData] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("upload")

  const handleResumeProcessed = (data: any) => {
    setResumeData(data)
    setActiveTab("analysis")
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Award className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">CareerBoost AI</h1>
          </div>
          <div className="hidden md:flex space-x-4">
            <Button variant="ghost">About</Button>
            <Button variant="ghost">Features</Button>
            <Button variant="ghost">FAQ</Button>
            <Button variant="default">Get Started</Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {!resumeData ? (
          <div className="max-w-3xl mx-auto text-center py-12">
            <div className="flex items-center justify-center mb-4">
              <h2 className="text-3xl font-bold">Boost Your Career with</h2>
              <div className="flex items-center ml-2">
                <Sparkles className="h-6 w-6 text-primary mr-1" />
                <span className="text-3xl font-bold text-primary">AI</span>
              </div>
            </div>
            <p className="text-gray-600 mb-8">
              Upload your resume to get AI-powered insights, career roadmaps, course recommendations, and ATS
              optimization - all processed locally on your device for complete privacy.
            </p>
            <ResumeUploader onResumeProcessed={handleResumeProcessed} />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-5 mb-8">
              <TabsTrigger value="analysis" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Resume Analysis</span>
              </TabsTrigger>
              <TabsTrigger value="suggestions" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">AI Suggestions</span>
              </TabsTrigger>
              <TabsTrigger value="roadmap" className="flex items-center gap-2">
                <BarChart className="h-4 w-4" />
                <span className="hidden sm:inline">Career Roadmap</span>
              </TabsTrigger>
              <TabsTrigger value="courses" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Course Recommendations</span>
              </TabsTrigger>
              <TabsTrigger value="ats" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                <span className="hidden sm:inline">ATS Score</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analysis">
              <ResumeAnalysis resumeData={resumeData} />
            </TabsContent>

            <TabsContent value="suggestions">
              <AISuggestions resumeData={resumeData} />
            </TabsContent>

            <TabsContent value="roadmap">
              <CareerRoadmap resumeData={resumeData} />
            </TabsContent>

            <TabsContent value="courses">
              <CourseRecommendations resumeData={resumeData} />
            </TabsContent>

            <TabsContent value="ats">
              <AtsScoreAnalyzer resumeData={resumeData} />
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Award className="h-6 w-6 text-primary" />
              <span className="font-semibold">CareerBoost AI</span>
              <div className="flex items-center ml-2">
                <Sparkles className="h-4 w-4 text-primary mr-1" />
                <span className="text-sm font-medium">Powered by AI</span>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              © {new Date().getFullYear()} CareerBoost AI. All rights reserved.
              <span className="block md:inline md:ml-2">All processing happens locally on your device.</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}

