
import { useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { mockJobs } from "@/lib/mockData";
import { Job } from "@/types/auth";
import { Briefcase, Clock, MapPin, Search } from "lucide-react";

export default function JobFeed() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  
  const handleApply = (job: Job) => {
    // In a real app, this would send an application to Supabase
    toast({
      title: "Application submitted",
      description: `You've applied for the ${job.title} position at ${job.company}.`,
    });
  };
  
  // Filter jobs based on search and filters
  const filteredJobs = mockJobs.filter((job) => {
    const matchesSearch = searchTerm === "" || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesType = selectedType === null || job.type === selectedType;
    const matchesLocation = selectedLocation === null || job.location === selectedLocation;
    
    return matchesSearch && matchesType && matchesLocation;
  });
  
  // Extract unique job types and locations for filters
  const jobTypes = Array.from(new Set(mockJobs.map(job => job.type)));
  const jobLocations = Array.from(new Set(mockJobs.map(job => job.location)));
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };
  
  return (
    <DashboardLayout title="Job Feed">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                className="pl-9"
                placeholder="Search jobs by title, company, or keyword"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
          
          {filteredJobs.length > 0 ? (
            <div className="space-y-6">
              {filteredJobs.map((job) => (
                <GlassCard key={job.id} className="animate-fade-in" hoverEffect>
                  <div className="md:flex justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-white">{job.title}</h3>
                        <span className="px-2 py-1 bg-vortex-500/20 text-vortex-300 text-xs rounded-full">
                          {job.type}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-400 mb-3">{job.company}</p>
                      
                      <div className="flex flex-wrap gap-3 mb-4">
                        <div className="flex items-center text-sm text-gray-300">
                          <MapPin className="h-3.5 w-3.5 mr-1" />
                          {job.location}
                        </div>
                        <div className="flex items-center text-sm text-gray-300">
                          <Briefcase className="h-3.5 w-3.5 mr-1" />
                          {job.salary || "Salary not specified"}
                        </div>
                        <div className="flex items-center text-sm text-gray-300">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          {formatDate(job.postedAt)}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-300 mb-4 line-clamp-2">{job.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.requirements.slice(0, 3).map((req, i) => (
                          <span 
                            key={i} 
                            className="px-2 py-1 bg-white/5 text-gray-300 text-xs rounded"
                          >
                            {req}
                          </span>
                        ))}
                        {job.requirements.length > 3 && (
                          <span className="px-2 py-1 text-gray-400 text-xs">
                            +{job.requirements.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="md:ml-4 flex md:flex-col gap-3 mt-4 md:mt-0 md:justify-between md:items-end">
                      <Button onClick={() => handleApply(job)}>Apply Now</Button>
                      <Button variant="outline">View Details</Button>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
            <GlassCard className="text-center py-10">
              <p className="text-gray-400 mb-2">No jobs found matching your criteria.</p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedType(null);
                  setSelectedLocation(null);
                }}
              >
                Clear Filters
              </Button>
            </GlassCard>
          )}
        </div>
        
        <div>
          <GlassCard>
            <h2 className="font-bold text-lg text-white mb-4">Filters</h2>
            
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-300 mb-2">Job Type</h3>
              <div className="space-y-2">
                {jobTypes.map((type) => (
                  <div key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`type-${type}`}
                      checked={selectedType === type}
                      onChange={() => setSelectedType(selectedType === type ? null : type)}
                      className="rounded-sm bg-transparent border border-gray-500"
                    />
                    <label htmlFor={`type-${type}`} className="ml-2 text-sm text-gray-300">
                      {type}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-300 mb-2">Location</h3>
              <div className="space-y-2">
                {jobLocations.map((location) => (
                  <div key={location} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`location-${location}`}
                      checked={selectedLocation === location}
                      onChange={() => setSelectedLocation(selectedLocation === location ? null : location)}
                      className="rounded-sm bg-transparent border border-gray-500"
                    />
                    <label htmlFor={`location-${location}`} className="ml-2 text-sm text-gray-300">
                      {location}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                setSearchTerm("");
                setSelectedType(null);
                setSelectedLocation(null);
              }}
            >
              Reset Filters
            </Button>
          </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
