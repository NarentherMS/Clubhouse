/* Advisor Activity Tracker: relationship activity tracker for professional sports clubs. */
const LEAGUES={NFL:['Arizona Cardinals','Atlanta Falcons','Baltimore Ravens','Buffalo Bills','Carolina Panthers','Chicago Bears','Cincinnati Bengals','Cleveland Browns','Dallas Cowboys','Denver Broncos','Detroit Lions','Green Bay Packers','Houston Texans','Indianapolis Colts','Jacksonville Jaguars','Kansas City Chiefs','Las Vegas Raiders','Los Angeles Chargers','Los Angeles Rams','Miami Dolphins','Minnesota Vikings','New England Patriots','New Orleans Saints','New York Giants','New York Jets','Philadelphia Eagles','Pittsburgh Steelers','San Francisco 49ers','Seattle Seahawks','Tampa Bay Buccaneers','Tennessee Titans','Washington Commanders'],MLB:['Arizona Diamondbacks','Atlanta Braves','Baltimore Orioles','Boston Red Sox','Chicago Cubs','Chicago White Sox','Cincinnati Reds','Cleveland Guardians','Colorado Rockies','Detroit Tigers','Houston Astros','Kansas City Royals','Los Angeles Angels','Los Angeles Dodgers','Miami Marlins','Milwaukee Brewers','Minnesota Twins','New York Mets','New York Yankees','Athletics','Philadelphia Phillies','Pittsburgh Pirates','San Diego Padres','San Francisco Giants','Seattle Mariners','St. Louis Cardinals','Tampa Bay Rays','Texas Rangers','Toronto Blue Jays','Washington Nationals'],MLS:['Atlanta United','Austin FC','Charlotte FC','Chicago Fire FC','FC Cincinnati','Colorado Rapids','Columbus Crew','D.C. United','FC Dallas','Houston Dynamo FC','Inter Miami CF','LA Galaxy','Los Angeles Football Club','Minnesota United FC','CF Montréal','Nashville SC','New England Revolution','New York City FC','New York Red Bulls','Orlando City SC','Philadelphia Union','Portland Timbers','Real Salt Lake','San Diego FC','San Jose Earthquakes','Seattle Sounders FC','Sporting Kansas City','St. Louis CITY SC','Toronto FC','Vancouver Whitecaps FC'],NHL:['Anaheim Ducks','Boston Bruins','Buffalo Sabres','Calgary Flames','Carolina Hurricanes','Chicago Blackhawks','Colorado Avalanche','Columbus Blue Jackets','Dallas Stars','Detroit Red Wings','Edmonton Oilers','Florida Panthers','Los Angeles Kings','Minnesota Wild','Montréal Canadiens','Nashville Predators','New Jersey Devils','New York Islanders','New York Rangers','Ottawa Senators','Philadelphia Flyers','Pittsburgh Penguins','San Jose Sharks','Seattle Kraken','St. Louis Blues','Tampa Bay Lightning','Toronto Maple Leafs','Utah Mammoth','Vancouver Canucks','Vegas Golden Knights','Washington Capitals','Winnipeg Jets'],NBA:['Atlanta Hawks','Boston Celtics','Brooklyn Nets','Charlotte Hornets','Chicago Bulls','Cleveland Cavaliers','Dallas Mavericks','Denver Nuggets','Detroit Pistons','Golden State Warriors','Houston Rockets','Indiana Pacers','LA Clippers','Los Angeles Lakers','Memphis Grizzlies','Miami Heat','Milwaukee Bucks','Minnesota Timberwolves','New Orleans Pelicans','New York Knicks','Oklahoma City Thunder','Orlando Magic','Philadelphia 76ers','Phoenix Suns','Portland Trail Blazers','Sacramento Kings','San Antonio Spurs','Toronto Raptors','Utah Jazz','Washington Wizards']};
const LOGO_CODES={NFL:['ari','atl','bal','buf','car','chi','cin','cle','dal','den','det','gb','hou','ind','jax','kc','lv','lac','lar','mia','min','ne','no','nyg','nyj','phi','pit','sf','sea','tb','ten','was'],MLB:['ari','atl','bal','bos','chc','chw','cin','cle','col','det','hou','kc','laa','lad','mia','mil','min','nym','nyy','oak','phi','pit','sd','sf','sea','stl','tb','tex','tor','was'],MLS:['atl','aus','clt','chi','cin','col','clb','dc','dal','hou','mia','la','laf','min','mtl','nash','ne','nyc','ny','orl','phi','por','rsl','sd','sj','sea','skc','stl','tor','van'],NHL:['ana','bos','buf','cgy','car','chi','col','cbj','dal','det','edm','fla','la','min','mtl','nsh','nj','nyi','nyr','ott','phi','pit','sj','sea','stl','tb','tor','uta','van','vgk','was','wpg'],NBA:['atl','bos','bkn','cha','chi','cle','dal','den','det','gs','hou','ind','lac','lal','mem','mia','mil','min','no','ny','okc','orl','phi','phx','por','sac','sa','tor','utah','wsh']};
const CAPS=['Marketing in a Box','Finance in a Box','Ticket Sales Accelerator','Collections Accelerator','Search & Retrieval','Smart Stadium','Other'];
const NEXT_STEP_TYPES=['Meeting scheduled','Materials to be shared','NDA in progress','SOW in progress','Awaiting their response','Yet to be decided','Demo','Other'];
const SEED_USERS=[{id:'u-admin',name:'Jordan Lee',role:'Admin',title:'SVP · Admin'},{id:'u-avery',name:'Avery Morgan',role:'User',title:'Senior Advisor'},{id:'u-jamie',name:'Jamie Chen',role:'User',title:'Advisor'},{id:'u-taylor',name:'Taylor Brooks',role:'User',title:'Internal POC'}];
function contractFor(id){return db.contracts?.[id]||null}
function contractMoney(value){return '$'+Number(value||0).toLocaleString('en-US')}
function contractRows(text){return String(text||'').split('\n').map(line=>line.split('|').map(part=>part.trim()))}
const dt=(offset=0)=>{const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()+offset);return d.toISOString().slice(0,10)};
function freshDB(){
 const clubs=[];Object.entries(LEAGUES).forEach(([league,names])=>names.forEach((name,i)=>clubs.push({id:`${league}-${i+1}`,league,name})));
 return {users:SEED_USERS,clubs,interactions:[],meetings:[],contracts:{},activeUser:'u-admin'};
}
function seedShowcaseData(actor){
 if(actor!=='u-admin'||db.showcaseSeeded)return false;
 db.interactions||=[];db.meetings||=[];db.contracts||={};
 const hasRealData=db.interactions.some(x=>!x.sample)||db.meetings.some(x=>!x.sample)||Object.values(db.contracts).some(x=>!x.sample);
 db.showcaseSeeded=true;
 if(hasRealData||db.interactions.length||db.meetings.length)return true;
 const club=(league,name)=>db.clubs.find(c=>c.league===league&&c.name===name), owner='u-avery';
 const records=[
  {id:'showcase-cowboys-1',club:club('NFL','Dallas Cowboys'),days:-1,poc:'Sam Carter',designation:'SVP, Partnerships',exl:'Avery Morgan',summary:'Reviewed partnership priorities and sponsor servicing workflows. The team requested examples to share with its commercial operations group.',caps:['Marketing in a Box','Finance in a Box'],tag:'Materials to be shared',steps:[['Share sponsor servicing overview with the partnerships team','u-avery',2,'Open']]},
  {id:'showcase-cowboys-2',club:club('NFL','Dallas Cowboys'),days:-8,poc:'Sam Carter',designation:'SVP, Partnerships',exl:'Avery Morgan',summary:'Introductory discussion about the club’s commercial operations, current priorities, and opportunities to exchange practical examples.',caps:['Marketing in a Box'],tag:'Meeting scheduled',steps:[['Prepare examples for the discovery session','u-avery',-2,'Open']]},
  {id:'showcase-yankees-1',club:club('MLB','New York Yankees'),days:-3,poc:'Morgan Ellis',designation:'VP, Partnerships',exl:'Taylor Brooks',summary:'Discussed sponsor renewal workflows and planning for the next season. The club asked for a short overview of ticketing use cases.',caps:['Marketing in a Box','Ticket Sales Accelerator'],tag:'Awaiting their response',steps:[['Send ticketing use case overview','u-taylor',-1,'Done']]},
  {id:'showcase-galaxy-1',club:club('MLS','LA Galaxy'),days:-6,poc:'Riley Bennett',designation:'Director, Business Strategy',exl:'Jamie Chen',summary:'Explored ways to streamline collections follow-through and improve visibility into partner servicing activities.',caps:['Collections Accelerator'],tag:'NDA in progress',steps:[['Confirm NDA review status','u-jamie',4,'Open']]},
  {id:'showcase-bruins-1',club:club('NHL','Boston Bruins'),days:-10,poc:'Casey Morgan',designation:'VP, Corporate Partnerships',exl:'Avery Morgan',summary:'Shared an initial overview of EXL capabilities and agreed to bring finance and partnership operations stakeholders into a working session.',caps:['Finance in a Box'],tag:'SOW in progress',steps:[['Coordinate internal working session','u-avery',6,'Open']]},
  {id:'showcase-celtics-1',club:club('NBA','Boston Celtics'),days:-14,poc:'Drew Parker',designation:'Senior Director, Partnerships',exl:'Taylor Brooks',summary:'Reviewed current partner engagement processes and identified a few areas for a deeper discovery conversation.',caps:['Marketing in a Box','Other'],other:'Partner experience analytics',tag:'Yet to be decided',steps:[]},
  {id:'showcase-sounders-1',club:club('MLS','Seattle Sounders FC'),days:-18,poc:'Alex Rivera',designation:'Director, Revenue Operations',exl:'Jamie Chen',summary:'Discussed season planning, sales enablement priorities, and examples of workflows used by comparable organizations.',caps:['Ticket Sales Accelerator'],tag:'Materials to be shared',steps:[['Share sales enablement overview','u-jamie',-5,'Open']]}
 ];
 records.forEach(r=>{if(!r.club)return;db.interactions.push({id:r.id,clubId:r.club.id,date:dt(r.days),meetingType:'Completed meeting',stakeholders:[{name:r.poc,role:r.designation}],participants:[{name:r.exl,role:r.exl==='Taylor Brooks'?'Internal POC':'Advisor'}],exlPoc:r.exl,clubPoc:r.poc,clubPocDesignation:r.designation,summary:r.summary,capabilities:r.caps,other:r.other||'',nextStepType:r.tag,owner:r.exl==='Taylor Brooks'?'u-taylor':r.exl==='Jamie Chen'?'u-jamie':'u-avery',sample:true,followups:r.steps.map((s,j)=>({id:`${r.id}-step-${j+1}`,description:s[0],owner:s[1],due:dt(s[2]),status:s[3]}))})});
 const meetingSpecs=[
  ['NFL','Dallas Cowboys',3,'Follow-up meeting','Avery Morgan','Sam Carter','SVP, Partnerships','Review partnership operations priorities and agree on a discovery agenda.','u-avery','10:30'],
  ['MLB','New York Yankees',7,'Follow-up meeting','Taylor Brooks','Morgan Ellis','VP, Partnerships','Review ticketing use cases and confirm stakeholders for the next discussion.','u-taylor','14:00'],
  ['NHL','Boston Bruins',12,'First meeting','Avery Morgan','Casey Morgan','VP, Corporate Partnerships','Introductory conversation about current priorities and potential collaboration areas.','u-avery','11:00'],
  ['NBA','Boston Celtics',18,'Follow-up meeting','Jamie Chen','Drew Parker','Senior Director, Partnerships','Review discovery topics and decide whether to schedule a deeper working session.','u-jamie','09:30']
 ];
 meetingSpecs.forEach((s,i)=>{const c=club(s[0],s[1]);if(c)db.meetings.push({id:`showcase-meeting-${i+1}`,clubId:c.id,date:dt(s[2]),time:s[9],meetingType:s[3],exlPoc:s[4],clubPoc:s[5],clubPocDesignation:s[6],participants:[s[4],s[5]],agenda:s[7],owner:s[8],status:'Planned',sample:true})});
 const contract=(id,rate,cap,used,termEnd,commission)=>({sample:true,agreementType:'Advisor Services Agreement',status:'Active',role:db.users.find(u=>u.id===id)?.title||'Advisor',exlContact:'Jordan Lee',agreementDate:dt(-90),sowStart:dt(-75),sowEnd:dt(termEnd),extensionDeadline:dt(termEnd-30),commissionWindowEnd:dt(termEnd+180),location:'United States',governingLaw:'New York',paymentTerms:'Net 30 after approved invoice',hourlyRate:rate,firstMonthCap:cap,monthlyCap:cap,hoursUsed:used,hoursCap:cap,extraHours:'Prior written approval required',travelExpenses:'Pre-approved, reasonable expenses reimbursed with receipts',oneTimeIncentive:1500,largeMsaThreshold:5,largeMsaCommission:commission,otherMsaCommission:2500,sowYearOnePercent:2,sowYearTwoPercent:1,deliverables:[{name:'Qualified stakeholder introductions',target:8,actual:5},{name:'Discovery sessions supported',target:6,actual:3}],compliance:[{name:'Confidentiality training',status:'Complete',detail:'Completed during onboarding'},{name:'Annual compliance review',status:'In progress',detail:'Renewal due this quarter'}],scope:'Support relationship development, discovery preparation, and coordination of approved advisory services.',conditions:'Submit monthly timesheets and invoices. Work outside the approved scope requires written authorization.',restrictions:'Protect confidential information and return company materials at the end of the engagement.'});
 db.contracts['u-avery']=contract('u-avery',165,80,46,150,12000);
 db.contracts['u-jamie']=contract('u-jamie',145,72,38,120,9500);
 db.contracts['u-taylor']=contract('u-taylor',135,64,29,135,8000);
 return true;
}
function linkShowcaseMeetings(){let changed=false;for(const meeting of db.meetings||[]){if(!meeting.sample||meeting.status!=='Planned')continue;const candidates=(db.interactions||[]).filter(i=>i.sample&&i.clubId===meeting.clubId&&i.date<=meeting.date&&(i.owner===meeting.owner||!meeting.owner)).sort((a,b)=>Number(b.nextStepType==='Meeting scheduled')-Number(a.nextStepType==='Meeting scheduled')||b.date.localeCompare(a.date));const interaction=candidates[0];if(!interaction)continue;if(meeting.interactionId&&meeting.interactionId!==interaction.id){const old=(db.interactions||[]).find(i=>i.id===meeting.interactionId);if(old?.meetingId===meeting.id)old.meetingId=''}if(meeting.interactionId!==interaction.id||interaction.meetingId!==meeting.id||interaction.nextMeeting!==meeting.date||interaction.nextMeetingTime!==(meeting.time||'')){meeting.interactionId=interaction.id;interaction.meetingId=meeting.id;interaction.nextMeeting=meeting.date;interaction.nextMeetingTime=meeting.time||'';interaction.nextAgenda=meeting.agenda||'';changed=true}}
 const cowboys=(db.interactions||[]).find(i=>i.id==='showcase-cowboys-2'&&i.sample);if(cowboys)for(const f of cowboys.followups||[])if(f.owner!==cowboys.owner){f.owner=cowboys.owner;changed=true}return changed}
const STORE='clubhouse_v1';let db=freshDB(),accountEpoch=0;
function clearWorkspaceCache(){try{localStorage.removeItem(STORE)}catch{}}
clearWorkspaceCache();
async function save(){
 const epoch=accountEpoch;
 const response=await fetch('/api/state',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({state:db})});
 const result=await response.json().catch(()=>null);
 if(epoch!==accountEpoch)return false;
 if(!response.ok||!result?.ok||!result.state){
  const error=new Error(result?.error||'Could not save this record. Check the server and try again.');error.status=response.status;
  if(response.status===401)loginPage('Your session expired. Sign in again.');
  throw error;
 }
 db=result.state;clearWorkspaceCache();return true;
}
const user=()=>db.users.find(u=>u.id===db.activeUser)||db.users[0];const isAdmin=()=>user().role==='Admin';const isSubadmin=()=>user().role==='Sub-admin';const isStaff=()=>isAdmin()||isSubadmin();const $=s=>document.querySelector(s);const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let page='home',selectedClub=null,clubTab='history',toastTimer,editingMeeting=null,editingInteraction=null,meetingToComplete=null,activeDigestItems=[],selectedContractUser='u-avery',editContractsMode=false,followupRange='open',calendarMonth=new Date(new Date().getFullYear(),new Date().getMonth(),1),selectedCalendarDate=dt();
const clubBy=id=>db.clubs.find(c=>c.id===id);const who=id=>db.users.find(u=>u.id===id)?.name||'Unassigned';
function exlPoc(i){if(i.exlPoc)return i.exlPoc;const p=(i.participants||[]).find(x=>(x.role||'').toLowerCase().includes('poc'))||(i.participants||[])[0];return p?.name||who(i.owner)}
function clubPoc(i){return i.clubPoc||(i.stakeholders||[])[0]?.name||'Not recorded'}
function clubPocDesignation(i){return i.clubPocDesignation||(i.stakeholders||[])[0]?.role||'Designation not recorded'}
function contactMeta(i){return 'Advisor / EXL POC: '+esc(exlPoc(i))+' · Club/client POC: '+esc(clubPoc(i))+' — '+esc(clubPocDesignation(i))}
function nextStepLabel(i){return i.nextStepType==='Other'&&i.nextStepDetail?'Other · '+i.nextStepDetail:i.nextStepType||'Yet to be decided'}
function nextStepPill(i){const tag=i.nextStepType||'Yet to be decided';const n=Math.max(0,NEXT_STEP_TYPES.indexOf(tag));return '<span class="next-step-tag next-tag-'+n+'">'+esc(nextStepLabel(i))+'</span>'}
function interactionNextMeeting(i,meetings=db.meetings||[]){
 const related=meetings.filter(m=>m.id===i.meetingId||m.interactionId===i.id);
 const linked=related.find(m=>m.id===i.meetingId&&m.status==='Planned')||related.find(m=>m.status==='Planned');
 if(linked)return linked;
 if(i.nextMeeting&&!related.some(m=>m.date===i.nextMeeting))return {date:i.nextMeeting,time:i.nextMeetingTime||'',meetingType:'Follow-up meeting',clubPoc:i.clubPoc||'',agenda:i.nextAgenda||'',status:'Planned'};
 return null;
}
function followupControls(f){if(!followupCanEdit(f))return '';return f.status==='Open'?`<span class="followup-controls"><button type="button" class="action-link follow-action" data-follow-status="${esc(f.id)}" data-next="Done">Mark done</button><button type="button" class="action-link follow-action cancel-follow-action" data-follow-status="${esc(f.id)}" data-next="Canceled">Cancel action</button></span>`:`<button type="button" class="action-link follow-action" data-follow-status="${esc(f.id)}" data-next="Open">Reopen</button>`}
const initials=n=>n.split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase();
const companyAccessFor=(advisor=user().id)=>db.companyAccess?.[advisor]||{mode:'all',companyIds:[],revision:0};
const canSeeClub=id=>!!clubBy(id)&&(isStaff()||companyAccessFor().mode==='all'||companyAccessFor().companyIds.includes(id));
const canCreateCompany=()=>!isStaff()&&companyAccessFor().mode==='all';
const visibleClubs=()=>db.clubs.filter(c=>canSeeClub(c.id));
const visibleInteractions=()=>db.interactions.filter(i=>(isStaff()||i.owner===user().id)&&canSeeClub(i.clubId));
const visibleMeetings=()=>db.meetings.filter(m=>m.status==='Planned'&&(isStaff()||m.owner===user().id)&&canSeeClub(m.clubId));
const allFollowups=()=>[...db.interactions.flatMap(i=>(i.followups||[]).map(f=>({...f,interaction:i,club:clubBy(i.clubId)}))).filter(f=>isStaff()||f.owner===user().id||f.interaction.owner===user().id),...(isStaff()?[]:(db.assignedFollowups||[]).map(f=>({...f,interaction:{id:f.interactionId,owner:f.interactionOwner,clubId:f.clubId},club:clubBy(f.clubId)})))].filter(f=>canSeeClub(f.club?.id));
let navigationRequest=0;
async function refreshWorkspace(request){
 const response=await fetch('/api/state');const result=await response.json();
 if(!response.ok||!result.state)throw new Error(result.error||'Could not refresh the workspace');
 if(request!==navigationRequest)return;
 db=result.state;
 clearWorkspaceCache();
}
async function navigateToPage(id){
 const request=++navigationRequest;
 try{await refreshWorkspace(request);if(request!==navigationRequest)return;page=id==='digest'?'home':id;selectedClub=null;editingInteraction=null;meetingToComplete=null;app()}
 catch(error){if(request===navigationRequest)toast(error.message)}
}

function fmt(d,opts={month:'short',day:'numeric',year:'numeric'}){if(!d)return '—';return new Date(`${d}T12:00:00`).toLocaleDateString('en-US',opts)}function relative(d){const delta=Math.round((new Date(d+'T12:00:00')-new Date(dt()+'T12:00:00'))/86400000);return delta<0?`${Math.abs(delta)}d overdue`:delta===0?'Due today':delta===1?'Due tomorrow':`Due in ${delta}d`}
function toast(msg){const el=document.createElement('div');el.className='toast';el.setAttribute('role','status');el.setAttribute('aria-live','polite');el.setAttribute('aria-atomic','true');el.textContent=msg;document.body.append(el);setTimeout(()=>el.remove(),3500)}
function icon(name){return ({home:'◫',clubs:'▦',log:'＋',followups:'✓',digest:'◷',admin:'⚙',advisors:'◎'})[name]||'•'}
function app(){const u=user();document.getElementById('app').innerHTML=`<a class="skip-link" href="#view">Skip to main content</a><div class="app-shell"><aside class="sidebar"><div class="brand"><div class="brand-mark">A</div><div><div class="brand-name">Advisor Activity Tracker</div><div class="brand-sub">Advisor activity</div></div></div><div class="nav-label">Workspace</div><nav class="nav">${[['home','Overview'],['clubs','CME directory'],...(isStaff()?[['advisors','Advisors'],['time-expenses','Timesheets & expenses']]:[]),...(isStaff()?[]:[['log','Log interaction']]),['followups',isStaff()?'Next steps summary':'My next steps'],...(isStaff()?[]:[['time-expenses','Time & expenses'],['contracts','My contract terms']])].map(([id,label])=>`<button class="${(page===id||(id==='home'&&page==='digest'))?'active':''}" data-page="${id}" aria-label="${label}" aria-current="${(page===id||(id==='home'&&page==='digest'))?'page':'false'}"><span class="nav-icon">${icon(id)}</span><span>${label}</span></button>`).join('')}${isStaff()?`<div class="nav-divider"></div><div class="nav-label">Administration</div><button class="${page==='admin'?'active':''}" data-page="admin" aria-current="${page==='admin'?'page':'false'}" aria-label="Workspace users"><span class="nav-icon">${icon('admin')}</span><span>Workspace users</span></button><button class="${page==='contracts'?'active':''}" data-page="contracts" aria-current="${page==='contracts'?'page':'false'}" aria-label="Advisor / EXL POC contracts"><span class="nav-icon">▤</span><span>Advisor / EXL POC contracts</span></button>`:''}</nav><div class="sidebar-bottom"><div class="profile"><div class="avatar">${initials(u.name)}</div><div><div class="profile-name">${esc(u.name)}</div><div class="profile-role">${esc(u.title==='Internal POC'?'Advisor / EXL POC':u.title)}</div></div><button class="signout" id="signout">Sign out</button></div><div class="creator-credit"><span>Designed &amp; built by</span><strong>NARENTHER MS</strong></div></div></aside><main class="main"><header class="topbar"><div class="crumb">Advisor activity <span style="color:#bbc5bd"> / </span> ${pageLabel()}</div><div class="top-right"><span class="today">${new Date().toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}</span><div class="user-small"><div class="avatar">${initials(u.name)}</div>${esc(u.name)}</div><button class="btn top-signout" id="signout-top" type="button">Sign out</button></div></header><div class="content" id="view" tabindex="-1"></div></main></div>`;renderPage();bindShell()}
function pageLabel(){return ({home:'Overview',advisors:'Advisors','time-expenses':isStaff()?'Timesheets & expenses':'Time & expenses',clubs:'CME directory',log:'Log interaction',followups:isStaff()?'Next steps summary':'My next steps',contracts:isStaff()?'Advisor / EXL POC contracts':'My contract terms',digest:'Overview',admin:'Workspace users',club:'Club detail'})[page]||'Overview'}
function bindShell(){document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>navigateToPage(b.dataset.page));document.querySelectorAll('#signout,#signout-top').forEach(b=>b.onclick=signOut)}
function resetAccountState(){
 accountEpoch++;navigationRequest++;clearWorkspaceCache();db=freshDB();page='home';
 selectedClub=null;editingMeeting=null;editingInteraction=null;meetingToComplete=null;activeDigestItems=[];
 contractAllowances=[];advisorTimeEntries=[];selectedAdvisorId=null;selectedContractUser='';editContractsMode=false;selectedCompanyAdvisor='';
 directoryLeague='';advisorActivityMode='all';advisorActivityFrom='';advisorActivityTo='';timeExpenseTab='time';
}
async function signOut(){
 resetAccountState();const epoch=accountEpoch;
 document.getElementById('app').innerHTML='<main class="login-screen"><div role="status">Signing out…</div></main>';
 let message='';
 try{const response=await fetch('/api/logout',{method:'POST',credentials:'same-origin'});if(!response.ok)throw new Error('Sign-out was not confirmed')}
 catch{message='Account data was cleared from this browser, but server sign-out could not be confirmed. Reconnect before signing in again.'}
 if(epoch===accountEpoch)loginPage(message);
}
function head(kicker,title,desc,action=''){return `<div class="page-head"><div><div class="greeting">${kicker}</div><h1 class="page-title">${title}</h1><p class="page-desc">${desc}</p></div>${action?`<div class="head-actions">${action}</div>`:''}</div>`}
function stat(label,note,value,ico){return `<div class="stat-card"><div class="stat-top"><div class="stat-label">${label}</div><div class="stat-icon">${ico}</div></div><div class="stat-num">${value}</div><div class="stat-note">${note}</div></div>`}
function clubShort(c){return c?.name||'Unknown club'}function leagueTag(l){return `<span class="pill blue">${l}</span>`}function capsTags(a,other){return (a||[]).map(c=>`<span class="pill ${c==='Other'?'orange':'green'}">${esc(c==='Other'&&other?`Other · ${other}`:c)}</span>`).join('')}
function clubLogoUrl(c){const names=LEAGUES[c.league]||[],index=names.indexOf(c.name),code=LOGO_CODES[c.league]?.[index],sport={NFL:'nfl',MLB:'mlb',MLS:'soccer',NHL:'nhl',NBA:'nba'}[c.league];return code&&sport?`https://a.espncdn.com/i/teamlogos/${sport}/500/${code}.png`:''}
function bindFieldLabels(root){root.querySelectorAll('.field').forEach(field=>{const label=field.querySelector(':scope > label'),control=field.querySelector('input:not([type=hidden]),select,textarea');if(!label||!control||label.htmlFor)return;if(!control.id)control.id='field-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,9);label.htmlFor=control.id})}
function renderPage(){const v=$('#view');if(page==='advisors'){renderAdvisors(v);return}if(page==='time-expenses'){renderTimeExpenses(v);return}if(page==='contracts'){renderContracts(v);return}if(page==='home')v.innerHTML=homePage();else if(page==='clubs')v.innerHTML=clubsPage();else if(page==='club')v.innerHTML=clubPage();else if(page==='log')v.innerHTML=isStaff()?`${head('ADMIN VIEW','Interaction entry is for regular users','The Admin account reviews activity. Sign in as an advisor / EXL POC to log a conversation.')}`:interactionForm();else if(page==='followups')v.innerHTML=followupsPage();else if(page==='digest')v.innerHTML=digestPage();else if(page==='admin')v.innerHTML=adminPage();bindFieldLabels(v);bindPage()}
function homePage(){return digestPage()}
function activityRow(i){const c=clubBy(i.clubId);return '<div class="activity-row"><div class="league-mark">'+(c?.league||'—')+'</div><div><div class="activity-club">'+esc(clubShort(c))+'</div><div class="activity-meta">'+fmt(i.date)+' · '+contactMeta(i)+'</div><div class="activity-summary">'+esc(i.summary)+'</div><div class="cap-list">'+capsTags(i.capabilities,i.other)+'</div></div><button class="action-link" data-open-club="'+i.clubId+'">History →</button></div>'}
function meetingTypeLabel(type){
 if(type==='Discovery meeting'||type==='Working session')return 'Follow-up meeting';
 return type||'Planned meeting';
}
function meetingCard(m){const c=clubBy(m.clubId);const d=new Date(m.date+'T12:00:00');return `<div class="meeting-item"><div class="date-box"><span class="month">${d.toLocaleDateString('en-US',{month:'short'})}</span><span class="day">${d.getDate()}</span></div><div><div class="meeting-name">${esc(clubShort(c))} <span class="pill blue">${esc(meetingTypeLabel(m.meetingType))}</span></div><div class="meeting-info"><strong>Meeting:</strong> ${fmt(m.date)} · ${esc(meetingTimeLabel(m.time))}${m.clubPoc?' · '+esc(m.clubPoc)+(m.clubPocDesignation?' — '+esc(m.clubPocDesignation):''):''}</div>${isStaff()?`<div class="meeting-info"><strong>Meeting owner:</strong> ${esc(who(m.owner))}</div>`:''}${m.agenda?`<div class="meeting-info"><strong>Agenda:</strong> ${esc(m.agenda)}</div>`:''}</div></div>`}
function taskCard(f){const statusClass=f.status==='Done'?'green':f.status==='Canceled'?'red':'orange';return `<div class="task-item"><span class="task-dot ${f.due<dt()&&f.status==='Open'?'overdue':''}"></span><div class="task-card-content"><div class="task-name">${esc(f.description)}</div><div class="task-info">${esc(clubShort(f.club))} · Action due ${fmt(f.due)} · Owner: ${esc(who(f.owner))}</div><div class="task-card-footer"><span class="pill ${statusClass}">${esc(f.status)}${f.status==='Open'&&f.due<dt()?' · Overdue':''}</span>${followupControls(f)}</div></div></div>`}
let directoryLeague='';
const directoryLeagues={
 NFL:['National Football League','https://a.espncdn.com/i/teamlogos/leagues/500/nfl.png'],
 MLB:['Major League Baseball','https://a.espncdn.com/i/teamlogos/leagues/500/mlb.png'],
 MLS:['Major League Soccer','https://a.espncdn.com/i/leaguelogos/soccer/500/19.png'],
 NHL:['National Hockey League','https://a.espncdn.com/i/teamlogos/leagues/500/nhl.png'],
 NBA:['National Basketball Association','https://a.espncdn.com/i/teamlogos/leagues/500/nba.png'],
 Other:['Companies and organizations','']
};
function clubsPage(){
 const directory=Object.entries(directoryLeagues).map(([league,[name,logo]])=>`<button type="button" class="directory-league-card" data-directory-league="${league}" aria-pressed="${directoryLeague===league}">
 <span class="directory-league-logo" aria-hidden="true">${logo?`<img src="${logo}" alt="" width="88" height="88">`:'<span class="directory-other-icon">＋</span>'}</span>
 <span class="directory-league-title">${league}</span><span class="directory-league-name">${name}</span>
 <span class="directory-league-arrow" aria-hidden="true">→</span></button>`).join('');
 return `${head('','CME directory','','')}<div class="directory-leagues" role="group" aria-label="League or organization type">${directory}</div>
 ${directoryLeague?`<section class="card directory-results" aria-label="${directoryLeague} directory"><div class="card-head"><h2 class="card-title">${directoryLeagues[directoryLeague][0]}</h2>
 <label class="directory-search"><span>${directoryLeague==='Other'?'Search organizations':'Search clubs'}</span><input class="input" type="search" id="club-search"></label>
 ${directoryLeague==='Other'&&canCreateCompany()?'<form id="directory-organization" class="directory-search"><label>Company or organization name <input class="input" name="organizationName" maxlength="120" required></label><button class="btn primary">Log interaction</button></form>':''}</div>
 <div class="club-list" id="club-results">${clubCards(visibleClubs().filter(club=>club.league===directoryLeague))}</div></section>`:''}`;
}
function clubCards(clubs){return clubs.length?clubs.map(c=>{const n=visibleInteractions().filter(i=>i.clubId===c.id).length,logo=clubLogoUrl(c);return `<button type="button" class="club-card" data-league="${c.league}" data-open-club="${c.id}" aria-label="Open ${esc(c.name)}, ${n} ${n===1?'interaction':'interactions'}"><span class="club-logo">${initials(c.name)}${logo?`<img class="club-logo-img" src="${logo}" alt="" aria-hidden="true" loading="lazy" decoding="async" referrerpolicy="no-referrer">`:''}</span><span class="club-main"><span class="club-name">${esc(c.name)}</span><span class="club-meta">${c.league}</span></span><span class="club-count">${n} ${n===1?'interaction':'interactions'}</span></button>`}).join(''):`<div class="empty">No companies found.</div>`}
function clubOverview(club,interactions,plannedMeetings){
 const exl=new Map(),stakeholders=new Map();
 const add=(map,name,role='')=>{if(!name)return;const key=name.trim().toLowerCase();if(!map.has(key))map.set(key,{name:name.trim(),roles:new Set()});if(role)map.get(key).roles.add(role.trim())};
 interactions.forEach(i=>{const p=(i.participants||[]).find(x=>x.name===i.exlPoc)||(i.participants||[]).find(x=>(x.role||'').toLowerCase().includes('advisor'))||(i.participants||[])[0];add(exl,i.exlPoc||p?.name,p?.role);(i.stakeholders||[]).forEach(x=>add(stakeholders,x.name,x.role));if(!(i.stakeholders||[]).length)add(stakeholders,i.clubPoc,i.clubPocDesignation)});
 plannedMeetings.forEach(m=>{add(exl,m.exlPoc);add(stakeholders,m.clubPoc,m.clubPocDesignation)});
 const dates=[...new Set(interactions.map(i=>i.date).filter(Boolean))].sort((a,b)=>b.localeCompare(a));
 const next=plannedMeetings.filter(m=>m.date>=dt()).sort((a,b)=>a.date.localeCompare(b.date));
 const contactList=items=>`<div class="club-contact-list">${items.map(({name,roles})=>`<div class="club-contact"><span class="club-contact-avatar">${esc(initials(name))}</span><span><strong>${esc(name)}</strong>${roles.size?`<small>${[...roles].map(esc).join(' · ')}</small>`:''}</span></div>`).join('')}</div>`;
 const cards=[];
 if(exl.size)cards.push(`<div class="club-overview-card exl-contact-card"><div class="club-overview-title"><strong>Advisor / EXL POC</strong></div>${contactList([...exl.values()])}</div>`);
 if(stakeholders.size)cards.push(`<div class="club-overview-card stakeholder-card"><div class="club-overview-title"><strong>Club stakeholders</strong></div>${contactList([...stakeholders.values()])}</div>`);
 if(dates.length)cards.push(`<div class="club-overview-card dates-card"><div class="club-overview-title"><strong>Meeting dates</strong></div><div class="meeting-date-chips">${dates.map(d=>`<span>${fmt(d)}</span>`).join('')}</div></div>`);
 if(next.length)cards.push(`<div class="club-overview-card next-meeting-card"><div class="club-overview-title"><strong>Next meeting</strong></div><div class="next-meeting-date">${fmt(next[0].date)} · ${esc(meetingTimeLabel(next[0].time))}</div><div class="next-meeting-caption">${esc(meetingTypeLabel(next[0].meetingType))}${next[0].clubPoc?' with '+esc(next[0].clubPoc):''}</div>${next.length>1?`<span class="meeting-more">+ ${next.length-1} more planned</span>`:''}</div>`);
 return cards.length?`<section class="club-overview">${cards.join('')}</section>`:'';
}
function clubInteractionCard(i,{meetings,readOnly=false}={}){
 const stakeholders=(i.stakeholders||[]).length?i.stakeholders:[{name:i.clubPoc||'',role:i.clubPocDesignation||''}].filter(x=>x.name);
 const steps=i.followups||[];
 const nextMeeting=interactionNextMeeting(i,meetings);
 return `<article class="club-history-card"><header class="club-history-head"><span class="club-history-calendar">▦</span><div class="club-history-date"><small>INTERACTION DATE</small><strong>${fmt(i.date)}</strong></div><div class="club-history-status"><small>NEXT-STEP STATUS</small>${nextStepPill(i)}</div></header><div class="club-history-contacts"><div class="club-history-contact exl-contact"><span class="contact-kicker">Advisor / EXL POC</span><strong>${esc(exlPoc(i))}</strong></div><div class="club-history-contact stakeholder-contact"><span class="contact-kicker">CLUB STAKEHOLDERS</span><div class="stakeholder-name-list">${stakeholders.length?stakeholders.map(x=>`<span class="stakeholder-name"><strong>${esc(x.name)}</strong>${x.role?`<small>${esc(x.role)}</small>`:''}</span>`).join(''):'<span class="contact-missing">Not recorded</span>'}</div></div></div><div class="club-history-summary"><div class="club-history-label">Interaction summary</div><p>${esc(i.summary||'No discussion summary recorded.')}</p>${i.capabilities?.length?`<div class="club-history-label solution-label">Capabilities discussed</div><div class="cap-list">${capsTags(i.capabilities,i.other)}</div>`:''}</div>${nextMeeting?`<div class="interaction-meeting-callout"><small>NEXT MEETING</small><strong>${fmt(nextMeeting.date)} · ${esc(meetingTimeLabel(nextMeeting.time))}</strong><span>${esc(meetingTypeLabel(nextMeeting.meetingType))}${nextMeeting.clubPoc?' · '+esc(nextMeeting.clubPoc):''}</span>${nextMeeting.agenda?`<span class="meeting-agenda"><strong>Agenda:</strong> ${esc(nextMeeting.agenda)}</span>`:''}</div>`:''}${steps.length?`<div class="club-history-next"><div class="club-history-label">Follow-up actions</div><div class="club-history-step-list">${steps.map(f=>`<div class="club-history-step"><div><strong>${esc(f.description)}</strong><small>Action due ${fmt(f.due)} · Owner: ${esc(who(f.owner))}</small></div><div class="club-history-step-state"><span class="pill ${f.status==='Open'?'orange':f.status==='Done'?'green':'red'}">${esc(f.status)}${f.status==='Open'&&f.due<dt()?' · Overdue':''}</span>${readOnly?'':followupControls({...f,interaction:i})}</div></div>`).join('')}</div></div>`:''}</article>`
}
function clubPage(){
 const c=clubBy(selectedClub);if(!c||!canSeeClub(c.id)){page='clubs';return clubsPage()}
 const ix=visibleInteractions().filter(i=>i.clubId===c.id).sort((a,b)=>b.date.localeCompare(a.date));
 const meetings=visibleMeetings().filter(m=>m.clubId===c.id).sort((a,b)=>a.date.localeCompare(b.date));
 const clubSteps=allFollowups().filter(f=>f.club?.id===c.id).sort((a,b)=>a.due.localeCompare(b.due));
 const fs=clubSteps.filter(f=>f.status==='Open');
 const body=clubTab==='history'
  ? `<div class="club-history-list">${ix.length?ix.map(clubInteractionCard).join(''):'<div class="empty"><div class="empty-icon">◉</div>No interactions for this club yet.</div>'}</div>`
  : clubTab==='meetings'
   ? `<div class="table-wrap scroll-list" tabindex="0" role="region" aria-label="Planned meetings"><table class="table"><thead><tr><th>Meeting date & time</th><th>Participants & agenda</th><th>Owner</th>${isStaff()?'':'<th>Actions</th>'}</tr></thead><tbody>${meetings.length?meetings.map(m=>`<tr><td><div class="cell-title">${fmt(m.date)}</div><div class="cell-sub">${esc(meetingTimeLabel(m.time))}</div></td><td><div class="cell-title">${esc(meetingTypeLabel(m.meetingType))} · ${esc(m.clubPoc||'Club/client POC TBD')}</div><div class="cell-sub">Advisor / EXL POC: ${esc(m.exlPoc||'TBD')}${m.clubPocDesignation?' · '+esc(m.clubPocDesignation):''} · ${esc(m.agenda||'No agenda')}</div></td><td>${esc(who(m.owner))}</td>${isStaff()?'':`<td>${meetingActions(m)}</td>`}</tr>`).join(''):`<tr><td colspan="${isStaff()?3:4}"><div class="empty">No meetings planned.</div></td></tr>`}</tbody></table></div>`
   : `<div class="table-wrap scroll-list" tabindex="0" role="region" aria-label="Next steps"><table class="table"><thead><tr><th>Action</th><th>Owner</th><th>Action due date</th><th>Status</th>${isStaff()?'':'<th scope="col">Actions</th>'}</tr></thead><tbody>${clubSteps.length?clubSteps.map(f=>`<tr><td><div class="cell-title">${esc(f.description)}</div></td><td>${esc(who(f.owner))}</td><td>${fmt(f.due)} ${f.status==='Open'&&f.due<dt()?'<span class="pill red">Overdue</span>':''}</td><td><span class="pill ${f.status==='Open'?'orange':f.status==='Done'?'green':'red'}">${esc(f.status)}</span></td>${isStaff()?'':`<td>${followupControls(f)}</td>`}</tr>`).join(''):`<tr><td colspan="${isStaff()?4:5}"><div class="empty">No follow-up actions recorded.</div></td></tr>`}</tbody></table></div>`;
 const capabilities=[...new Set(ix.flatMap(x=>(x.capabilities||[]).map(cap=>cap==='Other'&&x.other?'Other · '+x.other:cap)))];
 const firstMeeting=ix.length?ix.reduce((earliest,x)=>x.date<earliest.date?x:earliest,ix[0]).date:'';
 const snapshot=ix.length?`<section class="card relationship-snapshot"><div class="snapshot-metrics"><div class="snapshot-metric"><small>FIRST MEETING</small><strong>${fmt(firstMeeting,{month:'short',day:'numeric',year:'numeric'})}</strong></div><div class="snapshot-metric"><small>COMPLETED INTERACTIONS</small><strong>${ix.length}</strong></div><div class="snapshot-metric snapshot-capability-metric"><small>CAPABILITIES DISCUSSED</small><div class="cap-list">${capabilities.length?capabilities.map(cap=>`<span class="snapshot-capability">${esc(cap)}</span>`).join(''):'<span class="snapshot-empty">None recorded</span>'}</div></div></div></section>`:'';
 const upcoming=meetings.filter(m=>m.date>=dt()),upcomingSteps=fs;
 const followthrough=upcoming.length||upcomingSteps.length?`<div class="club-followthrough">${upcoming.length?`<section class="card"><div class="card-head"><div><div class="card-title">Upcoming meetings</div></div></div><div class="card-body scroll-list" tabindex="0" role="region" aria-label="Upcoming meetings">${upcoming.map(meetingCard).join('')}</div></section>`:''}${upcomingSteps.length?`<section class="card"><div class="card-head"><div><div class="card-title">Next steps</div></div></div><div class="card-body scroll-list" tabindex="0" role="region" aria-label="Next steps">${upcomingSteps.map(taskCard).join('')}</div></section>`:''}</div>`:'';
 const details=snapshot||followthrough?`<div class="detail-columns ${snapshot&&followthrough?'':'single-detail-column'}">${snapshot}${followthrough}</div>`:'';
 return `${head('CLUB RELATIONSHIP',esc(c.name),ix.length?`${c.league} · ${ix.length} completed ${ix.length===1?'interaction':'interactions'}`:c.league,`<button class="btn" data-page="clubs">← &nbsp; CME directory</button>${isStaff()?'':`<button class="btn primary" data-log-club="${c.id}">＋ &nbsp; Log interaction</button>`}`)}<div class="card">${clubOverview(c,ix,meetings)}<div class="club-tabs"><button class="club-tab ${clubTab==='history'?'active':''}" data-tab="history">Interaction history${ix.length?` (${ix.length})`:''}</button><button class="club-tab ${clubTab==='meetings'?'active':''}" data-tab="meetings">Planned meetings${meetings.length?` (${meetings.length})`:''}</button><button class="club-tab ${clubTab==='followups'?'active':''}" data-tab="followups">Next steps${clubSteps.length?` (${clubSteps.length})`:''}</button></div><div id="club-tab-body">${body}</div></div>${details}`;
}
function historyPreview(id){const c=clubBy(id);if(!c||!canSeeClub(id))return '';const history=visibleInteractions().filter(x=>x.clubId===id).sort((a,b)=>b.date.localeCompare(a.date));if(!history.length)return `<div class="note" style="margin:0 0 14px">No previous interactions for ${esc(c.name)} yet.</div>`;return `<div class="card" style="margin-bottom:14px"><div class="card-head"><div><div class="card-title">${esc(c.name)} · recent history</div></div><button type="button" class="link-btn" data-open-club="${c.id}">Open club →</button></div><div class="card-body">${history.slice(0,2).map(x=>`<div class="activity-row"><div class="league-mark">${c.league}</div><div><div class="activity-club">${fmt(x.date)}</div><div class="activity-summary">${esc(x.summary)}</div><div class="cap-list">${capsTags(x.capabilities,x.other)}</div></div></div>`).join('')}</div></div>`}
function meetingCapabilityFields(name, selected=[], id=''){
 return `<fieldset class="meeting-capability-fields field full"${id?` id="${id}" hidden`:''}><legend>Capabilities planned for discussion</legend><div class="check-grid">${CAPS.filter(cap=>cap!=='Other').map(cap=>`<label class="check-option"><input type="checkbox" name="${name}" value="${esc(cap)}"${selected.includes(cap)?' checked':''}>${esc(cap)}</label>`).join('')}</div></fieldset>`;
}

function syncMeetingCapabilities(form){
 const planned=form.elements.recordMode?.value==='planned';
 const direct=form.querySelector('#planned-meeting-capabilities');
 const followup=form.querySelector('#next-meeting-capabilities');
 direct.hidden= !planned;
 direct.disabled= !planned;
 followup.hidden=planned||!form.elements.nextMeeting.value;
 followup.disabled=followup.hidden;
 if(!followup.dataset.custom){
  const selected=new Set([...form.querySelectorAll('[name=capability]:checked')].map(input=>input.value));
  followup.querySelectorAll('input').forEach(input=>{input.checked=selected.has(input.value)});
 }
}

function findOrganization(name){
 return visibleClubs().find(club=>club.league==='Other'&&club.name.toLowerCase()===name.toLowerCase());
}

function organizationField(){
 return '<label class="field full organization-name-field" hidden><span>Company or organization name *</span><input class="input" name="organizationName" maxlength="120" disabled></label>';
}

function syncOrganizationField(form){
 const custom=form.elements.clubId.value==='new-organization';
 form.querySelector('.organization-name-field').hidden=!custom;
 form.elements.organizationName.disabled=!custom;
 form.elements.organizationName.required=custom;
}

async function reloadLatestSaveForm(){
 const target={page,club:selectedClub,interactionId:editingInteraction?.id,meetingId:meetingToComplete},request=++navigationRequest;
 try{
  await refreshWorkspace(request);if(request!==navigationRequest)return;
  page=target.page;selectedClub=target.club;
  editingInteraction=target.interactionId?db.interactions.find(item=>item.id===target.interactionId):null;
  meetingToComplete=target.meetingId&&db.meetings.some(item=>item.id===target.meetingId&&item.status==='Planned')?target.meetingId:null;
  if((target.interactionId&&!editingInteraction)||(target.meetingId&&!meetingToComplete)){page='clubs';app();toast('This record is no longer available to edit');return}
  app();
 }catch(error){if(request===navigationRequest)toast(error.message)}
}
async function persistInteractionChanges(form,previous){
 const submit=form?.querySelector('button[type="submit"],button:not([type])'),epoch=accountEpoch;
 form?.querySelector('[data-save-error]')?.remove();
 if(submit)submit.disabled=true;
 try{return await save()}
 catch(error){
  if(epoch!==accountEpoch)return false;
  db=previous;
  if(form){
   const box=document.createElement('div');box.className='time-expense-error';box.dataset.saveError='';box.setAttribute('role','alert');box.textContent=error.message;
   if(error.status===409){const reload=document.createElement('button');reload.type='button';reload.className='btn';reload.textContent='Reload latest data';reload.onclick=reloadLatestSaveForm;box.append(reload)}
   form.append(box);
  }
  toast(error.message||'Unable to save this record');return false;
 }finally{if(submit)submit.disabled=false}
}

function organizationForEntry(data){
 const clubId=data.get('clubId');
 if(clubId!=='new-organization')return canSeeClub(clubId)?clubBy(clubId):null;
 if(!canCreateCompany())return null;
 const name=String(data.get('organizationName')||'').trim();
 return name&&name.length<=120?(findOrganization(name)||{id:'org-'+crypto.randomUUID(),name,league:'Other'}):null;
}

function interactionForm(prefill=''){
 const clubs=visibleClubs().slice().sort((a,b)=>a.name.localeCompare(b.name)),i=editingInteraction,scheduled=meetingToComplete?db.meetings.find(m=>m.id===meetingToComplete):null,planned=null,cId=prefill||i?.clubId||scheduled?.clubId||'';
 const stakeholder=(i?.stakeholders||[])[0]||{},participant=(i?.participants||[])[0]||{};
 const clientName=i?.clubPoc||stakeholder.name||scheduled?.clubPoc||'',clientRole=i?.clubPocDesignation||stakeholder.role||scheduled?.clubPocDesignation||'';
 const exlName=i?.exlPoc||participant.name||scheduled?.exlPoc||user().name;
 const followups=i?.followups?.length?i.followups:[{description:'',owner:user().id,due:'',status:'Open'}];
 const clubOptions=clubs.map(c=>'<option value="'+c.id+'" '+(c.id===cId?'selected':'')+'>'+esc(c.name)+' · '+c.league+'</option>').join('');
 const capOptions=CAPS.map(c=>'<label class="check-option"><input type="checkbox" name="capability" value="'+esc(c)+'" '+((i?.capabilities||scheduled?.capabilities||[]).includes(c)?'checked':'')+'>'+esc(c)+'</label>').join('');
 const nextOptions=NEXT_STEP_TYPES.map(x=>'<option '+((i?.nextStepType||'Yet to be decided')===x?'selected':'')+'>'+esc(x)+'</option>').join('');
 const existingNext=i?interactionNextMeeting(i):null;
 const isEdit=!!i||!!scheduled;
 return head(i?'EDIT INTERACTION':planned?'COMPLETE PLANNED MEETING':'CAPTURE THE CONVERSATION',i?'Update interaction':planned?'Complete planned meeting':'Log an interaction','Record a completed conversation or schedule a future meeting.', '<button class="btn" data-page="clubs">Cancel</button>')
 +'<div class="form-wrap"><div id="club-history-slot">'+historyPreview(cId)+'</div><form class="card form-card" id="interaction-form">'
 +'<div class="form-section"><h3 class="form-section-title">01 &nbsp; Meeting details</h3><div class="form-grid">'
 +(!isEdit?'<div class="field"><label>What are you recording? *</label><select class="select" name="recordMode" id="record-mode"><option value="interaction">Completed interaction</option><option value="planned">Plan a meeting</option></select></div>':'')
 +'<div class="field"><label>Club or organization *</label><select class="select" name="clubId" required><option value="">Select a club or organization</option>'+clubOptions+(canCreateCompany()?'<option value="new-organization">Other — enter a company name</option>':'')+'</select></div>'+organizationField()+'<div class="field"><label id="date-label">'+(planned?'Meeting date *':'Interaction date *')+'</label><input class="input" name="date" type="date" value="'+(i?.date||scheduled?.date||dt())+'" required></div><div class="field" id="planned-time-wrap" style="'+(planned?'':'display:none')+'"><label>Meeting time (optional)</label><input class="input" name="meetingTime" type="time" value="'+(scheduled?.time||'')+'"></div>'
 +'<div class="field" id="meeting-type-wrap" style="'+(planned?'':'display:none')+'"><label>Meeting type *</label><select class="select" name="meetingType" id="meeting-type"><option value="First meeting" '+((planned?.meetingType||'First meeting')==='First meeting'?'selected':'')+'>First meeting</option><option value="Follow-up meeting" '+(planned?.meetingType==='Follow-up meeting'?'selected':'')+'>Follow-up meeting</option></select></div>'
 +meetingCapabilityFields('plannedCapability',[],'planned-meeting-capabilities')
 +'<label class="field" id="meeting-duration-field"><span>Actual meeting duration (minutes)'+(scheduled?' *':'')+'</span><input class="input" type="number" name="meetingMinutes" min="1" max="1440" step="1" value="'+(i?.meetingMinutes||'')+'" '+(scheduled?'required':'')+'></label>'
 +'<div class="field full"><label>Advisor / EXL POC *</label><div id="participant-rows"><div class="attendee-row poc-single"><input class="mini-input" name="participantName" placeholder="Advisor / EXL POC" value="'+esc(exlName)+'" required><input type="hidden" name="participantRole" value="EXL POC"></div></div></div>'
 +'<div class="field full"><label>Club/client POC *</label><div id="stakeholder-rows"><div class="attendee-row poc-pair"><input class="mini-input" name="stakeholderName" placeholder="Club/client point of contact" value="'+esc(clientName)+'" required><input class="mini-input" name="stakeholderRole" placeholder="Designation" value="'+esc(clientRole)+'" required></div></div></div>'
 +'<div class="field full"><label id="summary-label">'+(planned?'Meeting agenda *':'Discussion summary *')+'</label><textarea class="textarea" name="summary" required placeholder="'+(planned?'Describe the introductory meeting and what you plan to discuss.':'What did you discuss?')+'">'+esc(i?.summary||scheduled?.agenda||'')+'</textarea></div></div></div>'
 +'<div id="completed-only-fields" style="'+(planned?'display:none':'')+'"><div class="form-section"><h3 class="form-section-title">02 &nbsp; Capabilities discussed</h3><div class="check-grid">'+capOptions+'</div><div class="field" id="other-field" style="margin-top:10px;'+((i?.capabilities||[]).includes('Other')?'':'display:none')+'"><label>What else was discussed?</label><input class="input" name="other" placeholder="Add a capability or topic" value="'+esc(i?.other||'')+'"></div></div>'
 +'<div class="form-section"><h3 class="form-section-title">03 &nbsp; Relationship status and next meeting</h3><div class="form-grid"><div class="field"><label>Next-step status *</label><select class="select" name="nextStepType" required>'+nextOptions+'</select></div><div class="field full" id="next-step-detail"><label>Describe the next step *</label><input class="input" name="nextStepDetail" maxlength="300" value="'+esc(i?.nextStepDetail||'')+'"></div><div class="field"><label>Next meeting date</label><input class="input" type="date" name="nextMeeting" value="'+(i?.nextMeeting||'')+'"></div><div class="field"><label>Meeting time (optional)</label><input class="input" type="time" name="nextMeetingTime" value="'+(i?.nextMeetingTime||'')+'"></div><div class="field full"><label>Next meeting agenda (required when a date is set)</label><input class="input" name="nextAgenda" value="'+esc(i?.nextAgenda||'')+'" placeholder="Topic for the next conversation"></div>'+meetingCapabilityFields('nextMeetingCapability',existingNext?.capabilities||[],'next-meeting-capabilities')+'</div></div>'
 +'<div class="form-section"><label class="optional-action-toggle"><input type="checkbox" name="hasFollowups" aria-controls="followup-fields" '+(i?.followups?.length?'checked':'')+'> Add follow-up actions</label><div id="followup-fields" hidden><div class="followup-row-labels" aria-hidden="true"><span>Action</span><span>Owner</span><span>Action due date</span><span>Status</span><span></span></div><div id="followup-rows" style="margin-top:10px">'+followups.map(f=>followRow(f)).join('')+'</div><button type="button" class="btn small" data-add-row="followup">＋ Add action</button></div></div></div>'
 +'<div class="form-actions"><button type="button" class="btn" data-page="clubs">Cancel</button><button class="btn primary" type="submit">'+(i?'Save changes':planned?'Save interaction':'<span id="submit-label">Save interaction</span>')+' &nbsp; →</button></div></form></div>';
}
function syncNextStepFields(){
 const planned=$('#record-mode')?.value==='planned';
 const toggle=$('[name=hasFollowups]'), fields=$('#followup-fields');
 if(fields){
  fields.hidden=!toggle.checked;
  fields.querySelectorAll('input,select,button').forEach(control=>control.disabled=planned||!toggle.checked);
 }
 const other=$('[name=nextStepType]')?.value==='Other';
 const detail=$('[name=nextStepDetail]');
 if(detail){
  $('#next-step-detail').hidden=!other;
  detail.disabled=planned||!other;
  detail.required=other;
 }
}
function syncInteractionMode(){const planned=$('#record-mode')?.value==='planned';const fields=$('#completed-only-fields'),type=$('#meeting-type-wrap'),time=$('#planned-time-wrap'),date=$('[name=date]'),meetingType=$('#meeting-type'),summary=$('[name=summary]'),agenda=$('[name=nextAgenda]');if(fields){fields.style.display=planned?'none':'';fields.querySelectorAll('input,select,textarea,button').forEach(x=>x.disabled=planned)}if(type)type.style.display=planned?'grid':'none';if(time)time.style.display=planned?'grid':'none';if(date)date.previousElementSibling.textContent=planned?'Meeting date *':'Interaction date *';if(meetingType)meetingType.required=planned;if(summary){summary.previousElementSibling.textContent=planned?'Meeting agenda *':'Discussion summary *';summary.placeholder=planned?'Describe the introductory meeting and what you plan to discuss.':'What did you discuss?'}if(agenda)agenda.required=!!agenda.value||!!$('[name=nextMeeting]')?.value;const submit=$('#submit-label');if(submit)submit.textContent=planned?'Save planned meeting':'Save interaction'}
function attendeeRow(a,kind){return `<div class="attendee-row"><input class="mini-input" name="${kind}Name" placeholder="Name" value="${esc(a.name)}"><input class="mini-input" name="${kind}Role" placeholder="Role" value="${esc(a.role)}"><button type="button" class="action-link" data-remove-row>×</button></div>`}
function followRow(f){return `<div class="follow-row" data-id="${esc(f.id||'')}"><label class="follow-field"><span>Action</span><input class="mini-input" name="followDescription" aria-label="Follow-up action description" placeholder="Describe the action" value="${esc(f.description)}"></label><label class="follow-field"><span>Owner</span><select class="mini-input" name="followOwner" aria-label="Action owner">${db.users.map(u=>`<option value="${u.id}" ${u.id===f.owner?'selected':''}>${esc(u.name)}</option>`).join('')}</select></label><label class="follow-field"><span>Action due date</span><input class="mini-input" type="date" aria-label="Action due date" name="followDue" value="${f.due||''}"></label><label class="follow-field"><span>Status</span><select class="mini-input" name="followStatus" aria-label="Action status">${['Open','Done','Canceled'].map(s=>`<option ${f.status===s?'selected':''}>${s}</option>`).join('')}</select></label><button type="button" class="action-link" aria-label="Remove follow-up action" data-remove-row>×</button></div>`}
function meetingActions(m){if(isStaff()||m.owner!==user().id)return '';return '<button class="action-link" data-meeting-edit="'+m.id+'">Edit</button><button class="action-link" data-meeting-complete="'+m.id+'">Complete</button><button class="action-link" data-meeting-cancel="'+m.id+'">Cancel</button>'}
function localDateKey(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function meetingTimeLabel(value){if(!value)return 'Time not set';const [hour,minute]=value.split(':').map(Number);return new Date(2000,0,1,hour,minute||0).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}
function meetingSteps(meeting){const interaction=visibleInteractions().find(i=>i.id===meeting.interactionId||i.meetingId===meeting.id);return (interaction?.followups||[]).map(f=>({...f,interaction,club:clubBy(interaction.clubId)}))}
function calendarMeetingPanel(meetings){return meetings.length?meetings.map(m=>{const steps=meetingSteps(m);return `<article class="calendar-detail-meeting"><div class="calendar-detail-top"><div><strong>${esc(clubShort(clubBy(m.clubId)))}</strong><span>Meeting: ${fmt(m.date)} · ${esc(meetingTimeLabel(m.time))}</span><small>${esc(meetingTypeLabel(m.meetingType))}${m.clubPoc?' · '+esc(m.clubPoc):''}</small></div></div>${steps.length?`<div class="calendar-detail-steps"><small>FOLLOW-UP ACTIONS</small>${steps.map(f=>`<div class="calendar-detail-step"><span>${esc(f.description)}</span><span class="pill ${f.status==='Open'?'orange':f.status==='Done'?'green':'red'}">${esc(f.status)}${f.status==='Open'&&f.due<dt()?' · Overdue':''}</span>${followupControls(f)}</div>`).join('')}</div>`:'<div class="calendar-no-steps">No follow-up actions linked to this meeting.</div>'}</article>`}).join(''):'<div class="calendar-empty-day"><span>◷</span><strong>No meetings scheduled</strong><small>Select another date to review its meetings.</small></div>'}
function calendarMarkup(){
 const year=calendarMonth.getFullYear(),month=calendarMonth.getMonth(),start=new Date(year,month,1),offset=(start.getDay()+6)%7,total=new Date(year,month+1,0).getDate(),slots=Math.ceil((offset+total)/7)*7;
 const meetings=visibleMeetings().filter(m=>m.date.slice(0,7)===`${year}-${String(month+1).padStart(2,'0')}`).sort((a,b)=>(a.time||'').localeCompare(b.time||''));
 const days=Array.from({length:slots},(_,n)=>{const number=n-offset+1;if(number<1||number>total)return '<div class="calendar-day outside"></div>';const date=localDateKey(new Date(year,month,number)),items=meetings.filter(m=>m.date===date),events=items.slice(0,3).map(m=>`<span class="calendar-event"><b>${esc(clubShort(clubBy(m.clubId)))}</b><small>${esc(meetingTimeLabel(m.time))}</small></span>`).join('');return `<button type="button" class="calendar-day ${date===selectedCalendarDate?'selected':''} ${date===dt()?'today':''}" data-calendar-date="${date}" aria-pressed="${date===selectedCalendarDate}" aria-label="${fmt(date,{weekday:'long',month:'long',day:'numeric',year:'numeric'})}${items.length?': '+items.map(m=>clubShort(clubBy(m.clubId))+' at '+meetingTimeLabel(m.time)).join(', '):'; no meetings scheduled'}"><span class="calendar-day-number">${number}</span><span class="calendar-day-events">${events}${items.length>3?`<small class="calendar-more">+${items.length-3} more</small>`:''}</span></button>`}).join('');
 const selected=visibleMeetings().filter(m=>m.date===selectedCalendarDate).sort((a,b)=>(a.time||'').localeCompare(b.time||''));
 return `<section class="card follow-calendar-card"><div class="card-head calendar-heading"><div><div class="card-title">Meeting calendar</div></div><div class="calendar-month-switch"><button type="button" class="btn small" data-calendar-shift="-1" aria-label="Previous month">‹</button><strong>${start.toLocaleDateString('en-US',{month:'long',year:'numeric'})}</strong><button type="button" class="btn small" data-calendar-shift="1" aria-label="Next month">›</button></div></div><div class="calendar-layout"><div class="calendar-main"><div class="calendar-weekdays">${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=>`<span>${d}</span>`).join('')}</div><div class="calendar-grid">${days}</div></div><aside class="calendar-day-panel"><div class="calendar-selected-date"><small>SELECTED DAY</small><strong>${fmt(selectedCalendarDate,{weekday:'long',month:'short',day:'numeric',year:'numeric'})}</strong></div><div class="calendar-selected-list">${calendarMeetingPanel(selected)}</div></aside></div></section>`
}
function followupsPage(){
 const all=allFollowups(),open=all.filter(f=>f.status==='Open'),today=dt(),now=new Date(),monthStart=localDateKey(new Date(now.getFullYear(),now.getMonth(),1)),monthEnd=localDateKey(new Date(now.getFullYear(),now.getMonth()+1,0));
 const week=open.filter(f=>f.due>=today&&f.due<=dt(7)),month=open.filter(f=>f.due>=today&&f.due<=monthEnd),overdue=open.filter(f=>f.due<today);
 const owned=open.filter(f=>f.owner===user().id||f.interaction.owner===user().id),admin=isStaff();
 const ranges=[['open','Open next steps','All open actions',admin?open.length:owned.length,'✓'],['week','Due this week','Today through next 7 days',week.length,'◷'],['month','Due this month',fmt(monthStart,{month:'short',day:'numeric'})+' – '+fmt(monthEnd,{month:'short',day:'numeric'}),month.length,'▦'],['overdue','Overdue','Past due date',overdue.length,'!']];
 const selectedStatus=$('#follow-status-filter')?.value||'Open';
 let rows=all.filter(f=>selectedStatus==='all'||f.status===selectedStatus);
 if(followupRange==='open')rows=all.filter(f=>f.status==='Open');
 if(followupRange==='week')rows=week;
 if(followupRange==='month')rows=month;
 if(followupRange==='overdue')rows=overdue;
 rows.sort((a,b)=>a.due.localeCompare(b.due));
 const ownedRows=admin?rows.length:rows.filter(f=>f.owner===user().id||f.interaction.owner===user().id).length;
 return `${head(admin?'TEAM FOLLOW-THROUGH':'NEXT STEPS',admin?'Next steps summary':'My next steps',admin?'Review team next steps and the meetings they support.':'Keep commitments visible and see the meetings they support.','<button class="btn" data-page="digest">◷ &nbsp; Overview</button>')}<div class="followup-summary-tabs">${ranges.map(([key,label,note,count,ico])=>`<button type="button" class="followup-summary-tab ${followupRange===key?'active':''}" data-followup-range="${key}"><span class="followup-summary-icon">${ico}</span><span class="followup-summary-copy"><small>${label}</small><strong>${count}</strong><em>${note}</em></span></button>`).join('')}</div>${calendarMarkup()}<div class="card followup-table-card"><div class="card-head"><div><div class="card-title">${admin?'All next steps':'My next steps'}</div><div class="card-sub">${followupRange==='open'?'Open next steps across clubs':followupRange==='week'?'Open actions due this week':followupRange==='month'?'Open actions due this month':followupRange==='overdue'?'Open actions past due':'Actions across the selected status'} · ${ownedRows} shown</div></div><select class="select" id="follow-status-filter"><option value="Open" ${selectedStatus==='Open'?'selected':''}>Open</option><option value="all" ${selectedStatus==='all'?'selected':''}>All statuses</option><option value="Done" ${selectedStatus==='Done'?'selected':''}>Done</option><option value="Canceled" ${selectedStatus==='Canceled'?'selected':''}>Canceled</option></select></div><div class="table-wrap scroll-list" tabindex="0" role="region" aria-label="Next steps"><table class="table"><thead><tr><th>Follow-up action</th><th>Club</th><th>Owner</th><th>Action due date</th><th>Status</th>${isStaff()?'':'<th scope="col">Actions</th>'}</tr></thead><tbody id="follow-table">${followRows(rows)}</tbody></table></div></div>`
}
function followRows(rows){return rows.length?rows.map(f=>`<tr><td><div class="cell-title">${esc(f.description)}</div><div class="cell-sub">From ${fmt(f.interaction.date)} interaction</div></td><td><button class="action-link" data-open-club="${f.club?.id}">${esc(clubShort(f.club))}</button></td><td>${esc(who(f.owner))}</td><td>${fmt(f.due)} ${f.due<dt()&&f.status==='Open'?'<span class="pill red">Overdue</span>':''}</td><td><span class="pill ${f.status==='Open'?'orange':f.status==='Done'?'green':'red'}">${f.status}</span></td>${isStaff()?'':`<td>${followupControls(f)}</td>`}</tr>`).join(''):`<tr><td colspan="${isStaff()?5:6}"><div class="empty"><div class="empty-icon">✓</div>No next steps in this view.</div></td></tr>`}
function followupCanEdit(f){return !isStaff()&&(f.owner===user().id||f.interaction.owner===user().id)}
function nextMonthDate(date){const [year,month,day]=date.split('-').map(Number);const end=new Date(year,month+1,0);return localDateKey(new Date(year,month,Math.min(day,end.getDate())))}
let contractAllowances=[];
async function renderContracts(view){
 view.innerHTML=head('','Contract terms','')+'<div class="empty" role="status">Loading contract terms…</div>';
 try{const result=await timeExpenseRequest();if(page!=='contracts'||view!==$('#view'))return;contractAllowances=result.allowances||[];view.innerHTML=contractPage();bindFieldLabels(view);bindPage()}
 catch(error){if(page==='contracts'&&view===$('#view')){view.innerHTML=head('','Contract terms','')+`<div class="empty" role="alert">${esc(error.message)}</div><button class="btn" data-page="contracts">Retry</button>`;bindPage()}}
}
function allowanceCards(balance){
 if(!balance?.configured)return '<div class="empty">Contract terms have not been set.</div>';
 return `<div class="allowance-grid">${[['Hourly rate',contractMoney(balance.hourlyRate)+' / hr'],['Hours logged',balance.hoursUsed+' h'],['Hours remaining',balance.hoursRemaining+' h'],['Amount logged',contractMoney(balance.amountUsed)],['Budget remaining',contractMoney(balance.amountRemaining)]].map(([label,value])=>`<div><span>${label}</span><strong>${esc(value)}</strong></div>`).join('')}</div>`;
}
let selectedAdvisorId=null,advisorMonth=localDateKey(new Date()).slice(0,7),advisorActivityMode='all',advisorActivityFrom='',advisorActivityTo='',advisorTimeEntries=[];
function advisorBalance(id,month){
 const saved=contractAllowances.find(balance=>balance.owner===id&&balance.month===month);
 if(saved)return saved;
 const contract=contractFor(id),first=contract?.sowStart?.slice(0,7)===month;
 const cap=Number(contract?.[first?'firstMonthCap':'monthlyCap']??contract?.hoursCap??0),rate=Number(contract?.hourlyRate||0);
 return {owner:id,month,configured:!!contract,hourlyRate:rate,hoursCap:cap,hoursUsed:'0.00',hoursRemaining:cap.toFixed(2),amountUsed:'0.00',amountRemaining:(cap*rate).toFixed(2)};
}
function contractTermDates(contract){
 const term=(label,value)=>`<div><dt>${label}</dt><dd>${value?`<time datetime="${esc(value)}">${fmt(value)}</time>`:'Not set'}</dd></div>`;
 return `<dl class="advisor-term-dates">${term('Term start',contract?.sowStart)}${term('Term end',contract?.sowEnd)}</dl>`;
}
function advisorInteractionItems(id,mode='all',from='',to=''){
 return visibleInteractions().filter(item=>item.owner===id&&(mode==='all'||(from&&to&&from<=to&&item.date>=from&&item.date<=to))).sort((a,b)=>b.date.localeCompare(a.date)||String(a.id).localeCompare(String(b.id)));
}
function advisorCompanyGroups(id){
 const groups=new Map();
 for(const interaction of advisorInteractionItems(id)){
  if(!groups.has(interaction.clubId))groups.set(interaction.clubId,[]);
  groups.get(interaction.clubId).push(interaction);
 }
 return [...groups].sort((a,b)=>b[1][0].date.localeCompare(a[1][0].date));
}
function advisorHoursLogged(id){
 return advisorTimeEntries.filter(entry=>entry.owner===id&&entry.kind==='time').reduce((total,entry)=>total+Number(entry.detail.hours||0),0).toFixed(2);
}
async function renderAdvisors(view){
 if(!isStaff()){page='home';renderPage();return}
 const requestedAdvisor=selectedAdvisorId;
 view.innerHTML=head('','Advisors','')+'<div class="empty" role="status">Loading advisors…</div>';
 try{
  const [stateResponse,timeData]=await Promise.all([fetch('/api/state'),timeExpenseRequest()]);
  const payload=await stateResponse.json();if(!stateResponse.ok||!payload.state)throw new Error(payload.error||'Could not load advisors');
  if(page!=='advisors'||view!==$('#view')||requestedAdvisor!==selectedAdvisorId)return;
  db=payload.state;if(!isStaff()){page='home';app();return}
  contractAllowances=timeData.allowances||[];advisorTimeEntries=timeData.entries||[];
  view.innerHTML=advisorsPage();bindFieldLabels(view);bindPage();bindAdvisors(view);
 }catch(error){
  if(page==='advisors'&&view===$('#view')&&requestedAdvisor===selectedAdvisorId){view.innerHTML=head('','Advisors','')+`<div class="empty" role="alert">${esc(error.message)}</div><button class="btn" data-page="advisors">Retry</button>`;bindPage()}
 }
}
function advisorsPage(){
 if(!isStaff())return '<div class="empty">Advisors is available to Admin and Sub-admin.</div>';
 const people=db.users.filter(person=>person.role==='User').sort((a,b)=>a.name.localeCompare(b.name));
 const person=people.find(item=>item.id===selectedAdvisorId);
 if(person)return advisorDetailPage(person);
 selectedAdvisorId=null;
 return `${head('','Advisors','')}<div class="advisors-toolbar"><span class="advisor-list-count">${people.length} ${people.length===1?'advisor':'advisors'}</span><label class="advisor-search">Search advisors<input type="search" class="input" id="advisor-search" placeholder="Name or role" autocomplete="off"></label></div>
 <div class="advisor-directory-grid">${people.map(person=>{
  const contract=contractFor(person.id),groups=advisorCompanyGroups(person.id),balance=advisorBalance(person.id,localDateKey(new Date()).slice(0,7));
  return `<button type="button" class="advisor-profile-card" data-open-advisor="${esc(person.id)}" data-advisor-search="${esc((person.name+' '+(person.title||'')).toLowerCase())}"><span class="advisor-card-identity"><span class="avatar">${esc(initials(person.name))}</span><span><strong>${esc(person.name)}</strong><small>${esc(person.title==='Internal POC'?'Advisor / EXL POC':person.title||'Advisor / EXL POC')}</small></span><span class="advisor-card-arrow" aria-hidden="true">→</span></span>${contractTermDates(contract)}<span class="advisor-card-metrics"><span><strong>${groups.length}</strong> companies contacted</span><span><strong>${advisorHoursLogged(person.id)} h</strong> logged · all time</span></span><span class="advisor-card-balance">${balance.configured?`${esc(balance.hoursRemaining)} h remaining this month`:'Contract terms not set'}</span></button>`;
 }).join('')}</div><div class="empty" id="advisor-search-empty" role="status"${people.length?' hidden':''}>No advisors found.</div>`;
}
function advisorDetailPage(person){
 const contract=contractFor(person.id),items=advisorInteractionItems(person.id),groups=advisorCompanyGroups(person.id);
 const field=(label,value)=>value?`<div class="advisor-condition"><dt>${label}</dt><dd>${esc(value)}</dd></div>`:'';
 const goals=contract?.deliverables||[];
 return `<div class="advisor-detail-page"><header class="advisor-profile-head"><div><button type="button" class="action-link" id="advisor-back">← Advisors</button><div class="advisor-profile-identity"><span class="avatar">${esc(initials(person.name))}</span><div><h1 class="page-title">${esc(person.name)}</h1><p>${esc(person.title==='Internal POC'?'Advisor / EXL POC':person.title||'Advisor / EXL POC')}</p></div></div></div><div class="advisor-profile-totals"><span><strong>${groups.length}</strong> companies contacted</span><span><strong>${items.length}</strong> completed interactions</span><span><strong>${advisorHoursLogged(person.id)} h</strong> logged · all time</span></div></header>
 <section class="card advisor-contract-strip" aria-label="Contract term">${contractTermDates(contract)}<div class="advisor-rate"><span>Hourly rate</span><strong>${contract?.hourlyRate!=null?esc(contractMoney(contract.hourlyRate))+' / hr':'Not set'}</strong></div>${contract?.status?`<span class="pill blue">${esc(contract.status)}</span>`:''}</section>
 <section class="card advisor-monthly"><div class="card-head"><div><h2 class="card-title">Hours & budget</h2><div class="card-sub" id="advisor-monthly-cap"></div></div><label class="advisor-month-label">Month<input class="input" type="month" id="advisor-month" value="${esc(advisorMonth)}" required></label></div><div class="card-body" id="advisor-monthly-balance">${advisorMonthlyBalance(person.id)}</div></section>
 <div class="advisor-contract-grid"><section class="card"><div class="card-head"><h2 class="card-title">Contract summary</h2><button class="action-link" id="advisor-view-contract" type="button">Full contract →</button></div><div class="card-body">${contract?`<dl class="advisor-conditions">${field('Scope of work',contract.scope)}${field('Terms & conditions',contract.conditions)}${field('Payment terms',contract.paymentTerms)}${field('Extra hours',contract.extraHours)}${field('Restrictions',contract.restrictions)||''}</dl>`:'<div class="empty">No contract terms recorded.</div>'}</div></section>
 <section class="card"><div class="card-head"><h2 class="card-title">Goals</h2></div><div class="card-body">${goals.length?goals.map(goal=>{const progress=Math.max(0,Math.min(100,Math.round(Number(goal.actual||0)/Math.max(1,Number(goal.target||0))*100)));return `<div class="contract-progress-row"><div class="contract-progress-copy"><strong>${esc(goal.name)}</strong><span>${esc(goal.actual??0)} of ${esc(goal.target??0)}</span></div><div class="contract-progress-track" role="progressbar" aria-label="${esc(goal.name)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}"><i style="width:${progress}%"></i></div></div>`}).join(''):'<div class="empty">No goals recorded.</div>'}</div></section></div>
 <section class="card advisor-companies"><div class="card-head"><h2 class="card-title">Companies contacted</h2><span class="count-badge">${groups.length}</span></div><div class="card-body advisor-company-grid">${groups.map(([id,interactions])=>{const company=clubBy(id);return `<button class="advisor-company-card" type="button" data-open-club="${esc(id)}"><span class="advisor-company-mark">${esc(initials(company?.name||'Company'))}</span><span><strong>${esc(clubShort(company))}</strong><small>${esc(company?.league||'')} · ${interactions.length} ${interactions.length===1?'interaction':'interactions'}</small><small>Last interaction ${fmt(interactions[0].date)}</small></span><span aria-hidden="true">→</span></button>`}).join('')||'<div class="empty">No companies contacted yet.</div>'}</div></section>
 <section class="card advisor-activity"><div class="card-head"><h2 class="card-title">Interaction activity</h2><label class="advisor-period-label">Period<select class="select" id="advisor-activity-period"><option value="all"${advisorActivityMode==='all'?' selected':''}>All activity</option><option value="range"${advisorActivityMode==='range'?' selected':''}>Date range</option></select></label></div>
 <div class="advisor-date-range" id="advisor-date-range"${advisorActivityMode==='all'?' hidden':''}><label>From date<input class="input" type="date" id="advisor-activity-from" value="${esc(advisorActivityFrom)}"></label><label>To date<input class="input" type="date" id="advisor-activity-to" value="${esc(advisorActivityTo)}"></label></div>
 <div class="time-expense-error advisor-filter-error" id="advisor-activity-error" role="alert"></div><div class="advisor-activity-count" id="advisor-activity-count" aria-live="polite"></div><div class="digest-list" id="advisor-activity-results">${digestRows(advisorInteractionItems(person.id,advisorActivityMode,advisorActivityFrom,advisorActivityTo))}</div></section></div>`;
}
function advisorMonthlyBalance(id){
 const balance=advisorBalance(id,advisorMonth);
 if(balance.configured)return allowanceCards(balance);
 return `<div class="empty">Contract terms have not been set.</div><div class="advisor-unconfigured-hours"><strong>${esc(balance.hoursUsed)} h</strong> logged in this month</div>`;
}
function updateAdvisorActivity(view){
 const error=view.querySelector('#advisor-activity-error');
 const invalid=advisorActivityMode==='range'&&(!advisorActivityFrom||!advisorActivityTo||advisorActivityFrom>advisorActivityTo);
 error.textContent=invalid?(!advisorActivityFrom||!advisorActivityTo?'Select both From date and To date.':'To date must be on or after From date.'):'';
 const items=advisorInteractionItems(selectedAdvisorId,advisorActivityMode,advisorActivityFrom,advisorActivityTo);
 view.querySelector('#advisor-activity-count').textContent=`${items.length} ${items.length===1?'interaction':'interactions'}`;
 view.querySelector('#advisor-activity-results').innerHTML=invalid?'<div class="empty">Choose a valid date range.</div>':digestRows(items);
}
function bindAdvisors(view){
 view.querySelectorAll('[data-open-advisor]').forEach(button=>button.onclick=()=>{selectedAdvisorId=button.dataset.openAdvisor;advisorMonth=localDateKey(new Date()).slice(0,7);advisorActivityMode='all';advisorActivityFrom='';advisorActivityTo='';renderPage()});
 const search=view.querySelector('#advisor-search');
 if(search)search.oninput=()=>{let count=0;const query=search.value.trim().toLowerCase();view.querySelectorAll('[data-open-advisor]').forEach(card=>{card.hidden=!card.dataset.advisorSearch.includes(query);if(!card.hidden)count++});view.querySelector('#advisor-search-empty').hidden=count>0};
 view.querySelector('#advisor-back')?.addEventListener('click',()=>{selectedAdvisorId=null;renderPage()});
 if(!selectedAdvisorId)return;
 view.querySelector('#advisor-view-contract')?.addEventListener('click',()=>{selectedContractUser=selectedAdvisorId;editContractsMode=false;page='contracts';app()});
 const month=view.querySelector('#advisor-month');
 const updateMonth=()=>{
  if(!/^\d{4}-\d{2}$/.test(month.value))return;
  advisorMonth=month.value;const balance=advisorBalance(selectedAdvisorId,advisorMonth);
  view.querySelector('#advisor-monthly-cap').textContent=balance.configured?`Monthly allowance: ${balance.hoursCap} h`:'';
  view.querySelector('#advisor-monthly-balance').innerHTML=advisorMonthlyBalance(selectedAdvisorId);
 };
 month.addEventListener('change',updateMonth);updateMonth();
 const period=view.querySelector('#advisor-activity-period'),from=view.querySelector('#advisor-activity-from'),to=view.querySelector('#advisor-activity-to');
 period.onchange=()=>{
  advisorActivityMode=period.value;view.querySelector('#advisor-date-range').hidden=advisorActivityMode==='all';
  if(advisorActivityMode==='range'&&!from.value&&!to.value){const dates=advisorInteractionItems(selectedAdvisorId).map(item=>item.date);from.value=dates[dates.length-1]||localDateKey(new Date());to.value=dates[0]||localDateKey(new Date())}
  advisorActivityFrom=from.value;advisorActivityTo=to.value;updateAdvisorActivity(view);
 };
 const filter=()=>{advisorActivityFrom=from.value;advisorActivityTo=to.value;updateAdvisorActivity(view)};
 from.onchange=filter;to.onchange=filter;updateAdvisorActivity(view);
}

function digestPage(){
 const today=dt(),monthStart=new Date();monthStart.setDate(1);const start=monthStart.toISOString().slice(0,10);
 const ix=visibleInteractions();
 const from=$('#digest-from')?.value||start,to=$('#digest-to')?.value||today;
 const league=$('#digest-league')?.value||'all',club=$('#digest-club')?.value||'all',advisor=$('#digest-advisor')?.value||'all',cap=$('#digest-cap')?.value||'all';
 const filtered=ix.filter(i=>i.date>=from&&i.date<=to
  &&(club==='all'||i.clubId===club)
  &&(league==='all'||clubBy(i.clubId)?.league===league)
  &&(advisor==='all'||exlPoc(i)===who(advisor))
  &&(cap==='all'||(i.capabilities||[]).includes(cap)));
 const meetings=visibleMeetings().filter(m=>m.date>=today&&m.date<=nextMonthDate(today)).sort((a,b)=>a.date.localeCompare(b.date));
 const dateField=(label,id,value)=>'<label class="filter-field"><span>'+label+'</span><input class="input" type="date" id="'+id+'" value="'+value+'"></label>';
 const selectField=(label,id,options,value)=>'<label class="filter-field"><span>'+label+'</span><select class="select" id="'+id+'">'+options.map(o=>'<option value="'+esc(o.value)+'" '+(o.value===value?'selected':'')+'>'+esc(o.label)+'</option>').join('')+'</select></label>';
 const leagueOptions=[{value:'all',label:'All leagues'},...[...Object.keys(LEAGUES),'Other'].map(x=>({value:x,label:x}))];
 const clubOptions=[{value:'all',label:'All companies'},...visibleClubs().map(c=>({value:c.id,label:c.name}))];
 const userOptions=[{value:'all',label:isStaff()?'All users':'My records'},...(isStaff()?db.users.filter(u=>u.role==='User'):[user()]).map(u=>({value:u.id,label:u.name}))];
 const capOptions=[{value:'all',label:'All capabilities'},...CAPS.map(x=>({value:x,label:x}))];
 const actions='<button class="btn" id="clear-digest">Reset filters</button><button class="btn" id="export-digest">↓ &nbsp; Export CSV</button>'+(isStaff()?'':'<button class="btn primary" data-page="log">＋ &nbsp; Log interaction</button>');
 const groups=isStaff()?'<div class="segmented"><button class="active" type="button" data-group="all">All users</button><button type="button" data-group="advisor">By advisor / EXL POC</button></div>':'';
 activeDigestItems=filtered;
 return head('RELATIONSHIP ACTIVITY','Overview','Completed interactions, capabilities discussed, and scheduled meetings.',actions)
 +overviewFollowthrough(meetings)
 +'<section class="card filter-panel"><div class="filter-panel-title"><div><div class="card-title">Activity filters</div></div><span class="filter-panel-icon">⌕</span></div><div class="digest-controls">'
 +dateField('From date','digest-from',from)+dateField('To date','digest-to',to)
 +selectField('League','digest-league',leagueOptions,league)+selectField('Club','digest-club',clubOptions,club)
 +selectField('Advisor / EXL POC','digest-advisor',userOptions,advisor)+selectField('Capability','digest-cap',capOptions,cap)
 +'</div></section>'
 +'<section class="overview-section"><div class="overview-section-heading"><div><div class="greeting">ACTIVITY SNAPSHOT</div><h2>Overview</h2><p>'+esc(fmt(from,{month:'short',day:'numeric',year:'numeric'}))+' – '+esc(fmt(to,{month:'short',day:'numeric',year:'numeric'}))+'</p></div></div>'
 +'<div class="stats-grid overview-stat-grid">'+stat('Completed interactions','In selected date range',filtered.length,'◉')+stat('Unique clubs','With interactions',new Set(filtered.map(i=>i.clubId)).size,'▦')+stat('Upcoming meetings','Next one month · '+fmt(today)+' – '+fmt(nextMonthDate(today)),meetings.length,'◷')+'</div>'
 +'<section class="card"><div class="card-head"><div><div class="card-title">Interaction activity</div></div>'+groups+'</div><div class="digest-list" id="digest-results">'+digestRows(filtered)+'</div></section></section>';
}
function exportDigestCSV(){const columns=['Club','League','Interaction date','Advisor / EXL POC','Club/client POC','Club designation','Discussion summary','Capabilities discussed','Other capability','Next meeting date','Next meeting time','Next-step status','Follow-up actions'];const cell=value=>{let text=String(value??'');if(/^[=+@\-\t\r]/.test(text))text='\''+text;return '"'+text.replace(/"/g,'""')+'"'};const rows=activeDigestItems.slice().sort((a,b)=>a.date.localeCompare(b.date)).map(i=>{const club=clubBy(i.clubId);const steps=(i.followups||[]).map(f=>`${f.description} [${f.status}; ${who(f.owner)}; action due ${f.due||'—'}]`).join(' | '),meeting=interactionNextMeeting(i);return [club?.name,club?.league,i.date,exlPoc(i),clubPoc(i),clubPocDesignation(i),i.summary,(i.capabilities||[]).join(', '),i.other,meeting?.date||'',meeting?.time||'',nextStepLabel(i),steps].map(cell).join(',')});const blob=new Blob(['\uFEFF'+[columns.map(cell).join(','),...rows].join('\r\n')],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`advisor-activity-${dt()}.csv`;document.body.append(a);a.click();a.remove();URL.revokeObjectURL(url);toast(`Exported ${rows.length} filtered interaction${rows.length===1?'':'s'}`)}
function overviewFollowthrough(meetings){const tasks=allFollowups().filter(f=>f.status==='Open').sort((a,b)=>a.due.localeCompare(b.due));return '<div class="overview-followthrough"><section class="card upcoming-top"><div class="card-head"><div><div class="card-title">Upcoming meetings</div><div class="card-subtitle">Next one month · '+fmt(dt())+' – '+fmt(nextMonthDate(dt()))+'</div></div><span class="count-badge">'+meetings.length+'</span></div><div class="upcoming-strip scroll-list" tabindex="0" role="region" aria-label="Upcoming meetings">'+(meetings.length?meetings.map(meetingCard).join(''):'<div class="empty">No upcoming meetings are scheduled.</div>')+'</div></section><section class="card overview-next-card"><div class="card-head"><div><div class="card-title">Next steps</div></div><button class="link-btn" data-page="followups">All next steps →</button></div><div class="card-body scroll-list" tabindex="0" role="region" aria-label="Next steps">'+(tasks.length?tasks.map(taskCard).join(''):'<div class="empty">No open next steps.</div>')+'</div></section></div>'}
function digestRows(ix){
 if(!ix.length)return '<div class="empty"><div class="empty-icon">◷</div>No interactions match these filters.</div>';
 return ix.slice().sort((a,b)=>b.date.localeCompare(a.date)).map(i=>{
  const c=clubBy(i.clubId),steps=i.followups||[],meeting=interactionNextMeeting(i);
  const stepRows=steps.length?steps.map(f=>{
  const stateClass=f.status==='Done'?'green':f.status==='Canceled'?'red':'orange';
   const overdue=f.status==='Open'&&f.due<dt();
   return `<div class="next-action-row"><div class="next-action-copy"><div class="next-action-title">${esc(f.description)}</div><div class="next-action-meta">Owner: ${esc(who(f.owner))} <span>·</span> Action due: ${fmt(f.due)}</div></div><div class="next-action-state"><span class="pill ${stateClass}">${esc(f.status)}</span>${overdue?'<span class="pill red">Overdue</span>':''}${followupControls({...f,interaction:i})}</div></div>`;
  }).join(''):'<div class="next-action-empty">No follow-up actions recorded.</div>';
  const nextMeeting=meeting?`<div class="interaction-meeting-callout"><small>NEXT MEETING</small><strong>${fmt(meeting.date)} · ${esc(meetingTimeLabel(meeting.time))}</strong><span>${esc(meetingTypeLabel(meeting.meetingType))}${meeting.clubPoc?' · '+esc(meeting.clubPoc):''}</span>${meeting.agenda?`<span class="meeting-agenda"><strong>Agenda:</strong> ${esc(meeting.agenda)}</span>`:''}</div>`:(i.nextStepType==='Meeting scheduled'?'<div class="interaction-meeting-callout meeting-missing"><small>NEXT MEETING</small><strong>Meeting date not recorded</strong></div>':'');
  return `<article class="digest-item interaction-record"><header class="interaction-record-head"><div class="interaction-record-club"><div class="league-mark">${c?.league||'—'}</div><div><div class="activity-club">${esc(clubShort(c))} ${leagueTag(c?.league||'')}</div><div class="activity-meta">Interaction: ${fmt(i.date)}</div></div></div><button class="action-link" data-open-club="${i.clubId}">Club history →</button></header><div class="interaction-pocs"><div class="interaction-poc"><span class="poc-label">Advisor / EXL POC</span><strong>${esc(exlPoc(i))}</strong></div><div class="poc-divider"></div><div class="interaction-poc"><span class="poc-label">Club/client POC</span><strong>${esc(clubPoc(i))}</strong><span class="poc-designation">${esc(clubPocDesignation(i))}</span></div></div><div class="interaction-record-body"><section class="interaction-discussion"><div class="interaction-section-label"><span class="section-icon">◌</span>Discussion summary</div><p>${esc(i.summary)}</p><div class="interaction-section-label capability-heading">Capabilities discussed</div><div class="cap-list">${capsTags(i.capabilities,i.other)}</div></section><aside class="interaction-next-panel"><div class="interaction-next-head"><div><div class="next-kicker">RELATIONSHIP STATUS</div><h3>Next-step status</h3></div><div class="overall-status">${nextStepPill(i)}</div></div>${nextMeeting}<div class="next-action-list"><div class="interaction-section-label">Follow-up actions</div>${stepRows}</div></aside></div></article>`;
 }).join('');
}
function contractDashboard(u,c){
 const stat=(label,value,note='')=>`<div class="contract-kpi"><small>${label}</small><strong>${value}</strong>${note?`<span>${note}</span>`:''}</div>`;
 const detail=(label,value)=>`<div class="contract-detail"><span>${label}</span><strong>${esc(value||'Not set')}</strong></div>`;
 const balance=contractAllowances.find(item=>item.owner===u.id&&item.month===dt().slice(0,7));
 const pct=Math.max(0,Math.min(100,Math.round(Number(balance?.hoursUsed||0)/Math.max(1,Number(balance?.hoursCap||0))*100)));
 const deliverables=(c.deliverables||[]).map(x=>{const progress=Math.max(0,Math.min(100,Math.round(Number(x.actual||0)/Math.max(1,Number(x.target||1))*100)));return `<div class="contract-progress-row"><div class="contract-progress-copy"><strong>${esc(x.name)}</strong><span>${esc(x.actual)} of ${esc(x.target)} · ${progress}%</span></div><div class="contract-progress-track"><i style="width:${progress}%"></i></div></div>`}).join('');
 const compliance=(c.compliance||[]).map(x=>`<div class="contract-check-row"><div><strong>${esc(x.name)}</strong><small>${esc(x.detail||'')}</small></div><span class="pill ${x.status==='Complete'?'green':x.status==='In progress'?'orange':'blue'}">${esc(x.status)}</span></div>`).join('');
 return `<div class="contract-dashboard"><section class="contract-kpis">${stat('HOURLY RATE',`${contractMoney(c.hourlyRate)} / hr`)}${stat('MONTHLY CAP',`${esc(balance?.hoursCap??c.monthlyCap)} hrs`,`${contractMoney(Number(balance?.hoursCap??c.monthlyCap??0)*Number(c.hourlyRate||0))} cap value`)}${stat('TERM ENDS',fmt(c.sowEnd))}${stat('EXTENSION DEADLINE',fmt(c.extensionDeadline))}</section><div class="contract-dashboard-grid"><section class="card contract-dash-card"><div class="contract-section-head"><div><h2>Contract summary</h2><p>Who, when, and under what terms</p></div></div><div class="contract-detail-grid">${detail('Advisor / POC',u.name)}${detail('Role',c.role||u.title)}${detail('EXL contact',c.exlContact)}${detail('Agreement date',fmt(c.agreementDate))}${detail('SOW start',fmt(c.sowStart))}${detail('SOW end',fmt(c.sowEnd))}${detail('Location',c.location)}${detail('Governing law',c.governingLaw)}${detail('Payment terms',c.paymentTerms)}</div></section><section class="card contract-dash-card"><div class="contract-section-head"><div><h2>Key dates & deadlines</h2><p>Term milestones and commission window</p></div></div><div class="contract-timeline"><div><b>${fmt(c.sowStart)}</b><strong>Term begins</strong><small>Work and billing start</small></div><div><b>${fmt(c.extensionDeadline)}</b><strong>Extension deadline</strong><small>Written extension due</small></div><div><b>${fmt(c.sowEnd)}</b><strong>Term ends</strong><small>Six-month cap or SOW completion</small></div><div><b>${fmt(c.commissionWindowEnd)}</b><strong>Commission window closes</strong><small>Eligibility window closes</small></div></div><div class="contract-callout"><b>Recurring:</b> Timesheet due on the last day of each month → CSV export → invoice → payment within 30 days. Insurance must remain current through the term.</div></section><section class="card contract-dash-card"><div class="contract-section-head"><div><h2>Compensation</h2><p>Hourly retainer and expense rules</p></div></div><div class="contract-term-list">${detail('Hourly rate',`${contractMoney(c.hourlyRate)} / hr`)}${detail('Cap — first month',`${c.firstMonthCap} hrs (${contractMoney(Number(c.firstMonthCap||0)*Number(c.hourlyRate||0))})`)}${detail('Cap — each month after',`${c.monthlyCap} hrs (${contractMoney(Number(c.monthlyCap||0)*Number(c.hourlyRate||0))})`)}${detail('Extra hours',c.extraHours)}${detail('Timesheet due','Last day of month')}${detail('Payment terms',c.paymentTerms)}${detail('Travel & expenses',c.travelExpenses)}${detail('One-time incentive',`${contractMoney(c.oneTimeIncentive)} · first SOW in a new buying center`)}</div>${allowanceCards(balance)}<div class="contract-usage"><div><strong>Hours used this month</strong><span>${esc(balance?.hoursUsed||0)} of ${esc(balance?.hoursCap||0)} hrs (${pct}%)</span></div><div class="contract-progress-track"><i style="width:${pct}%"></i></div></div></section><section class="card contract-dash-card"><div class="contract-section-head"><div><h2>New business commission</h2><p>Commission terms</p></div></div><div class="contract-commission-table"><div class="contract-commission-row heading"><span>TRIGGER</span><span>COMMISSION</span></div><div class="contract-commission-row"><span>New MSA · annual revenue above ${contractMoney(Number(c.largeMsaThreshold||0)*1000000)}</span><strong>${contractMoney(c.largeMsaCommission)}</strong></div><div class="contract-commission-row"><span>New MSA · other prospects</span><strong>${contractMoney(c.otherMsaCommission)}</strong></div><div class="contract-commission-row"><span>New SOW · months 1–12</span><strong>${esc(c.sowYearOnePercent)}% of revenue</strong></div><div class="contract-commission-row"><span>New SOW · months 13–24</span><strong>${esc(c.sowYearTwoPercent)}% of revenue</strong></div><div class="contract-commission-row"><span>First SOW in a new buying center</span><strong>${contractMoney(c.oneTimeIncentive)}</strong></div></div><div class="contract-callout">Commission eligibility depends on the signed agreement and approval process. Salesforce remains the source of truth for opportunities.</div></section><section class="card contract-dash-card"><div class="contract-section-head"><div><h2>Deliverables — target vs. actual</h2><p>Commitments for the full term</p></div></div><div class="contract-deliverables">${deliverables||'<div class="empty">No deliverables recorded.</div>'}</div></section><section class="card contract-dash-card"><div class="contract-section-head"><div><h2>Compliance & onboarding</h2><p>Must be completed before work starts and kept current</p></div></div><div class="contract-checklist">${compliance||'<div class="empty">No checklist items recorded.</div>'}</div></section><section class="card contract-dash-card contract-wide"><div class="contract-section-head"><div><h2>Scope, conditions & restrictions</h2><p>Responsibilities and continuing obligations</p></div></div><div class="contract-obligations"><div><small>SCOPE OF WORK</small><p>${esc(c.scope)}</p></div><div><small>TERMS & CONDITIONS</small><p>${esc(c.conditions)}</p></div><div><small>RESTRICTIONS & POST-EXIT OBLIGATIONS</small><p>${esc(c.restrictions)}</p></div></div></section></div></div>`
}
function contractEditorForm(u){
 const c=contractFor(u.id)||{},input=(label,key,type='text',step='')=>`<label class="contract-edit-field"><span>${label}</span><input class="input" name="${key}" type="${type}" value="${esc(c[key])}" ${type==='number'?`min="0" step="${step||'1'}"`:''}></label>`,area=(label,key,value='')=>`<label class="contract-edit-field contract-edit-wide"><span>${label}</span><textarea class="textarea" name="${key}">${esc(value||c[key]||'')}</textarea></label>`;
 const deliverableText=(c.deliverables||[]).map(x=>`${x.name} | ${x.target} | ${x.actual}`).join('\n'),checklistText=(c.compliance||[]).map(x=>`${x.name} | ${x.status} | ${x.detail}`).join('\n');
 return `<form class="card contract-edit-form" data-contract-user="${esc(u.id)}"><div class="card-head"><div><div class="card-title">Edit terms · ${esc(u.name)}</div></div><button class="btn" type="button" data-contract-cancel>Cancel</button></div><div class="contract-edit-section"><h2>Contract summary & dates</h2><div class="contract-edit-grid">${input('Agreement type','agreementType')}${input('Status','status')}${input('Role','role')}${input('EXL contact','exlContact')}${input('Agreement date','agreementDate','date')}${input('SOW start','sowStart','date')}${input('SOW end','sowEnd','date')}${input('Extension deadline','extensionDeadline','date')}${input('Commission window end','commissionWindowEnd','date')}${input('Location','location')}${input('Governing law','governingLaw')}${input('Payment terms','paymentTerms')}</div></div><div class="contract-edit-section"><h2>Compensation & commission rules</h2><div class="contract-edit-grid">${input('Hourly rate ($)','hourlyRate','number','0.01')}${input('First month cap (hours)','firstMonthCap','number')}${input('Monthly cap after first month (hours)','monthlyCap','number')}${input('Extra hours approval','extraHours')}${input('Travel & expenses','travelExpenses')}${input('One-time incentive ($)','oneTimeIncentive','number')}${input('Large MSA threshold ($M)','largeMsaThreshold','number')}${input('Large MSA commission ($)','largeMsaCommission','number')}${input('Other MSA commission ($)','otherMsaCommission','number')}${input('SOW commission · months 1–12 (%)','sowYearOnePercent','number','0.1')}${input('SOW commission · months 13–24 (%)','sowYearTwoPercent','number','0.1')}</div></div><div class="contract-edit-section"><h2>Deliverables & compliance</h2><div class="contract-edit-grid">${area('Deliverables · one per line: name | target | actual','deliverablesText',deliverableText)}${area('Compliance checklist · one per line: item | status | note','complianceText',checklistText)}</div></div><div class="contract-edit-section"><h2>Scope & obligations</h2><div class="contract-edit-grid">${area('Scope of work','scope')}${area('Terms and conditions','conditions')}${area('Restrictions & post-exit obligations','restrictions')}</div></div><div class="contract-save-row"><span>Saving makes these terms visible to this person.</span><button class="btn primary" type="submit">Save contract terms</button></div></form>`
}
function contractPage(){

 if(isStaff()){
  const people=db.users.filter(u=>u.role==='User');if(!people.some(u=>u.id===selectedContractUser))selectedContractUser=people[0]?.id;
  const person=people.find(u=>u.id===selectedContractUser);if(!person)return `${head('ADMINISTRATION','Advisor / EXL POC contract terms','No advisor / EXL POC accounts are configured.')}`;
  const terms=contractFor(person.id);return `${head('ADMINISTRATION','Advisor / EXL POC contract terms','')}<div class="contract-toolbar"><label><span>Choose advisor / EXL POC</span><select class="select" id="contract-user-select">${people.map(u=>`<option value="${esc(u.id)}" ${u.id===person.id?'selected':''}>${esc(u.name)} · ${esc(u.title==='Internal POC'?'Advisor / EXL POC':u.title)}</option>`).join('')}</select></label>${!isAdmin()?'':editContractsMode?'<span class="pill orange">Editing terms</span>':'<button class="btn primary" type="button" data-contract-edit>'+(terms?'Edit terms':'Add contract terms')+'</button>'}</div>${isAdmin()&&editContractsMode?contractEditorForm(person):terms?contractDashboard(person,terms):'<section class="card contract-empty"><div class="empty"><h2>No contract terms on file</h2><p>Add the approved terms for this person to make them available in their workspace.</p></div></section>'}`
 }
 const terms=contractFor(user().id);return `${head('MY WORKSPACE','My contract terms','Review the agreement details and conditions recorded for your profile.')}${terms?contractDashboard(user(),terms):'<section class="card contract-empty"><div class="empty"><h2>No contract terms available</h2><p>Your administrator has not added approved terms for your profile yet.</p></div></section>'}`
}
let selectedCompanyAdvisor='';
function companyAccessEditor(people){
 if(!people.some(person=>person.id===selectedCompanyAdvisor))selectedCompanyAdvisor=people[0]?.id||'';
 if(!selectedCompanyAdvisor)return '';
 const access=companyAccessFor(selectedCompanyAdvisor),selected=new Set(access.companyIds);
 const companies=db.clubs.slice().sort((a,b)=>a.league.localeCompare(b.league)||a.name.localeCompare(b.name));
 return `<section class="card company-access-card"><div class="card-head"><h2 class="card-title">Company access</h2></div>
 <form id="access-new-company" hidden></form>
 <form id="company-access-form" class="card-body">
 <label class="access-advisor-field">Advisor / EXL POC<select class="select" id="access-advisor">${people.map(person=>`<option value="${esc(person.id)}"${person.id===selectedCompanyAdvisor?' selected':''}>${esc(person.name)}</option>`).join('')}</select></label>
 <fieldset class="access-mode"><legend>Access</legend>${[['all','All companies'],['selected','Selected companies']].map(([value,label])=>`<label><input type="radio" name="accessMode" value="${value}"${access.mode===value?' checked':''}>${label}</label>`).join('')}</fieldset>
 <section id="access-company-picker"${access.mode==='all'?' hidden':''}>
 <div class="access-picker-toolbar"><label class="access-search">Search companies<input class="input" type="search" id="access-company-search" placeholder="Company or league" autocomplete="off"></label><span id="access-selected-count" aria-live="polite"></span></div>
 <div class="access-picker-actions"><button class="action-link" type="button" id="access-select-visible">Select visible</button><button class="action-link" type="button" id="access-clear">Clear selection</button><button class="action-link" type="button" id="access-add-company" aria-expanded="false" aria-controls="access-new-company-panel">＋ Add New Company</button></div>
 <div id="access-new-company-panel" class="access-new-company" hidden><h3>Add New Company</h3><label>Company name<input class="input" name="companyName" form="access-new-company" maxlength="120" required autocomplete="organization"></label><div class="access-new-company-recipient">Advisor / EXL POC: <strong>${esc(people.find(person=>person.id===selectedCompanyAdvisor)?.name||'')}</strong><span class="pill blue">Other</span></div><div class="form-actions"><button class="btn" type="button" id="access-new-company-cancel">Cancel</button><button class="btn primary" type="submit" form="access-new-company">Add company</button></div><div class="time-expense-error" role="alert"></div></div>
 <div class="access-company-list">${companies.map(company=>`<label class="access-company-option"><input type="checkbox" name="accessCompany" value="${esc(company.id)}"${selected.has(company.id)?' checked':''}><span><strong>${esc(company.name)}</strong><small>${esc(company.league)}</small></span></label>`).join('')}</div><p id="access-search-empty" class="empty" hidden>No companies found.</p></section>
 <div class="form-actions"><button class="btn primary" type="submit" id="access-save">Save company access</button></div><div class="time-expense-error" id="access-save-error" role="alert"></div></form></section>`;
}
function adminPage(){
 if(!isStaff()){page='home';return homePage()}
 const people=db.users.filter(person=>person.role==='User');
 return `${head('ADMINISTRATION','Workspace users','','')}<div class="workspace-access-grid"><section class="card"><div class="card-head"><h2 class="card-title">Workspace users</h2></div><div class="card-body">${db.users.map(person=>{
 const access=companyAccessFor(person.id),advisor=person.role==='User';
 return `<div class="admin-user"><div><div class="cell-title">${esc(person.name)}</div><div class="cell-sub">${esc(person.title==='Internal POC'?'Advisor / EXL POC':person.title)}</div>${advisor?`<div class="access-summary">${access.mode==='all'?'All companies':access.companyIds.length+' companies'}${isAdmin()?`<button class="action-link" type="button" data-edit-company-access="${esc(person.id)}">Edit access</button>`:''}</div>${!isAdmin()&&access.mode==='selected'?`<details class="access-readonly"><summary>View companies</summary><ul>${access.companyIds.map(id=>`<li>${esc(clubBy(id)?.name||'Company unavailable')}</li>`).join('')||'<li>No companies selected</li>'}</ul></details>`:''}`:''}</div><span class="pill ${person.role==='Admin'?'blue':'green'}">${esc(person.role)}</span></div>`;
 }).join('')}</div></section>${isAdmin()?companyAccessEditor(people):''}</div>`;
}
function bindCompanyAccess(){
 document.querySelectorAll('[data-edit-company-access]').forEach(button=>button.onclick=()=>{selectedCompanyAdvisor=button.dataset.editCompanyAccess;renderPage();$('#access-advisor')?.focus()});
 const form=$('#company-access-form');if(!form||!isAdmin())return;
 bindAddCompany(form);
 $('#access-advisor').onchange=event=>{selectedCompanyAdvisor=event.target.value;renderPage()};
 const picker=$('#access-company-picker'),boxes=[...form.querySelectorAll('[name=accessCompany]')];
 const updateCount=()=>{$('#access-selected-count').textContent=boxes.filter(box=>box.checked).length+' selected'};
 form.querySelectorAll('[name=accessMode]').forEach(input=>input.onchange=()=>{picker.hidden=form.elements.accessMode.value==='all';if(picker.hidden){$('#access-new-company-panel').hidden=true;$('#access-add-company').setAttribute('aria-expanded','false')}});
 const filter=()=>{const query=$('#access-company-search').value.trim().toLowerCase();let count=0;boxes.forEach(box=>{const label=box.closest('label');label.hidden=!label.textContent.toLowerCase().includes(query);if(!label.hidden)count++});$('#access-search-empty').hidden=count>0};
 $('#access-company-search').oninput=filter;
 boxes.forEach(box=>box.onchange=updateCount);
 $('#access-select-visible').onclick=()=>{boxes.filter(box=>!box.closest('label').hidden).forEach(box=>box.checked=true);updateCount()};
 $('#access-clear').onclick=()=>{boxes.forEach(box=>box.checked=false);updateCount()};
 updateCount();
 form.onsubmit=async event=>{
  event.preventDefault();const button=$('#access-save'),error=$('#access-save-error');button.disabled=true;error.textContent='';
  const advisorId=$('#access-advisor').value,mode=form.elements.accessMode.value,epoch=accountEpoch;
  try{
   const response=await fetch('/api/company-access',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({advisorId,mode,companyIds:mode==='selected'?boxes.filter(box=>box.checked).map(box=>box.value):[],revision:companyAccessFor(advisorId).revision})});
   const result=await response.json();if(epoch!==accountEpoch)return;if(!response.ok)throw new Error(result.error||'Could not save company access');
   db=result.state;clearWorkspaceCache();
   if(page==='admin'){app();toast('Company access saved')}
  }catch(problem){error.textContent=problem.message}finally{button.disabled=false}
 };
}
function bindAddCompany(accessForm){
 const form=$('#access-new-company'),panel=$('#access-new-company-panel'),toggle=$('#access-add-company');if(!form||!panel||!toggle)return;
 const setOpen=open=>{panel.hidden=!open;toggle.setAttribute('aria-expanded',String(open));if(open)form.elements.companyName.focus();else toggle.focus()};
 toggle.onclick=()=>setOpen(panel.hidden);
 $('#access-new-company-cancel').onclick=()=>setOpen(false);
 form.onsubmit=async event=>{
  event.preventDefault();
  const advisorId=$('#access-advisor').value,name=form.elements.companyName.value.trim(),epoch=accountEpoch;
  const draft={mode:accessForm.elements.accessMode.value,ids:[...accessForm.querySelectorAll('[name=accessCompany]:checked')].map(input=>input.value)};
  const error=panel.querySelector('[role=alert]');error.textContent='';
  const controls=[...panel.querySelectorAll('input,button'),...accessForm.querySelectorAll('input,select,button')];controls.forEach(control=>control.disabled=true);
  try{
   const response=await fetch('/api/companies',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({advisorId,name,revision:companyAccessFor(advisorId).revision})});
   const result=await response.json();if(epoch!==accountEpoch)return;if(!response.ok)throw new Error(result.error||'Could not add this company');
   db=result.state;clearWorkspaceCache();
   if(page==='admin'){
    app();
    // Preserve pending checkbox edits; adding a company does not submit those edits.
    const current=$('#company-access-form');
    if(current&&$('#access-advisor').value===advisorId){
     const radio=current.querySelector(`[name=accessMode][value="${draft.mode}"]`);radio.checked=true;radio.onchange();
     current.querySelectorAll('[name=accessCompany]').forEach(input=>{input.checked=draft.ids.includes(input.value)||input.value===result.company.id});
     current.querySelector('[name=accessCompany]')?.onchange();
    }
    toast('Company added under Other');
   }
  }catch(problem){error.textContent=problem.message}finally{controls.forEach(control=>control.disabled=false)}
 };
}
async function openClub(id){
 const request=++navigationRequest;
 try{await refreshWorkspace(request);if(request!==navigationRequest)return;if(!canSeeClub(id)){page='clubs';app();toast('This company is not available in your CME directory');return}selectedClub=id;clubTab='history';page='club';app()}
 catch(error){if(request===navigationRequest)toast(error.message)}
}
function bindPage(){bindCompanyAccess();document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>navigateToPage(b.dataset.page));document.querySelectorAll('[data-log-club]').forEach(b=>b.onclick=()=>{editingInteraction=null;page='log';app();const s=document.querySelector('[name=clubId]');if(s){s.value=b.dataset.logClub;s.dispatchEvent(new Event('change'))}});const view=$('#view');if(view)view.onclick=e=>{const follow=e.target.closest('[data-follow-status]');if(follow){if(follow.disabled)return;if(follow.dataset.next==='Canceled'&&!confirm('Cancel this follow-up action?'))return;follow.disabled=true;follow.textContent='Saving…';changeFollowup(follow.dataset.followStatus,follow.dataset.next);return}const clubButton=e.target.closest('[data-open-club]');if(clubButton){e.preventDefault();openClub(clubButton.dataset.openClub)}};const logoRoot=$('#club-results');logoRoot?.addEventListener('error',e=>{if(e.target.matches('.club-logo-img'))e.target.remove()},true);
 document.querySelectorAll('[data-directory-league]').forEach(button=>button.onclick=()=>{directoryLeague=button.dataset.directoryLeague;renderPage();document.querySelector('[data-directory-league][aria-pressed="true"]')?.focus()});
 const search=$('#club-search');
 search?.addEventListener('input',()=>{$('#club-results').innerHTML=clubCards(visibleClubs().filter(club=>club.league===directoryLeague&&club.name.toLowerCase().includes(search.value.trim().toLowerCase())))});
 const directoryForm=$('#directory-organization');
 if(directoryForm)directoryForm.onsubmit=event=>{
  event.preventDefault();
  const name=directoryForm.elements.organizationName.value.trim();
  if(!name)return;
  editingInteraction=null;meetingToComplete=null;page='log';app();
  const form=$('#interaction-form');
  const existing=findOrganization(name);
  form.elements.clubId.value=existing?.id||'new-organization';
  form.elements.organizationName.value=existing?'':name;
  form.elements.clubId.dispatchEvent(new Event('change'));
 };

 document.querySelectorAll('[data-contract-user]').forEach(form=>form.onsubmit=async e=>{e.preventDefault();if(!isAdmin())return;const previous=structuredClone(db);const fd=new FormData(form),id=form.dataset.contractUser,number=k=>Number(fd.get(k)||0),rows=k=>contractRows(fd.get(k)).filter(r=>r[0]);db.contracts||={};db.contracts[id]={agreementType:String(fd.get('agreementType')||'').trim(),status:String(fd.get('status')||'').trim(),role:String(fd.get('role')||'').trim(),exlContact:String(fd.get('exlContact')||'').trim(),agreementDate:fd.get('agreementDate'),sowStart:fd.get('sowStart'),sowEnd:fd.get('sowEnd'),extensionDeadline:fd.get('extensionDeadline'),commissionWindowEnd:fd.get('commissionWindowEnd'),location:String(fd.get('location')||'').trim(),governingLaw:String(fd.get('governingLaw')||'').trim(),paymentTerms:String(fd.get('paymentTerms')||'').trim(),hourlyRate:number('hourlyRate'),firstMonthCap:number('firstMonthCap'),monthlyCap:number('monthlyCap'),extraHours:String(fd.get('extraHours')||'').trim(),travelExpenses:String(fd.get('travelExpenses')||'').trim(),oneTimeIncentive:number('oneTimeIncentive'),largeMsaThreshold:number('largeMsaThreshold'),largeMsaCommission:number('largeMsaCommission'),otherMsaCommission:number('otherMsaCommission'),sowYearOnePercent:number('sowYearOnePercent'),sowYearTwoPercent:number('sowYearTwoPercent'),deliverables:rows('deliverablesText').map(([name,target,actual])=>({name,target:Number(target)||0,actual:Number(actual)||0})),compliance:rows('complianceText').map(([name,status,detail])=>({name,status,detail})),scope:String(fd.get('scope')||'').trim(),conditions:String(fd.get('conditions')||'').trim(),restrictions:String(fd.get('restrictions')||'').trim(),updatedAt:dt()};if(!await persistInteractionChanges(form,previous))return;editContractsMode=false;app();toast('Contract terms saved for '+(db.users.find(u=>u.id===id)?.name||'user'))});
 $('#contract-user-select')?.addEventListener('change',e=>{selectedContractUser=e.target.value;editContractsMode=false;app()});document.querySelectorAll('[data-contract-edit]').forEach(b=>b.onclick=()=>{editContractsMode=true;app()});document.querySelectorAll('[data-contract-cancel]').forEach(b=>b.onclick=()=>{editContractsMode=false;app()});
 document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{clubTab=b.dataset.tab;renderPage()});
 document.querySelectorAll('[data-add-row]').forEach(b=>b.onclick=()=>{const kind=b.dataset.addRow,holder=$(`#${kind==='followup'?'followup-rows':kind==='stakeholder'?'stakeholder-rows':'participant-rows'}`);holder.insertAdjacentHTML('beforeend',kind==='followup'?followRow({description:'',owner:user().id,due:'',status:'Open'}):attendeeRow({name:'',role:''},kind))});document.querySelectorAll('[data-remove-row]').forEach(b=>b.onclick=()=>{const row=b.parentElement;const parent=row.parentElement;if(parent.children.length>1)row.remove();else row.querySelectorAll('input').forEach(i=>i.value='')});
 document.querySelectorAll('[name=capability]').forEach(x=>x.onchange=()=>{$('#other-field').style.display=document.querySelector('[name=capability][value="Other"]').checked?'grid':'none'});
 if($('#interaction-form')){$('#interaction-form').onsubmit=saveInteraction;const mode=$('#record-mode'),nextMeeting=$('[name=nextMeeting]'),nextAgenda=$('[name=nextAgenda]'),syncAgenda=()=>{if(nextAgenda)nextAgenda.required=!!nextMeeting?.value||!!nextAgenda.value};mode?.addEventListener('change',()=>{syncInteractionMode();syncNextStepFields()});$('[name=hasFollowups]')?.addEventListener('change',syncNextStepFields);$('[name=nextStepType]')?.addEventListener('change',syncNextStepFields);nextMeeting?.addEventListener('change',syncAgenda);nextAgenda?.addEventListener('input',syncAgenda);syncInteractionMode();syncNextStepFields();syncAgenda();
 const form=$('#interaction-form');
 const followup=form.querySelector('#next-meeting-capabilities');
 if(editingInteraction&&Array.isArray(interactionNextMeeting(editingInteraction)?.capabilities))followup.dataset.custom='1';
 form.addEventListener('change',event=>{
  if(event.target.name==='nextMeetingCapability')followup.dataset.custom='1';
  syncMeetingCapabilities(form);
 });
 syncMeetingCapabilities(form);
 const syncEntryFields=()=>{
  syncOrganizationField(form);
  const duration=form.elements.meetingMinutes;
  duration.disabled=form.elements.recordMode?.value==='planned';
  $('#meeting-duration-field').hidden=duration.disabled;
 };
 form.addEventListener('change',syncEntryFields);
 syncEntryFields();
}document.querySelector('[name=clubId]')?.addEventListener('change',e=>{$('#club-history-slot').innerHTML=historyPreview(e.target.value)});
 document.querySelectorAll('[data-followup-range]').forEach(b=>b.onclick=()=>{followupRange=b.dataset.followupRange;const select=$('#follow-status-filter');if(select)select.value='Open';renderPage()});document.querySelectorAll('[data-calendar-date]').forEach(b=>b.onclick=()=>{selectedCalendarDate=b.dataset.calendarDate;renderPage()});document.querySelectorAll('[data-calendar-shift]').forEach(b=>b.onclick=()=>{const shift=Number(b.dataset.calendarShift);calendarMonth=new Date(calendarMonth.getFullYear(),calendarMonth.getMonth()+shift,1);selectedCalendarDate=localDateKey(new Date(calendarMonth.getFullYear(),calendarMonth.getMonth(),1));renderPage()});
 $('#follow-status-filter')?.addEventListener('change',()=>{followupRange='all';renderPage()});
 ['digest-from','digest-to','digest-club','digest-league','digest-advisor','digest-cap'].forEach(id=>$('#'+id)?.addEventListener('change',()=>{const oldPage=page;renderPage();}));
 $('#clear-digest')?.addEventListener('click',()=>{document.querySelectorAll('.digest-controls select').forEach(x=>x.value='all');$('#digest-from').value=new Date(new Date().getFullYear(),new Date().getMonth(),1).toISOString().slice(0,10);$('#digest-to').value=dt();page='home';app()});$('#export-digest')?.addEventListener('click',exportDigestCSV);
 document.querySelectorAll('[data-meeting-edit]').forEach(b=>b.onclick=()=>meetingModal(b.dataset.meetingEdit));document.querySelectorAll('[data-meeting-cancel]').forEach(b=>b.onclick=()=>cancelMeeting(b.dataset.meetingCancel));document.querySelectorAll('[data-meeting-complete]').forEach(b=>b.onclick=()=>completeMeeting(b.dataset.meetingComplete));

 document.querySelectorAll('[data-group]').forEach(button=>button.onclick=()=>{
  document.querySelectorAll('[data-group]').forEach(option=>option.classList.toggle('active',option===button));
  const results=$('#digest-results');
  if(button.dataset.group==='all'){results.innerHTML=digestRows(activeDigestItems);return}
  const groups=new Map();
  for(const item of activeDigestItems){
   const name=exlPoc(item);
   if(!groups.has(name))groups.set(name,[]);
   groups.get(name).push(item);
  }
  results.innerHTML=[...groups].map(([name,items])=>`<div class="digest-item"><div class="activity-club">${esc(name)}</div>${digestRows(items)}</div>`).join('')||digestRows([]);
 });

}
function collectRows(form,kind){return [...form.querySelectorAll(`.${kind==='follow'?'follow-row':'attendee-row'}`)]}
async function changeFollowup(id,status){
 if(isStaff())return;
 const found=allFollowups().find(f=>f.id===id&&followupCanEdit(f));
 if(!found){renderPage();toast('This action is no longer available.');return}
 const epoch=accountEpoch;
 try{
  const response=await fetch('/api/followup',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({interactionId:found.interaction.id,followupId:id,status})});
  const result=await response.json();
  if(epoch!==accountEpoch)return;
  if(!response.ok)throw new Error(result.error||'Could not update this action');
  const action=db.interactions.find(i=>i.id===found.interaction.id)?.followups?.find(f=>f.id===id)||(db.assignedFollowups||[]).find(f=>f.id===id);
  if(action)action.status=status;
  if(result.interactionVersion&&db.interactions.some(item=>item.id===found.interaction.id)){db.recordVersions||={};db.recordVersions.interactions||={};db.recordVersions.interactions[found.interaction.id]=result.interactionVersion}
  renderPage();
  toast(status==='Open'?'Action reopened':`Action marked ${status.toLowerCase()}`);
 }catch(error){renderPage();toast(error.message||'Could not update this action')}
}
function meetingModal(id=''){
 const m=db.meetings.find(x=>x.id===id);if(isStaff()||(m&&(m.owner!==user().id||!canSeeClub(m.clubId))))return;
 const content=`<div class="modal-backdrop" id="modal-backdrop"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="meeting-modal-title"><div class="modal-head"><div class="modal-title" id="meeting-modal-title">${m?'Edit planned meeting':'Plan a meeting'}</div><button class="close" data-close aria-label="Close dialog">×</button></div><form class="modal-body" id="meeting-form"><div class="form-grid"><div class="field"><label>Club or organization *</label><select class="select" name="clubId" required>${visibleClubs().map(c=>`<option value="${c.id}" ${c.id===(m?.clubId||selectedClub)?'selected':''}>${esc(c.name)} · ${c.league}</option>`).join('')}${canCreateCompany()?'<option value="new-organization">Other — enter a company name</option>':''}</select></div>${organizationField()}<div class="field"><label>Meeting date *</label><input class="input" type="date" name="date" value="${m?.date||''}" required></div><div class="field"><label>Meeting time (optional)</label><input class="input" type="time" name="time" value="${m?.time||''}"></div><div class="field"><label>Meeting type *</label><select class="select" name="meetingType"><option ${m?.meetingType==='First meeting'?'selected':''}>First meeting</option><option ${meetingTypeLabel(m?.meetingType)==='Follow-up meeting'?'selected':''}>Follow-up meeting</option></select></div><div class="field"><label>Advisor / EXL POC *</label><input class="input" name="exlPoc" value="${esc(m?.exlPoc||user().name)}" required></div><div class="field"><label>Club/client POC *</label><input class="input" name="clubPoc" value="${esc(m?.clubPoc||'')}" required></div><div class="field"><label>Designation *</label><input class="input" name="clubPocDesignation" value="${esc(m?.clubPocDesignation||'')}" required></div><div class="field full"><label>Meeting agenda *</label><textarea class="textarea" name="agenda" placeholder="What do you plan to discuss?" required>${esc(m?.agenda||'')}</textarea></div>${meetingCapabilityFields('plannedCapability',m?.capabilities||[])}</div><div class="form-actions"><button type="button" class="btn" data-close>Cancel</button><button class="btn primary">Save meeting</button></div></form></div></div>`;
 document.body.insertAdjacentHTML('beforeend',content);bindFieldLabels($('#modal-backdrop'));const dialog=$('#modal-backdrop'),restoreFocus=document.activeElement;dialog.querySelector('[name=clubId]')?.focus();const closeDialog=()=>{dialog.remove();restoreFocus?.focus?.()};dialog.onclick=e=>{if(e.target.id==='modal-backdrop'||e.target.closest('[data-close]'))closeDialog()};dialog.onkeydown=e=>{if(e.key==='Escape'){e.preventDefault();closeDialog();return}if(e.key==='Tab'){const items=[...dialog.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(x=>x.getClientRects().length);if(!items.length)return;const first=items[0],last=items[items.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}};
 const meetingForm=$('#meeting-form');
 meetingForm.elements.clubId.onchange=()=>syncOrganizationField(meetingForm);
 syncOrganizationField(meetingForm);
 meetingForm.onsubmit=async e=>{e.preventDefault();const d=new FormData(e.target),club=organizationForEntry(d);if(!club){toast('Select a club or enter a company name');return}const clubId=club.id;const previous=JSON.parse(JSON.stringify(db));const linked=m?.interactionId?visibleInteractions().find(i=>i.id===m.interactionId):visibleInteractions().filter(i=>i.clubId===clubId&&i.owner===user().id).sort((a,b)=>b.date.localeCompare(a.date))[0];const record={id:m?.id||`m-${Date.now()}`,clubId,date:d.get('date'),time:d.get('time')||'',interactionId:m?.interactionId||linked?.id||'',meetingType:d.get('meetingType'),exlPoc:d.get('exlPoc').trim(),clubPoc:d.get('clubPoc').trim(),clubPocDesignation:d.get('clubPocDesignation').trim(),participants:[d.get('clubPoc').trim(),d.get('exlPoc').trim()],agenda:d.get('agenda').trim(),capabilities:d.getAll('plannedCapability'),owner:m?.owner||user().id,status:'Planned'};if(!clubBy(clubId))db.clubs.push(club);if(m)db.meetings=db.meetings.map(x=>x.id===m.id?record:x);else db.meetings.push(record);if(linked){linked.meetingId=record.id;linked.nextMeeting=record.date;linked.nextMeetingTime=record.time;linked.nextAgenda=record.agenda}if(!await persistInteractionChanges(meetingForm,previous))return;$('#modal-backdrop')?.remove();renderPage();const heading=$('#view h1');heading?.setAttribute('tabindex','-1');heading?.focus();toast(m?'Meeting updated':'Meeting planned')}
}
async function cancelMeeting(id){
 const meeting=db.meetings.find(item=>item.id===id);
 if(!meeting||meeting.status!=='Planned'||!canSeeClub(meeting.clubId)||isStaff()||meeting.owner!==user().id)return;
 if(!confirm('Cancel this planned meeting?'))return;
 const previous=structuredClone(db),epoch=accountEpoch,targetPage=page,targetView=$('#view');
 meeting.status='Canceled';
 const interaction=visibleInteractions().find(item=>item.id===meeting.interactionId||item.meetingId===meeting.id);
 if(interaction){interaction.meetingId='';interaction.nextMeeting='';interaction.nextMeetingTime='';interaction.nextAgenda='';if(interaction.nextStepType==='Meeting scheduled')interaction.nextStepType='Yet to be decided'}
 const saved=await persistInteractionChanges(null,previous);
 if(epoch!==accountEpoch)return;
 if(page===targetPage&&$('#view')===targetView)renderPage();
 if(saved)toast('Meeting canceled');
}
// Defer completing a planned meeting until its interaction notes are saved.
function completeMeeting(id){const m=db.meetings.find(x=>x.id===id);if(!m||!canSeeClub(m.clubId)||isStaff()||m.owner!==user().id||m.status!=='Planned')return;meetingToComplete=id;editingInteraction=null;page='log';app();const s=document.querySelector('[name=clubId]'),d=document.querySelector('[name=date]');if(s){s.value=m.clubId;s.dispatchEvent(new Event('change'))}if(d)d.value=m.date;toast('Add the POC details and discussion notes to complete this meeting')}
async function saveInteraction(e){
 e.preventDefault();if(isStaff()&&!editingInteraction){toast('The Admin account reviews existing activity. Sign in as an EXL user to log an interaction.');return}
 const form=e.target,fd=new FormData(form),club=organizationForEntry(fd);if(!club){toast('Select a club or enter a company name');return}const clubId=club.id;
 const previous=JSON.parse(JSON.stringify(db));
 const attendees=kind=>collectRows(form,kind).map(r=>({name:r.querySelector('[name='+kind+'Name]')?.value.trim()||'',role:r.querySelector('[name='+kind+'Role]')?.value.trim()||''})).filter(a=>a.name);
 const stakeholders=attendees('stakeholder'),participants=attendees('participant');
 if(fd.get('recordMode')==='planned'){
  const date=fd.get('date');if(date<dt()){toast('Choose today or a future date for a planned meeting');return}
  const related=visibleInteractions().filter(i=>i.clubId===clubId&&i.owner===user().id).sort((a,b)=>b.date.localeCompare(a.date))[0];
  const meeting={id:'m-'+Date.now(),clubId,date,time:fd.get('meetingTime')||'',meetingType:fd.get('meetingType')||'First meeting',exlPoc:participants[0]?.name||'',clubPoc:stakeholders[0]?.name||'',clubPocDesignation:stakeholders[0]?.role||'',participants:[stakeholders[0]?.name,participants[0]?.name].filter(Boolean),agenda:fd.get('summary').trim(),capabilities:fd.getAll('plannedCapability'),owner:user().id,status:'Planned',interactionId:related?.id||''};
  if(related){related.meetingId=meeting.id;related.nextMeeting=date;related.nextMeetingTime=meeting.time;related.nextAgenda=meeting.agenda}
  if(!clubBy(clubId))db.clubs.push(club);
  db.meetings.push(meeting);if(!await persistInteractionChanges(form,previous))return;editingInteraction=null;meetingToComplete=null;page='club';selectedClub=clubId;clubTab='meetings';app();toast('Planned meeting saved. It is not counted as a completed interaction.');return;
 }
 const followups=!fd.has('hasFollowups')?[]:collectRows(form,'follow').map(r=>({id:r.dataset.id||'f-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),description:r.querySelector('[name=followDescription]').value.trim(),owner:r.querySelector('[name=followOwner]').value,due:r.querySelector('[name=followDue]').value,status:r.querySelector('[name=followStatus]').value})).filter(f=>f.description);if(followups.some(f=>!f.due)){toast('Add a due date for each next step');return}
 if(fd.has('hasFollowups')&&!followups.length){toast('Describe a follow-up action or turn off follow-up actions');return}
 const nextStepDetail=fd.get('nextStepType')==='Other'?String(fd.get('nextStepDetail')||'').trim():'';
 if(fd.get('nextStepType')==='Other'&&!nextStepDetail){toast('Describe the next step');return}
 const prev=editingInteraction,nextDate=fd.get('nextMeeting'),nextAgenda=String(fd.get('nextAgenda')||'').trim();if(nextDate&&nextDate<dt()){toast('Choose today or a future date for the next meeting');return}if(nextDate&&!nextAgenda){toast('Add an agenda for the next meeting');return}if(fd.get('nextStepType')==='Meeting scheduled'&&!nextDate){toast('Add the next meeting date before setting this status');return}const record={id:prev?.id||'i-'+Date.now(),clubId,date:fd.get('date'),stakeholders,participants,exlPoc:participants[0]?.name||'',clubPoc:stakeholders[0]?.name||'',clubPocDesignation:stakeholders[0]?.role||'',nextStepType:fd.get('nextStepType')||'Yet to be decided',nextStepDetail,...(fd.get('meetingMinutes')?{meetingMinutes:Number(fd.get('meetingMinutes'))}:{}),summary:fd.get('summary').trim(),capabilities:fd.getAll('capability'),other:fd.get('other')?.trim()||'',owner:prev?.owner||user().id,followups,nextMeeting:nextDate||'',nextMeetingTime:fd.get('nextMeetingTime')||'',nextAgenda};if(!clubBy(clubId))db.clubs.push(club);if(prev)db.interactions=db.interactions.map(x=>x.id===prev.id?record:x);else db.interactions.push(record);
 const linked=prev?.meetingId&&db.meetings.find(m=>m.id===prev.meetingId&&m.status==='Planned');
 if(meetingToComplete){
  const completed=db.meetings.find(m=>m.id===meetingToComplete&&m.status==='Planned');
  if(completed){
   completed.status='Completed';
   completed.completedInteractionId=record.id;
  }
 }
 if(nextDate){
  const meeting=linked||{id:'m-'+Date.now(),meetingType:'Follow-up meeting',status:'Planned'};
  Object.assign(meeting,{clubId,date:nextDate,time:record.nextMeetingTime,interactionId:record.id,
   exlPoc:record.exlPoc,clubPoc:record.clubPoc,clubPocDesignation:record.clubPocDesignation,
   participants:[...stakeholders,...participants].map(person=>person.name),
   agenda:nextAgenda,capabilities:fd.getAll('nextMeetingCapability'),owner:record.owner});
  if(!linked)db.meetings.push(meeting);
  record.meetingId=meeting.id;
 }else if(linked){linked.status='Canceled'}

 if(!await persistInteractionChanges(form,previous))return;
 meetingToComplete=null;editingInteraction=null;page='club';selectedClub=clubId;clubTab='history';app();toast(prev?'Interaction updated':'Interaction saved')
}
function loginPage(message=''){resetAccountState();document.getElementById('app').innerHTML=`<main class="login-screen"><section class="login-card"><div class="brand login-brand"><div class="brand-mark">A</div><div><div class="brand-name">Advisor Activity Tracker</div><div class="brand-sub">Advisor activity</div></div></div><div class="login-intro"><div class="greeting">SPORTS PARTNERSHIPS</div><h1>Welcome back</h1><p>Sign in to review club conversations and keep the next steps moving.</p></div><form id="login-form" class="login-form"><label>Username<input class="input" name="username" autocomplete="username" placeholder="Enter your username" required></label><label>Password<input class="input" name="password" type="password" autocomplete="current-password" placeholder="Enter your password" required></label><div class="login-error" id="login-error" role="alert" aria-live="assertive">${esc(message)}</div><button class="btn primary login-submit" type="submit">Sign in <span>→</span></button></form></section><div class="login-aside"><div class="login-aside-mark">A</div><div class="login-aside-copy"><span>BUILT AROUND THE RELATIONSHIP</span><h2>Better conversations<br>start with a clear view.</h2><p>One place for club history, upcoming meetings, and the commitments that follow.</p></div><div class="login-aside-footer">NFL &nbsp; MLB &nbsp; MLS &nbsp; NHL &nbsp; NBA</div></div></main>`;$('#login-form').onsubmit=async e=>{e.preventDefault();const epoch=accountEpoch;const fd=new FormData(e.target),button=e.target.querySelector('button[type=submit]');button.disabled=true;button.textContent='Signing in…';try{const r=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:fd.get('username'),password:fd.get('password')})});const payload=await r.json();if(epoch!==accountEpoch)return;if(!r.ok)throw new Error(payload.error||'Sign in failed');let needsSave=false;if(payload.state)db=payload.state;else if(payload.actor==='u-admin'){db=freshDB();needsSave=true}else{loginPage('The admin account needs to sign in once to initialize this workspace.');return}db.activeUser=payload.actor;if(!payload.state&&seedShowcaseData(payload.actor)){linkShowcaseMeetings();needsSave=true};if(!isStaff()&&linkShowcaseMeetings())needsSave=true;if(needsSave&&!await save())return;if(epoch!==accountEpoch)return;page='home';app()}catch(err){if(epoch!==accountEpoch)return;$('#login-error').textContent=err.message;button.disabled=false;button.innerHTML='Sign in <span>→</span>'}}}
async function init(){const epoch=accountEpoch;try{const r=await fetch('/api/session');const payload=await r.json();if(epoch!==accountEpoch)return;if(!payload.authenticated){loginPage();return}let needsSave=false;if(payload.state)db=payload.state;else if(payload.actor==='u-admin'){db=freshDB();needsSave=true}else{loginPage('Ask an admin to initialize the workspace before signing in as a regular user.');return}db.activeUser=payload.actor;if(!payload.state&&seedShowcaseData(payload.actor)){linkShowcaseMeetings();needsSave=true};if(!isStaff()&&linkShowcaseMeetings())needsSave=true;if(needsSave&&!await save())return;if(epoch!==accountEpoch)return;app()}catch(e){if(epoch===accountEpoch)loginPage(e.message||'Start the local server with python3 server.py, then reload this page.')}};

let timeExpenseTab = 'time';
let allowanceMonth=dt().slice(0,7);
async function renderTimeExpenses(view) {
 const heading = isStaff() ? 'Timesheets & expenses' : 'Time & expenses';
 view.innerHTML = head('', heading, '') + '<div class="empty" role="status">Loading entries…</div>';
 bindPage();
 try {
  const {entries,meetingTime=[],allowances=[]} = await timeExpenseRequest();
  if (page !== 'time-expenses' || view !== $('#view')) return;
  contractAllowances=allowances;
  showTimeExpenses(view, heading, entries, meetingTime);
 } catch (error) {
  if (page !== 'time-expenses' || view !== $('#view')) return;
  view.innerHTML = head('', heading, '') + '<div class="empty" role="alert">'+esc(error.message)+'</div><button class="btn" data-page="time-expenses">Retry</button>';
  bindPage();
 }
}

async function timeExpenseRequest(data) {
 let response;
 try {
  response = await fetch('/api/time-expenses', data ? {
  method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data)
  } : {});
 } catch {
  throw new Error('Could not reach Advisor Activity Tracker. Check that the server is running and try again.');
 }
 if (response.status === 404 || response.status === 405) {
  throw new Error('Time & expenses is unavailable on this server. Restart Advisor Activity Tracker with the latest server.py, then refresh.');
 }
 const result = await response.json().catch(()=>null);
 if (!response.ok || !result || (data ? result.ok !== true : !Array.isArray(result.entries))) {
  throw new Error(result?.error || 'Advisor Activity Tracker returned an unexpected response. Refresh and try again.');
 }
 return result;
}

function showTimeExpenses(view, heading, entries, meetingTime) {
 const admin = isStaff();
 const time = timeExpenseTab === 'time';
 const rows = entries.filter(item=>item.kind===timeExpenseTab);
 view.innerHTML = head('', heading, '') + `<div class="card">
  <div class="card-head time-expense-toolbar">
   <div class="segmented" aria-label="Entry type">${[['time','Timesheet'],['travel','Expenses']].map(([key,label])=>
    `<button type="button" data-expense-tab="${key}" class="${timeExpenseTab===key?'active':''}" aria-pressed="${timeExpenseTab===key}">${label}</button>`).join('')}</div>
   <div class="form-actions"><button type="button" class="btn" id="expense-export">Download CSV</button>${!admin?'<button type="button" class="btn primary" id="expense-new">'+(time?'Add timesheet':'Add expense')+'</button>':''}</div>
  </div>
  ${time?`<section class="timesheet-allowance"><div class="time-expense-toolbar"><h2 class="card-title">Monthly contract balance</h2><label>Month <input class="input" type="month" id="allowance-month" value="${esc(allowanceMonth)}"></label></div><div id="allowance-balances"></div></section>`:''}
  <div class="card-body" id="expense-editor"></div>
  <div class="table-wrap"><table class="table time-expense-table"><thead><tr>
  ${admin?'<th>Advisor / EXL POC</th>':''}${time?'<th>From date</th><th>To date</th><th>Work and meetings</th><th>Total hours</th><th>Amount</th>':'<th>Date</th><th>Category</th><th>Description</th><th>Total cost</th>'}
  <th>Status</th><th>Actions</th></tr></thead><tbody>${rows.map(item=>timeExpenseRow(item,admin,time)).join('')||`<tr><td colspan="${(time?7:6)+(admin?1:0)}"><div class="empty">No entries yet.</div></td></tr>`}</tbody></table></div></div>`;
 bindPage();
 if(time){
  const renderBalances=()=>{
   const selected=view.querySelector('#allowance-month').value;
   allowanceMonth=selected;
   const owners=admin?db.users.filter(person=>person.role==='User'):[user()];
   view.querySelector('#allowance-balances').innerHTML=owners.map(person=>{
    const contract=contractFor(person.id),balance=advisorBalance(person.id,selected);
    return `<div class="timesheet-advisor-balance">${admin?`<h3>${esc(person.name)}</h3>`:''}${contractTermDates(contract)}${allowanceCards(balance)}</div>`;
   }).join('');
  };
  view.querySelector('#allowance-month').onchange=renderBalances;
  renderBalances();
 }
 view.querySelectorAll('[data-expense-tab]').forEach(button=>button.onclick=()=>{
  timeExpenseTab=button.dataset.expenseTab;
  showTimeExpenses(view,heading,entries,meetingTime);
  view.querySelector('[aria-pressed="true"]')?.focus();
 });
 $('#expense-new')?.addEventListener('click',()=>openTimeExpenseEditor(view,undefined,meetingTime));
 $('#expense-export')?.addEventListener('click',()=>exportTimeExpenses(rows,time));
 view.querySelectorAll('[data-expense-edit]').forEach(button=>button.onclick=()=>openTimeExpenseEditor(view,rows.find(item=>item.id===button.dataset.expenseEdit),meetingTime));

}

function timeExpenseRow(item,admin,time) {
 const detail=item.detail;
 const edit=!admin;
 return `<tr>${admin?`<td>${esc(item.advisor)}</td>`:''}<td>${fmt(item.entry_date)}</td>${time?`<td>${fmt(detail.toDate||item.entry_date)}</td>`:''}
 ${time?`<td>${esc(detail.deliverables)}${detail.meetings?.length?`<ul class="timesheet-meetings">${detail.meetings.map(meeting=>`<li>${meeting.date?fmt(meeting.date)+' · ':''}${esc(meeting.organization)} · ${meeting.minutes} min</li>`).join('')}</ul>`:''}</td><td>${esc(detail.hours)}${detail.meetingMinutes?`<div class="cell-sub">${detail.meetingMinutes} min in meetings</div>`:''}</td><td>${detail.amount!=null?contractMoney(detail.amount):db.contracts?.[item.owner]?.hourlyRate!=null?contractMoney(Number(detail.hours)*Number(db.contracts[item.owner].hourlyRate)):'—'}</td>`:
 `<td>${esc(detail.category==='Other'?detail.otherCategory:detail.category||'Travel')}</td><td>${esc(detail.reason)}${detail.origin?`<div class="cell-sub">${esc(detail.origin)} → ${esc(detail.destination)}</div>`:''}</td><td>${Number(detail.cost).toFixed(2)}</td>`}
 <td><span class="pill green">Saved</span></td>
 <td>${edit?`<button type="button" class="action-link" data-expense-edit="${esc(item.id)}">Edit</button>`:''}</td></tr>`;
}

function openTimeExpenseEditor(view,item,meetingTime=[]) {
 const detail=item?.detail||{};
 const time=timeExpenseTab==='time';
 const startDate=item?.entry_date||localDateKey(new Date());
 const endDate=detail.toDate||startDate;
 const field=(label,name,type,value,attrs='')=>`<label class="field"><span>${label}</span><input class="input" name="${name}" type="${type}" value="${esc(value)}" required ${attrs}></label>`;
 const longField=(label,name,value)=>`<label class="field full"><span>${label}</span><textarea class="textarea" name="${name}" maxlength="2000" required>${esc(value)}</textarea></label>`;
 const editor=$('#expense-editor');
 editor.innerHTML=`<form class="form-section time-expense-editor">
 <h2 class="card-title">${item?'Edit entry':time?'Timesheet':'Expense'}</h2>
 <div class="form-grid">${field(time?'From date':'Date','date','date',startDate)}${time?field('To date','toDate','date',endDate):''}
 ${time?`<div class="field full" id="timesheet-meeting-preview" aria-live="polite"></div>
 <label class="field"><span>Other work (hours)</span><input class="input" name="hours" type="number" min="0" step="0.01" value="${esc(detail.manualHours??detail.hours??'')}"></label>
 <label class="field full"><span>Other work description</span><textarea class="textarea" name="deliverables" maxlength="2000">${esc(detail.deliverables)}</textarea></label>`:
 `<label class="field"><span>Category</span><select class="select" name="category">${['Travel','Food','Other'].map(category=>`<option${category===(detail.category||'Travel')?' selected':''}>${category}</option>`).join('')}</select></label>`+
 field('Other category','otherCategory','text',detail.otherCategory,'maxlength="120"')+
 field('Total cost','cost','number',detail.cost,'min="0.01" max="999999999" step="0.01"')+
 field('Travel from','origin','text',detail.origin,'maxlength="250"')+
 field('Travel to','destination','text',detail.destination,'maxlength="250"')+
 longField('Description','reason',detail.reason)}</div>
 <div class="form-actions"><button type="button" class="btn" data-entry-close>Close</button>
 <button class="btn primary" name="action" value="save">${time?'Save timesheet':'Save expense'}</button>
 </div><div class="time-expense-error" role="alert"></div></form>`;
 const form=editor.querySelector('form');
 if(time){
  const from=form.elements.date,to=form.elements.toDate;
  let sameDay=from.value===to.value;
  const syncTime=()=>{
   to.min=from.value;
   const valid=from.value&&to.value&&from.value<=to.value;
   const meetings=valid?meetingTime.filter(meeting=>meeting.date>=from.value&&meeting.date<=to.value):[];
   const minutes=meetings.reduce((total,meeting)=>total+meeting.minutes,0);
   const manual=Number(form.elements.hours.value)||0;
   form.elements.deliverables.required=manual>0;
   form.querySelector('#timesheet-meeting-preview').innerHTML=`<strong>Completed meeting time: ${minutes} min</strong>
   ${meetings.length?`<ul class="timesheet-meetings">${meetings.map(meeting=>`<li>${meeting.date?fmt(meeting.date)+' · ':''}${esc(meeting.organization)} · ${meeting.minutes} min</li>`).join('')}</ul>`:''}
   <span>Total: ${(manual+minutes/60).toFixed(2)} h${(detail.billingRate??db.contracts?.[user().id]?.hourlyRate)!=null?' · '+contractMoney((manual+minutes/60)*Number(detail.billingRate??db.contracts[user().id].hourlyRate)):''}</span>${valid&&from.value.slice(0,7)!==to.value.slice(0,7)&&manual>0?'<small>Other work hours are split evenly across the calendar days in this range.</small>':''}`;
  };
  from.addEventListener('change',()=>{
   if(sameDay||!to.value||to.value<from.value)to.value=from.value;
   sameDay=from.value===to.value;
   syncTime();
  });
  to.addEventListener('change',()=>{sameDay=from.value===to.value;syncTime()});
  form.elements.hours.addEventListener('input',syncTime);
  syncTime();
 } else {
  const syncCategory=()=>{
   const category=form.elements.category.value;
   for(const [name,visible] of [['origin',category==='Travel'],['destination',category==='Travel'],['otherCategory',category==='Other']]){
    const input=form.elements[name];
    input.closest('label').hidden=!visible;
    input.disabled=!visible;
    input.required=visible;
   }
  };
  form.elements.category.addEventListener('change',syncCategory);
  syncCategory();
 }
 form.querySelector('input,textarea')?.focus();
 form.querySelector('[data-entry-close]').onclick=()=>{editor.innerHTML='';};
 form.onsubmit=async event=>{
  event.preventDefault();
  const action='save';
  const data=Object.fromEntries(new FormData(form));
  const errorBox=form.querySelector('[role=alert]');
  errorBox.textContent='';
  form.querySelectorAll('button').forEach(button=>button.disabled=true);
  try {
   await timeExpenseRequest({...data,action,kind:timeExpenseTab,id:item?.id,revision:item?.revision});
   if(time)allowanceMonth=data.date.slice(0,7);
   if(page==='time-expenses'&&view===$('#view'))await renderTimeExpenses(view);
  } catch(error) {
   errorBox.textContent=error.message;
  } finally {
   form.querySelectorAll('button').forEach(button=>button.disabled=false);
  }
 };
}

function exportTimeExpenses(rows,time) {
 if(!rows.length){toast(time?'No timesheets to export':'No expenses to export');return}
 const columns=time?['Advisor / EXL POC','From date','To date','Other work','Other work hours','Meeting minutes','Total hours','Hourly rate ($)','Amount ($)']:['Advisor / EXL POC','Date','Category','Travel From','Travel To','Total Cost','Description'];
 const csv=[columns,...rows.map(({advisor,owner,entry_date:date,detail})=>time?
  [advisor,date,detail.toDate||date,detail.deliverables,detail.manualHours??detail.hours,detail.meetingMinutes??0,detail.hours,detail.billingRate??db.contracts?.[owner]?.hourlyRate??'',detail.amount??(db.contracts?.[owner]?.hourlyRate!=null?(Number(detail.hours)*Number(db.contracts[owner].hourlyRate)).toFixed(2):'')]:
  [advisor,date,detail.category==='Other'?detail.otherCategory:detail.category||'Travel',detail.origin||'',detail.destination||'',detail.cost,detail.reason])].map(row=>row.map(value=>{
   const text=String(value);
   return '"'+(/^[\s]*[=+@-]|^[\t\r\n]/.test(text)?"'"+text:text).replace(/"/g,'""')+'"';
  }).join(',')).join('\r\n');
 const url=URL.createObjectURL(new Blob(['\uFEFF',csv],{type:'text/csv;charset=utf-8'}));
 const link=document.createElement('a');
 link.href=url;
 link.download=time?'timesheets.csv':'expenses.csv';
 link.click();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
}


init();
