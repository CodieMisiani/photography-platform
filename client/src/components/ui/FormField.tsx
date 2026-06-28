import type { ComponentPropsWithoutRef, ReactNode } from "react";

type SharedProps = {
  label: string;
  id: string;
  helper?: ReactNode;
};

type InputProps = SharedProps &
  ComponentPropsWithoutRef<"input"> & {
    as?: "input";
  };

type TextareaProps = SharedProps &
  ComponentPropsWithoutRef<"textarea"> & {
    as: "textarea";
  };

type SelectProps = SharedProps &
  ComponentPropsWithoutRef<"select"> & {
    as: "select";
  };

type FormFieldProps = InputProps | TextareaProps | SelectProps;

const fieldClasses =
  "w-full border-0 border-b border-grey bg-transparent px-0 py-3 text-[1rem] text-ink placeholder:text-grey focus:border-ink focus:outline-none";

export default function FormField(props: FormFieldProps) {
  const { label, id, helper } = props;

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-grey"
      >
        {label}
      </label>
      {props.as === "textarea" ? (
        <TextareaField {...props} />
      ) : props.as === "select" ? (
        <SelectField {...props} />
      ) : (
        <InputField {...props} />
      )}
      {helper ? <p className="text-[0.75rem] leading-5 text-grey">{helper}</p> : null}
    </div>
  );
}

function InputField({ label, helper, as, className, ...inputProps }: InputProps) {
  void label;
  void helper;
  void as;

  return (
    <input
      {...inputProps}
      className={`${fieldClasses} ${className ?? ""}`.trim()}
    />
  );
}

function TextareaField({
  label,
  helper,
  as,
  className,
  ...textareaProps
}: TextareaProps) {
  void label;
  void helper;
  void as;

  return (
    <textarea
      {...textareaProps}
      className={`${fieldClasses} ${className ?? ""}`.trim()}
    />
  );
}

function SelectField({ label, helper, as, className, ...selectProps }: SelectProps) {
  void label;
  void helper;
  void as;

  return (
    <select
      {...selectProps}
      className={`${fieldClasses} ${className ?? ""}`.trim()}
    />
  );
}
