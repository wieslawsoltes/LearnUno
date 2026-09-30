import {guides as coreGuides} from './guides-core.mjs';
import {applicationGuides} from './application-guides.mjs';
export const guides = [...coreGuides, ...applicationGuides];
export const guideMap = new Map(guides.map(guide => [guide.id, guide]));
