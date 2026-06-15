const ALIA_BASE_URL = process.env.ALIA_RESOLUTION_URL ?? "http://localhost:3004";
const ALIA_API_KEY = process.env.ALIA_INTERNAL_API_KEY ?? "";

export type AliaResolutionResult = {
  token: string;
  routing: {
    destinationBankCode: string;
    destinationBankName: string;
    accountName: string;
  };
  resolvedAt: string;
};

export class AliaResolutionError extends Error {
  constructor(
    public readonly alias: string,
    public readonly code: string = "RESOLUTION_FAILED",
  ) {
    super(`Unable to resolve alias '${alias}'`);
    this.name = "AliaResolutionError";
  }
}

export async function resolveAlias(params: {
  alias: string;
  initiatingBank: string;
  transactionRef: string;
  ipAddress?: string;
}): Promise<AliaResolutionResult> {
  const res = await fetch(`${ALIA_BASE_URL}/v1/resolve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ALIA_API_KEY}`,
    },
    body: JSON.stringify({
      alias: params.alias,
      initiatingBank: params.initiatingBank,
      transactionRef: params.transactionRef,
      ipAddress: params.ipAddress,
    }),
  });

  if (res.status === 422 || res.status === 404) {
    throw new AliaResolutionError(params.alias);
  }

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`ALIA resolution error ${res.status}: ${err}`);
  }

  return res.json() as Promise<AliaResolutionResult>;
}

export type AliaIdentityResult = {
  alias: string;
  aliasType: "username" | "email" | "phone" | "merchant";
  displayName: string;
  avatarInitials: string;
  verified: boolean;
  merchantHandle: string | null;
};

export async function lookupIdentity(alias: string): Promise<AliaIdentityResult | null> {
  try {
    const res = await fetch(`${ALIA_BASE_URL}/v1/identities/lookup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ALIA_API_KEY}`,
      },
      body: JSON.stringify({ alias }),
    });

    if (res.status === 404) return null;
    if (!res.ok) return null;

    return res.json() as Promise<AliaIdentityResult>;
  } catch {
    return null;
  }
}
