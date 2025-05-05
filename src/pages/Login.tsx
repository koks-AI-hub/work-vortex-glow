
import { useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
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

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Login() {
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get("role") as UserRole || "employee";
  const [role, setRole] = useState<UserRole>(roleParam);
  const { toast } = useToast();
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await login(values.email, values.password, role);
      toast({
        title: "Login successful",
        description: `Welcome back! You've been logged in as a ${role}.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "Please check your credentials and try again.",
      });
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Login to your account"
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

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </Form>

      <div className="mt-6 text-center text-sm">
        <p className="text-gray-400">
          Don't have an account?{" "}
          <Link to={`/register?role=${role}`} className="text-vortex-400 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
