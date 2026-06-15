import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSignUp } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import payraldLogo from "/payrald-icon-192.png";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  raldId: z.string().min(3, "RALD ID is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Phone number is required"),
  pin: z.string().min(4, "PIN must be at least 4 digits").max(6, "PIN can be at most 6 digits"),
  activatedTypes: z.array(z.string()).min(1, "Select at least one identity type"),
});

export default function SignUp() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      raldId: "",
      email: "",
      phone: "",
      pin: "",
      activatedTypes: ["Personal"],
    },
  });

  const signUpMutation = useSignUp();

  function onSubmit(values: z.infer<typeof formSchema>) {
    signUpMutation.mutate(
      { data: values as any },
      {
        onSuccess: (data) => {
          login(data.token, data.user);
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Sign up failed",
            description: "Please check your details and try again.",
          });
        },
      }
    );
  }

  const identityTypes = [
    { id: "Personal", label: "Personal" },
    { id: "Business", label: "Business" },
    { id: "Network", label: "Network" },
  ];

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-background p-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-[-80px] right-[-80px] w-[300px] h-[300px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full max-w-[390px] space-y-6 relative z-10"
      >
        <div className="space-y-2 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
            className="mx-auto w-16 h-16 mb-4 flex items-center justify-center"
          >
            <img
              src={payraldLogo}
              alt="PayRald"
              className="w-16 h-16 object-contain rounded-2xl shadow-lg shadow-primary/20"
            />
          </motion.div>
          <h1 className="text-3xl font-bold tracking-tight">Create your RALD ID</h1>
          <p className="text-muted-foreground text-sm">Join the fastest payment network in Nigeria</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Emeka Okafor" {...field} className="h-12 bg-card/60 border-border/60" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="raldId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Choose a RALD ID</FormLabel>
                  <FormControl>
                    <Input placeholder="emeka" {...field} className="h-12 bg-card/60 border-border/60" />
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
                    <Input type="email" placeholder="emeka@example.com" {...field} className="h-12 bg-card/60 border-border/60" />
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
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="+234..." {...field} className="h-12 bg-card/60 border-border/60" />
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
                  <FormLabel>Create PIN (4-6 digits)</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••" maxLength={6} {...field} className="h-12 bg-card/60 border-border/60 text-center tracking-widest text-xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="activatedTypes"
              render={() => (
                <FormItem>
                  <div className="mb-3">
                    <FormLabel className="text-base">Identity Types</FormLabel>
                  </div>
                  <div className="flex gap-2">
                    {identityTypes.map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="activatedTypes"
                        render={({ field }) => {
                          const isSelected = field.value?.includes(item.id);
                          return (
                            <FormItem
                              key={item.id}
                              className={`flex-1 flex flex-col items-center justify-center p-3 border rounded-xl cursor-pointer transition-all duration-200 ${isSelected ? 'bg-primary/20 border-primary shadow-sm shadow-primary/10' : 'bg-card/60 border-border/60 hover:border-border'}`}
                              onClick={() => {
                                const current = new Set(field.value || []);
                                if (isSelected) {
                                  current.delete(item.id);
                                } else {
                                  current.add(item.id);
                                }
                                field.onChange(Array.from(current));
                              }}
                            >
                              <FormControl>
                                <Checkbox
                                  checked={isSelected}
                                  className="hidden"
                                />
                              </FormControl>
                              <FormLabel className="font-medium cursor-pointer text-sm">
                                {item.label}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full h-12 text-base font-semibold mt-4" disabled={signUpMutation.isPending}>
              {signUpMutation.isPending ? "Creating account..." : "Continue"}
            </Button>
          </form>
        </Form>
        
        <div className="text-center text-sm text-muted-foreground pb-2">
          Already have an account?{" "}
          <Link href="/signin" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </div>

        <div className="flex items-center justify-center gap-2">
          <img src="/alia-logo.jpg" alt="Powered by ALIA" className="w-5 h-5 rounded-sm object-cover" />
          <span className="text-[11px] text-muted-foreground/60">Powered by ALIA Identity Network</span>
        </div>
      </motion.div>
    </div>
  );
}
