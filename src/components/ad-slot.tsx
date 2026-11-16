'use client';
import { useEffect, useState } from 'react';
/** Ads remain absent unless the owner supplies a publisher ID and the visitor has consented. */
export function AdSlot({slot}:{slot:string}){const [consent,setConsent]=useState(false);useEffect(()=>{setConsent(localStorage.getItem('vaiblae-ad-consent')==='granted');},[]);const publisher=process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;if(!publisher||!consent)return null;return <div className="ad-slot" aria-label="Advertisement"><ins className="adsbygoogle" style={{display:'block'}} data-ad-client={publisher} data-ad-slot={slot} data-ad-format="auto" data-full-width-responsive="true"/></div>;}
