"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, Info } from "lucide-react"

interface ResumeAnalysisProps {
  resumeData: any
}

export default function ResumeAnalysis({ resumeData }: ResumeAnalysisProps) {
  const [activeTab, setActiveTab] = useState("overview")

  if (!resumeData) return null

  const { name, email, phone, skills, experience, education, strengths, weaknesses, overallScore } = resumeData

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Resume Analysis</CardTitle>
            <CardDescription>AI-powered insights about your resume</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="strengths">Strengths</TabsTrigger>
                <TabsTrigger value="improvements">Improvements</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Overall Score</h3>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold mr-2">{overallScore}/100</span>
                    <Progress value={overallScore} className="w-32" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Personal Information</h4>
                    <p className="text-lg font-medium">{name}</p>
                    <p className="text-sm text-gray-500">{email}</p>
                    <p className="text-sm text-gray-500">{phone}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Key Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Experience Summary</h4>
                  <ul className="space-y-2">
                    {experience.map((exp: any, index: number) => (
                      <li key={index} className="text-sm">
                        <span className="font-medium">{exp.title}</span> at {exp.company}, {exp.duration}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Education</h4>
                  <ul className="space-y-2">
                    {education.map((edu: any, index: number) => (
                      <li key={index} className="text-sm">
                        <span className="font-medium">{edu.degree}</span> from {edu.institution}, {edu.year}
                      </li>
                    ))}
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="strengths" className="space-y-4">
                <ul className="space-y-3">
                  {strengths.map((strength: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </TabsContent>

              <TabsContent value="improvements" className="space-y-4">
                <ul className="space-y-3">
                  {weaknesses.map((weakness: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Tips</CardTitle>
            <CardDescription>Improve your resume with these suggestions</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start text-sm">
                <Info className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                <span>Use action verbs to describe your achievements</span>
              </li>
              <li className="flex items-start text-sm">
                <Info className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                <span>Quantify your accomplishments with numbers</span>
              </li>
              <li className="flex items-start text-sm">
                <Info className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                <span>Tailor your resume for each job application</span>
              </li>
              <li className="flex items-start text-sm">
                <Info className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                <span>Keep your resume to 1-2 pages maximum</span>
              </li>
              <li className="flex items-start text-sm">
                <Info className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                <span>Use industry-specific keywords to pass ATS systems</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

