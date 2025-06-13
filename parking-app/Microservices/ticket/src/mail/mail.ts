import FormData from "form-data";
import Mailgun from "mailgun.js";
import path from 'path';
import dotenv from 'dotenv';
import { htmlContent } from "./content";
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

export async function sendTicketEmail(time: string, fine: string, reason: string, email: string) {
  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY || "API_KEY",
  });

  const content = htmlContent(time, fine, reason);

  try {
    const data = await mg.messages.create("sammyparks.com", {
      from: "Sammy Parks <postmaster@sammyparks.com>",
      to: [`Dear Driver <${email}>`],
      subject: "Parking Violation Ticket",
      text: "You have received a ticket from Sammy Parks enforcement.",
      html: content
    });

    console.log(data);
  } catch (error) {
    console.log(error);
  }
}