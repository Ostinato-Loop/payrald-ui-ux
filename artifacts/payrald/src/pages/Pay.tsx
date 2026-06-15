import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useResolveIdentity, useInitiatePayment, getGetWalletQueryKey, getListTransactionsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, ArrowLeft, Loader2, Store } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  merchantAlias: z.string().min(1, "Merchant handle is required"),
  amount: z.coerce.number().min(10, "Minimum amount is ₦10"),
  note: z.string().optional(),
});

export default function Pay() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [debouncedAlias, setDebouncedAlias] = useState("");
  const [resolvedIdentity, setResolvedIdentity] = useState<any>(null);
  
  const resolveIdentityMutation = useResolveIdentity();
  const initiatePaymentMutation = useInitiatePayment();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      merchantAlias: "",
      amount: 0,
      note: "",
    },
  });

  const aliasValue = form.watch("merchantAlias");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedAlias(aliasValue);
    }, 500);
    return () => clearTimeout(handler);
  }, [aliasValue]);

  useEffect(() => {
    if (debouncedAlias.length > 2) {
      resolveIdentityMutation.mutate(
        { data: { alias: debouncedAlias } },
        {
          onSuccess: (data) => {
            if (data.aliasType === 'merchant') {
              setResolvedIdentity(data);
            } else {
              setResolvedIdentity(null);
            }
          },
          onError: () => {
            setResolvedIdentity(null);
          }
        }
      );
    } else {
      setResolvedIdentity(null);
    }
  }, [debouncedAlias]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!resolvedIdentity) {
      toast({
        variant: "destructive",
        title: "Merchant not found",
        description: "Please enter a valid merchant handle.",
      });
      return;
    }

    initiatePaymentMutation.mutate(
      { data: { merchantAlias: values.merchantAlias, amount: values.amount, note: values.note } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetWalletQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListTransactionsQueryKey() });
          toast({
            title: "Payment successful",
            description: `Paid ₦${values.amount} to ${resolvedIdentity.displayName}`,
          });
          setLocation("/");
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Payment failed",
            description: "An error occurred while making payment.",
          });
        },
      }
    );
  }

  return (
    <div className="p-6 pt-12 space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => setLocation("/")} className="w-10 h-10 bg-card rounded-full flex items-center justify-center border border-border">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Pay Merchant</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="merchantAlias"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Merchant Handle</FormLabel>
                <FormControl>
                  <Input placeholder="@merchant" {...field} className="h-14 bg-card/50 text-lg" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <AnimatePresence>
            {resolveIdentityMutation.isPending && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin text-primary" size={20} />
                  <span className="text-sm text-muted-foreground">Finding Merchant...</span>
                </div>
              </motion.div>
            )}

            {resolvedIdentity && !resolveIdentityMutation.isPending && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border border-primary/20 bg-primary/20">
                      <Store className="text-primary m-auto" size={24} />
                    </Avatar>
                    <div>
                      <p className="font-semibold flex items-center gap-1">
                        {resolvedIdentity.displayName}
                        {resolvedIdentity.verified && <CheckCircle2 className="text-green-500" size={14} />}
                      </p>
                      <p className="text-xs text-muted-foreground">{resolvedIdentity.alias}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {debouncedAlias.length > 2 && !resolvedIdentity && !resolveIdentityMutation.isPending && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-center gap-3">
                  <XCircle className="text-destructive" size={24} />
                  <div>
                    <p className="font-semibold text-destructive">Merchant not found</p>
                    <p className="text-xs text-destructive/80">Check the handle and try again</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground">₦</span>
                    <Input type="number" {...field} className="h-16 pl-10 text-3xl font-bold bg-card/50" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="note"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Note (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="What are you paying for?" {...field} className="h-12 bg-card/50" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full h-14 text-lg mt-8" 
            disabled={!resolvedIdentity || initiatePaymentMutation.isPending}
          >
            {initiatePaymentMutation.isPending ? "Processing..." : "Confirm & Pay"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
