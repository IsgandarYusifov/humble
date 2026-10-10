(function(){
'use strict';
const form=document.getElementById('application-form');
if(!form)return;
const status=document.getElementById('form-status');
const confirmation=document.getElementById('clear-confirm');
const fields=[...form.querySelectorAll('input,textarea,select')];
const categories={culture:'Culture / Meme lore',art:'Art / Internet IP',agent:'AI / Agent',product:'Tech / Product'};
const requested=new URLSearchParams(location.search).get('category');
const initialCategory=Object.hasOwn(categories,requested)?categories[requested]:'';
const category=document.getElementById('category');
category.value=initialCategory;
const initialValues=new Map(fields.map(field=>[field.name,field.value]));
const values=()=>Object.fromEntries(new FormData(form).entries());
const dirty=()=>fields.some(field=>field.value!==initialValues.get(field.name));
let editingField;
form.querySelectorAll('button[disabled]').forEach(button=>{button.disabled=false;});
function validate(){fields.forEach(field=>field.setCustomValidity(field.required&&!field.value.trim()?'Please complete this field.':''));return form.reportValidity();}
function draft(){const data=values();return 'Humble creator application\n\nCreator / team: '+data.creator.trim()+'\nContact email: '+data.contact.trim()+'\nIdea name: '+data.idea.trim()+'\nCreative territory: '+data.category+'\n\nThe idea:\n'+data.narrative.trim()+'\n\nOrigin links: '+(data.origin.trim()||'Not provided')+'\nCanonical mint: '+(data.mint.trim()||'Pre-launch / not provided');}
function showStatus(message){status.textContent=message;status.hidden=false;}
fields.forEach(field=>{field.addEventListener('focus',()=>{editingField=field;});field.addEventListener('input',()=>{field.setCustomValidity('');confirmation.hidden=true;status.hidden=true;});});
form.addEventListener('submit',event=>{event.preventDefault();if(!validate())return;const link=document.createElement('a');link.href='mailto:liquify.support@gmail.com?subject='+encodeURIComponent('Humble application — '+values().idea.trim())+'&body='+encodeURIComponent(draft());link.click();showStatus('Email draft prepared. Review and send it through your email app. Humble has not received your application yet.');});
document.getElementById('download-draft').addEventListener('click',()=>{if(!validate())return;const url=URL.createObjectURL(new Blob([draft()],{type:'text/plain;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download='humble-application.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);showStatus("Draft downloaded. Email it to liquify.support@gmail.com when you’re ready. It has not been submitted.");});
function clearDraft(){form.reset();category.value=initialCategory;fields.forEach(field=>field.setCustomValidity(''));confirmation.hidden=true;status.hidden=true;fields[0].focus({preventScroll:true});}
document.getElementById('clear-draft').addEventListener('click',()=>{if(!dirty()){clearDraft();return;}confirmation.hidden=false;document.getElementById('keep-draft').focus();});
document.getElementById('keep-draft').addEventListener('click',()=>{confirmation.hidden=true;(editingField||fields[0]).focus();});
document.getElementById('confirm-clear').addEventListener('click',clearDraft);
})();
