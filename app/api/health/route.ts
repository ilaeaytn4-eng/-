import {NextResponse} from "next/server";
export async function GET(){return NextResponse.json({ok:true,aiConfigured:!!process.env.OPENAI_API_KEY,draftsConfigured:!!(process.env.SUPABASE_URL&&process.env.SUPABASE_SERVICE_ROLE_KEY),rateLimitConfigured:!!(process.env.UPSTASH_REDIS_REST_URL&&process.env.UPSTASH_REDIS_REST_TOKEN)});}
