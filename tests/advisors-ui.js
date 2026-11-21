// Execute in a Node VM after loading app.js without its final init() call.
// The harness supplies Node's strict assert as global `assert` and a minimal document.
(async()=>{
 const originalDb=db;
 db={activeUser:'admin',users:[
  {id:'admin',name:'Admin',role:'Admin',title:'Admin'},
  {id:'sub',name:'Sub Admin',role:'Sub-admin',title:'Sub-admin'},
  {id:'avery',name:'Avery Morgan',role:'User',title:'Advisor'},
  {id:'taylor',name:'Taylor Brooks',role:'User',title:'Advisor'}],
  clubs:[{id:'cowboys',name:'Dallas Cowboys',league:'NFL'},{id:'company',name:'Example Company',league:'Other'}],
  interactions:[
   {id:'old',owner:'avery',clubId:'company',date:'2025-02-01',summary:'Older discussion',capabilities:[]},
   {id:'start',owner:'avery',clubId:'cowboys',date:'2026-11-10',summary:'Start boundary',capabilities:['Marketing in a Box']},
   {id:'end',owner:'avery',clubId:'cowboys',date:'2026-11-20',summary:'End boundary',capabilities:[]},
   {id:'other',owner:'taylor',clubId:'cowboys',date:'2026-11-15',summary:'Private Taylor discussion',capabilities:[]}],
  meetings:[{id:'planned-only',owner:'avery',clubId:'company',date:'2026-12-01',status:'Planned'}],
  contracts:{avery:{sowStart:'2026-10-01',sowEnd:'2027-03-31',hourlyRate:40,firstMonthCap:60,monthlyCap:80,
   conditions:'Written terms <script>alert(1)</script>',scope:'Relationship development',paymentTerms:'Net 30',
   deliverables:[{name:'Introductions',target:8,actual:3}]}},companyAccess:{}};
 contractAllowances=[
  {owner:'avery',month:'2026-11',configured:true,hourlyRate:'40.00',hoursCap:'80.00',hoursUsed:'2.00',hoursRemaining:'78.00',amountUsed:'80.00',amountRemaining:'3120.00'},
  {owner:'avery',month:'2026-12',configured:true,hourlyRate:'40.00',hoursCap:'80.00',hoursUsed:'3.00',hoursRemaining:'77.00',amountUsed:'120.00',amountRemaining:'3080.00'}];
 advisorTimeEntries=[
  {owner:'avery',kind:'time',detail:{hours:'2.00'}},{owner:'avery',kind:'time',detail:{hours:'3.00'}},
  {owner:'taylor',kind:'time',detail:{hours:'99.00'}},{owner:'avery',kind:'travel',detail:{hours:'50.00',cost:'50'}}];
 const ownIds=()=>advisorInteractionItems('avery').map(item=>item.id);
 assert.deepEqual(ownIds(),['end','start','old']);
 assert.deepEqual(advisorInteractionItems('avery','range','2026-11-10','2026-11-20').map(item=>item.id),['end','start']);
 assert.equal(advisorInteractionItems('avery','range','2026-11-10','2026-11-10').length,1);
 assert.equal(advisorInteractionItems('avery','range','2026-11-20','2026-11-10').length,0);
 assert.equal(advisorInteractionItems('avery','range','','').length,0);
 assert.equal(advisorCompanyGroups('avery').length,2);
 assert.equal(advisorCompanyGroups('avery')[0][1].length,2);
 assert.equal(advisorHoursLogged('avery'),'5.00');
 assert.equal(advisorBalance('avery','2026-11').hoursRemaining,'78.00');
 assert.equal(advisorBalance('avery','2026-10').hoursRemaining,'60.00');
 assert.equal(advisorBalance('avery','2027-01').amountRemaining,'3200.00');
 assert.equal(advisorBalance('taylor','2026-11').configured,false);
 const dates=contractTermDates(db.contracts.avery);
 assert(dates.includes('Term start')&&dates.includes('Term end')&&dates.includes('2027-03-31'));
 assert(!contractTermDates(null).includes('undefined'));
 selectedAdvisorId='avery';advisorMonth='2026-11';advisorActivityMode='all';advisorActivityFrom='';advisorActivityTo='';
 const profile=advisorsPage();
 assert(profile.includes('Older discussion'));
 assert(!profile.includes('Private Taylor discussion'));
 assert(profile.includes('Introductions')&&profile.includes('3 of 8'));
 assert(profile.includes('2027-03-31')&&profile.includes('2026-10-01'));
 assert(profile.includes('Written terms &lt;script&gt;'));
 assert(!profile.includes('<script>alert(1)</script>'));
 assert(profile.includes('value="all" selected'));
 assert(!profile.includes('data-contract-edit'));
 const nodes={
  '#advisor-month':{value:'2026-11',listeners:{},addEventListener(name,fn){this.listeners[name]=fn}},
  '#advisor-monthly-cap':{},'#advisor-monthly-balance':{},'#advisor-activity-period':{value:'all'},
  '#advisor-activity-from':{value:''},'#advisor-activity-to':{value:''},'#advisor-date-range':{hidden:true},
  '#advisor-activity-error':{},'#advisor-activity-count':{},'#advisor-activity-results':{}};
 const view={querySelector:selector=>nodes[selector]||null,querySelectorAll:()=>[]};
 bindAdvisors(view);
 assert(nodes['#advisor-monthly-balance'].innerHTML.includes('78.00 h'));
 nodes['#advisor-month'].value='2026-12';nodes['#advisor-month'].listeners.change();
 assert(nodes['#advisor-monthly-balance'].innerHTML.includes('77.00 h'));
 nodes['#advisor-activity-period'].value='range';nodes['#advisor-activity-period'].onchange();
 assert.equal(nodes['#advisor-activity-from'].value,'2025-02-01');
 assert.equal(nodes['#advisor-activity-to'].value,'2026-11-20');
 nodes['#advisor-activity-from'].value='2026-11-10';nodes['#advisor-activity-to'].value='2026-11-10';nodes['#advisor-activity-from'].onchange();
 assert.equal(nodes['#advisor-activity-count'].textContent,'1 interaction');
 assert(!nodes['#advisor-activity-results'].innerHTML.includes('End boundary'));
 assert(nodes['#advisor-monthly-balance'].innerHTML.includes('77.00 h'));
 assert.equal(advisorCompanyGroups('avery').length,2);
 nodes['#advisor-activity-from'].value='2026-11-21';nodes['#advisor-activity-from'].onchange();
 assert(nodes['#advisor-activity-error'].textContent.includes('on or after'));
 nodes['#advisor-activity-period'].value='all';nodes['#advisor-activity-period'].onchange();
 assert.equal(nodes['#advisor-activity-count'].textContent,'3 interactions');
 assert.equal(nodes['#advisor-activity-error'].textContent,'');assert(nodes['#advisor-date-range'].hidden);
 db.activeUser='sub';assert(advisorsPage().includes('Contract summary'));assert(!advisorsPage().includes('data-contract-edit'));
 selectedAdvisorId=null;assert(advisorsPage().includes('data-open-advisor="avery"'));
 selectedAdvisorId='taylor';const noContract=advisorsPage();assert(noContract.includes('No contract terms recorded.'));assert(noContract.includes('No goals recorded.'));assert(!noContract.includes('undefined'));
 db.activeUser='avery';assert(!advisorsPage().includes('Private Taylor discussion'));
 const originalRenderPage=renderPage,originalFetch=globalThis.fetch;let redirected=false,requested=false;
 renderPage=()=>{redirected=true};globalThis.fetch=async()=>{requested=true;throw new Error('Should not fetch')};
 await renderAdvisors({});assert(redirected);assert(!requested);assert.equal(page,'home');
 renderPage=originalRenderPage;globalThis.fetch=originalFetch;
 assert(showTimeExpenses.toString().includes('contractTermDates(contract)'));
 db=originalDb;
 console.log('Advisor UI regression checks passed: owner separation, all-history default, inclusive ranges, independent monthly balances, goals, term dates, missing contracts, safe text and role guards.');
})();
