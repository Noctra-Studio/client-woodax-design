import { CONSENT_COOKIE, CONSENT_VERSION } from "@/lib/consent-config";

/**
 * Runs from `head` before first paint. Hides the bar when a v1 choice
 * already exists, and sets Consent Mode before gtag.js can load.
 */
export function consentBootstrapScript(options: {
  gaId: string | undefined;
  loadGa: boolean;
}): string {
  const gaId = options.gaId ?? "";
  return `(function(){try{
var KEY=${JSON.stringify(CONSENT_COOKIE)};
var VERSION=${CONSENT_VERSION};
function parse(raw){
if(!raw)return null;
try{
var value=JSON.parse(raw);
if(!value||value.v!==VERSION||value.necessary!==true)return null;
if(typeof value.analytics!=="boolean"||typeof value.marketing!=="boolean")return null;
return value;
}catch(e){return null;}
}
function readCookie(){
try{
var prefix=KEY+"=";
var rawCookie=typeof document!=="undefined"&&document.cookie?document.cookie:"";
var parts=rawCookie?rawCookie.split("; "):[];
var best=null;
for(var i=0;i<parts.length;i++){
if(parts[i].indexOf(prefix)!==0)continue;
var parsed=null;
try{parsed=parse(decodeURIComponent(parts[i].slice(prefix.length)));}catch(e){parsed=null;}
if(!parsed)continue;
if(!best||(parsed.ts||0)>=(best.ts||0))best=parsed;
}
return best;
}catch(e){return null;}
}
var fromCookie=readCookie();
var fromStorage=null;
try{fromStorage=parse(window.localStorage&&window.localStorage.getItem(KEY));}catch(e){}
var consent=fromCookie||fromStorage;
if(fromCookie&&fromStorage&&fromStorage.ts>fromCookie.ts)consent=fromStorage;
window.__woodaxConsent=consent;
if(consent){
var style=document.createElement("style");
style.setAttribute("data-woodax-consent-hide","");
style.textContent="[data-cookie-banner]{display:none!important}html:has([data-cookie-banner]) [data-whatsapp-float]{bottom:1.5rem!important}";
document.head.appendChild(style);
}
window.dataLayer=window.dataLayer||[];
window.gtag=window.gtag||function gtag(){window.dataLayer.push(arguments);};
var analyticsGranted=!consent||consent.analytics===true;
window.gtag("consent","default",{
analytics_storage:analyticsGranted?"granted":"denied",
ad_storage:"denied",
ad_user_data:"denied",
ad_personalization:"denied"
});
var gaId=${JSON.stringify(gaId)};
var loadGa=${options.loadGa ? "true" : "false"};
if(loadGa&&analyticsGranted&&gaId){
window.gtag("js",new Date());
window.gtag("config",gaId);
var script=document.createElement("script");
script.async=true;
script.src="https://www.googletagmanager.com/gtag/js?id="+encodeURIComponent(gaId);
script.setAttribute("data-woodax-ga","");
document.head.appendChild(script);
}
}catch(e){}})();`;
}
