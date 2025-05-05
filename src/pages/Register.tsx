
import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import AuthLayout from "@/layouts/AuthLayout";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types/auth";

const baseSchema = {
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
};

const employeeSchema = z.object({
  ...baseSchema,
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const companySchema = z.object({
  ...baseSchema,
  sector: z.string().min(2, "Sector is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function Register() {
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get("role") as UserRole || "employee";
  const [role, setRole] = useState<UserRole>(roleParam);
  const { toast } = useToast();
  const { register: registerUser, isLoading, error } = useAuth();

  const form = useForm<any>({
    resolver: zodResolver(role === "employee" ? employeeSchema : companySchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      sector: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: any) => {
    // Remove confirmPassword as it's not needed for registration
    const { confirmPassword, ...registrationData } = values;
    
    try {
      await registerUser(registrationData, role);
      toast({
        title: "Registration successful",
        description: `Welcome to Work Vortex! Your ${role} account has been created.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: "There was an error creating your account. Please try again.",
      });
    }
  };

  return (
    <AuthLayout
      title="Create an Account"
      subtitle="Join Work Vortex today"
    >
      <div className="flex justify-center mb-6 bg-secondary/10 rounded-lg p-1">
        <Button
          variant={role === "employee" ? "default" : "ghost"}
          className={role === "employee" ? "" : "text-gray-400"}
          onClick={() => setRole("employee")}
        >
          Employee
        </Button>
        <Button
          variant={role === "company" ? "default" : "ghost"}
          className={role === "company" ? "" : "text-gray-400"}
          onClick={() => setRole("company")}
        >
          Company
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{role === "employee" ? "Full Name" : "Company Name"}</FormLabel>
                <FormControl>
                  <Input placeholder={role === "employee" ? "John Doe" : "Acme Inc."} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {role === "company" && (
            <FormField
              control={form.control}
              name="sector"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sector</FormLabel>
                  <FormControl>
                    <Input placeholder="Technology, Healthcare, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="+1 123 456 7890" {...field} />
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
                  <Input placeholder="your.email@example.com" {...field} />
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
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Register"}
          </Button>
        </form>
      </Form>

      <div className="mt-6 text-center text-sm">
        <p className="text-gray-400">
          Already have an account?{" "}
          <Link to={`/login?role=${role}`} className="text-vortex-400 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
