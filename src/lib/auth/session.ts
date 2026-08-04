/**
 * Sessão assinada (HMAC-SHA256 via Web Crypto) para autenticação da aplicação.
 *
 * Formato do token: base64url(payload JSON) + "." + base64url(assinatura)
 * Usa apenas Web Crypto (crypto.subtle) para ser compatível tanto com o
 * runtime Node das rotas de API quanto com o runtime Edge do middleware.
 */

export type SessionRole = "gerente" | "tecnico"

export type SessionPayload = {
  usuario: string
  role: SessionRole
  exp: number // epoch ms
}

export const SESSION_COOKIE = "session"
export const SESSION_MAX_AGE_SEGUNDOS = 60 * 60 * 8 // 8 horas

const encoder = new TextEncoder()
const decoder = new TextDecoder()

function bytesToBase64Url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  let binario = ""
  for (const byte of arr) binario += String.fromCharCode(byte)
  return btoa(binario).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function base64UrlToBytes(input: string): BufferSource {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4))
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/") + pad
  const binario = atob(base64)
  const bytes = new Uint8Array(binario.length)
  for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i)
  return bytes.buffer as ArrayBuffer
}

async function obterChave(): Promise<CryptoKey> {
  const secret = process.env.SESSION_SECRET
  if (!secret) {
    throw new Error("SESSION_SECRET não configurado nas variáveis de ambiente")
  }
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  )
}

export async function criarSessionToken(payload: SessionPayload): Promise<string> {
  const chave = await obterChave()
  const corpo = bytesToBase64Url(encoder.encode(JSON.stringify(payload)))
  const assinatura = await crypto.subtle.sign("HMAC", chave, encoder.encode(corpo))
  return `${corpo}.${bytesToBase64Url(assinatura)}`
}

export async function verificarSessionToken(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null

  const [corpo, assinatura] = token.split(".")
  if (!corpo || !assinatura) return null

  try {
    const chave = await obterChave()
    const valido = await crypto.subtle.verify(
      "HMAC",
      chave,
      base64UrlToBytes(assinatura),
      encoder.encode(corpo)
    )
    if (!valido) return null

    const payload = JSON.parse(decoder.decode(base64UrlToBytes(corpo))) as SessionPayload
    if (typeof payload.exp !== "number" || Date.now() >= payload.exp) return null
    if (payload.role !== "gerente" && payload.role !== "tecnico") return null
    if (typeof payload.usuario !== "string" || !payload.usuario) return null

    return payload
  } catch {
    return null
  }
}
