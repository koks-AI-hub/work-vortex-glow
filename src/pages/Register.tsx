
import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AuthLayout from "@/layouts/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/context/AuthContext";
import { Briefcase, Loader2, User } from "lucide-react";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
});

// Extended schema for company registration
const companySchema = registerSchema.extend({
  sector: z.string().min(2, "Company sector is required"),
});

export default function Register() {
  const { register, isLoading, user } = useAuth();
  const [role, setRole] = useState<"employee" | "company">("employee");
  const [authInProgress, setAuthInProgress] = useState(false);
  
  // If user is already logged in, redirect to appropriate dashboard
  if (user) {
    return <Navigate to={user.role === "employee" ? "/employee/dashboard" : "/company/dashboard"} />;
  }

  const form = useForm<z.infer<typeof companySchema>>({
    resolver: zodResolver(role === "employee" ? registerSchema : companySchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      sector: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof companySchema>) => {
    setAuthInProgress(true);
    try {
      await register(values, role);
    } finally {
      setAuthInProgress(false);
    }
  };

  return (
    <AuthLayout title="Create an Account" subtitle="Join Work Vortex today">
      <Tabs
        defaultValue="employee"
        value={role}
        onValueChange={(value) => setRole(value as "employee" | "company")}
        className="mb-6"
      >
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="employee" className="flex items-center">
            <User className="mr-2 h-4 w-4" /> 
            Job Seeker
          </TabsTrigger>
          <TabsTrigger value="company" className="flex items-center">
            <Briefcase className="mr-2 h-4 w-4" /> 
            Company
          </TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{role === "company" ? "Company Name" : "Full Name"}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={role === "company" ? "Enter company name" : "Enter your name"} 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your email" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Create a password" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your phone number" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {role === "company" && (
              <TabsContent value="company" className="pt-0">
                <FormField
                  control={form.control}
                  name="sector"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Sector</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. Technology, Healthcare, Finance" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            )}

            <Button type="submit" className="w-full mt-6" disabled={authInProgress || isLoading}>
              {(authInProgress || isLoading) ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : "Create Account"}
            </Button>

            <div className="text-center mt-4">
              <p className="text-sm text-gray-400">
                Already have an account?{" "}
                <Link to="/login" className="text-vortex-500 hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </Form>
      </Tabs>
    </AuthLayout>
  );
}
