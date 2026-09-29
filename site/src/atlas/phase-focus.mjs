import {gridLayout,boxGeometry,effectiveValue,damageTiles} from './models.mjs';

/** Narration highlights actual model regions without mutating experiment inputs. */
export function phaseOverlay(lab,s,step) {
  let bounds=[];
  if(lab.id==='layout'){
    const m=gridLayout(s);
    if(step===0)bounds=[[42,92,s.width*.54,156]];
    else bounds=m.tracks.filter((_,i)=>step===3||(step===1?i<2:i>=2))
      .map(t=>[42+t.x*.54,109,Math.max(1,t.width*.54),122]);
  }else if(lab.id==='binding'){
    bounds=[[[36,105,240,124]],[[322,100,155,69]],[[278,135,240,38]],[[524,105,240,124]]][step];
  }else if(lab.id==='tree'){
    bounds=[[[29,48,291,285]],[[61,137,237,143]],[[373,99,389,242]],[[370,55,390,286]]][step];
  }else if(lab.id==='box'){
    const inset=[0,s.margin,s.margin+s.border,boxGeometry(s).inset][step];
    bounds=[[(800-s.width)/2+inset,72+inset*.65,Math.max(1,s.width-2*inset),Math.max(1,254-inset*1.35)]];
  }else if(lab.id==='state'){
    bounds=[[[46,138,158,70]],[[278,138,158,70]],[[546,56,158,70]],[[546,161,158,175]]][step];
  }else if(lab.id==='race'){
    bounds=[[[140,105,Math.max(20,s.a*.227),44]],[[140+s.secondAt*.227,196,s.b*.227,44]],[[140,78,624,184]],[[140,294,624,66]]][step];
  }else if(lab.id==='virtualization'){
    bounds=[[[50,78,62,248]],[[250,78,302,Math.min(244,s.viewport)]],[[596,73,180,285]],[[596,73,180,285]]][step];
  }else if(lab.id==='pipeline'){
    bounds=[[35+step*191,124,156,100]];
  }else if(lab.id==='damage'){
    const m=damageTiles({...s,tile:+s.tile});
    const region=[m.old,m.current,m.next,{x:0,y:0,w:640,h:320}][step];
    bounds=[[80+region.x,46+region.y,region.w,region.h]];
  }else if(lab.id==='easing'){
    bounds=[[[69,296,359,38]],[[74,51,346,254]],[[502,195,253,60]],[[502,263,253,51]]][step];
  }else if(lab.id==='precedence'){
    const m=effectiveValue({...s,defaultValue:14});
    bounds=[[[35,59,376,274]],[[35,59+m.layers.indexOf(m.winner)*72,376,58]],[[479,105,286,196]],[[35,131,376,58]]][step];
  }
  return `<g class="atlas-phase-focus" data-phase-focus="${step}" aria-hidden="true" pointer-events="none">`+
    bounds.map(([x,y,w,h])=>`<rect x="${x-3}" y="${y-3}" width="${w+6}" height="${h+6}" rx="9"/>`).join('')+'</g>';
}
