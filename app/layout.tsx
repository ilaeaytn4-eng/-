import type {Metadata} from "next";
import "./globals.css";
export const metadata:Metadata={title:"휴대폰멀티샵 | BLOG STUDIO",description:"매장 공용 AI 블로그 콘텐츠 제작 도구"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ko"><body>{children}</body></html>}
