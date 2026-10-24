export type NewsletterEmailMessage = {
  from: string;
  subject: string;
  text: string;
};

export async function deliverNewsletterNotification({
  smtpConfigured,
  recipient,
  message,
  sendMail,
  onSkipped,
}: {
  smtpConfigured: boolean;
  recipient?: string;
  message: NewsletterEmailMessage;
  sendMail: (
    message: NewsletterEmailMessage & { to: string },
  ) => Promise<unknown>;
  onSkipped?: () => void;
}): Promise<boolean> {
  if (!smtpConfigured || !recipient) {
    onSkipped?.();
    return false;
  }

  await sendMail({ ...message, to: recipient });
  return true;
}
