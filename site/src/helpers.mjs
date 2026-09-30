export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const $ = (selector, root=document) => root.querySelector(selector);
export const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
export function toast(message) { const node=$('#toast'); node.textContent=message; node.classList.add('shown'); clearTimeout(toast.timer); toast.timer=setTimeout(()=>node.classList.remove('shown'),4000); }
export function download(name, content, type='application/json') { const url=URL.createObjectURL(content instanceof Blob?content:new Blob([content],{type})); const a=document.createElement('a'); a.href=url; a.download=name; a.click(); setTimeout(()=>URL.revokeObjectURL(url),10000); }
export function dialog(html, setup) { const modal=$('#modal'); $('#modal-content').innerHTML=html; $('.dialog-close',modal).onclick=()=>modal.close(); modal.showModal(); setup?.(modal); }
export function safeUrl(value, base=location.href) { try { const url=new URL(value,base); return ['https:','http:'].includes(url.protocol)?url.href:'#'; } catch { return '#'; } }
export function inline(text, base) { return escapeHtml(text).replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/\[([^\]]+)\]\(([^)]+)\)/g,(_,label,href)=>`<a href="${escapeHtml(safeUrl(href.replaceAll('&amp;','&'),base))}" target="_blank" rel="noopener noreferrer">${label}</a>`); }
/** Raw HTML is always escaped. DocFX directives remain readable; open the pinned source for its full original presentation. */
export function markdown(text,base) {
  const lines=String(text).replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/,'').split('\n');
  let html='',fence=null,language='',code=[],paragraph=[];
  const flush=()=>{if(paragraph.length){html+=`<p>${inline(paragraph.join(' '),base)}</p>`;paragraph=[];}};
  const codeBlock=()=>`<pre><code${language?` data-language="${escapeHtml(language)}"`:''}>${escapeHtml(code.join('\n'))}</code></pre>`;
  for(const line of lines){
    const marker=line.match(/^\s*(`{3,}|~{3,})(.*)$/);
    if(marker && (!fence || marker[1][0]===fence[0] && marker[1].length>=fence.length && !marker[2].trim())){
      flush();if(fence){html+=codeBlock();code=[];fence=null;language='';}else{fence=marker[1];language=marker[2].trim().split(/\s+/)[0].replace(/[^a-zA-Z0-9#+._-]/g,'').slice(0,32);}continue;
    }
    if(fence){code.push(line);continue;}
    const heading=line.match(/^(#{1,6})\s+(.+)/);
    if(heading){flush();const n=Math.min(heading[1].length+1,6);html+=`<h${n}>${inline(heading[2],base)}</h${n}>`;}
    else if(!line.trim())flush();
    else if(/^\s*[-*]\s/.test(line)){flush();html+=`<div class="md-list">${inline(line.replace(/^\s*[-*]\s/,''),base)}</div>`;}
    else if(/^>/.test(line)){flush();html+=`<blockquote>${inline(line.replace(/^>\s?/,''),base)}</blockquote>`;}
    else paragraph.push(line);
  }
  flush();if(fence)html+=codeBlock();return html;
}
export function icon(name,size=20){const p={home:'M3 10 12 3l9 7v11h-6v-7H9v7H3z',book:'M4 3h7l1 2 1-2h7v17h-7l-1 1-1-1H4z M12 5v16',code:'m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18',search:'M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16m6-2 6 6',arrow:'M4 12h16m-6-6 6 6-6 6',play:'m8 4 13 8-13 8z',check:'m4 12 5 5L20 6',star:'m12 2 3 7 7 1-5 5 1 7-6-4-6 4 1-7-5-5 7-1z',grid:'M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z',layers:'m12 2 10 6-10 6L2 8zm-10 10 10 6 10-6M2 16l10 6 10-6',bolt:'M13 2 4 14h7l-1 8 10-13h-7z',clock:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18m0 4v5l4 2',menu:'M3 6h18M3 12h18M3 18h18',target:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18m0 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8',settings:'m9 3-1 3-3 1-2 3 2 2-1 3 3 2 3-1 2 2 3-1 1-3 3-1 2-3-2-2 1-3-3-2-3 1-2-2z M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8',download:'M12 2v13m-5-5 5 5 5-5M4 16v5h16v-5',monitor:'M3 3h18v13H3zm5 18h8m-4-5v5',phone:'M7 2h10v20H7zm4 17h2',info:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18m0 7v7m0-10v1',refresh:'M20 8a8 8 0 1 0 0 8M20 3v5h-5',sun:'M12 3v2m0 14v2M3 12h2m14 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8'};return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${p[name]||p.book}"/></svg>`;}
