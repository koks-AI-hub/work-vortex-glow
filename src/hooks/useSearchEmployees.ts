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
      // Clean the phone number
      const cleanPhone = phoneNumber.replace(/[\s-]/g, '');

      // First try the RPC function
      const { data, error } = await supabase.rpc(
        'search_employee_by_phone',
        { phone_query: cleanPhone }
      );

      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        const foundEmployee = data[0];
        setEmployee(foundEmployee);
        
        // Fetch experiences for this employee
        const { data: expData, error: expError } = await supabase
          .from('experiences')
          .select('*')
          .eq('employee_id', foundEmployee.id)
          .order('current', { ascending: false })
          .order('start_date', { ascending: false });
          
        if (expError) throw expError;
        
        setExperiences(expData || []);
      } else {
        // As fallback, try direct query with exact matching
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
          .eq('phone', cleanPhone);  // Changed to exact match
          
        if (profileError) {
          throw profileError;
        }
        
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
        
      if (error) {
        if (error.code === '42501') {
          throw new Error('You do not have permission to add experiences. Please contact support.');
        }
        throw error;
      }
      
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
