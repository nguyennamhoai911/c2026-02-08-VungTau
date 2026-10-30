(function(root){
var D=Math.PI/180;
var RATE=[14.49205211,0.54901653,0.04106864,0.00464183,0.00220641,0.00000196];
var CON={
SA:[0,0,1,0,0,0,0,'1'], SSA:[0,0,2,0,0,0,0,'1'],
MM:[0,1,0,-1,0,0,0,'Mm'], MSF:[0,2,-2,0,0,0,0,'-M2'], MF:[0,2,0,0,0,0,0,'Mf'],
MTM:[0,3,0,-1,0,0,0,'Mf'], MSQM:[0,4,-2,0,0,0,0,'Mf'],
'2Q1':[1,-3,0,2,0,0,1,'O1'], SIGMA1:[1,-3,2,0,0,0,1,'O1'], Q1:[1,-2,0,1,0,0,1,'O1'],
RHO1:[1,-2,2,-1,0,0,1,'O1'], O1:[1,-1,0,0,0,0,1,'O1'], M1:[1,0,0,1,0,0,-1,'O1'],
P1:[1,1,-2,0,0,0,1,'1'], S1:[1,1,-1,0,0,0,0,'1'], K1:[1,1,0,0,0,0,-1,'K1'],
J1:[1,2,0,-1,0,0,-1,'J1'], OO1:[1,3,0,0,0,0,-1,'OO1'],
EPS2:[2,-3,2,1,0,0,0,'M2'], '2N2':[2,-2,0,2,0,0,0,'M2'], MU2:[2,-2,2,0,0,0,0,'M2'],
MKS2:[2,-1,0,0,0,0,0,'M2'], N2:[2,-1,0,1,0,0,0,'M2'], NU2:[2,-1,2,-1,0,0,0,'M2'],
MA2:[2,0,-1,0,0,0,0,'M2'], M2:[2,0,0,0,0,0,0,'M2'], MB2:[2,0,1,0,0,0,0,'M2'],
'3N2':[2,0,2,0,0,0,0,'MK2'], LAMBDA2:[2,1,-2,1,0,0,2,'M2'], L2:[2,1,0,-1,0,0,2,'L2'],
'3L2':[2,1,0,0,0,0,2,'M2'], T2:[2,2,-3,0,0,1,0,'1'], S2:[2,2,-2,0,0,0,0,'1'],
R2:[2,2,-1,0,0,-1,2,'1'], K2:[2,2,0,0,0,0,0,'K2'], '2SM2':[2,4,-4,0,0,0,0,'-M2'],
M3:[3,0,0,0,0,0,0,'M3'], T3:[3,3,-4,0,0,1,0,'1'], S3:[3,3,-3,0,0,0,0,'1'], R3:[3,3,-2,0,0,-1,0,'1'],
N4:[4,-2,0,2,0,0,0,'M4'], MN4:[4,-1,0,1,0,0,0,'M4'], M4:[4,0,0,0,0,0,0,'M4'],
MS4:[4,2,-2,0,0,0,0,'M2'], S4:[4,4,-4,0,0,0,0,'1'],
'2MO5':[5,-1,0,0,0,0,1,'2MO5'], '2MK5':[5,1,0,0,0,0,-1,'2MK5'],
M6:[6,0,0,0,0,0,0,'M6'], '2MS6':[6,2,-2,0,0,0,0,'M4'], M8:[8,0,0,0,0,0,0,'M8']
};
function astro(ms){
var T=(ms-946728000000)/3155760000000,T2=T*T,
s=218.3164591+481267.88134236*T-0.0013268*T2,
h=280.4664472+36000.7698231*T+0.00030368*T2,
p=83.3532430+4069.0137111*T-0.0103238*T2,
N=125.0445550-1934.1361849*T+0.0020762*T2,
p1=282.9373481+1.7195366*T+0.00045688*T2,
t=15*(((ms%86400000)+86400000)%86400000)/3600000+180;
return {v:[t+h-s,s,h,p,-N,p1],N:N,p:p};
}
function nodal(a){
var N=a.N*D,p=a.p*D,cN=Math.cos(N),sN=Math.sin(N),c2=Math.cos(2*N),s2=Math.sin(2*N),
c3=Math.cos(3*N),s3=Math.sin(3*N),r={};
r['1']=[1,0];
r.M2=[1.0004-0.0373*cN+0.0002*c2,-2.14*sN];
r.O1=[1.0089+0.1871*cN-0.0147*c2+0.0014*c3,10.80*sN-1.34*s2+0.19*s3];
r.K1=[1.0060+0.1150*cN-0.0088*c2+0.0006*c3,-8.86*sN+0.68*s2-0.07*s3];
r.K2=[1.0241+0.2863*cN+0.0083*c2-0.0015*c3,-17.74*sN+0.68*s2-0.04*s3];
r.J1=[1.1029+0.1676*cN-0.0170*c2+0.0016*c3,-12.94*sN+1.34*s2-0.19*s3];
r.OO1=[1.1027+0.6504*cN+0.0317*c2-0.0014*c3,-36.68*sN+4.02*s2-0.57*s3];
r.Mf=[1.0429+0.4135*cN-0.004*c2,-23.74*sN+2.68*s2-0.38*s3];
r.Mm=[1.0-0.1300*cN+0.0013*c2,0];
var x=1-0.2505*Math.cos(2*p)-0.1102*Math.cos(2*p-N)-0.0156*Math.cos(2*p-2*N)-0.0370*cN,
y=-0.2505*Math.sin(2*p)-0.1102*Math.sin(2*p-N)-0.0156*Math.sin(2*p-2*N)-0.0370*sN;
r.L2=[Math.sqrt(x*x+y*y),Math.atan2(y,x)/D];
var m=r.M2;
r['-M2']=[m[0],-m[1]];
r.M3=[Math.pow(m[0],1.5),1.5*m[1]];
r.M4=[m[0]*m[0],2*m[1]]; r.M6=[m[0]*m[0]*m[0],3*m[1]]; r.M8=[m[0]*m[0]*m[0]*m[0],4*m[1]];
r.MK2=[m[0]*r.K2[0],m[1]+r.K2[1]];
r['2MK5']=[m[0]*m[0]*r.K1[0],2*m[1]+r.K1[1]];
r['2MO5']=[m[0]*m[0]*r.O1[0],2*m[1]+r.O1[1]];
return r;
}
function prepare(cons){
var st={A:[],G:[],W:[],C:[],cache:{}};
for(var n in cons){if(!cons.hasOwnProperty(n)||!CON[n]||!cons[n][0])continue;
var c=CON[n];st.A.push(cons[n][0]/100);st.G.push(cons[n][1]);st.C.push(c);
st.W.push((c[0]*RATE[0]+c[1]*RATE[1]+c[2]*RATE[2]+c[3]*RATE[3]+c[4]*RATE[4]+c[5]*RATE[5])*D/3600000);}
return st;
}
var BUCKET=16*86400000;
function ref(st,ms){var b=Math.floor(ms/BUCKET),r=st.cache[b];if(r)return r;
var t0=b*BUCKET+BUCKET/2,a=astro(t0),nd=nodal(a),amp=[],ph=[];
for(var i=0;i<st.A.length;i++){var c=st.C[i],fu=nd[c[7]],
V=c[0]*a.v[0]+c[1]*a.v[1]+c[2]*a.v[2]+c[3]*a.v[3]+c[4]*a.v[4]+c[5]*a.v[5]+c[6]*90;
amp.push(fu[0]*st.A[i]);ph.push((V+fu[1]-st.G[i])*D);}
var keys=Object.keys(st.cache);if(keys.length>6)st.cache={};
return (st.cache[b]={t0:t0,amp:amp,ph:ph});}
function level(st,ms){var r=ref(st,ms),dt=ms-r.t0,h=0;
for(var i=0;i<r.amp.length;i++)h+=r.amp[i]*Math.cos(st.W[i]*dt+r.ph[i]);return h;}
function slope(st,ms){var r=ref(st,ms),dt=ms-r.t0,d=0;
for(var i=0;i<r.amp.length;i++)d-=r.amp[i]*st.W[i]*Math.sin(st.W[i]*dt+r.ph[i]);return d;}
function events(st,ms0,ms1,minRange){var STEP=15*60000,out=[],a=ms0,da=slope(st,a);
while(a<ms1){var b=a+STEP,db=slope(st,b);
if((da>0&&db<=0)||(da<0&&db>=0)){var lo=a,hi=b,dlo=da;
for(var k=0;k<14;k++){var md=(lo+hi)/2,dm=slope(st,md);if((dlo>0)===(dm>0)){lo=md;dlo=dm;}else hi=md;}
var t=Math.round((lo+hi)/2);out.push({t:t,type:da>0?'H':'L',h:level(st,t)});}
a=b;da=db;}
if(minRange>0)for(;;){var bi=-1,bd=minRange;
for(var i=0;i+1<out.length;i++){var d=Math.abs(out[i].h-out[i+1].h);if(d<bd){bd=d;bi=i;}}
if(bi<0)break;out.splice(bi,2);}
return out;}
var api={prepare:prepare,level:level,slope:slope,events:events,CON:CON,astro:astro,nodal:nodal};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.TideHarmonic=api;
})(this);
