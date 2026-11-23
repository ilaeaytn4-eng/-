
import { NextRequest, NextResponse } from "next/server";

export function clientIp(req: NextRequest) {
  return (req.headers.get("x-forwarded-for") || "unknown")
    .split(",")[0]
    .trim();
}

export async function limit(
  req: NextRequest,
  operation: "text" | "image"
) {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim().replace(/\/+$/, "");
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

  if (!url || !token) {
    console.error("[RATE_LIMIT] Missing Redis configuration");

    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "운영 환경 사용량 제한 설정이 필요합니다." },
        { status: 503 }
      );
    }

    return null;
  }

  const key = `multishop:${operation}:${clientIp(req)}:${new Date()
    .toISOString()
    .slice(0, 13)}`;

  const max = operation === "text" ? 8 : 5;

  try {
    const response = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", key],
        ["EXPIRE", key, 7200],
      ]),
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.error(
        "[RATE_LIMIT] Redis HTTP error:",
        response.status
      );
      throw new Error(`Redis HTTP ${response.status}`);
    }

    const result = await response.json();

    if (
      !Array.isArray(result) ||
      result[0]?.error ||
      result[1]?.error ||
      !Number.isFinite(Number(result[0]?.result))
    ) {
      console.error("[RATE_LIMIT] Invalid Redis pipeline response");
      throw new Error("Redis pipeline failed");
    }

    if (Number(result[0].result) > max) {
      return NextResponse.json(
        { error: "시간당 생성 한도를 초과했습니다. 잠시 후 다시 시도하세요." },
        { status: 429 }
      );
    }

    return null;
  } catch (error) {
    console.error(
      "[RATE_LIMIT] Connection failed:",
      error instanceof Error ? error.message : "Unknown error"
    );

    return NextResponse.json(
      { error: "사용량 제한 서버 연결에 실패했습니다." },
      { status: 503 }
    );
  }
}

export function sameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");

  if (!origin) return false;

  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}
