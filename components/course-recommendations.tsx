"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Clock, BookOpen, Award, Filter, Sparkles } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getCourseRecommendations } from "@/lib/resume-analyzer"
import { Skeleton } from "@/components/ui/skeleton"

interface CourseRecommendationsProps {
  resumeData: any
}

export default function CourseRecommendations({ resumeData }: CourseRecommendationsProps) {
  const [filter, setFilter] = useState("all")
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCourses() {
      if (resumeData) {
        setLoading(true)
        try {
          const data = await getCourseRecommendations(resumeData)
          setCourses(data)
        } catch (error) {
          console.error("Error loading course recommendations:", error)
          setCourses([])
        } finally {
          setLoading(false)
        }
      }
    }

    loadCourses()
  }, [resumeData])

  const filteredCourses = filter === "all" ? courses : courses.filter((course) => course.category === filter)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Course Recommendations</h2>
          <p className="text-muted-foreground">
            AI-powered course recommendations based on your resume and career goals
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="frontend">Frontend</SelectItem>
              <SelectItem value="backend">Backend</SelectItem>
              <SelectItem value="cloud">Cloud Computing</SelectItem>
              <SelectItem value="system-design">System Design</SelectItem>
              <SelectItem value="mobile">Mobile Development</SelectItem>
              <SelectItem value="leadership">Leadership</SelectItem>
              <SelectItem value="cs-fundamentals">CS Fundamentals</SelectItem>
              <SelectItem value="data-science">Data Science</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-4 w-1/3 mt-2" />
              </CardHeader>
              <CardContent className="pb-4 flex-grow">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <Card key={course.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <Badge variant={course.relevance > 90 ? "default" : "secondary"}>{course.relevance}% Match</Badge>
                  </div>
                  <CardDescription className="flex items-center">
                    {course.provider}
                    <Sparkles className="h-3 w-3 ml-1 text-primary" />
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-4 flex-grow">
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{course.duration}</span>
                      <span className="mx-2">•</span>
                      <Award className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{course.level}</span>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {course.skills.map((skill: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    <p className="text-sm text-muted-foreground mt-2">{course.description}</p>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button variant="outline" className="w-full" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Course
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No courses found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Try selecting a different category or upload a new resume.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

