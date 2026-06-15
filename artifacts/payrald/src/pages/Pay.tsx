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
import { CheckCircle2, XCircle, ArrowLeft, Loader2, Store, ScanLine } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { useQueryClient } from "@tanstack/react-query";
import { QrScanner } from "@/components/ui/QrScanner";

const formSchema = z.object({
  merchantAlias: z.string().min(1, "Merchant handle is required"),
  amount: z.coerce.number().min(10, "Minimum amount is ₦10"),
  note: z.string().optional(),
});

export default function Pay() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [debouncedAlias, setDebouncedAlias]     = useState("");
  const [resolvedIdentity, setResolvedIdentity] = useState<any>(null);
  const [showScanner, setShowScanner]           = useState(false);

  const resolveIdentityMutation = useResolveIdentity();
  const initiatePaymentMutation = useInitiatePayment();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { merchantAlias: "", amount: 0, note: "" },
  });

  const aliasValue = form.watch("merchantAlias");

  useEffect(() => {
    const h = setTimeout(() => setDebouncedAlias(aliasValue), 500);
    return () => clearTimeout(h);
  }, [aliasValue]);

  useEffect(() => {
    if (debouncedAlias.length > 2) {
      resolveIdentityMutation.mutate(
        { data: { alias: debouncedAlias } },
        {
          onSuccess: (data) => {
            setResolvedIdentity(data.aliasType === "merchant" ? data : null);
          },
          onError: () => setResolvedIdentity(null),
        }
      );
    } else {
      setResolvedIdentity(null);
    }
  }, [debouncedAlias]);

  function handleQrScan(handle: string) {
    setShowScanner(false);
    form.setValue("merchantAlias", handle, { shouldDirty: true, shouldTouch: true });
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!resolvedIdentity) {
      toast({ variant: "destructive", title: "Merchant not found", description: "Enter a valid merchant handle." });
      return;
    }

    initiatePaymentMutation.mutate(
      { data: { merchantAlias: values.merchantAlias, amount: values.amount, note: values.note } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetWalletQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListTransactionsQueryKey() });
          toast({ title: "Payment successful", description: `Paid ₦${values.amount} to ${resolvedIdentity.displayName}` });
          setLocation("/");
        },
        onError: () => {
          toast({ variant: "destructive", title: "Payment failed", description: "An error occurred while making payment." });
        },
      }
    );
  }

  return (
    <>
      {showScanner && (
        <QrScanner onScan={handleQrScan} onClose={() => setShowScanner(false)} />
      )}

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
            <h1 className="text-xl font-bold leading-tight">Pay Merchant</h1>
            <p className="text-xs text-muted-foreground">Enter handle or scan a QR code</p>
          </div>
        </div>

        {/* QR scan banner */}
        <button
          type="button"
          onClick={() => setShowScanner(true)}
          className="w-full flex items-center gap-4 bg-primary rounded-2xl p-4 text-left transition-opacity active:opacity-80"
          style={{ background: "linear-gradient(135deg, #1B2744 0%, #243357 100%)" }}
        >
          <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
            <ScanLine size={22} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-white text-sm">Scan QR Code</p>
            <p className="text-white/60 text-xs mt-0.5">Point at a PayRald merchant QR code</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            <ScanLine size={15} className="text-white/70" />
          </div>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground font-medium">or type manually</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Merchant handle */}
            <FormField
              control={form.control}
              name="merchantAlias"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Merchant Handle</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Store size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="@merchant"
                        {...field}
                        className="h-13 h-12 pl-10 bg-card/60 text-base"
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
                    <span className="text-sm text-muted-foreground">Looking up merchant…</span>
                  </div>
                </motion.div>
              )}

              {resolvedIdentity && !resolveIdentityMutation.isPending && (
                <motion.div key="found" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                  <div className="bg-primary/8 border border-primary/20 rounded-xl p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                      <Store size={18} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm flex items-center gap-1">
                        {resolvedIdentity.displayName}
                        {resolvedIdentity.verified && <CheckCircle2 className="text-green-600 shrink-0" size={13} />}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{resolvedIdentity.alias}</p>
                    </div>
                    <CheckCircle2 className="text-green-600 shrink-0" size={18} />
                  </div>
                </motion.div>
              )}

              {debouncedAlias.length > 2 && !resolvedIdentity && !resolveIdentityMutation.isPending && (
                <motion.div key="notfound" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                  <div className="bg-destructive/8 border border-destructive/20 rounded-xl p-3 flex items-center gap-3">
                    <XCircle className="text-destructive shrink-0" size={18} />
                    <div>
                      <p className="font-semibold text-destructive text-sm">Merchant not found</p>
                      <p className="text-xs text-destructive/70">Check the handle and try again</p>
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
                    <Input placeholder="What are you paying for?" {...field} className="h-11 bg-card/60" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full h-13 h-12 text-base mt-2"
              disabled={!resolvedIdentity || initiatePaymentMutation.isPending}
            >
              {initiatePaymentMutation.isPending ? (
                <><Loader2 size={16} className="animate-spin mr-2" /> Processing…</>
              ) : "Confirm & Pay"}
            </Button>
          </form>
        </Form>
      </div>
    </>
  );
}
