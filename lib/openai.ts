export async function openAI(path: string, payload: object) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY가 설정되지 않았습니다.");
  const response = await fetch(`https://api.openai.com/v1/${path}`,{method:"POST",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify(payload),cache:"no-store"});
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || `AI API 오류 (${response.status})`);
  return data;
}
