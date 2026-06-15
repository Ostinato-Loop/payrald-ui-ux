import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useListBanks, useInitiateWithdrawal,
  getGetWalletQueryKey, getListTransactionsQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Landmark, Loader2, Info } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  bankCode:    z.string().min(1, "Select a bank"),
  accountName: z.string().min(3, "Account name is required"),
  amount:      z.coerce.number().min(100, "Minimum withdrawal is ₦100"),
  narration:   z.string().optional(),
});

export default function Withdraw() {
  const [, setLocation] = useLocation();
  const { toast }       = useToast();
  const queryClient     = useQueryClient();

  const { data: banks, isLoading: banksLoading } = useListBanks();
  const initiateWithdrawalMutation = useInitiateWithdrawal();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { bankCode: "", accountName: "", amount: 0, narration: "" },
  });

  const amountValue = form.watch("amount") || 0;
  const fee         = 50;
  const totalDebit  = amountValue + fee;

  function onSubmit(values: z.infer<typeof formSchema>) {
    initiateWithdrawalMutation.mutate(
      { data: values },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetWalletQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListTransactionsQueryKey() });
          toast({
            title: "Withdrawal initiated",
            description: `₦${values.amount.toLocaleString()} is on its way to your bank.`,
          });
          setLocation("/");
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Withdrawal failed",
            description: "Something went wrong. Please try again.",
          });
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
          <h1 className="text-xl font-bold leading-tight">Withdraw</h1>
          <p className="text-xs text-muted-foreground">Send funds to your bank account</p>
        </div>
      </div>

      {/* Fee notice */}
      <div className="flex items-start gap-2.5 bg-[#D4922A]/8 border border-[#D4922A]/25 rounded-xl px-4 py-3">
        <Info size={15} className="text-[#D4922A] shrink-0 mt-0.5" />
        <p className="text-xs text-[#D4922A] font-medium leading-snug">
          A flat fee of ₦50 applies per withdrawal. No account numbers are shared — your identity is protected by ALIA.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Bank */}
          <FormField
            control={form.control}
            name="bankCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bank</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12 bg-card/60">
                      <div className="flex items-center gap-2">
                        <Landmark size={15} className="text-muted-foreground shrink-0" />
                        <SelectValue placeholder={banksLoading ? "Loading banks…" : "Select a bank"} />
                      </div>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {banks?.filter((b) => b.supported).map((bank) => (
                      <SelectItem key={bank.code} value={bank.code}>
                        {bank.name}
                      </SelectItem>
                    ))}
                    {!banksLoading && !banks?.filter((b) => b.supported).length && (
                      <SelectItem value="_none" disabled>No supported banks found</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Account name */}
          <FormField
            control={form.control}
            name="accountName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Name</FormLabel>
                <FormControl>
                  <Input placeholder="As shown on your bank account" {...field} className="h-12 bg-card/60" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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

          {/* Narration */}
          <FormField
            control={form.control}
            name="narration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Narration <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                <FormControl>
                  <Input placeholder="Withdrawal" {...field} className="h-11 bg-card/60" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Summary */}
          {amountValue >= 100 && (
            <div className="bg-secondary border border-border rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Withdrawal</span>
                <span className="font-medium">₦{amountValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Fee</span>
                <span className="font-medium">₦{fee}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between text-sm font-bold">
                <span>Total deducted</span>
                <span className="text-primary">₦{totalDebit.toLocaleString()}</span>
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 text-base mt-2"
            disabled={initiateWithdrawalMutation.isPending}
          >
            {initiateWithdrawalMutation.isPending ? (
              <><Loader2 size={16} className="animate-spin mr-2" />Processing…</>
            ) : "Confirm Withdrawal"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
