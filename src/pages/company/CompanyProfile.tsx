
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/layouts/DashboardLayout";
import { GlassCard } from "@/components/ui/glass-card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/types/auth";

const companyProfileSchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters"),
  sector: z.string().min(2, "Sector must be at least 2 characters"),
  description: z.string().optional(),
  phone: z.string().optional(),
});

export default function CompanyProfile() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const form = useForm({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: {
      name: "",
      sector: "",
      description: "",
      phone: "",
    },
  });

  useEffect(() => {
    // Set form default values when user data is loaded
    if (user) {
      form.reset({
        name: user.name || "",
        phone: user.phone || "",
        sector: (user as Company)?.sector || "",
        description: (user as Company)?.description || "",
      });
      
      setLogoUrl((user as Company)?.logo || null);
    }
  }, [user, form]);

  const onSubmit = async (data: z.infer<typeof companyProfileSchema>) => {
    if (!user) return;
    
    setIsUpdating(true);
    try {
      // Update profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          name: data.name,
          phone: data.phone,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Update companies table
      const { error: companyError } = await supabase
        .from("companies")
        .update({
          sector: data.sector,
          description: data.description,
        })
        .eq("id", user.id);

      if (companyError) throw companyError;

      toast({
        title: "Profile Updated",
        description: "Your company profile has been successfully updated.",
      });

      // Update local state
      updateUser({
        ...user,
        name: data.name,
        phone: data.phone,
        sector: data.sector,
        description: data.description,
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    if (!user) return;

    const file = e.target.files[0];
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}-logo.${fileExt}`;
    const filePath = `company-logos/${fileName}`;

    setUploadingLogo(true);
    try {
      // Upload the logo to storage
      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: urlData } = supabase.storage.from("media").getPublicUrl(filePath);
      const logoUrl = urlData.publicUrl;

      // Update the company record with the logo URL
      const { error: updateError } = await supabase
        .from("companies")
        .update({ logo: logoUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      // Update local state
      setLogoUrl(logoUrl);
      updateUser({
        ...user,
        logo: logoUrl,
      });

      toast({
        title: "Logo Updated",
        description: "Your company logo has been successfully updated.",
      });
    } catch (error: any) {
      console.error("Error uploading logo:", error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message || "Failed to upload logo. Please try again.",
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  return (
    <DashboardLayout title="Company Profile">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <GlassCard>
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                {uploadingLogo ? (
                  <div className="h-32 w-32 rounded-full bg-vortex-700/50 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-vortex-400" />
                  </div>
                ) : logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Company Logo"
                    className="h-32 w-32 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-full bg-vortex-700/50 flex items-center justify-center">
                    <Building2 className="h-16 w-16 text-vortex-400" />
                  </div>
                )}
                <input
                  type="file"
                  id="logo-upload"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  disabled={uploadingLogo}
                />
              </div>
              <label
                htmlFor="logo-upload"
                className="cursor-pointer text-vortex-400 hover:text-vortex-300 text-sm mb-6"
              >
                {uploadingLogo ? "Uploading..." : "Upload Company Logo"}
              </label>
              
              <div className="w-full">
                <h3 className="text-lg font-semibold text-white mb-2">Account Information</h3>
                <Separator className="mb-4 bg-white/10" />
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-400">Email:</span>
                    <span className="block text-white">{user?.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Account Type:</span>
                    <span className="block text-white capitalize">{user?.role}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Member Since:</span>
                    <span className="block text-white">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "-"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="lg:col-span-2">
          <GlassCard>
            <h2 className="text-xl font-bold text-white mb-6">Edit Company Profile</h2>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="sector"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry / Sector</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Description</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={5}
                          placeholder="Write about your company, mission, and what you're looking for in candidates..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </form>
            </Form>
          </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
