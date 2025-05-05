import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AuthLayout from "@/layouts/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Login() {
  const { login, isLoading, user } = useAuth();
  const [authInProgress, setAuthInProgress] = useState(false);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setAuthInProgress(true);
    try {
      await login(values.email, values.password);
    } finally {
      setAuthInProgress(false);
    }
  };

  // Redirect after hooks are initialized
  if (user) {
    return <Navigate to={user.role === "employee" ? "/employee/dashboard" : "/company/dashboard"} />;
  }

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to your account">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your email" {...field} />
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
                  <Input type="password" placeholder="Enter your password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full mt-6" disabled={authInProgress || isLoading}>
            {(authInProgress || isLoading) ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : "Sign In"}
          </Button>
          <div className="text-center mt-4">
            <p className="text-sm text-gray-400">
              Don't have an account yet?{" "}
              <Link to="/register" className="text-vortex-500 hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </form>
      </Form>
    </AuthLayout>
  );
}
