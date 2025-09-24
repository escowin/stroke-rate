import{r as D,g as x,a as z}from"./react-vendor-gH-7aFTg.js";function M(e,v){for(var f=0;f<v.length;f++){const t=v[f];if(typeof t!="string"&&!Array.isArray(t)){for(const u in t)if(u!=="default"&&!(u in e)){const l=Object.getOwnPropertyDescriptor(t,u);l&&Object.defineProperty(e,u,l.get?l:{enumerable:!0,get:()=>t[u]})}}}return Object.freeze(Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}))}var W=D();const P=x(W),U=M({__proto__:null,default:P},[W]);var k=z(),S={exports:{}},g={};/**
 * @license React
 * use-sync-external-store-with-selector.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var O;function q(){if(O)return g;O=1;var e=D();function v(o,a){return o===a&&(o!==0||1/o===1/a)||o!==o&&a!==a}var f=typeof Object.is=="function"?Object.is:v,t=e.useSyncExternalStore,u=e.useRef,l=e.useEffect,V=e.useMemo,w=e.useDebugValue;return g.useSyncExternalStoreWithSelector=function(o,a,p,y,s){var i=u(null);if(i.current===null){var n={hasValue:!1,value:null};i.current=n}else n=i.current;i=V(function(){function j(r){if(!E){if(E=!0,m=r,r=y(r),s!==void 0&&n.hasValue){var c=n.value;if(s(c,r))return b=c}return b=r}if(c=b,f(m,r))return c;var _=y(r);return s!==void 0&&s(c,_)?(m=r,c):(m=r,b=_)}var E=!1,m,b,R=p===void 0?null:p;return[function(){return j(a())},R===null?void 0:function(){return j(R())}]},[a,p,y,s]);var d=t(o,i[0],i[1]);return l(function(){n.hasValue=!0,n.value=d},[d]),w(d),d},g}var h;function A(){return h||(h=1,S.exports=q()),S.exports}var C=A();export{P as G,k as a,W as r,U as t,C as w};
