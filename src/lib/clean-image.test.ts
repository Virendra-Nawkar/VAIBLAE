import { describe,it,expect } from 'vitest';
import { cleanImage, detectFormat } from './clean-image';
describe('image signature and cleaning',()=>{
 it('rejects a misleading filename or MIME type based on file signature',()=>{expect(detectFormat(new Uint8Array([1,2,3]))).toBeNull();expect(()=>cleanImage(new Uint8Array([1,2,3]).buffer,'image/png')).toThrow(/signature/i);});
 it('cleans a valid minimal PNG with integrity verification',()=>{const b=Uint8Array.from([137,80,78,71,13,10,26,10,0,0,0,13,73,72,68,82,0,0,0,1,0,0,0,1,8,6,0,0,0,31,21,196,137,0,0,0,0,73,69,78,68,174,66,96,130]);const result=cleanImage(b.buffer,'image/png');expect(result.format).toBe('png');expect(result.after.exif).toBe(false);});
});
