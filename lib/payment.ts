import QRCode from "qrcode";

/**
 * QRIS payment abstraction.
 *
 * Real gateway (pay.xoftware.id): set PAYMENT_API_KEY (and optionally
 * PAYMENT_MERCHANT_ID) in .env. `createQrisPayment` will POST to the gateway
 * and use the QRIS string it returns.
 *
 * Simulation mode (default, when PAYMENT_API_KEY is empty): a valid EMVCo QRIS
 * payload is generated locally so the whole flow is testable end-to-end. In this
 * mode a payment can be confirmed via the "simulate payment" action, and a real
 * gateway callback would hit /api/payment/callback in production.
 */

export type QrisResult = {
  qrisString: string;
  qrisImage: string; // data URL (PNG)
  externalId: string | null;
  expiresAt: Date;
  simulated: boolean;
};

const EXPIRY_MINUTES = 30;

function tlv(id: string, value: string): string {
  const len = value.length.toString().padStart(2, "0");
  return `${id}${len}${value}`;
}

/** CRC16-CCITT (0xFFFF) as required by the EMVCo QRIS spec. */
function crc16(input: string): string {
  let crc = 0xffff;
  for (let i = 0; i < input.length; i++) {
    crc ^= input.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function buildQrisPayload(amount: number, reference: string): string {
  const merchantId = process.env.PAYMENT_MERCHANT_ID || "9360000000000000000";
  const merchantAccount = tlv("00", "ID.CO.QRIS.WWW") + tlv("01", merchantId) + tlv("02", "UMI");
  let payload =
    tlv("00", "01") + // payload format indicator
    tlv("01", "12") + // dynamic QR
    tlv("26", merchantAccount) +
    tlv("52", "0000") + // merchant category code
    tlv("53", "360") + // IDR
    tlv("54", String(Math.round(amount))) +
    tlv("58", "ID") +
    tlv("59", "PAYU BOUNTY") +
    tlv("60", "JAKARTA") +
    tlv("62", tlv("01", reference.slice(0, 25)));
  payload += "6304"; // CRC placeholder id + length
  const crc = crc16(payload);
  return payload + crc;
}

async function toImage(qrisString: string): Promise<string> {
  return QRCode.toDataURL(qrisString, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 320,
    color: { dark: "#0f1b3d", light: "#ffffff" },
  });
}

export async function createQrisPayment(params: {
  amount: number;
  reference: string;
  description: string;
}): Promise<QrisResult> {
  const expiresAt = new Date(Date.now() + EXPIRY_MINUTES * 60 * 1000);
  const apiKey = process.env.PAYMENT_API_KEY;

  if (apiKey) {
    try {
      const base = process.env.PAYMENT_API_BASE || "https://pay.xoftware.id";
      const res = await fetch(`${base}/api/v1/qris/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          amount: Math.round(params.amount),
          reference: params.reference,
          description: params.description,
          expiry_minutes: EXPIRY_MINUTES,
          callback_url: `${process.env.APP_URL || ""}/api/payment/callback`,
        }),
        cache: "no-store",
      });
      if (res.ok) {
        const data: any = await res.json();
        const qrisString: string =
          data.qris_string || data.qrString || data.qris || data.data?.qris_string || "";
        const externalId: string =
          data.id || data.transaction_id || data.trx_id || data.data?.id || params.reference;
        const image = data.qris_image || data.qr_image || "";
        return {
          qrisString: qrisString || buildQrisPayload(params.amount, params.reference),
          qrisImage: image || (await toImage(qrisString || buildQrisPayload(params.amount, params.reference))),
          externalId,
          expiresAt,
          simulated: false,
        };
      }
      // fall through to simulation on non-OK response
    } catch {
      // network error — fall back to simulation so the flow never dead-ends
    }
  }

  const qrisString = buildQrisPayload(params.amount, params.reference);
  return {
    qrisString,
    qrisImage: await toImage(qrisString),
    externalId: null,
    expiresAt,
    simulated: true,
  };
}

export function isSimulationMode(): boolean {
  return !process.env.PAYMENT_API_KEY;
}
