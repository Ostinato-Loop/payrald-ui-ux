import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useResolveIdentity, useInitiateTransfer,
  getGetWalletQueryKey, getListTransactionsQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, ArrowLeft, Loader2, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  recipient: z.string().min(1, "Recipient is required"),
  amount:    z.coerce.number().min(10, "Minimum amount is ₦10"),
  note:      z.string().optional(),
});

export default function Send() {
  const [, setLocation] = useLocation();
  const { toast }       = useToast();
  const queryClient     = useQueryClient();

  const [debouncedRecipient, setDebouncedRecipient] = useState("");
  const [resolvedIdentity,   setResolvedIdentity]   = useState<any>(null);

  const resolveIdentityMutation = useResolveIdentity();
  const initiateTransferMutation = useInitiateTransfer();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { recipient: "", amount: 0, note: "" },
  });

  const recipientValue = form.watch("recipient");

  useEffect(() => {
    const h = setTimeout(() => setDebouncedRecipient(recipientValue), 500);
    return () => clearTimeout(h);
  }, [recipientValue]);

  useEffect(() => {
    if (debouncedRecipient.length > 2) {
      resolveIdentityMutation.mutate(
        { data: { alias: debouncedRecipient } },
        {
          onSuccess: (data) => setResolvedIdentity(data),
          onError:   ()     => setResolvedIdentity(null),
        }
      );
    } else {
      setResolvedIdentity(null);
    }
  }, [debouncedRecipient]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!resolvedIdentity) {
      toast({ variant: "destructive", title: "Identity not resolved", description: "Enter a valid recipient before sending." });
      return;
    }

    initiateTransferMutation.mutate(
      { data: { recipient: values.recipient, amount: values.amount, note: values.note } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetWalletQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListTransactionsQueryKey() });
          toast({ title: "Transfer sent!", description: `₦${values.amount.toLocaleString()} sent to ${resolvedIdentity.displayName}` });
          setLocation("/");
        },
        onError: () => {
          toast({ variant: "destructive", title: "Transfer failed", description: "An error occurred. Please try again." });
        },
      }
    );
  }

  return (
    <div className="p-6 pt-10 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setLocation("/")}
          className="w-10 h-10 bg-card rounded-full flex items-center justify-center border border-border"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold leading-tight">Send Money</h1>
          <p className="text-xs text-muted-foreground">Transfer to any ALIA identity</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Recipient */}
          <FormField
            control={form.control}
            name="recipient"
            render={({ field }) => (
              <FormItem>
                <FormLabel>To</FormLabel>
                <FormControl>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="@username, email or phone"
                      {...field}
                      className="h-12 pl-10 bg-card/60 text-base"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Identity resolution feedback */}
          <AnimatePresence>
            {resolveIdentityMutation.isPending && (
              <motion.div key="loading" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                <div className="bg-secondary border border-border rounded-xl p-3 flex items-center gap-2">
                  <Loader2 className="animate-spin text-primary shrink-0" size={16} />
                  <span className="text-sm text-muted-foreground">Finding ALIA identity…</span>
                </div>
              </motion.div>
            )}

            {resolvedIdentity && !resolveIdentityMutation.isPending && (
              <motion.div key="found" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                <div className="bg-primary/8 border border-primary/20 rounded-xl p-3 flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-primary/20 shrink-0">
                    <AvatarFallback className="bg-primary/15 text-primary text-sm font-bold">
                      {resolvedIdentity.avatarInitials ?? resolvedIdentity.displayName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{resolvedIdentity.displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">{resolvedIdentity.alias}</p>
                  </div>
                  {resolvedIdentity.verified && <CheckCircle2 className="text-green-600 shrink-0" size={18} />}
                </div>
              </motion.div>
            )}

            {debouncedRecipient.length > 2 && !resolvedIdentity && !resolveIdentityMutation.isPending && (
              <motion.div key="notfound" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                <div className="bg-destructive/8 border border-destructive/20 rounded-xl p-3 flex items-center gap-3">
                  <XCircle className="text-destructive shrink-0" size={18} />
                  <div>
                    <p className="font-semibold text-destructive text-sm">Identity not found</p>
                    <p className="text-xs text-destructive/70">Check the alias and try again</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Amount */}
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-muted-foreground">₦</span>
                    <Input type="number" {...field} className="h-14 pl-9 text-2xl font-bold bg-card/60" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Note */}
          <FormField
            control={form.control}
            name="note"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Note <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                <FormControl>
                  <Input placeholder="What's this for?" {...field} className="h-11 bg-card/60" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full h-12 text-base mt-2"
            disabled={!resolvedIdentity || initiateTransferMutation.isPending}
          >
            {initiateTransferMutation.isPending ? (
              <><Loader2 size={16} className="animate-spin mr-2" />Processing…</>
            ) : "Confirm & Send"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
