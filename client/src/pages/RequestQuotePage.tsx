import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
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

type FormStep = 1 | 2 | 3 | "success";

export default function RequestQuotePage() {
  const [step, setStep] = useState<FormStep>(1);
  const [selectedBudget, setSelectedBudget] = useState(budgetOptions[0]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStep("success");
    window.scrollTo({ top: 0, behavior: "smooth" });
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
                {step === 1 ? <IdentityStep onNext={() => setStep(2)} /> : null}
                {step === 2 ? (
                  <EventDetailsStep
                    selectedBudget={selectedBudget}
                    onBudgetChange={setSelectedBudget}
                    onBack={() => setStep(1)}
                    onNext={() => setStep(3)}
                  />
                ) : null}
                {step === 3 ? <CreativeBriefStep onBack={() => setStep(2)} /> : null}
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

function IdentityStep({ onNext }: { onNext: () => void }) {
  return (
    <section className="space-y-12">
      <StepTitle>Personal Identity</StepTitle>
      <div className="grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-2">
        <FormField id="name" name="name" label="Full Name" placeholder="Johnathan Doe" required />
        <FormField
          id="mobile"
          name="mobile"
          label="WhatsApp / Mobile"
          placeholder="+1 000 000 000"
          type="tel"
          required
        />
        <div className="md:col-span-2">
          <FormField
            id="email"
            name="email"
            label="Email Address"
            placeholder="hello@studio.com"
            type="email"
            required
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
  selectedBudget,
  onBudgetChange,
  onBack,
  onNext,
}: {
  selectedBudget: string;
  onBudgetChange: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <section className="space-y-12">
      <StepTitle>Event Specifications</StepTitle>
      <div className="grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-2">
        <FormField as="select" id="eventType" name="eventType" label="Event Type">
          {eventTypeOptions.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </FormField>
        <FormField
          id="dateRange"
          name="dateRange"
          label="Date Range Preference"
          placeholder="MM/DD/YYYY - MM/DD/YYYY"
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

function CreativeBriefStep({ onBack }: { onBack: () => void }) {
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
        <Button type="submit">Submit Request</Button>
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
