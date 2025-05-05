
import { useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { mockExperiences } from "@/lib/mockData";
import { Search, UserRound } from "lucide-react";

export default function SearchWorkers() {
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [employee, setEmployee] = useState<any>(null);
  
  const handleSearch = () => {
    if (!phoneNumber.trim()) {
      toast({
        variant: "destructive",
        title: "Search Error",
        description: "Please enter a phone number to search.",
      });
      return;
    }
    
    // In a real app, this would search for workers in Supabase
    // For this demo, we'll simulate finding an employee if the phone number ends with "1234"
    if (phoneNumber.endsWith("1234")) {
      setEmployee({
        id: "emp-123456",
        name: "Alex Johnson",
        email: "alex@example.com",
        phone: phoneNumber,
        title: "Frontend Developer",
        experiences: mockExperiences,
      });
    } else {
      setEmployee(null);
    }
    
    setSearchPerformed(true);
  };
  
  const handleAddExperience = () => {
    toast({
      title: "Add Experience",
      description: "In a real app, this would allow you to add experience to this employee's profile.",
    });
  };
  
  return (
    <DashboardLayout title="Search Workers">
      <GlassCard className="mb-6">
        <h2 className="text-xl font-bold text-white mb-4">Find Worker by Phone Number</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              className="pl-9"
              placeholder="Enter phone number (e.g. 555-1234)"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
          <Button onClick={handleSearch}>Search</Button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Note: For demo purposes, search for a number ending in "1234" to see results.
        </p>
      </GlassCard>
      
      {searchPerformed && (
        employee ? (
          <GlassCard className="animate-fade-in">
            <div className="md:flex gap-6">
              <div className="mb-6 md:mb-0">
                <div className="h-24 w-24 rounded-full bg-vortex-700/50 flex items-center justify-center mb-4">
                  <UserRound className="h-12 w-12 text-white" />
                </div>
              </div>
              
              <div className="flex-grow">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{employee.name}</h2>
                    <p className="text-gray-400">{employee.title}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="mt-2 md:mt-0"
                    onClick={handleAddExperience}
                  >
                    Add Experience
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="text-white">{employee.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Phone</p>
                    <p className="text-white">{employee.phone}</p>
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-white mb-3">Experience</h3>
                {employee.experiences.map((exp: any, idx: number) => (
                  <div 
                    key={idx}
                    className="p-3 border border-white/10 rounded-lg bg-white/5 mb-3"
                  >
                    <h4 className="text-md font-medium text-white">{exp.role}</h4>
                    <p className="text-gray-400">{exp.company}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(exp.startDate).toLocaleDateString()} - {" "}
                      {exp.current ? "Present" : new Date(exp.endDate as string).toLocaleDateString()}
                    </p>
                    {exp.description && (
                      <p className="text-sm text-gray-300 mt-2">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        ) : (
          <GlassCard className="text-center py-10 animate-fade-in">
            <p className="text-gray-400 mb-2">No employee found with that phone number.</p>
            <p className="text-sm text-gray-500">Try a different phone number or check the format.</p>
          </GlassCard>
        )
      )}
    </DashboardLayout>
  );
}
