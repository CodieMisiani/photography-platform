import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Button from "../components/ui/Button";
import FormField from "../components/ui/FormField";
import StatusText from "../components/ui/StatusText";
import { api } from "../lib/api";
import { fetchPayableInvoice } from "../services/invoiceService";

type PaymentStep = "lookup" | "payment" | "pending" | "success" | "failed";

export default function PayInvoicePage() {
  const [invoiceId, setInvoiceId] = useState("");
  const [verifiedInvoiceId, setVerifiedInvoiceId] = useState("");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<PaymentStep>("lookup");
  const [error, setError] = useState("");
  const { data, isFetching, isError } = useQuery({
    queryKey: ["payable-invoice", verifiedInvoiceId],
    queryFn: () => fetchPayableInvoice(verifiedInvoiceId),
    enabled: Boolean(verifiedInvoiceId),
    retry: false,
  });
  const paymentMutation = useMutation({
    mutationFn: ({ id, phoneNumber }: { id: string; phoneNumber: string }) =>
      api.invoices.pay(id, phoneNumber),
  });
  const statusQuery = useQuery({
    queryKey: ["invoice-status", data?.databaseId],
    queryFn: () => api.invoices.status(data?.databaseId ?? ""),
    enabled: step === "pending" && Boolean(data?.databaseId),
    refetchInterval: step === "pending" ? 3000 : false,
  });

  const displayedStep: PaymentStep =
    statusQuery.data?.status === "paid"
      ? "success"
      : statusQuery.data?.status === "failed"
        ? "failed"
        : step;

  useEffect(() => {
    if (step !== "pending") {
      return;
    }
    const timeout = window.setTimeout(() => setStep("failed"), 90_000);
    return () => window.clearTimeout(timeout);
  }, [step]);

  function verifyInvoice() {
    setError("");
    if (invoiceId.trim()) {
      setVerifiedInvoiceId(invoiceId.trim().toUpperCase());
      setStep("payment");
    }
  }

  async function sendPrompt() {
    setError("");
    if (!data?.databaseId || !phone.trim()) {
      setError("Enter a valid invoice and phone number.");
      return;
    }

    try {
      await paymentMutation.mutateAsync({ id: data.databaseId, phoneNumber: phone });
      setStep("pending");
    } catch {
      setError("The M-Pesa prompt could not be sent. Check the phone number and try again.");
    }
  }

  return (
    <div className="bg-paper text-ink">
      <Header />
      <main className="mx-auto flex min-h-[70vh] max-w-4xl flex-col items-center px-6 py-16">
        <div className="mb-10 flex w-full max-w-md justify-between px-4">
          {["lookup", "payment", "success"].map((item, index) => {
            const activeIndex = displayedStep === "lookup" ? 0 : displayedStep === "payment" ? 1 : 2;
            return (
              <span
                key={item}
                className={`h-2 w-2 ${index <= activeIndex ? "bg-ink" : "bg-grey-light"}`}
              />
            );
          })}
        </div>

        {displayedStep === "lookup" ? (
          <section className="w-full max-w-md">
            <div className="mb-12 text-center">
              <p className="mb-4 text-[0.75rem] font-semibold uppercase tracking-[0.3em] text-grey">
                Secure Payment Portal
              </p>
              <h1 className="text-4xl font-display font-semibold uppercase">
                Find Your Invoice
              </h1>
            </div>
            <div className="space-y-8">
              <FormField
                id="invoiceNumber"
                label="Invoice Number"
                value={invoiceId}
                onChange={(event) => setInvoiceId(event.target.value)}
                placeholder="INV-20260629-ABCDE"
              />
              <Button className="w-full" onClick={verifyInvoice}>
                Verify Invoice
              </Button>
            </div>
          </section>
        ) : null}

        {displayedStep === "payment" ? (
          <section className="w-full max-w-md">
            <button
              type="button"
              onClick={() => setStep("lookup")}
              className="mb-6 text-[0.75rem] font-semibold uppercase tracking-[0.25em] text-grey underline decoration-ink decoration-1 underline-offset-4"
            >
              Change Invoice
            </button>
            {isFetching ? <StatusPanel title="Loading Invoice" message="Checking the invoice number." busy /> : null}
            {isError ? <StatusPanel title="Invoice Not Found" message="Check the invoice number and try again." /> : null}
            {data ? (
              <>
                <div className="border border-grey-light">
                  <div className="border-b border-grey-light bg-grey-faint p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h1 className="mb-1 text-2xl font-display font-semibold uppercase">
                          {data.id}
                        </h1>
                        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-grey">
                          {data.dueDate}
                        </p>
                      </div>
                      <StatusText status={data.status} />
                    </div>
                  </div>
                  <div className="space-y-4 p-6">
                    {data.lineItems.map((item) => (
                      <div key={item.description} className="flex justify-between gap-4 text-sm">
                        <span className="text-grey">{item.description}</span>
                        <span className="font-semibold">{item.amount}</span>
                      </div>
                    ))}
                    <div className="flex justify-between border-t border-grey-light pt-6">
                      <span className="text-[0.75rem] font-semibold uppercase tracking-[0.25em]">
                        Total Amount
                      </span>
                      <span className="text-2xl font-semibold">{data.total}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-12 space-y-8">
                  <FormField
                    id="phoneNumber"
                    label="Phone Number"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="+254 712345678"
                    type="tel"
                  />
                  {error ? <p className="text-sm leading-6 text-grey">{error}</p> : null}
                  <Button className="w-full" onClick={sendPrompt} disabled={paymentMutation.isPending}>
                    {paymentMutation.isPending ? "Sending" : "Send STK Push"}
                  </Button>
                </div>
              </>
            ) : null}
          </section>
        ) : null}

        {displayedStep === "pending" ? (
          <StatusPanel
            title="Check Your Phone"
            message="We sent an M-Pesa prompt. Enter your PIN to complete payment."
            busy
          />
        ) : null}

        {displayedStep === "success" ? (
          <StatusPanel
            title="Payment Successful"
            message="The invoice has been settled and the payment reference was saved."
          />
        ) : null}

        {displayedStep === "failed" ? (
          <StatusPanel
            title="Payment Not Completed"
            message="The payment failed or timed out. You can return to the invoice and try again."
          />
        ) : null}
      </main>
      <Footer />
    </div>
  );
}

function StatusPanel({
  title,
  message,
  busy = false,
}: {
  title: string;
  message: string;
  busy?: boolean;
}) {
  return (
    <section className="w-full max-w-md border border-grey-light bg-grey-faint px-8 py-16 text-center">
      <div
        className={`mx-auto mb-8 h-20 w-20 border border-ink ${
          busy ? "animate-[spin_1.2s_linear_infinite]" : "bg-ink"
        }`}
      />
      <h1 className="mb-4 text-3xl font-display font-semibold uppercase">
        {title}
      </h1>
      <p className="text-sm leading-7 text-grey">{message}</p>
    </section>
  );
}
