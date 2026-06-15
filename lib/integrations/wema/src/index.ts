const BASE_URL = process.env.WEMA_BANK_BASE_URL ?? "https://apigateway.wemabank.com";
const API_KEY = process.env.WEMA_BANK_API_KEY ?? "";
const SECRET_KEY = process.env.WEMA_BANK_SECRET_KEY ?? "";

async function wemaRequest<T>(
  method: string,
  path: string,
  body?: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "x-api-key": API_KEY,
      "x-api-secret": SECRET_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = (await res.json()) as {
    responseCode?: string;
    responseMessage?: string;
    status?: string;
    data?: T;
    [key: string]: unknown;
  };

  if (!res.ok || (data.responseCode && data.responseCode !== "00" && data.responseCode !== "000")) {
    throw new WemaError(
      data.responseMessage ?? `Wema API error ${res.status}`,
      res.status,
      data,
    );
  }

  return (data.data ?? data) as T;
}

export class WemaError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly raw: unknown,
  ) {
    super(message);
    this.name = "WemaError";
  }
}

export type WemaVirtualAccountResult = {
  accountNumber: string;
  accountName: string;
  bankCode: string;
  bankName: string;
  reference: string;
};

export async function createVirtualAccount(params: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bvn?: string;
  userId: string;
}): Promise<WemaVirtualAccountResult> {
  const result = await wemaRequest<{
    accountNumber: string;
    accountName?: string;
    reference?: string;
    [key: string]: unknown;
  }>("POST", "/vas/virtual-accounts", {
    firstName: params.firstName,
    lastName: params.lastName,
    email: params.email,
    phoneNumber: params.phone.replace(/\D/g, ""),
    bvn: params.bvn ?? "",
    narration: `PayRald wallet — ${params.userId}`,
    trackingReference: `payrald_${params.userId}`,
  });

  return {
    accountNumber: result.accountNumber,
    accountName: result.accountName ?? `${params.firstName} ${params.lastName}`,
    bankCode: "035",
    bankName: "Wema Bank",
    reference: result.reference ?? `payrald_${params.userId}`,
  };
}

export type WemaAccountNameResult = {
  accountName: string;
  accountNumber: string;
  bankCode: string;
};

export async function lookupAccountName(params: {
  accountNumber: string;
  bankCode: string;
}): Promise<WemaAccountNameResult> {
  const result = await wemaRequest<{ accountName: string }>(
    "POST",
    "/nip/nameenquiry",
    {
      accountNumber: params.accountNumber,
      bankCode: params.bankCode,
    },
  );

  return {
    accountName: result.accountName,
    accountNumber: params.accountNumber,
    bankCode: params.bankCode,
  };
}

export type WemaTransferResult = {
  sessionId: string;
  reference: string;
  status: string;
};

export async function initiateTransfer(params: {
  destinationAccount: string;
  destinationBank: string;
  destinationName: string;
  amount: number;
  narration: string;
  reference: string;
}): Promise<WemaTransferResult> {
  return wemaRequest<WemaTransferResult>("POST", "/nip/transfer", {
    destinationAccount: params.destinationAccount,
    destinationBank: params.destinationBank,
    destinationAccountName: params.destinationName,
    amount: params.amount * 100,
    narration: params.narration,
    transactionReference: params.reference,
  });
}
