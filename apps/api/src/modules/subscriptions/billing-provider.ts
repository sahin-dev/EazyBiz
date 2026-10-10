import { Injectable } from "@nestjs/common";

export interface BillingCheckoutInput {
  tenantId: string;
  subscriptionId: string;
  invoiceId: string;
  amount: number;
  currency: string;
  interval: "monthly" | "yearly";
}

export interface BillingCheckoutResult {
  provider: string;
  paymentIntentId: string | null;
  checkoutUrl: string | null;
  status: "pending" | "requires_review" | "ready";
}

export interface BillingProvider {
  readonly name: string;
  createCheckout(input: BillingCheckoutInput): Promise<BillingCheckoutResult>;
}

@Injectable()
export class ManualBillingProvider implements BillingProvider {
  readonly name = "manual";

  async createCheckout(input: BillingCheckoutInput): Promise<BillingCheckoutResult> {
    return {
      provider: this.name,
      paymentIntentId: `manual_${input.invoiceId}`,
      checkoutUrl: null,
      status: "requires_review",
    };
  }
}

