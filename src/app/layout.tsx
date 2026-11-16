import type { Metadata } from 'next';
import './globals.css';
import { brand } from '@/config/brand';
export const metadata:Metadata={metadataBase:new URL(brand.url),title:{default:'Vaiblae — Private Image Metadata Remover',template:'%s | Vaiblae'},description:brand.description,alternates:{canonical:'/'},openGraph:{title:'Vaiblae — Private Image Metadata Remover',description:brand.description,url:brand.url,siteName:brand.name,type:'website'},twitter:{card:'summary_large_image',title:'Vaiblae — Private Image Metadata Remover',description:brand.description},robots:{index:true,follow:true}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
