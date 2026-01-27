import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import axios from "axios";
import { johnsmithside } from "../../assets/images";

import Header from "../../components/header";
import Sidebar from "../../components/sidebar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";

function AccountPage() {
  const [firstname, setFirstName] = useState("");
  const [lastname, setLastName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [textState, setTextState] = useState("Off");
  const [studentNotification, setStudentNotification] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      await fetchProfile();
    };

    fetchProfileData();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/student/profile`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        const data = response.data;
        setFirstName(data.Studentfirstname);
        setLastName(data.Studentlastname);
        setContactNumber(data.Studentcontactnumber);
        setStudentNotification(data.Studentnotification);
        localStorage.setItem("profile", JSON.stringify(data));
      } else {
        throw new Error("Failed to fetch profile data");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/student/update_profile`,
        {
          Studentfirstname: firstname,
          Studentlastname: lastname,
          Studentcontactnumber: contactNumber,
          Studentnotification: studentNotification,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        console.log("Profile updated successfully");
        toggleText();
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const toggleText = () => {
    setTextState((state) => (state === "On" ? "Off" : "On"));
    setEditMode((prevState) => !prevState);
  };

  return (
    <>
      <Helmet>
        <title>Profile | Go-Canvas</title>
      </Helmet>
      
      <div className="min-h-screen bg-background text-foreground">
        {/* Overlays */}
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 hidden sidebar-overlay"
          onClick={() => document.body.classList.remove("sidebar-open")}
        ></div>
        
        <Header />
        <Sidebar />
        
        <main className="pt-16 md:pl-64 transition-all duration-200">
          <div className="container mx-auto p-6 md:p-8 max-w-4xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
              <p className="text-muted-foreground mt-1">Manage your account settings</p>
            </div>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-end gap-4 mb-6">
                  {editMode && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2">
                            <Label htmlFor="notifications" className="cursor-pointer">Notifications</Label>
                            <Switch
                              id="notifications"
                              checked={studentNotification}
                              onCheckedChange={setStudentNotification}
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{studentNotification ? "Disable Notification" : "Enable Notification"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  <Button variant={textState === 'Off' ? "default" : "secondary"} onClick={toggleText}>
                    {textState === 'Off' ? 'Edit Profile' : 'Cancel'}
                  </Button>
                </div>
                
                <div className="flex flex-col items-center mb-8">
                  <div className="w-24 h-24 rounded-full overflow-hidden mb-4 bg-muted">
                    <img src={johnsmithside} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <h2 className="text-xl font-semibold">{firstname} {lastname}</h2>
                </div>
                
                {textState === 'On' ? (
                  <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
                    <div className="space-y-2">
                      <Label htmlFor="firstname">First Name</Label>
                      <Input
                        id="firstname"
                        value={firstname}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastname">Last Name</Label>
                      <Input
                        id="lastname"
                        value={lastname}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contact">Contact No.</Label>
                      <Input
                        id="contact"
                        value={contactNumber}
                        onChange={(e) => setContactNumber(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex justify-center pt-4">
                      <Button type="submit">Save Changes</Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4 max-w-md mx-auto">
                    <div className="grid grid-cols-3 gap-4 py-2 border-b">
                      <span className="font-medium text-muted-foreground">First Name:</span>
                      <span className="col-span-2 font-medium">{firstname}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 py-2 border-b">
                      <span className="font-medium text-muted-foreground">Last Name:</span>
                      <span className="col-span-2 font-medium">{lastname}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 py-2 border-b">
                      <span className="font-medium text-muted-foreground">Contact No:</span>
                      <span className="col-span-2 font-medium">{contactNumber}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </>
  );
}

export default AccountPage;
