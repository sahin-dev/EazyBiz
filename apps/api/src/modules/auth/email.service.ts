import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class EmailService {
  constructor(private readonly config: ConfigService) {}

  get ready() {
    return Boolean(this.config.get<string>("RESEND_API_KEY") && this.config.get<string>("EMAIL_FROM") && this.config.get<string>("WEB_ORIGIN"));
  }

  async sendLink(to: string, kind: "verify" | "reset", token: string) {
    if (!this.ready) throw new ServiceUnavailableException("Email delivery is not configured.");
    const origin = this.config.getOrThrow<string>("WEB_ORIGIN");
    const url = `${origin}/${kind === "verify" ? "verify-email" : "reset-password"}?token=${token}`;
    const subject = kind === "verify" ? "Verify your BusinessOS email" : "Reset your BusinessOS password";
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${this.config.getOrThrow<string>("RESEND_API_KEY")}`, "content-type": "application/json" },
      body: JSON.stringify({ from: this.config.getOrThrow<string>("EMAIL_FROM"), to: [to], subject, text: `${subject}\n\n${url}\n\nThis link expires in ${kind === "verify" ? "24 hours" : "30 minutes"}.` }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new ServiceUnavailableException("Email delivery failed. Please try again later.");
  }
}
