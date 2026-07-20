import{c as a,r as n,j as e,X as d}from"./index-D433XKWQ.js";import{C as h}from"./PageContainer-B-g8-Q03.js";/**
 * @license lucide-react v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const x=a("CircleCheck",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]);/**
 * @license lucide-react v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=a("Info",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]]);/**
 * @license lucide-react v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const u=a("TriangleAlert",[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]]);function k({isOpen:s,message:l,type:i="success",onClose:r,duration:t=4e3}){if(n.useEffect(()=>{if(s&&t>0){const m=setTimeout(()=>{r()},t);return()=>clearTimeout(m)}},[s,t,r]),!s)return null;const c={success:{bg:"bg-emerald-50 border-emerald-100 shadow-emerald-100/10 text-emerald-800",icon:e.jsx(x,{className:"h-5 w-5 text-emerald-500 shrink-0"})},error:{bg:"bg-rose-50 border-rose-100 shadow-rose-100/10 text-rose-800",icon:e.jsx(u,{className:"h-5 w-5 text-rose-500 shrink-0"})},warning:{bg:"bg-amber-50 border-amber-100 shadow-amber-100/10 text-amber-800",icon:e.jsx(h,{className:"h-5 w-5 text-amber-500 shrink-0"})},info:{bg:"bg-blue-50 border-blue-100 shadow-blue-100/10 text-blue-800",icon:e.jsx(b,{className:"h-5 w-5 text-blue-500 shrink-0"})}},o=c[i]||c.success;return e.jsx("div",{className:"fixed bottom-5 right-5 z-50 animate-bounce-in max-w-sm w-full",children:e.jsxs("div",{className:`flex items-start gap-3 rounded-xl border p-4 shadow-lg bg-white ${o.bg}`,children:[o.icon,e.jsx("div",{className:"flex-1 text-sm font-semibold leading-relaxed",children:l}),e.jsx("button",{onClick:r,className:"text-slate-400 hover:text-slate-600 transition-colors",children:e.jsx(d,{className:"h-4 w-4"})})]})})}export{k as T,u as a};
