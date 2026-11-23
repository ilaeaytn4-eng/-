# MULTISHOP BLOG STUDIO — ChatGPT Plus 연결형

기존 v0.2 화면 구성을 바탕으로 외부 유료 AI API 호출을 제거한 버전입니다.

## 작동 방식
1. 매장, 글 유형, 주제, 이미지 수 선택
2. 주제 추천/수정, 원고, 이미지 요청문 생성
3. 요청문 복사 후 ChatGPT(https://chatgpt.com/)에 붙여넣기
4. 결과를 웹사이트 원고 편집기에 붙여넣기
5. 브라우저 localStorage에 초안 저장

## 중요한 제한
- ChatGPT Plus 구독은 외부 사이트의 API 사용권이 아닙니다. ChatGPT 창에서 사용자가 직접 생성합니다.
- ChatGPT 결과 자동 회수, 실시간 뉴스 자동 수집, 직원 간 초안 공유, 자동 이미지 다운로드는 제공하지 않습니다.
- ChatGPT 기능별 이용 한도는 적용됩니다.
- OpenAI API, Upstash Redis, Supabase, API 엔드포인트는 이 버전에서 사용하지 않습니다.
- Vercel Hobby의 상업적 사용 제한을 확인해야 합니다. 실제 매장 업무용 운영에는 약관에 맞는 호스팅을 선택하세요.

## 배포
GitHub 저장소에 압축파일 내부 파일을 업로드/덮어쓰기 후 배포합니다.
기존 app/api 폴더는 저장소에서 삭제해야 API 엔드포인트가 남지 않습니다.
기존 OPENAI_API_KEY, UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN 환경변수는 이 버전에서 필요하지 않으며, 기존 키/토큰은 별도로 폐기/교체를 권장합니다.

로컬 실행: npm install && npm run dev


## v0.4 주제 선택 흐름
1. 주제 6개 추천 요청문을 복사해 ChatGPT에 전송합니다.
2. ChatGPT에서 `1. 주제 제목` 형식의 제목 6줄을 복사합니다.
3. 사이트의 ‘ChatGPT 추천 주제 6개 가져오기’에 붙여넣고 ‘주제 6개 가져오기’를 누릅니다.
4. 6개 중 하나를 선택하면 해당 제목이 원고 작성 요청문에 반영됩니다.
5. 원고 요청문을 ChatGPT에 보내 글 1개를 작성합니다.

추천 주제 목록은 해당 브라우저에 저장되며, 외부 API를 호출하지 않습니다.
