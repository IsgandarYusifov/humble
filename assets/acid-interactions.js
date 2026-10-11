(function(){
'use strict';
const root=document.documentElement;
const basePath=document.querySelector('meta[name="humble-base-path"]')?.content||'';
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
const toggle=document.getElementById('motion-toggle');
let requestedFull=true;
try{const saved=localStorage.getItem('humble-effects');if(saved)requestedFull=saved==='full';}catch{}
function syncEffects(announce=false){
 const full=requestedFull&&!reduced.matches;
 root.dataset.effects=full?'full':'calm';
 toggle.querySelector('span').textContent=full?'Full':'Calm';
 toggle.setAttribute('aria-pressed',String(full));
 toggle.disabled=reduced.matches;
 toggle.title=reduced.matches?'Calm mode follows your device’s reduced-motion preference.':full?'Stop decorative motion.':'Enable decorative motion.';
 toggle.setAttribute('aria-label',reduced.matches?'Effects: Calm, following reduced-motion preference':full?'Effects: Full. Switch to Calm':'Effects: Calm. Switch to Full');
 root.style.setProperty('--px','0px');root.style.setProperty('--py','0px');
 window.dispatchEvent(new CustomEvent('humble:effects',{detail:{enabled:full}}));
 if(announce)document.getElementById('effects-status').textContent=full?'Full visual effects enabled.':'Calm mode enabled. Decorative motion is stopped.';
}
toggle.addEventListener('click',()=>{requestedFull=!requestedFull;try{localStorage.setItem('humble-effects',requestedFull?'full':'calm');}catch{}syncEffects(true);});
reduced.addEventListener('change',()=>syncEffects(true));syncEffects();
const signals={
 culture:{label:'CULTURE / 01',title:'Lore worth believing in.',description:'Memes, communities, and internet worlds with an identifiable creator behind the first spark.'},
 art:{label:'ART / 02',title:'A universe in your image.',description:'Art, characters, and internet-born IP. A distinct world, with a clear line back to its creator.'},
 agent:{label:'AI / 03',title:'Intelligence with intention.',description:'Agents and experiments with a team, a purpose, and an origin visitors can actually trace.'},
 product:{label:'CODE / 04',title:'An idea made tangible.',description:'Tools, products, and technical ideas. The first chapter belongs to the people building them.'}
};
document.querySelectorAll('[data-signal]').forEach(button=>{if(button.tagName!=='BUTTON')return;button.addEventListener('click',()=>{const key=button.dataset.signal,data=signals[key];const applicationButton=document.querySelector('.signal-apply');if(applicationButton)applicationButton.setAttribute('href',basePath+(document.body.classList.contains('horizon-theme')?'/v2':'')+'/apply/?category='+key);document.querySelectorAll('.signal-table button').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));document.querySelector('.signal-output').dataset.signal=key;document.getElementById('signal-label').textContent=data.label;document.getElementById('signal-title').textContent=data.title;document.getElementById('signal-description').textContent=data.description;});});
})();
