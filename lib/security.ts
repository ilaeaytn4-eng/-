import { NextRequest, NextResponse } from "next/server";
export function clientIp(req: NextRequest) {
  // Trust the platform-provided first forwarded address. Deploy behind a trusted proxy.
  return (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
}
export async function limit(req: NextRequest, operation: "text" | "image") {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    // Never allow publicly deployed generation without durable throttling.
    if (process.env.NODE_ENV === "production") return NextResponse.json({error:"운영 환경 사용량 제한 설정이 필요합니다."},{status:503});
    return null;
  }
  const key = `multishop:${operation}:${clientIp(req)}:${new Date().toISOString().slice(0,13)}`;
  const max = operation === "text" ? 8 : 5;
  try {
    const response = await fetch(`${url}/pipeline`,{method:"POST",headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},body:JSON.stringify([["INCR",key],["EXPIRE",key,7200]]),cache:"no-store"});
    if (!response.ok) throw new Error("rate limiter unavailable");
    const result = await response.json();
    if (Number(result?.[0]?.result) > max) return NextResponse.json({error:"시간당 생성 한도를 초과했습니다. 잠시 후 다시 시도하세요."},{status:429});
    return null;
  } catch {return NextResponse.json({error:"사용량 제한 서버 연결에 실패했습니다."},{status:503});}
}
export function sameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {return new URL(origin).host === req.headers.get("host");} catch {return false;}
}
