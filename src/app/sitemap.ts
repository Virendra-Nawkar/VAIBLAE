import type { MetadataRoute } from 'next';
import { brand } from '@/config/brand';
const routes=['','remove-ai-metadata','remove-exif-data','remove-image-metadata','check-image-metadata','supported-formats','how-it-works','privacy-policy','terms','about','contact'];
export default function sitemap():MetadataRoute.Sitemap{return routes.map(route=>({url:`${brand.url}/${route?`${route}/`:''}`,lastModified:new Date()}));}
