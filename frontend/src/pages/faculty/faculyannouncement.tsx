import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";

import FacultySidebar from "../../components/facultysidebar";
import Header from "../../components/header";
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

function AddAnnouncement() {
  const { courseid } = useParams();
  const courseId = courseid || ""; 
  const token = localStorage.getItem("token");

  const [showForm, setShowForm] = useState(false);
  const [announcementName, setAnnouncementName] = useState("");
  const [announcementDescription, setAnnouncementDescription] = useState("");
  const [savedAnnouncements, setSavedAnnouncements] = useState<AnnouncementData[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/faculty/view_announcement_by_courseid?courseid=${courseId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          const mappedData = data.map((item: { Announcementid: any; Announcementname: any; Announcementdescription: any; }) => ({
            id: item.Announcementid,
            announcementName: item.Announcementname,
            announcementDescription: item.Announcementdescription,
            Semester: "SPRING24",
          }));
          setSavedAnnouncements(mappedData);
        } else {
          setError("Failed to fetch announcements");
        }
      } catch (error) {
        console.error("Error fetching announcements:", error);
        setError("Failed to fetch announcements");
      }
    };
  
    fetchAnnouncements();
  }, [courseId, token]);

  const handleSubmit = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/faculty/add_announcements`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            Courseid: courseId,
            Announcementname: announcementName,
            Announcementdescription: announcementDescription,
            Semester: "SPRING24",
          }),
        }
      );
      if (response.ok) {
        const newAnnouncement = await response.json();
        setSavedAnnouncements(prevAnnouncements => [...prevAnnouncements, {
            id: newAnnouncement.Announcementid, // Mapping the response correctly if needed
            announcementName: announcementName,
            announcementDescription: announcementDescription, 
            Semester: "SPRING24"
        }]); // Note: Ideally the backend returns the full object with ID
        
        setAnnouncementName("");
        setAnnouncementDescription("");
        setShowForm(false);
        setError("");
        alert("Your Announcement Added Successfully");
      } else {
        const errorMessage = await response.text();
        setError(errorMessage || "Failed to add announcement");
      }
    } catch (error) {
      console.error("Error adding announcement:", error);
      setError("Failed to add announcement");
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
      
      <div className="min-h-screen bg-background text-foreground">
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 hidden sidebar-overlay"
          onClick={() => document.body.classList.remove("sidebar-open")}
        ></div>
        
        <Header />
        <FacultySidebar />
        
        <main className="pt-16 md:pl-64 transition-all duration-200">
          <div className="container mx-auto p-6 md:p-8 max-w-4xl">
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
        </main>
      </div>
    </>
  );
}

export default AddAnnouncement;
