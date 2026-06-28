import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { useMutation } from "@tanstack/react-query";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Button from "../components/ui/Button";
import FormField from "../components/ui/FormField";
import {
  budgetOptions,
  eventTypeOptions,
  quoteImages,
  quoteSteps,
} from "../data/quoteFixtures";
import { api } from "../lib/api";

type FormStep = 1 | 2 | 3 | "success";
type QuoteFormState = {
  name: string;
  mobile: string;
  email: string;
  eventType: string;
  dateRange: string;
  description: string;
};

export default function RequestQuotePage() {
  const [step, setStep] = useState<FormStep>(1);
  const [selectedBudget, setSelectedBudget] = useState(budgetOptions[0]);
  const [formError, setFormError] = useState("");
  const [formState, setFormState] = useState<QuoteFormState>({
    name: "",
    mobile: "",
    email: "",
    eventType: eventTypeOptions[0],
    dateRange: "",
    description: "",
  });
  const quoteMutation = useMutation({
    mutationFn: api.quotes.create,
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    try {
      await quoteMutation.mutateAsync({
        client_name: formState.name,
        whatsapp: formState.mobile,
        email: formState.email,
        description: [
          formState.description,
          `Event type: ${formState.eventType}`,
          `Preferred date range: ${formState.dateRange || "Flexible"}`,
          `Budget: ${selectedBudget}`,
        ].join("\n"),
      });
      setStep("success");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setFormError("Your quote request could not be sent. Please check the details and try again.");
    }
  }

  function updateField(field: keyof QuoteFormState, value: string) {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  }

  return (
    <div className="bg-paper text-ink">
      <Header />

      <main className="min-h-screen">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-16 lg:grid-cols-12 lg:py-24">
          <aside className="order-1 lg:order-2 lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              <h1 className="mb-4 text-3xl font-display font-semibold uppercase text-ink">
                The Creative Journey
              </h1>
              <p className="mb-10 text-[1rem] leading-8 text-grey">
                Every commission begins with a conversation. We ensure every
                detail is intentional.
              </p>
              <div className="space-y-10">
                {quoteSteps.map((item, index) => (
                  <div key={item.number} className="flex items-start gap-6">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center border text-[0.7rem] font-semibold uppercase tracking-[0.2em] ${
                        index === 0
                          ? "border-ink bg-ink text-paper"
                          : "border-grey-light text-grey"
                      }`}
                    >
                      {item.number}
                    </div>
                    <div>
                      <h2 className="mb-1 text-[0.75rem] font-semibold uppercase tracking-[0.25em] text-ink">
                        {item.title}
                      </h2>
                      <p className="text-sm leading-6 text-grey">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-16 border border-grey-light bg-grey-faint p-8">
                <p className="mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-grey">
                  Last minute? Call the studio
                </p>
                <p className="text-3xl font-display font-semibold text-ink">
                  +1 (212) 555-0198
                </p>
              </div>
            </div>
          </aside>

          <section className="order-2 lg:order-1 lg:col-span-8">
            <div className="max-w-2xl">
              <header className="mb-12">
                <p className="mb-4 text-[0.75rem] font-semibold uppercase tracking-[0.3em] text-grey">
                  Booking Inquiry
                </p>
                <h2 className="mb-5 text-5xl font-display uppercase leading-tight tracking-[-0.04em] text-ink sm:text-6xl md:text-[4.5rem]">
                  Request a bespoke quote
                </h2>
                <div className="h-px w-24 bg-ink" />
              </header>

              <form onSubmit={handleSubmit}>
                {formError ? (
                  <p className="mb-8 border border-grey-light bg-grey-faint p-4 text-[0.8rem] font-semibold uppercase tracking-[0.18em] text-ink">
                    {formError}
                  </p>
                ) : null}
                {step === 1 ? (
                  <IdentityStep
                    formState={formState}
                    onFieldChange={updateField}
                    onNext={() => setStep(2)}
                  />
                ) : null}
                {step === 2 ? (
                  <EventDetailsStep
                    formState={formState}
                    selectedBudget={selectedBudget}
                    onFieldChange={updateField}
                    onBudgetChange={setSelectedBudget}
                    onBack={() => setStep(1)}
                    onNext={() => setStep(3)}
                  />
                ) : null}
                {step === 3 ? (
                  <CreativeBriefStep
                    description={formState.description}
                    isSubmitting={quoteMutation.isPending}
                    onDescriptionChange={(value) => updateField("description", value)}
                    onBack={() => setStep(2)}
                  />
                ) : null}
                {step === "success" ? <SuccessState /> : null}
              </form>
            </div>
          </section>
        </div>

        <section className="mx-auto max-w-7xl px-6 pb-24">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {quoteImages.map((image, index) => (
              <div
                key={image.src}
                className={`h-64 overflow-hidden bg-grey-faint md:h-96 ${
                  index % 2 === 1 ? "mt-12" : ""
                }`}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="h-full w-full object-cover grayscale"
                />
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function IdentityStep({
  formState,
  onFieldChange,
  onNext,
}: {
  formState: QuoteFormState;
  onFieldChange: (field: keyof QuoteFormState, value: string) => void;
  onNext: () => void;
}) {
  return (
    <section className="space-y-12">
      <StepTitle>Personal Identity</StepTitle>
      <div className="grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-2">
        <FormField
          id="name"
          name="name"
          label="Full Name"
          placeholder="Johnathan Doe"
          required
          value={formState.name}
          onChange={(event) => onFieldChange("name", event.target.value)}
        />
        <FormField
          id="mobile"
          name="mobile"
          label="WhatsApp / Mobile"
          placeholder="+1 000 000 000"
          type="tel"
          required
          value={formState.mobile}
          onChange={(event) => onFieldChange("mobile", event.target.value)}
        />
        <div className="md:col-span-2">
          <FormField
            id="email"
            name="email"
            label="Email Address"
            placeholder="hello@studio.com"
            type="email"
            required
            value={formState.email}
            onChange={(event) => onFieldChange("email", event.target.value)}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button onClick={onNext}>Proceed to Event Details</Button>
      </div>
    </section>
  );
}

function EventDetailsStep({
  formState,
  selectedBudget,
  onFieldChange,
  onBudgetChange,
  onBack,
  onNext,
}: {
  formState: QuoteFormState;
  selectedBudget: string;
  onFieldChange: (field: keyof QuoteFormState, value: string) => void;
  onBudgetChange: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <section className="space-y-12">
      <StepTitle>Event Specifications</StepTitle>
      <div className="grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-2">
        <FormField
          as="select"
          id="eventType"
          name="eventType"
          label="Event Type"
          value={formState.eventType}
          onChange={(event) => onFieldChange("eventType", event.target.value)}
        >
          {eventTypeOptions.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </FormField>
        <FormField
          id="dateRange"
          name="dateRange"
          label="Date Range Preference"
          placeholder="MM/DD/YYYY - MM/DD/YYYY"
          value={formState.dateRange}
          onChange={(event) => onFieldChange("dateRange", event.target.value)}
        />
        <fieldset className="md:col-span-2">
          <legend className="mb-4 text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-grey">
            Estimated Budget (USD)
          </legend>
          <div className="grid gap-px border border-grey-light bg-grey-light sm:grid-cols-3">
            {budgetOptions.map((option) => {
              const isSelected = selectedBudget === option;

              return (
                <label key={option} className="cursor-pointer bg-paper">
                  <input
                    className="sr-only"
                    type="radio"
                    name="budget"
                    value={option}
                    checked={isSelected}
                    onChange={() => onBudgetChange(option)}
                  />
                  <span
                    className={`block px-4 py-4 text-center text-[0.75rem] font-semibold uppercase tracking-[0.2em] ${
                      isSelected ? "bg-ink text-paper" : "text-ink"
                    }`}
                  >
                    {option}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </div>
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="text-[0.75rem] font-semibold uppercase tracking-[0.25em] text-grey underline decoration-ink decoration-1 underline-offset-4"
        >
          Back
        </button>
        <Button onClick={onNext}>Final Step: Description</Button>
      </div>
    </section>
  );
}

function CreativeBriefStep({
  description,
  isSubmitting,
  onDescriptionChange,
  onBack,
}: {
  description: string;
  isSubmitting: boolean;
  onDescriptionChange: (value: string) => void;
  onBack: () => void;
}) {
  return (
    <section className="space-y-12">
      <StepTitle>The Creative Brief</StepTitle>
      <FormField
        as="textarea"
        id="description"
        name="description"
        label="Tell Us Your Vision"
        placeholder="Describe the atmosphere, location, and aesthetic goals..."
        rows={5}
        required
        value={description}
        onChange={(event) => onDescriptionChange(event.target.value)}
      />
      <div className="flex items-start gap-4">
        <input
          className="mt-1 h-4 w-4 border border-grey"
          id="terms"
          required
          type="checkbox"
        />
        <label
          className="text-[0.7rem] font-semibold uppercase leading-6 tracking-[0.2em] text-grey"
          htmlFor="terms"
        >
          I understand that a booking is only confirmed upon receipt of a
          digital contract and 50% non-refundable retainer.
        </label>
      </div>
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="text-[0.75rem] font-semibold uppercase tracking-[0.25em] text-grey underline decoration-ink decoration-1 underline-offset-4"
        >
          Back
        </button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Sending" : "Submit Request"}
        </Button>
      </div>
    </section>
  );
}

function SuccessState() {
  return (
    <section className="border border-grey-light bg-grey-faint px-8 py-20 text-center">
      <h2 className="mb-4 text-5xl font-display uppercase tracking-[-0.04em] text-ink">
        Inquiry Received
      </h2>
      <p className="mx-auto mb-8 max-w-sm text-[0.95rem] leading-7 text-grey">
        Alexander will review your creative brief within 48 hours. A
        personalized quote will be sent to your email.
      </p>
      <Button asLink to="/">
        Return to Home
      </Button>
    </section>
  );
}

function StepTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="border-b border-grey-light pb-2 text-[0.75rem] font-semibold uppercase tracking-[0.25em] text-grey">
      {children}
    </h3>
  );
}
