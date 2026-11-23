import {NextRequest,NextResponse} from "next/server";
import {stores,kinds} from "@/lib/stores";
import {limit,sameOrigin} from "@/lib/security";
import {openAI} from "@/lib/openai";
export async function POST(req:NextRequest){
 if(!sameOrigin(req))return NextResponse.json({error:"허용되지 않은 요청입니다."},{status:403});
 const limited=await limit(req,"text");if(limited)return limited;
 try{
  const b=await req.json();const store=b.store as keyof typeof stores;
  const kind=String(b.kind||"");const topic=String(b.topic||"").trim();const mode=String(b.mode||"suggest");
  if(!stores[store]||!kinds.includes(kind as typeof kinds[number])||topic.length>160||!["suggest","refine"].includes(mode))return NextResponse.json({error:"입력값을 확인하세요."},{status:400});
  if(mode==="refine"&&!topic)return NextResponse.json({error:"수정할 주제를 입력하세요."},{status:400});
  const instruction=`당신은 한국 휴대폰 매장 네이버 블로그 주제 기획자다. 매장 지역과 콘텐츠 유형에 맞게 고객에게 실용적인 주제를 기획한다. 확인되지 않은 할인·가격·재고·공식 발표·리뷰 순위를 사실처럼 쓰지 않는다. 실시간 검색 결과를 보유한 것처럼 주장하지 않는다. 서로 중복되지 않는 6개 주제를 반환한다. 반드시 JSON 객체 {"topics":["주제1",...]} 형태로만 답한다. 각 주제는 55자 이내.`;
  const input=`매장: ${stores[store].name} / ${stores[store].address}\n유형: ${kind}\n요청: ${mode==="refine"?`직원이 작성한 '${topic}'를 더 구체적이고 유용하게 다듬은 6개 변형을 제안`:`새로운 블로그 주제 6개 제안. ${topic?`관심 키워드: ${topic}`:"휴대폰 사용법, 통신 서비스, 고객이 자주 묻는 질문을 균형 있게"}`}`;
  const result=await openAI("responses",{model:process.env.OPENAI_TEXT_MODEL||"gpt-4.1-mini",instructions:instruction,input,max_output_tokens:650});
  const raw=(result.output||[]).flatMap((x:any)=>x.content||[]).filter((x:any)=>x.type==="output_text").map((x:any)=>x.text).join("\n");
  const parsed=JSON.parse(raw.replace(/^```(?:json)?\s*|\s*```$/g,""));
  const topics=Array.isArray(parsed.topics)?parsed.topics.filter((x:unknown)=>typeof x==="string"&&x.trim().length>0).slice(0,6).map((x:string)=>x.slice(0,160)):[];
  if(!topics.length)throw new Error("주제 추천 결과가 없습니다.");
  return NextResponse.json({topics});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"주제 추천 실패"},{status:500});}
}
