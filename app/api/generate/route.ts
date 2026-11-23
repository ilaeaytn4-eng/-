import {NextRequest,NextResponse} from "next/server";
import {stores,kinds} from "@/lib/stores";
import {limit,sameOrigin} from "@/lib/security";
import {openAI} from "@/lib/openai";
export async function POST(req:NextRequest){
  if(!sameOrigin(req))return NextResponse.json({error:"허용되지 않은 요청입니다."},{status:403});
  const limited=await limit(req,"text");if(limited)return limited;
  try{
    const body=await req.json();
    const store=body.store as keyof typeof stores;
    const kind=String(body.kind||"");const topic=String(body.topic||"").trim();
    const imageCount=Number(body.imageCount??3);
    if(!stores[store]||!kinds.includes(kind as typeof kinds[number])||topic.length>160||!Number.isInteger(imageCount)||imageCount<0||imageCount>5)return NextResponse.json({error:"입력값을 확인하세요."},{status:400});
    const s=stores[store];
    const instruction=`당신은 한국 네이버 블로그용 휴대폰 매장 콘텐츠 편집자다. 다음 규칙을 엄격히 준수한다.\n- 정보가 확인되지 않은 가격, 혜택, 재고, 할인, 지원금, 최신 스펙, 공식 정책, 리뷰 순위를 사실로 단정하지 않는다.\n- 실시간 웹 검색 기능이 제공되지 않는다. 최신 정보가 필요한 문장은 [확인 필요]로 표시하고 공식 출처를 확인하라고 안내한다. 출처 URL을 지어내지 않는다.\n- 고객에게 유용한 답을 첫 문단에 제시하고 반복적인 FAQ와 과장 광고를 피한다.\n- 마크다운 원고를 작성한다. 이미지가 0장이면 이미지 삽입 표시는 하지 않는다. 그 외에는 정확히 ${imageCount}개의 [이미지 N 삽입] 위치를 글 흐름에 자연스럽게 배치한다.\n- 이미지는 예시 이미지이며 실제 제품·매장 사진으로 오해할 설명을 피한다.\n- 고객 개인정보·비밀번호를 요구하지 않는다.\n- 매장 전화번호가 미설정 상태면 번호를 쓰지 않는다.\n- 본문 뒤에 '발행 전 확인사항'을 별도 작성한다.`;
    const input=`매장: ${s.name}\n주소: ${s.address}\n부가정보: ${s.note}\n콘텐츠 유형: ${kind}\n주제: ${topic||"휴대폰 구매 전 확인할 점 중 하나를 골라 작성"}\n이미지 개수: ${imageCount}장. 분량: 1200~1800자 정도. 제목 3개 제안 후 완성 원고를 작성.`;
    const result=await openAI("responses",{model:process.env.OPENAI_TEXT_MODEL||"gpt-4.1-mini",instructions:instruction,input,max_output_tokens:2400});
    const content=(result.output||[]).flatMap((x:any)=>x.content||[]).filter((x:any)=>x.type==="output_text").map((x:any)=>x.text).join("\n");
    if(!content)throw new Error("원고 결과가 비어 있습니다.");
    return NextResponse.json({content});
  }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"생성 실패"},{status:500});}
}
