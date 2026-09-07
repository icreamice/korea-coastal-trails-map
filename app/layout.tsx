import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'코리아둘레길 지도 | 해파랑길·남파랑길·서해랑길',description:'해파랑길·남파랑길·서해랑길 코스와 주요지점, 편의시설, 고도를 확인하고 다녀온 길을 계정에 저장하세요.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ko"><body>{children}</body></html>}
