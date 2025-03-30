import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, AlertTriangle, ArrowUp, Zap } from 'lucide-react'; // Removed ArrowDown, Loader2

// Define an interface for the expected structure of the ATS Analysis part
// This should match the 'atsAnalysis' part of your CombinedAnalysisSchema
interface AtsAnalysisData {
  atsScore: number;
  keywordMatch: number;
  formatScore: number;
  contentScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  formatIssues: { issue: string; severity: "high" | "medium" | "low" }[];
  contentIssues: { issue: string; severity: "high" | "medium" | "low" }[];
}

// Define an interface for the overall resume data prop
// This assumes resumeData contains the full AI response structure
interface CombinedResumeData {
  resumeAnalysis: any; // Add specific type if needed elsewhere
  atsAnalysis: AtsAnalysisData;
  careerRoadmap: any; // Add specific type if needed elsewhere
  courseRecommendations: any; // Add specific type if needed elsewhere
}

interface AtsScoreAnalyzerProps {
  // Expect the full combined AI response object, or null if not loaded yet
  resumeData: CombinedResumeData | null;
}

export default function AtsScoreAnalyzer({ resumeData }: AtsScoreAnalyzerProps) {
  const [activeTab, setActiveTab] = useState("overview");

  // --- No more useEffect or separate loading/data state for ATS ---
  // The data comes directly from the prop. Loading is handled by the parent component.

  // --- Early exit if data isn't available ---
  // Check if resumeData exists and if the specific atsAnalysis section exists within it.
  if (!resumeData || !resumeData.atsAnalysis) {
     // You might want to return a specific message or a minimal placeholder,
     // but returning null is fine if the parent handles the overall loading state well.
    // console.log("AtsScoreAnalyzer: Waiting for resumeData.atsAnalysis...");
    return null;
  }

  // --- Extract ATS data directly from the prop ---
  // Use default empty arrays for safety when mapping
  const {
    atsScore = 0, // Default score to 0
    keywordMatch = 0,
    formatScore = 0,
    contentScore = 0,
    matchedKeywords = [], // Default to empty array
    missingKeywords = [], // Default to empty array
    formatIssues = [], // Default to empty array
    contentIssues = [] // Default to empty array
  } = resumeData.atsAnalysis;

  // --- Helper function to determine badge variant based on score ---
  const getScoreVariant = (score: number): "default" | "outline" | "destructive" => {
    if (score >= 80) return "default"; // Use 'default' for good scores (often green/primary)
    if (score >= 60) return "outline"; // Use 'outline' for medium scores (neutral)
    return "destructive"; // Use 'destructive' for low scores (often red)
  };

  // --- Helper function to determine icon and color based on severity ---
  const getSeverityIcon = (severity: "high" | "medium" | "low") => {
    switch (severity) {
      case "high":
        return <XCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />;
      case "medium":
        return <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />;
      case "low":
        return <AlertTriangle className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />; // Or a different icon for low
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>ATS Score Analysis</CardTitle>
          <CardDescription>
            AI-powered analysis of how your resume likely performs against Applicant Tracking Systems (ATS) for relevant roles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* --- Scores Display --- */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Overall Score Gauge */}
            <Card className="bg-muted/30 dark:bg-muted/50">
              <CardContent className="p-4 flex flex-col items-center justify-center">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Overall ATS Score</h3>
                <div className="relative w-24 h-24">
                  {/* Background Circle */}
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      className="text-gray-200 dark:text-gray-700 stroke-current"
                      strokeWidth="10"
                      cx="50" cy="50" r="40" fill="transparent"
                    />
                    {/* Progress Circle */}
                    <circle
                      className="text-primary stroke-current"
                      strokeWidth="10"
                      strokeLinecap="round"
                      cx="50" cy="50" r="40" fill="transparent"
                      strokeDasharray={`${atsScore * 2.513} 251.3`} // 2 * PI * R (40) = 251.3
                      transform="rotate(-90 50 50)" // Start from top
                      style={{ transition: 'stroke-dasharray 0.5s ease-out' }} // Smooth animation
                    />
                  </svg>
                  {/* Text in Center */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-2xl font-bold ${atsScore >= 80 ? 'text-primary' : atsScore >=60 ? 'text-amber-600' : 'text-destructive'}`}>{atsScore}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Individual Score Cards */}
            {[
              { label: "Keyword Match", value: keywordMatch },
              { label: "Format Score", value: formatScore },
              { label: "Content Score", value: contentScore },
            ].map((scoreItem) => (
              <Card key={scoreItem.label} className="bg-muted/30 dark:bg-muted/50">
                <CardContent className="p-4 flex flex-col justify-between h-full">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium text-muted-foreground">{scoreItem.label}</h3>
                    <Badge variant={getScoreVariant(scoreItem.value)}>{scoreItem.value}%</Badge>
                  </div>
                  <Progress value={scoreItem.value} aria-label={`${scoreItem.label} ${scoreItem.value}%`} className="h-2" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* --- Tabs for Details --- */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="keywords">Keywords</TabsTrigger>
              <TabsTrigger value="improvements">Improvements</TabsTrigger>
            </TabsList>

            {/* Overview Tab Content */}
            <TabsContent value="overview" className="space-y-4">
               {/* Note: The summary text, strengths, and weaknesses here are still generic.
                   You could dynamically generate these based on the scores and issues
                   for a more personalized overview if desired. */}
               <div>
                  <h3 className="text-lg font-medium mb-2">ATS Compatibility Summary</h3>
                  {/* Example dynamic text based on score */}
                  <p className="text-sm text-muted-foreground">
                    {atsScore >= 80 ? "Your resume demonstrates strong ATS compatibility with good keyword matching and formatting." :
                     atsScore >= 60 ? "Your resume has a solid foundation but could be improved by refining keywords and addressing minor format/content issues." :
                     "Your resume needs significant improvement in keyword density, formatting, and content clarity to perform well with ATS."}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Potential Strengths</h4>
                    <ul className="space-y-2">
                     {/* These could be dynamically generated based on scores > threshold */}
                      {formatScore >= 75 && <li className="flex items-start text-sm"><CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" /><span>Likely has clear, parsable formatting.</span></li>}
                      {keywordMatch >= 70 && <li className="flex items-start text-sm"><CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" /><span>Contains a reasonable amount of relevant keywords.</span></li>}
                      {contentScore >= 70 && <li className="flex items-start text-sm"><CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" /><span>Content seems generally relevant and structured.</span></li>}
                      {formatScore < 75 && keywordMatch < 70 && contentScore < 70 && <li className="text-sm text-muted-foreground italic">No significant strengths identified by score thresholds.</li>}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Primary Areas for Improvement</h4>
                    <ul className="space-y-2">
                       {/* These could be dynamically generated based on scores < threshold */}
                       {keywordMatch < 70 && <li className="flex items-start text-sm"><XCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" /><span>Increase relevant keyword density.</span></li>}
                       {formatScore < 75 && <li className="flex items-start text-sm"><XCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" /><span>Review formatting for ATS compatibility (see details).</span></li>}
                       {contentScore < 70 && <li className="flex items-start text-sm"><XCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" /><span>Enhance content clarity and add quantifiable results.</span></li>}
                       {keywordMatch >= 70 && formatScore >= 75 && contentScore >= 70 && <li className="text-sm text-muted-foreground italic">No primary improvement areas identified by score thresholds. Check details for minor issues.</li>}
                    </ul>
                  </div>
                </div>
            </TabsContent>

            {/* Keywords Tab Content */}
            <TabsContent value="keywords" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Matched Keywords */}
                <div>
                  <h3 className="text-lg font-medium mb-3 flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    Matched Keywords ({matchedKeywords.length})
                  </h3>
                  {matchedKeywords.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {matchedKeywords.map((keyword, index) => (
                        <Badge key={index} variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-700">
                          {/* <CheckCircle className="h-3 w-3 mr-1 text-green-600 dark:text-green-400" /> */}
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                     <p className="text-sm text-muted-foreground italic">No specific matched keywords identified.</p>
                  )}
                </div>

                {/* Missing Keywords */}
                <div>
                  <h3 className="text-lg font-medium mb-3 flex items-center">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                    Suggested Keywords to Add ({missingKeywords.length})
                  </h3>
                  {missingKeywords.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {missingKeywords.map((keyword, index) => (
                        <Badge key={index} variant="secondary" className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-700">
                          <ArrowUp className="h-3 w-3 mr-1 text-amber-600 dark:text-amber-400" />
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                   ) : (
                     <p className="text-sm text-muted-foreground italic">No specific missing keywords suggested.</p>
                  )}
                </div>
              </div>

              {/* Keyword Tip */}
              <Card className="bg-muted/30 dark:bg-muted/50 mt-4">
                <CardContent className="p-4">
                  <div className="flex items-start">
                    <Zap className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium">Keyword Optimization Tip</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Integrate relevant keywords naturally within your summary, skills, and experience sections. Tailor keywords based on specific job descriptions you're targeting. Avoid "keyword stuffing" (listing keywords without context).
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Improvements Tab Content */}
            <TabsContent value="improvements" className="space-y-6">
              {/* Format Issues */}
              <div>
                <h3 className="text-lg font-medium mb-3">Format Improvements</h3>
                {formatIssues.length > 0 ? (
                  <div className="space-y-3">
                    {formatIssues.map((issue, index) => (
                      <div key={`format-${index}`} className="flex items-start p-3 border rounded-md bg-background">
                        {getSeverityIcon(issue.severity)}
                        <div>
                          <p className="text-sm font-medium">{issue.issue}</p>
                          <Badge variant="outline" className={`mt-1 capitalize ${
                              issue.severity === 'high' ? 'border-red-500 text-red-600' :
                              issue.severity === 'medium' ? 'border-amber-500 text-amber-600' :
                              'border-blue-500 text-blue-600'
                          }`}>
                            {issue.severity} priority
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                   <p className="text-sm text-muted-foreground italic">No specific formatting issues identified.</p>
                )}
              </div>

              {/* Content Issues */}
              <div>
                <h3 className="text-lg font-medium mb-3">Content Improvements</h3>
                 {contentIssues.length > 0 ? (
                   <div className="space-y-3">
                    {contentIssues.map((issue, index) => (
                      <div key={`content-${index}`} className="flex items-start p-3 border rounded-md bg-background">
                        {getSeverityIcon(issue.severity)}
                         <div>
                          <p className="text-sm font-medium">{issue.issue}</p>
                          <Badge variant="outline" className={`mt-1 capitalize ${
                              issue.severity === 'high' ? 'border-red-500 text-red-600' :
                              issue.severity === 'medium' ? 'border-amber-500 text-amber-600' :
                              'border-blue-500 text-blue-600'
                          }`}>
                            {issue.severity} priority
                          </Badge>
                        </div>
                      </div>
                    ))}
                   </div>
                 ) : (
                    <p className="text-sm text-muted-foreground italic">No specific content issues identified.</p>
                 )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
