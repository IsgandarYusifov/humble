(function(){
'use strict';
const form=document.getElementById('application-form');
if(!form)return;
const byId=id=>document.getElementById(id);
const steps=[...form.querySelectorAll('.application-step')];
const stepButtons=[...form.querySelectorAll('[data-step-target]')];
const next=byId('application-continue'),back=byId('application-back');
const submit=form.querySelector('[type=submit]');
const status=byId('form-status'),confirmation=byId('clear-confirm');
const fields=[...form.querySelectorAll('input:not([type=hidden]):not([name=_honey]),textarea,select')];
const category=byId('category'),plan=byId('token-plan'),stage=byId('stage'),mint=byId('mint'),ticker=byId('ticker');
const image=byId('project-image');
const categories={culture:'Culture / Meme lore',art:'Art / Internet IP',agent:'AI / Agent',product:'Tech / Product'};
const query=new URLSearchParams(location.search);
const initialCategory=Object.hasOwn(categories,query.get('category'))?categories[query.get('category')]:'';
category.value=initialCategory;
let currentStep=0,busy=false,imageURL='',imageVersion=0,imageState='empty',imageDetails='',editingField;
const initialValues=new Map(fields.map(field=>[field.name,field.type==='checkbox'?field.checked:field.value]));
const returnURL=new URL(location.href);returnURL.search='';returnURL.hash='';returnURL.searchParams.set('received','1');
byId('application-next').value=returnURL.href;byId('application-next').name='_next';
form.noValidate=true;form.classList.add('enhanced');
byId('download-draft').disabled=false;byId('clear-draft').disabled=false;
function showStatus(message,kind='error'){status.textContent=message;status.dataset.kind=kind;status.hidden=false;}
function values(){return Object.fromEntries(fields.filter(field=>field.type!=='file').map(field=>[field.name,field.type==='checkbox'?(field.checked?'Confirmed':'Not confirmed'):field.value.trim()]));}
function isSolanaAddress(value){
 const alphabet='123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
 if(!value||value.length>44||[...value].some(char=>!alphabet.includes(char)))return false;
 const bytes=[0];
 for(const char of value){let carry=alphabet.indexOf(char);for(let i=0;i<bytes.length;i++){carry+=bytes[i]*58;bytes[i]=carry&255;carry>>=8;}while(carry){bytes.push(carry&255);carry>>=8;}}
 let leading=0;while(value[leading]==='1')leading++;
 return bytes.length+leading-(bytes.length===1&&bytes[0]===0?1:0)===32;
}
function updateRequirements(){
 const token=plan.value==='Token launch';
 ticker.required=token;byId('ticker-optional').hidden=token;
 byId('idea-label').textContent=token?'Coin name':'Project name';
 byId('idea').placeholder=token?'Name your coin':'Name your idea';
 mint.required=stage.value==='Mint exists'||stage.value==='Live';
 byId('mint-optional').hidden=mint.required;
}
function updatePreview(){
 const data=values();
 byId('narrative-count').textContent=byId('narrative').value.length.toLocaleString('en-US')+' / 2,400';
 byId('application-card-name').textContent=data.idea||(plan.value==='Token launch'?'Your coin name':'Your project name');
 byId('application-card-ticker').textContent=data.ticker?'$'+data.ticker.toUpperCase():'';
 byId('application-card-ticker').hidden=!data.ticker;
 byId('application-card-tagline').textContent=data.tagline||'Your one-line introduction will appear here.';
 byId('application-card-creator').textContent=data.creator?'By '+data.creator:'';
 byId('application-card-creator').hidden=!data.creator;
 byId('application-card-category').textContent=data.category.replace(' / ',' · ');
}
function buildReview(){
 const data=values();
 const list=byId('application-review-list');list.replaceChildren();
 const rows=[['Artwork',imageDetails||'No image selected'],['Coin / project',data.idea+(data.ticker?' · $'+data.ticker.toUpperCase():'')],['Network & category','Solana · '+data.category],['Introduction',data.tagline],['Narrative',data.narrative],['Origin',data.origin],['Your connection',data.creator_connection],['Stage',data.stage],['Mint address',data.canonical_mint||'Not minted yet'],['Creator & contact',data.creator+' · '+data.email]];
 const optional=[['Launch timing',data.launch_timing],['Launch platform',data.launch_platform],['X profile',data.x_profile],['Telegram',data.telegram],['Website',data.website]];
 for(const [label,value] of [...rows,...optional.filter(row=>row[1])]){const block=document.createElement('dl');block.className='application-review-item';const key=document.createElement('dt'),text=document.createElement('dd');key.textContent=label;text.textContent=value;block.append(key,text);list.append(block);}
}
function setStep(index,focus=true){
 currentStep=Math.max(0,Math.min(steps.length-1,index));
 steps.forEach((step,i)=>{step.hidden=i!==currentStep;});
 stepButtons.forEach((button,i)=>{if(i===currentStep)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');button.dataset.complete=String(i<currentStep);});
 back.hidden=currentStep===0;next.hidden=currentStep===steps.length-1;submit.hidden=currentStep!==steps.length-1;
 if(currentStep===steps.length-1)buildReview();
 if(focus){const target=steps[currentStep].querySelector('legend');target.tabIndex=-1;target.focus({preventScroll:true});form.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});}
}
function setFieldValidity(field){
 if(field.type==='file'){field.setCustomValidity(imageState==='pending'?'Please wait for the image to finish loading.':imageState==='invalid'?'Choose a valid PNG, JPG or WebP image.':'');return;}
 field.setCustomValidity('');
 if(field.required&&field.type!=='checkbox'&&!field.value.trim())field.setCustomValidity('Please complete this field.');
 if(field.type==='url'&&field.value.trim()){try{const address=new URL(field.value.trim());if(!['http:','https:'].includes(address.protocol))throw new Error();}catch{field.setCustomValidity('Use a complete http:// or https:// link.');}}
 if(field===mint&&field.value.trim()&&!isSolanaAddress(field.value.trim()))field.setCustomValidity('Enter a Solana address that decodes to 32 bytes.');
}
function validateThrough(index){
 updateRequirements();
 for(let i=0;i<=index;i++){const stepFields=fields.filter(field=>steps[i].contains(field));for(const field of stepFields){setFieldValidity(field);if(!field.checkValidity()){setStep(i);field.reportValidity();return false;}}}
 return true;
}
function clearPreview(){
 if(imageURL)URL.revokeObjectURL(imageURL);imageURL='';imageDetails='';
 for(const id of ['upload-preview','application-card-image']){const picture=byId(id);picture.removeAttribute('src');picture.hidden=true;}
 byId('upload-placeholder').hidden=false;byId('application-card-placeholder').hidden=false;byId('remove-image').hidden=true;
}
async function checkImage(){
 const version=++imageVersion;clearPreview();byId('image-error').hidden=true;
 const file=image.files&&image.files[0];
 if(!file){imageState='empty';image.setCustomValidity('');return;}
 const fail=message=>{imageState='invalid';image.setCustomValidity(message);byId('image-error').textContent=message;byId('image-error').hidden=false;byId('remove-image').hidden=false;};
 if(!['image/png','image/jpeg','image/webp'].includes(file.type)){fail('Choose a PNG, JPG or WebP image.');return;}
 if(file.size>5*1024*1024){fail('This image is larger than 5 MB. Choose a smaller file.');return;}
 if(file.size===0){fail('This image is empty. Choose another file.');return;}
 imageState='pending';image.setCustomValidity('Please wait for the image to finish loading.');
 const candidate=URL.createObjectURL(file),decoded=new Image();
 try{
  await new Promise((resolve,reject)=>{decoded.onload=resolve;decoded.onerror=reject;decoded.src=candidate;});
  if(version!==imageVersion){URL.revokeObjectURL(candidate);return;}
  if(decoded.naturalWidth<128||decoded.naturalHeight<128||decoded.naturalWidth>8192||decoded.naturalHeight>8192){URL.revokeObjectURL(candidate);fail('Use an image between 128 and 8,192 pixels in each dimension.');return;}
  imageURL=candidate;imageState='valid';image.setCustomValidity('');imageDetails=file.name+' · '+decoded.naturalWidth+' × '+decoded.naturalHeight+' · '+(file.size/(1024*1024)).toFixed(2)+' MB';
  for(const id of ['upload-preview','application-card-image']){const picture=byId(id);picture.src=imageURL;picture.hidden=false;}
  byId('upload-placeholder').hidden=true;byId('application-card-placeholder').hidden=true;byId('remove-image').hidden=false;
 }catch{URL.revokeObjectURL(candidate);if(version===imageVersion)fail('This file could not be opened as an image. Choose another file.');}
}
image.addEventListener('change',checkImage);
byId('remove-image').addEventListener('click',()=>{image.value='';imageVersion++;imageState='empty';image.setCustomValidity('');clearPreview();byId('image-error').hidden=true;status.hidden=true;image.focus();});
fields.forEach(field=>{
 field.addEventListener('focus',()=>{editingField=field;});
 const edited=()=>{if(field!==image)field.setCustomValidity('');status.hidden=true;confirmation.hidden=true;updateRequirements();updatePreview();};
 field.addEventListener('input',edited);field.addEventListener('change',edited);
});
next.addEventListener('click',()=>{if(validateThrough(currentStep))setStep(currentStep+1);});
back.addEventListener('click',()=>setStep(currentStep-1));
stepButtons.forEach(button=>button.addEventListener('click',()=>{const target=Number(button.dataset.stepTarget);if(target<=currentStep||validateThrough(target-1))setStep(target);}));
form.addEventListener('submit',event=>{
 if(busy){event.preventDefault();return;}
 if(currentStep<steps.length-1){event.preventDefault();if(validateThrough(currentStep))setStep(currentStep+1);return;}
 if(form.querySelector('[name=_honey]').value){event.preventDefault();showStatus('Please clear the hidden website field before continuing.');return;}
 if(!validateThrough(steps.length-1)){event.preventDefault();return;}
 form.querySelector('[name=_subject]').value='Humble application: '+byId('idea').value.trim();
 busy=true;form.setAttribute('aria-busy','true');submit.disabled=true;submit.textContent='Opening security check…';
 showStatus('Continue on FormSubmit to complete the security check and send your image with the application.','note');
 // Leave every named field enabled so the browser includes the file and all entries in its native multipart request.
});
function draft(){const data=values();return ['Humble creator application','','Artwork: '+(imageDetails||'No image selected')+' (image file not included in this text copy)','Plan: '+data.token_plan,'Coin / project: '+data.idea,'Ticker: '+(data.ticker||'Not provided'),'Blockchain: Solana','Category: '+data.category,'','One-line introduction:',data.tagline,'','Narrative & vision:',data.narrative,'','Origin evidence: '+data.origin,'Creator connection: '+data.creator_connection,'','Current stage: '+data.stage,'Canonical mint: '+(data.canonical_mint||'Not provided'),'Launch timing: '+(data.launch_timing||'Not decided'),'Launch platform: '+(data.launch_platform||'Not provided'),'','Creator / team: '+data.creator,'Contact email: '+data.email,'X: '+(data.x_profile||'Not provided'),'Telegram: '+(data.telegram||'Not provided'),'Website: '+(data.website||'Not provided'),'Authority confirmation: '+data.creator_authority].join('\n');}
byId('download-draft').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([draft()],{type:'text/plain;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download='humble-application.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);showStatus('Text copy downloaded. It does not include the image or submit an application.','note');});
function clearDraft(){imageVersion++;form.reset();category.value=initialCategory;fields.forEach(field=>field.setCustomValidity(''));imageState='empty';clearPreview();byId('image-error').hidden=true;busy=false;submit.disabled=false;submit.textContent='Send application';form.setAttribute('aria-busy','false');status.hidden=true;confirmation.hidden=true;updateRequirements();updatePreview();setStep(0);image.focus({preventScroll:true});}
byId('clear-draft').addEventListener('click',()=>{if(busy)return;const dirty=fields.some(field=>field.type==='file'?field.files.length>0:field.type==='checkbox'?field.checked!==initialValues.get(field.name):field.value!==initialValues.get(field.name));if(!dirty){clearDraft();return;}confirmation.hidden=false;byId('keep-draft').focus();});
byId('keep-draft').addEventListener('click',()=>{confirmation.hidden=true;(editingField||image).focus();});
byId('confirm-clear').addEventListener('click',clearDraft);
addEventListener('pageshow',event=>{if(event.persisted||busy){busy=false;submit.disabled=false;submit.textContent='Send application';form.setAttribute('aria-busy','false');status.hidden=true;}});
addEventListener('pagehide',event=>{if(!event.persisted){imageVersion++;clearPreview();}});
updateRequirements();updatePreview();setStep(0,false);
if(query.get('received')==='1'){byId('application-return').hidden=false;document.querySelector('.application-layout').hidden=true;}
})();

