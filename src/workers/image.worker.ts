import { cleanImage } from '../lib/clean-image';
self.onmessage = (event: MessageEvent<{ buffer:ArrayBuffer; mime:string }>) => {
  try { const result=cleanImage(event.data.buffer,event.data.mime); self.postMessage({ok:true,result},[result.bytes]); }
  catch(error) { self.postMessage({ok:false,error:error instanceof Error?error.message:'Image processing failed.'}); }
};
