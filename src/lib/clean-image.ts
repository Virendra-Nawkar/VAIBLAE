export type ImageFormat = 'jpeg' | 'png' | 'webp';
export type MetadataReport = { exif: boolean; xmp: boolean; iptc: boolean; gps: boolean; camera: boolean; software: boolean; other: boolean };
export type CleanResult = { bytes: ArrayBuffer; mime: string; format: ImageFormat; before: MetadataReport; after: MetadataReport; removed: string[] };
const empty = (): MetadataReport => ({ exif:false,xmp:false,iptc:false,gps:false,camera:false,software:false,other:false });
const ascii = (b: Uint8Array, start: number, len: number) => String.fromCharCode(...b.subarray(start, start + len));

export function detectFormat(b: Uint8Array): ImageFormat | null {
  if (b.length >= 3 && b[0]===0xff && b[1]===0xd8 && b[2]===0xff) return 'jpeg';
  if (b.length >= 8 && [137,80,78,71,13,10,26,10].every((v,i)=>b[i]===v)) return 'png';
  if (b.length >= 12 && ascii(b,0,4)==='RIFF' && ascii(b,8,4)==='WEBP') return 'webp';
  return null;
}
function inspectJpeg(b: Uint8Array): MetadataReport {
  const r=empty(); let p=2;
  while(p+4<=b.length && b[p]===0xff) { const marker=b[p+1]; if(marker===0xda||marker===0xd9) break; const n=(b[p+2]<<8)|b[p+3]; if(n<2||p+2+n>b.length) break;
    const s=ascii(b,p+4,n-2); if(marker===0xe1){ if(s.startsWith('Exif')){r.exif=true;r.other=true;} if(s.includes('http://ns.adobe.com/xap/')){r.xmp=true;r.other=true;} }
    if(marker===0xed){r.iptc=true;r.other=true;} p+=2+n;
  } return r;
}
function inspectPng(b: Uint8Array): MetadataReport { const r=empty(); let p=8; while(p+12<=b.length){const n=new DataView(b.buffer,b.byteOffset+p,4).getUint32(0); const t=ascii(b,p+4,4); if(p+12+n>b.length) break; if(['eXIf','iTXt','tEXt','zTXt'].includes(t)){const s=ascii(b,p+8,Math.min(n,512)); if(t==='eXIf'||s.includes('Exif'))r.exif=true; if(s.toLowerCase().includes('xmp'))r.xmp=true; if(s.toLowerCase().includes('iptc'))r.iptc=true; r.other=true;} p+=12+n; if(t==='IEND')break;} return r; }
function inspectWebp(b: Uint8Array): MetadataReport { const r=empty(); let p=12; while(p+8<=b.length){const t=ascii(b,p,4), n=new DataView(b.buffer,b.byteOffset+p+4,4).getUint32(0,true); if(p+8+n>b.length)break; if(t==='EXIF'){r.exif=true;r.other=true;} if(t==='XMP '){r.xmp=true;r.other=true;} p+=8+n+(n%2);} return r; }
function inspect(b: Uint8Array, f: ImageFormat) { return f==='jpeg'?inspectJpeg(b):f==='png'?inspectPng(b):inspectWebp(b); }
function cleanJpeg(b: Uint8Array): Uint8Array { const parts:Uint8Array[]=[b.subarray(0,2)]; let p=2; while(p+4<=b.length&&b[p]===0xff){const m=b[p+1]; if(m===0xda){parts.push(b.subarray(p));return concat(parts);} if(m===0xd9){parts.push(b.subarray(p));return concat(parts);} const n=(b[p+2]<<8)|b[p+3]; if(n<2||p+2+n>b.length) throw Error('Invalid JPEG segment.'); const seg=b.subarray(p,p+2+n); const metadata=m===0xe1||m===0xed; if(!metadata)parts.push(seg); p+=2+n;} throw Error('JPEG structure could not be verified.'); }
function crc32(bytes:Uint8Array){let c=0xffffffff; for(const v of bytes){c^=v;for(let k=0;k<8;k++)c=(c>>>1)^((c&1)?0xedb88320:0);}return(c^0xffffffff)>>>0;}
function cleanPng(b:Uint8Array):Uint8Array { const chunks:Uint8Array[]=[b.subarray(0,8)]; let p=8, ended=false; while(p+12<=b.length){const n=new DataView(b.buffer,b.byteOffset+p,4).getUint32(0), end=p+12+n; if(end>b.length)throw Error('Invalid PNG chunk length.'); const t=ascii(b,p+4,4); const chunk=b.subarray(p,end); if(['eXIf','iTXt','tEXt','zTXt'].includes(t)){} else {if(crc32(b.subarray(p+4,end-4))!==new DataView(b.buffer,b.byteOffset+end-4,4).getUint32(0)) throw Error('PNG checksum validation failed.'); chunks.push(chunk);} p=end; if(t==='IEND'){ended=true;break;} } if(!ended||p!==b.length)throw Error('PNG structure could not be verified.'); return concat(chunks); }
function cleanWebp(b:Uint8Array):Uint8Array {const chunks:Uint8Array[]=[]; let p=12; while(p+8<=b.length){const n=new DataView(b.buffer,b.byteOffset+p+4,4).getUint32(0,true), end=p+8+n+(n%2); if(end>b.length)throw Error('Invalid WebP chunk length.'); const t=ascii(b,p,4); if(t!=='EXIF'&&t!=='XMP ')chunks.push(b.subarray(p,end)); p=end;} if(p!==b.length)throw Error('WebP structure could not be verified.'); const body=concat(chunks), out=new Uint8Array(12+body.length); out.set(b.subarray(0,12)); out.set(body,12); new DataView(out.buffer).setUint32(4,out.length-8,true); return out; }
function concat(chunks:Uint8Array[]){const n=chunks.reduce((a,c)=>a+c.length,0),out=new Uint8Array(n);let p=0;for(const c of chunks){out.set(c,p);p+=c.length;}return out;}
export function cleanImage(buffer:ArrayBuffer, claimedMime:string):CleanResult {const b=new Uint8Array(buffer), format=detectFormat(b); if(!format)throw Error('Unsupported or invalid image signature.'); const expected={jpeg:'image/jpeg',png:'image/png',webp:'image/webp'}[format]; if(claimedMime&&claimedMime!=='application/octet-stream'&&claimedMime!==expected)throw Error('File type does not match its contents.'); const before=inspect(b,format), cleaned=format==='jpeg'?cleanJpeg(b):format==='png'?cleanPng(b):cleanWebp(b); const after=inspect(cleaned,format); for(const key of Object.keys(after) as (keyof MetadataReport)[])if(after[key])throw Error(`Metadata verification failed: ${key} remains.`); return {bytes:cleaned.buffer,mime:expected,format,before,after,removed:Object.keys(before).filter(k=>before[k as keyof MetadataReport])}; }
