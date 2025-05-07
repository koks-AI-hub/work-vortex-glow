
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export function useSearchEmployees() {
  const [isLoading, setIsLoading] = useState(false);
  const [employee, setEmployee] = useState<any | null>(null);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const searchByPhone = async (phoneNumber: string) => {
    if (!phoneNumber.trim()) {
      toast({
        variant: "destructive",
        title: "Search Error",
        description: "Please enter a phone number to search."
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setEmployee(null);
    setExperiences([]);
    setSearchPerformed(true);

    try {
      // Simplified direct query to profiles table to find employee by phone
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'employee')
        .ilike('phone', `%${phoneNumber}%`)
        .limit(1);

      if (profileError) throw profileError;
      
      if (profileData && profileData.length > 0) {
        const employeeProfile = profileData[0];
        
        // Get employee details
        const { data: employeeData, error: employeeError } = await supabase
          .from('employees')
          .select('*')
          .eq('id', employeeProfile.id)
          .single();
          
        if (employeeError) throw employeeError;
        
        // Combine profile and employee data
        const foundEmployee = {
          ...employeeProfile,
          profile_picture: employeeData?.profile_picture,
          resume_url: employeeData?.resume_url
        };
        
        setEmployee(foundEmployee);
        
        // Now fetch experiences for this employee
        const { data: expData, error: expError } = await supabase
          .from('experiences')
          .select('*')
          .eq('employee_id', foundEmployee.id)
          .order('current', { ascending: false })
          .order('start_date', { ascending: false });
          
        if (expError) throw expError;
        
        setExperiences(expData || []);
      } else {
        setEmployee(null);
        setExperiences([]);
      }
    } catch (err: any) {
      console.error("Search error:", err);
      setError(err.message || "An error occurred during search");
      toast({
        variant: "destructive",
        title: "Search Error",
        description: err.message || "An error occurred while searching for the employee."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addExperience = async (employeeId: string, experienceData: any) => {
    try {
      const { data, error } = await supabase
        .from('experiences')
        .insert({
          employee_id: employeeId,
          role: experienceData.role,
          company: experienceData.company,
          start_date: experienceData.startDate,
          end_date: experienceData.current ? null : experienceData.endDate,
          current: experienceData.current || false,
          description: experienceData.description || null
        })
        .select('*')
        .single();
        
      if (error) throw error;
      
      // Refresh experiences list
      const { data: expData, error: expError } = await supabase
        .from('experiences')
        .select('*')
        .eq('employee_id', employeeId)
        .order('current', { ascending: false })
        .order('start_date', { ascending: false });
        
      if (expError) throw expError;
      
      setExperiences(expData || []);
      
      toast({
        title: "Experience Added",
        description: "Experience has been added to the employee's profile."
      });
      
      return true;
    } catch (err: any) {
      console.error("Error adding experience:", err);
      toast({
        variant: "destructive",
        title: "Operation Failed",
        description: err.message || "Failed to add experience. Please try again."
      });
      return false;
    }
  };

  return {
    isLoading,
    employee,
    experiences,
    error,
    searchPerformed,
    searchByPhone,
    addExperience
  };
}
