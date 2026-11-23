import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@supabase/supabase-js";
import {sameOrigin} from "@/lib/security";
import {stores} from "@/lib/stores";
function db(){const u=process.env.SUPABASE_URL,k=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!u||!k)return null;return createClient(u,k,{auth:{persistSession:false}});}
export async function GET(req:NextRequest){
 const database=db();if(!database)return NextResponse.json({drafts:[],configured:false});
 const store=req.nextUrl.searchParams.get("store");if(store&&!stores[store as keyof typeof stores])return NextResponse.json({error:"매장 오류"},{status:400});
 let query=database.from("drafts").select("id,store,topic,kind,status,content,created_at").order("created_at",{ascending:false}).limit(30);
 if(store)query=query.eq("store",store);
 const {data,error}=await query;if(error)return NextResponse.json({error:error.message},{status:500});return NextResponse.json({drafts:data,configured:true});
}
export async function POST(req:NextRequest){
 if(!sameOrigin(req))return NextResponse.json({error:"허용되지 않은 요청입니다."},{status:403});
 const database=db();if(!database)return NextResponse.json({error:"초안 저장을 위해 Supabase 설정이 필요합니다."},{status:503});
 try{const b=await req.json();if(!stores[b.store as keyof typeof stores]||!String(b.content||"").trim()||String(b.content).length>25000||String(b.topic||"").length>160)return NextResponse.json({error:"초안 입력 오류"},{status:400});
 const {data,error}=await database.from("drafts").insert({store:b.store,topic:String(b.topic||""),kind:String(b.kind||"정보형"),content:b.content,status:"검수 대기"}).select("id").single();
 if(error)throw error;return NextResponse.json({id:data.id});}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"저장 실패"},{status:500});}
}
