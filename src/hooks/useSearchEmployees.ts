
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
      console.log("Searching for phone number:", phoneNumber);

      // Use the search_employee_by_phone RPC function or direct query
      const { data, error } = await supabase.rpc(
        'search_employee_by_phone',
        { phone_query: phoneNumber }
      );

      if (error) {
        console.error("RPC error:", error);
        throw error;
      }
      
      console.log("Search results:", data);
      
      if (data && data.length > 0) {
        const foundEmployee = data[0];
        setEmployee(foundEmployee);
        
        // Now fetch experiences for this employee
        const { data: expData, error: expError } = await supabase
          .from('experiences')
          .select('*')
          .eq('employee_id', foundEmployee.id)
          .order('current', { ascending: false })
          .order('start_date', { ascending: false });
          
        if (expError) throw expError;
        
        console.log("Experience data:", expData);
        setExperiences(expData || []);
      } else {
        // As fallback, try direct query to profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select(`
            id, 
            name, 
            email, 
            phone,
            employees (
              profile_picture,
              resume_url
            )
          `)
          .eq('role', 'employee')
          .ilike('phone', `%${phoneNumber}%`);
          
        if (profileError) throw profileError;
        console.log("Direct query results:", profileData);
        
        if (profileData && profileData.length > 0) {
          const foundEmployee = {
            id: profileData[0].id,
            name: profileData[0].name,
            email: profileData[0].email,
            phone: profileData[0].phone,
            profile_picture: profileData[0].employees?.[0]?.profile_picture,
            resume_url: profileData[0].employees?.[0]?.resume_url
          };
          
          setEmployee(foundEmployee);
          
          // Fetch experiences
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
