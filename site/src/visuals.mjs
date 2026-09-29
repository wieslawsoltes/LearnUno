import {mountLab,mountLessonVisual} from './atlas/lab.mjs';
/** Backwards-compatible entry point for existing lesson sections. */
export function mountVisual(root,kind='pipeline',motion=true,lesson=null){
 if(lesson)return mountLessonVisual(root,lesson,motion);
 const aliases={timeline:'easing'};
 return mountLab(root,aliases[kind]||kind,{motion});
}
