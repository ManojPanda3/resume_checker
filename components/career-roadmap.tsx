"use client"

import { useState } from "react" // Removed useEffect
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, Calendar, BookOpen, Briefcase, Sparkles, AlertCircle } from "lucide-react"
// Removed getCareerRoadmap import
// Removed Skeleton import

// --- Define Interfaces for Type Safety ---

// Interface for a single goal item
interface Goal {
  title: string;
  timeframe: string;
  type: string;
}

// Interface for a single career path step
interface CareerStep {
  role: string;
  timeframe: string;
}

// Interface for the Career Roadmap data structure within the combined AI response
interface CareerRoadmapData {
  shortTermGoals: Goal[];
  midTermGoals: Goal[];
  longTermGoals: Goal[];
  skillGaps: string[];
  careerPath: CareerStep[];
}

// Interface for the overall resume data prop, expecting the combined AI response
interface CombinedResumeData {
  resumeAnalysis: any; // Add specific type if needed elsewhere
  atsAnalysis: any; // Add specific type if needed elsewhere
  careerRoadmap: CareerRoadmapData | null; // It might be null if analysis failed
  courseRecommendations: any; // Add specific type if needed elsewhere
}

interface CareerRoadmapProps {
  // Expect the full combined AI response object, or null if not loaded yet
  resumeData: CombinedResumeData | null;
}

export default function CareerRoadmap({ resumeData }: CareerRoadmapProps) {
  // Default tab state remains
  const [activeTab, setActiveTab] = useState("timeline");

  // --- No more useEffect, loading state, or internal roadmapData state ---

  // --- Early exit if data isn't available ---
  // Check if resumeData and the specific careerRoadmap section exist
  if (!resumeData || !resumeData.careerRoadmap) {
    // Return null or a placeholder message; parent handles overall loading.
    // console.log("CareerRoadmap: Waiting for resumeData.careerRoadmap...");
    // Optionally return a minimal placeholder card:
    // return (
    //   <Card>
    //     <CardHeader>
    //       <CardTitle>Career Roadmap</CardTitle>
    //       <CardDescription>Awaiting analysis results...</CardDescription>
    //     </CardHeader>
    //     <CardContent><p className="text-sm text-muted-foreground">Roadmap data is not yet available.</p></CardContent>
    //   </Card>
    // );
     return null;
  }

  // --- Extract Career Roadmap data directly from the prop ---
  // Use default empty arrays for safety when mapping
  const {
    shortTermGoals = [],
    midTermGoals = [],
    longTermGoals = [],
    skillGaps = [],
    careerPath = []
  } = resumeData.careerRoadmap;

  // --- Helper Component for Timeline Section ---
  const TimelineSection = ({ title, goals, icon: Icon }: { title: string, goals: Goal[], icon: React.ElementType }) => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium flex items-center text-foreground">
        <Icon className="h-5 w-5 mr-2 text-primary flex-shrink-0" />
        {title}
      </h3>
      {goals.length > 0 ? (
        <div className="ml-7 border-l-2 border-primary/30 pl-6 space-y-6 relative before:absolute before:-left-[1px] before:top-0 before:h-full before:w-[1px] before:bg-border">
          {goals.map((goal, index) => (
            <div key={index} className="relative">
              {/* Timeline Dot */}
              <div className="absolute -left-[calc(1.5rem+1px)] top-1 w-4 h-4 rounded-full bg-primary border-2 border-background"></div>
              <div className="flex flex-col space-y-1">
                <h4 className="text-base font-semibold text-foreground">{goal.title}</h4>
                <div className="flex items-center flex-wrap gap-2">
                  <Badge variant="outline">{goal.timeframe}</Badge>
                  <Badge variant="secondary">{goal.type}</Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="ml-7 pl-6 text-sm text-muted-foreground italic">No {title.toLowerCase()} identified.</p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>Your AI Career Roadmap</CardTitle>
          </div>
          <CardDescription>
            Personalized goals, skill suggestions, and potential career path based on your resume analysis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* --- No more loading state here --- */}

          {/* Check if there's *any* data within the roadmap object */}
          {shortTermGoals.length === 0 && midTermGoals.length === 0 && longTermGoals.length === 0 && skillGaps.length === 0 && careerPath.length === 0 ? (
             // Display a message if the roadmap section exists but is empty
             <div className="flex flex-col items-center text-center py-8">
              <AlertCircle className="h-10 w-10 text-muted-foreground mb-3" />
              <h3 className="text-lg font-medium">Roadmap Data Not Generated</h3>
              <p className="text-sm text-muted-foreground mt-1">
                The AI could not generate a detailed career roadmap based on the provided resume content.
              </p>
            </div>
          ) : (
            // --- Display Tabs if data exists ---
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="timeline">Timeline & Goals</TabsTrigger>
                <TabsTrigger value="skills">Skills & Path</TabsTrigger>
              </TabsList>

              {/* Timeline Tab Content */}
              <TabsContent value="timeline" className="pt-6 space-y-8">
                <TimelineSection title="Short-term Goals" goals={shortTermGoals} icon={Calendar} />
                <TimelineSection title="Mid-term Goals" goals={midTermGoals} icon={Calendar} />
                <TimelineSection title="Long-term Goals" goals={longTermGoals} icon={Calendar} />
              </TabsContent>

              {/* Skills & Path Tab Content */}
              <TabsContent value="skills" className="pt-6 space-y-8">
                 {/* Skill Gaps Section */}
                <div>
                  <h3 className="text-lg font-medium mb-3 flex items-center">
                      <BookOpen className="h-5 w-5 mr-2 text-primary"/>
                      Identified Skill Gaps
                  </h3>
                  {skillGaps.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {skillGaps.map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-base py-1 px-3">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                     <p className="text-sm text-muted-foreground italic">No specific skill gaps identified for targeted roles.</p>
                  )}
                </div>

                {/* Career Path Section */}
                <div>
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                      <Briefcase className="h-5 w-5 mr-2 text-primary"/>
                      Potential Career Path
                  </h3>
                  {careerPath.length > 0 ? (
                     <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                      {careerPath.map((step, index) => (
                        <div key={index} className="flex items-center flex-shrink-0">
                          {/* Render arrow only between steps */}
                          {index > 0 && <ArrowRight className="h-5 w-5 text-muted-foreground mx-2 flex-shrink-0" />}
                          <Card className="flex-shrink-0 min-w-[160px] shadow-sm">
                              <CardContent className="p-3 text-center">
                                  {/* <Briefcase className="h-5 w-5 mx-auto mb-2 text-muted-foreground" /> */}
                                  <p className="font-semibold text-sm truncate">{step.role}</p>
                                  <p className="text-xs text-muted-foreground mt-1">{step.timeframe}</p>
                              </CardContent>
                          </Card>
                        </div>
                      ))}
                     </div>
                  ) : (
                      <p className="text-sm text-muted-foreground italic">No specific career path suggested based on the current resume.</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
