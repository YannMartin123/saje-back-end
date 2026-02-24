require('dotenv').config();
const nodemailer = require("nodemailer");
const { MailtrapTransport } = require("mailtrap");

const transport = nodemailer.createTransport(
    MailtrapTransport({
        token: process.env.MAILTRAP_TOKEN,
        sandbox: true,
        testInboxId: parseInt(process.env.MAILTRAP_INBOX_ID, 10),
    })
);

const sender = {
  address: "hello@example.com",
  name: "Mailtrap Test",
};
const recipients = [
  "yannngolamze@gmail.com",
];

console.log("Starting Mailtrap test...");
console.log("Token:", process.env.MAILTRAP_TOKEN ? "Present" : "Missing");
console.log("Inbox ID:", process.env.MAILTRAP_INBOX_ID);

transport
  .sendMail({
    from: sender,
    to: recipients,
    subject: "Test Mailtrap SAJE",
    text: "Ceci est un test de Mailtrap pour SAJE.",
  })
  .then((info) => {
      console.log("Success:", info);
      process.exit(0);
  })
  .catch((err) => {
      console.error("Error:", err);
      process.exit(1);
  });
