import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useListBanks, useInitiateWithdrawal, getGetWalletQueryKey, getListTransactionsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  bankCode: z.string().min(1, "Select a bank"),
  accountName: z.string().min(3, "Account name is required"),
  amount: z.coerce.number().min(100, "Minimum amount is ₦100"),
  narration: z.string().optional(),
});

export default function Withdraw() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: banks, isLoading: banksLoading } = useListBanks();
  const initiateWithdrawalMutation = useInitiateWithdrawal();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bankCode: "",
      accountName: "",
      amount: 0,
      narration: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    initiateWithdrawalMutation.mutate(
      { data: values },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetWalletQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListTransactionsQueryKey() });
          toast({
            title: "Withdrawal initiated",
            description: `₦${values.amount} sent to your bank. Fee: ₦50.`,
          });
          setLocation("/");
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Withdrawal failed",
            description: "An error occurred while withdrawing money.",
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
        <h1 className="text-2xl font-bold">Withdraw</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="bankCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Bank</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-14 bg-card/50">
                      <SelectValue placeholder={banksLoading ? "Loading banks..." : "Select a bank"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {banks?.filter(b => b.supported).map((bank) => (
                      <SelectItem key={bank.code} value={bank.code}>{bank.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="accountName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} className="h-14 bg-card/50" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount (₦50 flat fee applies)</FormLabel>
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
            name="narration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Narration (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Withdrawal" {...field} className="h-12 bg-card/50" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full h-14 text-lg mt-8" 
            disabled={initiateWithdrawalMutation.isPending}
          >
            {initiateWithdrawalMutation.isPending ? "Processing..." : "Confirm Withdrawal"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
