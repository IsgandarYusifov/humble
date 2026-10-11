(function(){
'use strict';
const form=document.getElementById('application-form');
if(!form)return;
const status=document.getElementById('form-status');
const confirmation=document.getElementById('clear-confirm');
const fields=[...form.querySelectorAll('input:not([type=hidden]):not([name=_honey]),textarea,select')];
const categories={culture:'Culture / Meme lore',art:'Art / Internet IP',agent:'AI / Agent',product:'Tech / Product'};
const requested=new URLSearchParams(location.search).get('category');
const initialCategory=Object.hasOwn(categories,requested)?categories[requested]:'';
const category=document.getElementById('category');
category.value=initialCategory;
const initialValues=new Map(fields.map(field=>[field.name,field.value]));
const values=()=>Object.fromEntries(fields.map(field=>[field.name,field.value]));
const dirty=()=>fields.some(field=>field.value!==initialValues.get(field.name));
const submit=form.querySelector('[type=submit]');
const narrative=document.getElementById('narrative');
const counter=document.getElementById('narrative-count');
let editingField,busy=false,submitted=false;
form.querySelectorAll('button[disabled]').forEach(button=>{button.disabled=false;});
function updateCount(){counter.textContent=narrative.value.length.toLocaleString('en-US')+' / 2,400';}
function validate(){fields.forEach(field=>field.setCustomValidity(field.required&&!field.value.trim()?'Please complete this field.':''));return form.reportValidity();}
function draft(){const data=values();return ['Humble creator application','','Creator / team: '+data.creator.trim(),'Contact email: '+data.contact.trim(),'Idea name: '+data.idea.trim(),'Category: '+data.category,'','The idea:',data.narrative.trim(),'','Origin links: '+(data.origin.trim()||'Not provided'),'Canonical mint: '+(data.mint.trim()||'Pre-launch / not provided')].join(String.fromCharCode(10));}
function showStatus(message,kind='error'){status.textContent=message;status.dataset.kind=kind;status.hidden=false;}
function setBusy(value){busy=value;form.setAttribute('aria-busy',String(value));fields.forEach(field=>field.disabled=value);form.querySelectorAll('button').forEach(button=>button.disabled=value);submit.disabled=value||submitted;submit.innerHTML=(value?'Submitting...':submitted?'Application submitted':'Submit application')+' <span aria-hidden="true" class="ui-arrow ui-arrow--ne"></span>';}
fields.forEach(field=>{field.addEventListener('focus',()=>{editingField=field;});const edited=()=>{field.setCustomValidity('');confirmation.hidden=true;status.hidden=true;if(submitted){submitted=false;setBusy(false);}updateCount();};field.addEventListener('input',edited);field.addEventListener('change',edited);});
form.addEventListener('submit',async event=>{
 event.preventDefault();
 if(busy||submitted||!validate())return;
 if(form.querySelector('[name=_honey]').value)return;
 const data=values();
 const payload={name:data.creator.trim(),email:data.contact.trim(),idea:data.idea.trim(),category:data.category,message:data.narrative.trim(),origin_links:data.origin.trim()||'Not provided',canonical_mint:data.mint.trim()||'Pre-launch',_subject:'Humble application: '+data.idea.trim(),_template:'table',_honey:''};
 const controller=new AbortController();
 const timeout=setTimeout(()=>controller.abort(),20000);
 status.hidden=true;setBusy(true);
 try{
  const response=await fetch(form.dataset.endpoint,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(payload),signal:controller.signal,credentials:'omit'});
  const result=await response.json();
  const accepted=response.ok&&(result.success===true||result.success==='true');
  const setupPending=/activat|confirm.*email|verify.*email/i.test(String(result.message||''));
  if(!accepted||setupPending)throw new Error(setupPending?'activation':'unavailable');
  submitted=true;
  showStatus('Application submitted. We will contact you at the email you provided if we would like to continue the conversation.','success');
 }catch(error){
  showStatus(error.message==='activation'?'Applications are temporarily unavailable while the review inbox is being connected. Your entries are still here.':"We couldn't confirm delivery. It may have reached the review inbox. Your entries are still here; download a copy before leaving. Contact us before sending again.",'error');
 }finally{clearTimeout(timeout);setBusy(false);}
});
document.getElementById('download-draft').addEventListener('click',()=>{if(!validate())return;const url=URL.createObjectURL(new Blob([draft()],{type:'text/plain;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download='humble-application.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);if(!submitted)showStatus('A copy was downloaded to your device. Downloading does not submit an application.','note');});
function clearDraft(){form.reset();category.value=initialCategory;form.querySelectorAll('details').forEach(detail=>detail.open=false);fields.forEach(field=>field.setCustomValidity(''));submitted=false;setBusy(false);updateCount();confirmation.hidden=true;status.hidden=true;fields[0].focus({preventScroll:true});}
document.getElementById('clear-draft').addEventListener('click',()=>{if(busy)return;if(!dirty()){clearDraft();return;}confirmation.hidden=false;document.getElementById('keep-draft').focus();});
document.getElementById('keep-draft').addEventListener('click',()=>{confirmation.hidden=true;(editingField||fields[0]).focus();});
document.getElementById('confirm-clear').addEventListener('click',clearDraft);
updateCount();
})();