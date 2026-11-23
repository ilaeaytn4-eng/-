import {NextRequest,NextResponse} from "next/server";
import {limit,sameOrigin} from "@/lib/security";
import {openAI} from "@/lib/openai";
export async function POST(req:NextRequest){
 if(!sameOrigin(req))return NextResponse.json({error:"허용되지 않은 요청입니다."},{status:403});
 const limited=await limit(req,"image");if(limited)return limited;
 try{
  const body=await req.json();const topic=String(body.topic||"").trim();const position=Number(body.position??1);const context=String(body.context||"").slice(0,500);
  if(!topic||topic.length>160||!Number.isInteger(position)||position<1||position>5)return NextResponse.json({error:"이미지 주제를 160자 이내로 입력하세요."},{status:400});
  const prompt=`Create one professional 3:2 landscape editorial illustration for a Korean smartphone retail informational blog about: ${topic}. Image number ${position}, distinct visual composition and subject from other images in the same article. Article context: ${context}. Clean contemporary composition, photorealistic lifestyle or abstract illustration. No letters, logos, trademarks, numbers, pricing, identifiable real stores, or inaccurate specific phone models. Do not include text.`;
  const data=await openAI("images/generations",{model:process.env.OPENAI_IMAGE_MODEL||"gpt-image-1",prompt,size:"1536x1024",n:1});
  const b64=data?.data?.[0]?.b64_json;
  if(!b64)throw new Error("이미지 데이터가 반환되지 않았습니다.");
  return NextResponse.json({image:`data:image/png;base64,${b64}`});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"이미지 생성 실패"},{status:500});}
}
