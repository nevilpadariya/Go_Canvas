import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";
import { FacultyPageLayout } from "@/components/FacultyPageLayout";
import { getApi, postApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface AnnouncementData {
  id: number;
  announcementName: string;
  announcementDescription: string;
  Semester: string;
}

interface ApiAnnouncement {
  Announcementid: number;
  Announcementname: string;
  Announcementdescription: string;
}

function AddAnnouncement() {
  const { courseid: courseidParam } = useParams();
  const courseId = courseidParam || localStorage.getItem("courseid") || "";

  const [showForm, setShowForm] = useState(false);
  const [announcementName, setAnnouncementName] = useState("");
  const [announcementDescription, setAnnouncementDescription] = useState("");
  const [savedAnnouncements, setSavedAnnouncements] = useState<AnnouncementData[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!courseId || courseId === "undefined") {
      setError("Select a course from the dashboard first.");
      return;
    }
    const fetchAnnouncements = async () => {
      try {
        const data = await getApi<ApiAnnouncement[]>(`/faculty/view_announcement_by_courseid?courseid=${courseId}`);
        const mappedData = data.map((item) => ({
          id: item.Announcementid,
          announcementName: item.Announcementname,
          announcementDescription: item.Announcementdescription,
          Semester: "SPRING24",
        }));
        setSavedAnnouncements(mappedData);
        setError("");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to fetch announcements. Check backend and login.");
      }
    };
    fetchAnnouncements();
  }, [courseId]);

  const handleSubmit = async () => {
    try {
      const newAnnouncement = await postApi<{ Announcementid: number }>("/faculty/add_announcements", {
        Courseid: courseId,
        Announcementname: announcementName,
        Announcementdescription: announcementDescription,
        Semester: "SPRING24",
      });
      setSavedAnnouncements((prev) => [
        ...prev,
        { id: newAnnouncement.Announcementid, announcementName, announcementDescription, Semester: "SPRING24" },
      ]);
      setAnnouncementName("");
      setAnnouncementDescription("");
      setShowForm(false);
      setError("");
      alert("Your Announcement Added Successfully");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add announcement");
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementName.trim() || !announcementDescription.trim()) {
      setError("Please fill out all fields.");
      return;
    }
    handleSubmit();
  };

  return (
    <>
      <Helmet>
        <title>Announcements | Go-Canvas</title>
      </Helmet>
      <FacultyPageLayout>
          <div className="w-full max-w-4xl p-6 md:p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
              <p className="text-muted-foreground mt-1">Manage Course Announcements</p>
            </div>

            <div className="flex justify-end mb-6">
              {!showForm && (
                <Button onClick={() => setShowForm(true)}>
                  Add Announcement
                </Button>
              )}
            </div>

            {showForm && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Add New Announcement</CardTitle>
                </CardHeader>
                <CardContent>
                  {error && <p className="text-destructive text-sm mb-4 font-medium">{error}</p>}
                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="announcementName">Announcement Name</Label>
                      <Input
                        id="announcementName"
                        placeholder="Enter Announcement Name"
                        value={announcementName}
                        onChange={(e) => setAnnouncementName(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="announcementDescription">Announcement Description</Label>
                      <Textarea
                        id="announcementDescription"
                        placeholder="Enter Announcement Description"
                        rows={4}
                        value={announcementDescription}
                        onChange={(e) => setAnnouncementDescription(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex items-center gap-4 pt-4">
                      <Button type="submit">Submit</Button>
                      <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <Accordion type="single" collapsible className="w-full bg-card rounded-lg border" defaultValue="announcement-item-0">
              {savedAnnouncements.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No announcements available. Click "Add Announcement" to create one.
                </div>
              ) : (
                savedAnnouncements.map((announcement, index) => (
                  <AccordionItem key={index} value={`announcement-item-${index}`}>
                    <AccordionTrigger className="px-4">
                      Announcement {index + 1}: {announcement.announcementName}
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="pt-2">
                        <Label className="text-base font-semibold">Description:</Label>
                        <p className="mt-2 text-muted-foreground whitespace-pre-wrap">
                          {announcement.announcementDescription}
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))
              )}
            </Accordion>
          </div>
      </FacultyPageLayout>
    </>
  );
}

export default AddAnnouncement;
