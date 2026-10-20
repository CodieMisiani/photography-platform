import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { deliverNewsletterNotification } from "./newsletterDelivery.js";

const message = {
  from: "Malume Photography <notifications@example.test>",
  subject: "Newsletter subscribed",
  text: "A newsletter subscriber was captured.",
};

describe("newsletter notification delivery", () => {
  it("sends to the explicitly configured recipient", async () => {
    let delivered: (typeof message & { to: string }) | undefined;
    const sent = await deliverNewsletterNotification({
      smtpConfigured: true,
      recipient: "studio@example.test",
      message,
      sendMail: async (email) => {
        delivered = email;
      },
    });

    assert.equal(sent, true);
    assert.equal(delivered?.to, "studio@example.test");
    assert.equal(delivered?.subject, message.subject);
  });

  it("skips delivery when no recipient is configured", async () => {
    let sendCount = 0;
    let warningCount = 0;
    const sent = await deliverNewsletterNotification({
      smtpConfigured: true,
      message,
      sendMail: async () => {
        sendCount += 1;
      },
      onSkipped: () => {
        warningCount += 1;
      },
    });

    assert.equal(sent, false);
    assert.equal(sendCount, 0);
    assert.equal(warningCount, 1);
  });

  it("skips delivery when SMTP is not configured", async () => {
    let sendCount = 0;
    const sent = await deliverNewsletterNotification({
      smtpConfigured: false,
      recipient: "studio@example.test",
      message,
      sendMail: async () => {
        sendCount += 1;
      },
    });

    assert.equal(sent, false);
    assert.equal(sendCount, 0);
  });
});
