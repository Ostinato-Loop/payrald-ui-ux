const BASE_URL = process.env.SQUAD_ENV === "production"
  ? "https://api.squadco.com"
  : "https://api-d.squadco.com";

const SECRET_KEY = process.env.SQUADCO_SECRET_KEY ?? process.env.SQUADCO_SECRET_KEYS ?? "";

async function squadRequest<T>(
  method: string,
  path: string,
  body?: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${SECRET_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = (await res.json()) as { status?: number; success?: boolean; message?: string; data?: T };

  if (!res.ok || data.success === false) {
    throw new SquadError(
      data.message ?? `Squad API error ${res.status}`,
      res.status,
      data,
    );
  }

  return (data.data ?? data) as T;
}

export class SquadError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly raw: unknown,
  ) {
    super(message);
    this.name = "SquadError";
  }
}

export type TransferResult = {
  transaction_reference: string;
  amount: number;
  bank_code: string;
  account_number: string;
  account_name: string;
  status: string;
};

export async function initiateTransfer(params: {
  accountNumber: string;
  accountName: string;
  bankCode: string;
  amountNgn: number;
  remark: string;
  transactionRef: string;
}): Promise<TransferResult> {
  return squadRequest<TransferResult>("POST", "/payout/initiate", {
    remark: params.remark,
    bank_code: params.bankCode,
    account_number: params.accountNumber,
    account_name: params.accountName,
    amount: Math.round(params.amountNgn * 100),
    currency_id: "NGN",
    transaction_ref: params.transactionRef,
  });
}

export type AccountNameResult = {
  account_name: string;
  account_number: string;
  bank_code: string;
};

export async function verifyAccountName(params: {
  accountNumber: string;
  bankCode: string;
}): Promise<AccountNameResult> {
  return squadRequest<AccountNameResult>("POST", "/payout/account/lookup", {
    bank_code: params.bankCode,
    account_number: params.accountNumber,
  });
}
