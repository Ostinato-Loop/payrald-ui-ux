import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSignIn } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  raldId: z.string().min(2, "RALD ID is required"),
  pin: z.string().min(4, "PIN must be at least 4 digits").max(6, "PIN can be at most 6 digits"),
});

export default function SignIn() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      raldId: "",
      pin: "",
    },
  });

  const signInMutation = useSignIn();

  function onSubmit(values: z.infer<typeof formSchema>) {
    signInMutation.mutate(
      { data: values },
      {
        onSuccess: (data) => {
          login(data.token, data.user);
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Sign in failed",
            description: "Invalid RALD ID or PIN",
          });
        },
      }
    );
  }

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-background p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[390px] space-y-8"
      >
        <div className="space-y-2 text-center">
          <div className="mx-auto w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-6">
            <span className="text-primary-foreground font-bold text-xl">R</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground">Sign in to your PayRald account</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="raldId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RALD ID</FormLabel>
                  <FormControl>
                    <Input placeholder="@adaeze" {...field} className="h-12 bg-card/50" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PIN</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••" maxLength={6} {...field} className="h-12 bg-card/50 text-center text-2xl tracking-widest" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full h-12 text-lg" disabled={signInMutation.isPending}>
              {signInMutation.isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </Form>
        
        <div className="text-center text-sm text-muted-foreground">
          Don't have an account? <Link href="/signup" className="text-primary hover:underline">Sign up</Link>
        </div>
      </motion.div>
    </div>
  );
}
