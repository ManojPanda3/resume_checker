"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Lightbulb, Sparkles, FileText, Layout, Tag, ListChecks } from "lucide-react"
import { getResumeSuggestions } from "@/lib/resume-analyzer"
import { Skeleton } from "@/components/ui/skeleton"

interface AISuggestionsProps {
  resumeData: any
}

export default function AISuggestions({ resumeData }: AISuggestionsProps) {
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    async function loadSuggestions() {
      if (resumeData) {
        setLoading(true)
        try {
          const data = await getResumeSuggestions(resumeData)
          setSuggestions(data)
        } catch (error) {
          console.error("Error loading suggestions:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    loadSuggestions()
  }, [resumeData])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "content":
        return <FileText className="h-5 w-5 text-blue-500" />
      case "format":
        return <Layout className="h-5 w-5 text-purple-500" />
      case "keywords":
        return <Tag className="h-5 w-5 text-green-500" />
      case "structure":
        return <ListChecks className="h-5 w-5 text-amber-500" />
      default:
        return <Lightbulb className="h-5 w-5 text-gray-500" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "content":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "format":
        return "bg-purple-50 text-purple-700 border-purple-200"
      case "keywords":
        return "bg-green-50 text-green-700 border-green-200"
      case "structure":
        return "bg-amber-50 text-amber-700 border-amber-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const filteredSuggestions = activeTab === "all" ? suggestions : suggestions.filter((s) => s.category === activeTab)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle>AI Suggestions</CardTitle>
        </div>
        <CardDescription>Personalized suggestions to improve your resume</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="format">Format</TabsTrigger>
            <TabsTrigger value="keywords">Keywords</TabsTrigger>
            <TabsTrigger value="structure">Structure</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-1/3" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredSuggestions.length > 0 ? (
              <div className="space-y-4">
                {filteredSuggestions.map((suggestion, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <div className="flex-shrink-0">{getCategoryIcon(suggestion.category)}</div>
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">{suggestion.title}</h3>
                            <Badge className={`${getCategoryColor(suggestion.category)}`}>{suggestion.category}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No suggestions found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Try selecting a different category or upload a new resume.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

