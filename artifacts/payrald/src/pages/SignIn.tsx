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
import payraldLogo from "/payrald-icon-192.png";

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
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-[-80px] right-[-80px] w-[300px] h-[300px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full max-w-[390px] space-y-8 relative z-10"
      >
        <div className="space-y-3 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
            className="mx-auto w-20 h-20 mb-6 flex items-center justify-center"
          >
            <img
              src={payraldLogo}
              alt="PayRald"
              className="w-20 h-20 object-contain rounded-2xl shadow-lg shadow-primary/20"
            />
          </motion.div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground text-sm">Sign in to your PayRald account</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="raldId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RALD ID</FormLabel>
                  <FormControl>
                    <Input placeholder="@adaeze" {...field} className="h-12 bg-card/60 border-border/60" />
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
                    <Input
                      type="password"
                      placeholder="••••"
                      maxLength={6}
                      {...field}
                      className="h-12 bg-card/60 border-border/60 text-center text-2xl tracking-widest"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold"
              disabled={signInMutation.isPending}
            >
              {signInMutation.isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </Form>

        <div className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-primary hover:underline font-medium">
            Sign up
          </Link>
        </div>

        <div className="flex items-center justify-center gap-2 pt-2">
          <img src="/alia-logo.jpg" alt="Powered by ALIA" className="w-5 h-5 rounded-sm object-cover" />
          <span className="text-[11px] text-muted-foreground/60">Powered by ALIA Identity Network</span>
        </div>
      </motion.div>
    </div>
  );
}
