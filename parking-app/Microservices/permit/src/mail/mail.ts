import FormData from "form-data";
import Mailgun from "mailgun.js";
import path from 'path';
import dotenv from 'dotenv';
import { htmlContent } from "./content";
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

export async function sendPermitReceipt(plate: string, startTime: string, endTime: string, price: string, zone: string, email: string) {
  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY || "API_KEY",
  });

  const content = htmlContent(plate, startTime, endTime, price, zone);

  try {
    const data = await mg.messages.create("sammyparks.com", {
      from: "Sammy Parks <postmaster@sammyparks.com>",
      to: [`Dear Driver <${email}>`],
      subject: "Permit receipt",
      text: "Here is your permit receipt from sammyparks",
      html: content
    });

    console.log(data);
  } catch (error) {
    console.log(error);
  }
}