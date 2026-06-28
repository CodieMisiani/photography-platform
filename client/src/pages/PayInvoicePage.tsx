import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Button from "../components/ui/Button";
import FormField from "../components/ui/FormField";
import StatusText from "../components/ui/StatusText";
import { fetchPayableInvoice } from "../services/invoiceService";

type PaymentStep = "lookup" | "payment" | "pending" | "success";

export default function PayInvoicePage() {
  const [invoiceId, setInvoiceId] = useState("EL-2024-8842");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<PaymentStep>("lookup");
  const { data } = useQuery({
    queryKey: ["payable-invoice", invoiceId],
    queryFn: () => fetchPayableInvoice(invoiceId),
    enabled: step !== "lookup",
  });

  function verifyInvoice() {
    if (invoiceId.trim()) {
      setStep("payment");
    }
  }

  function sendPrompt() {
    if (phone.trim()) {
      setStep("pending");
      window.setTimeout(() => setStep("success"), 1600);
    }
  }

  return (
    <div className="bg-paper text-ink">
      <Header />
      <main className="mx-auto flex min-h-[70vh] max-w-4xl flex-col items-center px-6 py-16">
        <div className="mb-10 flex w-full max-w-md justify-between px-4">
          {["lookup", "payment", "success"].map((item, index) => {
            const activeIndex = step === "lookup" ? 0 : step === "payment" ? 1 : 2;
            return (
              <span
                key={item}
                className={`h-2 w-2 ${index <= activeIndex ? "bg-ink" : "bg-grey-light"}`}
              />
            );
          })}
        </div>

        {step === "lookup" ? (
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
                placeholder="EL-2024-001"
              />
              <Button className="w-full" onClick={verifyInvoice}>
                Verify Invoice
              </Button>
            </div>
            <div className="mt-12 border border-grey-light bg-grey-faint p-6">
              <p className="text-sm leading-7 text-grey">
                Invoices are sent to your registered email after booking
                confirmation. Enter the unique alphanumeric code to continue.
              </p>
            </div>
          </section>
        ) : null}

        {step === "payment" && data ? (
          <section className="w-full max-w-md">
            <button
              type="button"
              onClick={() => setStep("lookup")}
              className="mb-6 text-[0.75rem] font-semibold uppercase tracking-[0.25em] text-grey underline decoration-ink decoration-1 underline-offset-4"
            >
              Change Invoice
            </button>
            <div className="border border-grey-light">
              <div className="border-b border-grey-light bg-grey-faint p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="mb-1 text-2xl font-display font-semibold uppercase">
                      {data.id}
                    </h1>
                    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-grey">
                      Due by {data.dueDate}
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
              <div className="text-center">
                <h2 className="text-[0.75rem] font-semibold uppercase tracking-[0.25em]">
                  Pay via M-Pesa
                </h2>
                <p className="mt-2 text-sm text-grey">
                  Enter your phone number to receive the prompt.
                </p>
              </div>
              <FormField
                id="phoneNumber"
                label="Phone Number"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+254 712345678"
                type="tel"
              />
              <Button className="w-full" onClick={sendPrompt}>
                Send STK Push
              </Button>
            </div>
          </section>
        ) : null}

        {step === "pending" ? (
          <StatusPanel
            title="Check Your Phone"
            message="We sent an M-Pesa prompt. Enter your PIN to complete payment."
            busy
          />
        ) : null}

        {step === "success" ? (
          <StatusPanel
            title="Payment Successful"
            message="The invoice has been settled. A digital receipt has been sent to your email."
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
