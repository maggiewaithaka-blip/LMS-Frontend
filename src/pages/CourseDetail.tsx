import React from 'react';
import ScormPlayer from '@/components/ScormPlayer';
// SimpleAccordion: a reusable, uniform accordion for any list of items
// (useState is already imported at the top)

function SimpleAccordion({ items, titleKey = 'title', contentKey = 'description', extraFields = [] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  if (!items || items.length === 0) return null;
  return (
    <div>
      {items.map((item, idx) => (
        <div key={item.id || idx} className="border rounded mb-2">
          <div
            className="cursor-pointer p-2 bg-muted/50 font-semibold"
            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
          >
            {item[titleKey]}
          </div>
          {openIndex === idx && (
            <div className="p-3">
              {typeof item[contentKey] === 'string' ? (
                <HtmlContent className="mb-2" html={item[contentKey] || ''} />
              ) : (
                item[contentKey] || null
              )}
              {extraFields.map((field) =>
                item[field]
                  ? (typeof item[field] === 'string'
                      ? <HtmlContent key={field} className="mb-2" html={item[field]} />
                      : item[field])
                  : null
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { api, Course, Sections } from '@/lib/api';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import {
  ArrowLeft,
  BookOpen,
  GraduationCap,
  Clock,
  FileText,
} from 'lucide-react';

import { toast } from 'sonner';
import HtmlContent from '@/components/HtmlContent';

/* -------------------------------------------------- */
/*   HELPER COMPONENT FOR ATTACHMENTS                 */
/* -------------------------------------------------- */
const AttachmentItem = ({ att }: { att: any }) => {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="font-medium capitalize">{att.type}:</span>

      {att.file && (
        <a
          href={att.file}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          Download File
        </a>
      )}

      {att.url && (
        <a
          href={att.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          Open Link
        </a>
      )}

      {att.text && (
        <HtmlContent className="text-muted-foreground" html={att.text} />
      )}
    </div>
  );
};

/* -------------------------------------------------- */
/*                   MAIN PAGE                        */
/* -------------------------------------------------- */

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [sections, setSections] = useState<Sections[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      loadCourseData(parseInt(courseId));
    }
  }, [courseId]);

  const loadCourseData = async (id: number) => {
    try {
      const [courseData, sectionsData] = await Promise.all([
        api.getCourseDetail(id),
        api.getCourseSections(id),
      ]);

      setCourse(courseData);
      setSections(sectionsData);
    } catch (error) {
      toast.error('Failed to load course details');
      console.error('Error loading course:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background p-8">
        <Card className="max-w-md mx-auto text-center py-12">
          <CardContent>
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="mb-2">Course Not Found</CardTitle>
            <CardDescription className="mb-4">
              The course you're looking for doesn't exist or you don't have access to it.
            </CardDescription>
            <Button onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex items-center gap-3">
            <div className="relative">
              <BookOpen className="h-8 w-8 text-primary" />
              <GraduationCap className="h-4 w-4 text-accent absolute -bottom-1 -right-1" />
            </div>

            <div>
              <h1 className="text-xl font-bold text-foreground">CCGD Learning Platform</h1>
              <p className="text-xs text-muted-foreground">
                College of Career Guidance and Development
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Course Header with Thumbnail */}
          <Card
            className="mb-8 shadow-elevated p-0 overflow-hidden relative"
            style={course.thumbnail ? {
              backgroundImage: `url(${course.thumbnail})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              minHeight: '220px',
              color: '#fff',
            } : {}}
          >
            {/* Overlay for better text visibility */}
            {course.thumbnail && (
              <div
                className="absolute inset-0 bg-black/50 z-0"
                aria-hidden="true"
              />
            )}
            <div className="relative z-10 p-8 h-full flex flex-col justify-between">
              <div>
                <CardTitle className="text-3xl mb-2 text-foreground font-bold">
                  {course.fullname || 'Untitled Course'}
                </CardTitle>
                {course.summary && (
                  <div className="relative mt-4">
                    <HtmlContent className="text-foreground bg-transparent" html={course.summary} />
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* COURSE SECTIONS (Uniform Accordion) */}
          <Card>
            <CardHeader>
              <CardTitle>Course Content</CardTitle>
              <CardDescription>
                {sections.length} {sections.length === 1 ? 'section' : 'sections'} in this course
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Debug log removed for production safety */}
              <SimpleAccordion
                items={sections.map(section => ({
                  ...section,
                  // Compose a custom content field for each section
                  _customContent: (
                    <>
                      {/* Section summary with embedded image (thumbnail) and formatting */}
                      {section.summary && (
                        <HtmlContent className="mb-2" html={section.summary} />
                      )}
                      {/* Removed: description, notifications, storage (not in Sections interface) */}
                      {section.assignments && section.assignments.length > 0 && (
                        <>
                          <h3 className="font-semibold text-primary mb-2 mt-4">Assignments</h3>
                          <SimpleAccordion
                            items={section.assignments.map(a => ({
                              ...a,
                              _customContent: (
                                <>
                                  {a.description && <HtmlContent className="mb-2" html={a.description} />}
                                  {a.attachments && a.attachments.length > 0 && (
                                    <div className="mt-2 ml-3 space-y-1">
                                      {a.attachments.map(att => (
                                        <AttachmentItem key={att.id} att={att} />
                                      ))}
                                    </div>
                                  )}
                                </>
                              )
                            }))}
                            titleKey="title"
                            contentKey="_customContent"
                            extraFields={[]}
                          />
                        </>
                      )}
                      {section.quizzes && section.quizzes.length > 0 && (
                        <>
                          <h3 className="font-semibold text-primary mb-2 mt-4">Quizzes</h3>
                          <SimpleAccordion
                            items={section.quizzes.map(q => ({
                              ...q,
                              _customContent: (
                                <>
                                  {q.description && <HtmlContent className="mb-2" html={q.description} />}
                                  {q.attachments && q.attachments.length > 0 && (
                                    <div className="mt-2 ml-3 space-y-1">
                                      {q.attachments.map(att => (
                                        <AttachmentItem key={att.id} att={att} />
                                      ))}
                                    </div>
                                  )}
                                </>
                              )
                            }))}
                            titleKey="title"
                            contentKey="_customContent"
                            extraFields={[]}
                          />
                        </>
                      )}
                      {section.resources && section.resources.length > 0 && (
                        <>
                          <h3 className="font-semibold text-primary mb-2 mt-4">Resources</h3>
                          <SimpleAccordion
                            items={section.resources.map(r => ({
                              ...r,
                              _customContent: (
                                <>
                                  {r.description && <HtmlContent className="mb-2" html={r.description} />}
                                  {r.text && <HtmlContent className="mb-2" html={r.text} />}
                                  {r.attachments && r.attachments.length > 0 && (
                                    <div className="mt-2 ml-3 space-y-1">
                                      {r.attachments.map(att => (
                                        <AttachmentItem key={att.id} att={att} />
                                      ))}
                                    </div>
                                  )}
                                </>
                              )
                            }))}
                            titleKey="title"
                            contentKey="_customContent"
                            extraFields={[]}
                          />
                        </>
                      )}

                      {/* === SCORM Player Section (SimpleAccordion) === */}
                      {section.scorm_packages && section.scorm_packages.length > 0 && (
                        <>
                          <h3 className="font-semibold text-primary mb-2 mt-4">Interactive Learning Resources</h3>
                          <SimpleAccordion
                            items={section.scorm_packages.map(pkg => ({
                              ...pkg,
                              _customContent: (
                                <ScormPlayer scormPackages={[pkg]} />
                              )
                            }))}
                            titleKey="name"
                            contentKey="_customContent"
                            extraFields={[]}
                          />
                        </>
                      )}
                    </>
                  )
                }))}
                titleKey="title"
                contentKey="_customContent"
                extraFields={[]}
              />
            </CardContent>
          </Card>

          {/* Tagline */}
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground italic">
              "One Purpose, One Mission, One Dream"
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CourseDetail;