
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AuthState, User, UserRole, Employee, Company, Experience, DbExperience } from "@/types/auth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  uploadProfileImage: (file: File) => Promise<string | null>;
  uploadResume: (file: File) => Promise<string | null>;
  addExperience: (experience: Omit<Experience, "id">) => Promise<Experience | null>;
  updateExperience: (experience: Experience) => Promise<Experience | null>;
  deleteExperience: (experienceId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mapExperienceFromDb = (exp: DbExperience): Experience => ({
  id: exp.id,
  role: exp.role,
  company: exp.company,
  startDate: exp.start_date,
  endDate: exp.end_date || null,
  current: exp.current,
  description: exp.description || ""
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    error: null,
  });

  const navigate = useNavigate();

  // Fetch user profile data and update state
  const fetchUserProfile = async (userId: string) => {
    try {
      // Fetch basic profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;
      if (!profileData) throw new Error("Profile not found");

      // If employee, fetch additional data
      if (profileData.role === 'employee') {
        // Fetch employee data
        const { data: employeeData, error: employeeError } = await supabase
          .from('employees')
          .select('*')
          .eq('id', userId)
          .single();

        if (employeeError) throw employeeError;

        // Fetch experiences
        const { data: experiencesData, error: experiencesError } = await supabase
          .from('experiences')
          .select('*')
          .eq('employee_id', userId);

        if (experiencesError) throw experiencesError;

        const employee: Employee = {
          id: profileData.id,
          email: profileData.email,
          name: profileData.name,
          phone: profileData.phone,
          role: 'employee',
          profileImage: employeeData.profile_picture || null,
          resume: employeeData.resume_url || null,
          experiences: experiencesData ? experiencesData.map(mapExperienceFromDb) : []
        };

        setAuthState(prev => ({ ...prev, user: employee }));
      } 
      // If company, fetch company data
      else if (profileData.role === 'company') {
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', userId)
          .single();

        if (companyError) throw companyError;

        const company: Company = {
          id: profileData.id,
          email: profileData.email,
          name: profileData.name,
          phone: profileData.phone,
          role: 'company',
          sector: companyData.sector,
          logo: companyData.logo || null,
          description: companyData.description || null
        };

        setAuthState(prev => ({ ...prev, user: company }));
      }
    } catch (error: any) {
      console.error("Error fetching user profile", error);
      setAuthState(prev => ({ ...prev, error: error.message }));
    }
  };

  // Set up auth state listener
  useEffect(() => {
    // First set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setAuthState(prev => ({ ...prev, session: newSession }));
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setAuthState(prev => ({ ...prev, isLoading: true }));
          // Use setTimeout to avoid recursive calls
          setTimeout(() => {
            if (newSession?.user) {
              fetchUserProfile(newSession.user.id);
            }
            setAuthState(prev => ({ ...prev, isLoading: false }));
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setAuthState({ user: null, session: null, isLoading: false, error: null });
        }
      }
    );

    // Then check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        if (session?.user) {
          setAuthState(prev => ({ ...prev, session }));
          await fetchUserProfile(session.user.id);
        }
      } catch (error: any) {
        console.error("Error initializing auth:", error);
        setAuthState(prev => ({ ...prev, error: error.message }));
      } finally {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initializeAuth();

    // Cleanup subscription when component unmounts
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        throw error;
      }
      
      // Auth state listener will handle user data
      
      // Redirect based on role after successful login
      if (data.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();
          
        if (profileData) {
          navigate(profileData.role === 'employee' ? '/employee/dashboard' : '/company/dashboard');
        }
      }
    } catch (error: any) {
      setAuthState(prev => ({ 
        ...prev, 
        error: error.message || "Login failed. Please check your credentials." 
      }));
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || "Please check your credentials and try again."
      });
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Register function
  const register = async (userData: any, role: UserRole) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      // Register the user with email and password
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            role: role,
            phone: userData.phone || null,
            sector: role === 'company' ? userData.sector || 'Technology' : null
          }
        }
      });

      if (error) {
        throw error;
      }

      // Auth state listener and trigger will handle profile creation

      toast({
        title: "Account Created",
        description: "Your account has been successfully created. You can now log in."
      });

      // Redirect based on role
      navigate(role === 'employee' ? '/employee/dashboard' : '/company/dashboard');
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        error: error.message || "Registration failed. Please try again."
      }));
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message || "Please check your information and try again."
      });
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      setAuthState({ user: null, session: null, isLoading: false, error: null });
      navigate("/");
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out."
      });
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        error: error.message || "Logout failed."
      }));
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: error.message || "Please try again."
      });
    }
  };

  // Update user profile
  const updateUser = async (userData: Partial<User>) => {
    if (!authState.user) return;
    
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Update profile data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: userData.name !== undefined ? userData.name : authState.user.name,
          phone: userData.phone !== undefined ? userData.phone : authState.user.phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', authState.user.id);

      if (profileError) throw profileError;

      // If company and updating company-specific fields
      if (authState.user.role === 'company' && (userData as Partial<Company>).sector) {
        const companyData = userData as Partial<Company>;
        
        const { error: companyError } = await supabase
          .from('companies')
          .update({
            sector: companyData.sector || (authState.user as Company).sector,
            description: companyData.description || (authState.user as Company).description,
            updated_at: new Date().toISOString()
          })
          .eq('id', authState.user.id);
          
        if (companyError) throw companyError;
      }

      // Refresh user data
      await fetchUserProfile(authState.user.id);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated."
      });
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        error: error.message || "Failed to update profile."
      }));
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Please try again."
      });
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Upload profile image
  const uploadProfileImage = async (file: File): Promise<string | null> => {
    if (!authState.user) return null;
    
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${authState.user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profile_pictures')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('profile_pictures')
        .getPublicUrl(filePath);
        
      const publicUrl = data.publicUrl;
      
      // Update employee record
      if (authState.user.role === 'employee') {
        const { error: updateError } = await supabase
          .from('employees')
          .update({ profile_picture: publicUrl })
          .eq('id', authState.user.id);
          
        if (updateError) throw updateError;
      } 
      // Update company record (logo)
      else if (authState.user.role === 'company') {
        const { error: updateError } = await supabase
          .from('companies')
          .update({ logo: publicUrl })
          .eq('id', authState.user.id);
          
        if (updateError) throw updateError;
      }
      
      // Refresh profile data
      await fetchUserProfile(authState.user.id);
      
      toast({
        title: "Upload Successful",
        description: "Your profile image has been updated."
      });
      
      return publicUrl;
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message || "Failed to upload image. Please try again."
      });
      return null;
    }
  };

  // Upload resume
  const uploadResume = async (file: File): Promise<string | null> => {
    if (!authState.user || authState.user.role !== 'employee') return null;
    
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${authState.user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath);
        
      const publicUrl = data.publicUrl;
      
      // Update employee record
      const { error: updateError } = await supabase
        .from('employees')
        .update({ resume_url: publicUrl })
        .eq('id', authState.user.id);
        
      if (updateError) throw updateError;
      
      // Refresh profile data
      await fetchUserProfile(authState.user.id);
      
      toast({
        title: "Upload Successful",
        description: "Your resume has been uploaded."
      });
      
      return publicUrl;
    } catch (error: any) {
      console.error("Error uploading resume:", error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message || "Failed to upload resume. Please try again."
      });
      return null;
    }
  };

  // Add experience
  const addExperience = async (experience: Omit<Experience, "id">): Promise<Experience | null> => {
    if (!authState.user || authState.user.role !== 'employee') return null;
    
    try {
      const { data, error } = await supabase
        .from('experiences')
        .insert({
          employee_id: authState.user.id,
          role: experience.role,
          company: experience.company,
          start_date: experience.startDate,
          end_date: experience.current ? null : experience.endDate,
          current: experience.current,
          description: experience.description || null
        })
        .select('*')
        .single();
        
      if (error) throw error;
      
      // Refresh profile data
      await fetchUserProfile(authState.user.id);
      
      toast({
        title: "Experience Added",
        description: "Your experience has been successfully added."
      });
      
      return mapExperienceFromDb(data);
    } catch (error: any) {
      console.error("Error adding experience:", error);
      toast({
        variant: "destructive",
        title: "Operation Failed",
        description: error.message || "Failed to add experience. Please try again."
      });
      return null;
    }
  };

  // Update experience
  const updateExperience = async (experience: Experience): Promise<Experience | null> => {
    if (!authState.user || authState.user.role !== 'employee') return null;
    
    try {
      const { data, error } = await supabase
        .from('experiences')
        .update({
          role: experience.role,
          company: experience.company,
          start_date: experience.startDate,
          end_date: experience.current ? null : experience.endDate,
          current: experience.current,
          description: experience.description || null
        })
        .eq('id', experience.id)
        .eq('employee_id', authState.user.id) // Security check
        .select('*')
        .single();
        
      if (error) throw error;
      
      // Refresh profile data
      await fetchUserProfile(authState.user.id);
      
      toast({
        title: "Experience Updated",
        description: "Your experience has been successfully updated."
      });
      
      return mapExperienceFromDb(data);
    } catch (error: any) {
      console.error("Error updating experience:", error);
      toast({
        variant: "destructive",
        title: "Operation Failed",
        description: error.message || "Failed to update experience. Please try again."
      });
      return null;
    }
  };

  // Delete experience
  const deleteExperience = async (experienceId: string): Promise<boolean> => {
    if (!authState.user || authState.user.role !== 'employee') return false;
    
    try {
      const { error } = await supabase
        .from('experiences')
        .delete()
        .eq('id', experienceId)
        .eq('employee_id', authState.user.id); // Security check
        
      if (error) throw error;
      
      // Refresh profile data
      await fetchUserProfile(authState.user.id);
      
      toast({
        title: "Experience Deleted",
        description: "The experience has been successfully deleted."
      });
      
      return true;
    } catch (error: any) {
      console.error("Error deleting experience:", error);
      toast({
        variant: "destructive",
        title: "Operation Failed",
        description: error.message || "Failed to delete experience. Please try again."
      });
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        logout,
        updateUser,
        uploadProfileImage,
        uploadResume,
        addExperience,
        updateExperience,
        deleteExperience
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
