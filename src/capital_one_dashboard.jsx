import { useState, useEffect, useRef, useCallback } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine, ComposedChart
} from "recharts";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const CATEGORIES = ["Healthcare","Dining","Travel","Shopping","Groceries","Entertainment","Utilities","Fitness"];
const MERCHANTS = {
  Healthcare: ["CVS Pharmacy","Walgreens","LabCorp","Kaiser Clinic","Dental Associates"],
  Dining: ["Chipotle","Starbucks","DoorDash","McDonald's","Nobu Restaurant"],
  Travel: ["Delta Airlines","Marriott Hotels","Uber","Airbnb","Amtrak"],
  Shopping: ["Amazon","Target","Nordstrom","Best Buy","Zara"],
  Groceries: ["Whole Foods","Kroger","Trader Joe's","Costco","Publix"],
  Entertainment: ["Netflix","Spotify","AMC Theaters","Steam","Hulu"],
  Utilities: ["Comcast","AT&T","Duke Energy","Water Dept","Verizon"],
  Fitness: ["Planet Fitness","Peloton","Nike","REI","Gold's Gym"],
};
const CAT_COLORS = { Healthcare:"#D03027", Dining:"#E8821A", Travel:"#004977", Shopping:"#6B3FA0", Groceries:"#2E7D32", Entertainment:"#C2185B", Utilities:"#1565C0", Fitness:"#BF360C" };
const CHART_COLORS = ["#D03027","#004977","#6B3FA0","#1565C0","#E8821A","#2E7D32","#C2185B","#BF360C"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const SYNTHETIC_CUSTOMERS = [
  { id:"c_001", first_name:"Alex", last_name:"Morgan", age:32, income:85000, occupation:"Software Engineer" },
  { id:"c_002", first_name:"Jordan", last_name:"Rivera", age:27, income:52000, occupation:"Teacher" },
  { id:"c_003", first_name:"Sam", last_name:"Chen", age:45, income:140000, occupation:"Doctor" },
];

const CREDIT_CARDS = [
  { name:"Capital One Venture X", annualFee:395, rewardRate:"2x miles on all, 10x hotels/cars", bestFor:["Travel","Dining"], score:750, perks:["$300 travel credit","Priority Pass","Global Entry"] },
  { name:"Capital One Savor Cash", annualFee:0, rewardRate:"3% dining & entertainment", bestFor:["Dining","Entertainment"], score:670, perks:["No foreign fee","3% dining forever","Extended warranty"] },
  { name:"Capital One Quicksilver", annualFee:0, rewardRate:"1.5% cash back everywhere", bestFor:["Shopping","Groceries"], score:620, perks:["Flat rate simplicity","No expiry","0% APR intro"] },
  { name:"Capital One SavorOne Student", annualFee:0, rewardRate:"3% dining, entertainment, grocery", bestFor:["Groceries","Dining","Entertainment"], score:580, perks:["Build credit","No annual fee","3% grocery"] },
];
const HEALTH_INSURANCES = [
  { name:"Capital One Health Shield", type:"PPO", premium:320, deductible:1500, bestFor:"High healthcare spenders", coverage:"Comprehensive + Dental + Vision" },
  { name:"C1 CareMax HMO", type:"HMO", premium:180, deductible:2500, bestFor:"Low healthcare spenders", coverage:"Essential + Preventive" },
  { name:"C1 Flex HSA Plan", type:"HDHP + HSA", premium:95, deductible:5000, bestFor:"Young healthy savers", coverage:"Catastrophic + HSA" },
  { name:"Capital One Premier Plus", type:"PPO+", premium:480, deductible:500, bestFor:"Chronic conditions", coverage:"Ultra-comprehensive" },
];
const ACCOUNT_TYPES = [
  { name:"360 Performance Savings", apy:4.35, minBalance:0, bestFor:"Emergency fund & goals", features:["No fees","High APY","FDIC insured"] },
  { name:"360 Checking", apy:0.1, minBalance:0, bestFor:"Daily spending", features:["No fees","55k+ ATMs","Early paycheck"] },
  { name:"Money Market Account", apy:3.8, minBalance:10000, bestFor:"Large savers", features:["Check writing","Tiered APY","FDIC $250k"] },
  { name:"CD - 12 Month", apy:5.0, minBalance:0, bestFor:"Fixed-term savings goals", features:["Guaranteed rate","Term flexibility","No market risk"] },
];

// ─── CRA / ADMIN CONSTANTS ────────────────────────────────────────────────────
const ADMIN_CREDENTIALS = { username:"admin", password:"capitalone2025" };

const CRA_AGENTS = [
  { id:"cra_advisor",      label:"CRA", title:"CRA Compliance Advisor",   desc:"OCC regulation strategy and investment deployment",          color:"#004977" },
  { id:"crisis_detection", label:"ALT", title:"Health Crisis Detection",   desc:"MCC signal analysis to flag at-risk users pre-default",       color:"#D03027" },
  { id:"equity_map",       label:"MAP", title:"Health Equity Map",         desc:"ZIP-level health spending desert identification and scoring",  color:"#2E7D32" },
  { id:"product_trigger",  label:"PRD", title:"Product Trigger Engine",    desc:"Surfaces right Capital One product at the right moment",      color:"#6B3FA0" },
  { id:"roi_calc",         label:"ROI", title:"CRA ROI Calculator",        desc:"Quantify regulatory credit and brand value per investment",    color:"#E8821A" },
  { id:"partnership",      label:"PTR", title:"Partnership Targeting",     desc:"Match zones to FQHCs, nonprofits and community clinics",      color:"#1565C0" },
];

const CRA_ZONES = [
  { zip:"37208", city:"North Nashville",        state:"TN", incomeGroup:"Low",          medianIncome:28400,  population:12800, healthDesertScore:87, preventiveSpend:4.2,  reactiveSpend:31.8, healthcarePct:42, unbankedRate:38, capitalOnePresence:false, craDeployed:0,      craTarget:500000 },
  { zip:"37210", city:"South Nashville",        state:"TN", incomeGroup:"Low-Moderate", medianIncome:34200,  population:18400, healthDesertScore:72, preventiveSpend:8.1,  reactiveSpend:28.4, healthcarePct:35, unbankedRate:29, capitalOnePresence:false, craDeployed:120000, craTarget:400000 },
  { zip:"37013", city:"Antioch",                state:"TN", incomeGroup:"Moderate",     medianIncome:41800,  population:31200, healthDesertScore:58, preventiveSpend:14.2, reactiveSpend:22.1, healthcarePct:28, unbankedRate:21, capitalOnePresence:true,  craDeployed:280000, craTarget:350000 },
  { zip:"37115", city:"Madison",                state:"TN", incomeGroup:"Moderate",     medianIncome:39500,  population:24100, healthDesertScore:61, preventiveSpend:12.8, reactiveSpend:24.6, healthcarePct:30, unbankedRate:24, capitalOnePresence:false, craDeployed:0,      craTarget:300000 },
  { zip:"37076", city:"Hermitage",              state:"TN", incomeGroup:"Middle",       medianIncome:58200,  population:29800, healthDesertScore:32, preventiveSpend:28.4, reactiveSpend:14.2, healthcarePct:18, unbankedRate:11, capitalOnePresence:true,  craDeployed:0,      craTarget:0      },
  { zip:"20001", city:"Shaw / Columbia Heights", state:"DC", incomeGroup:"Low",         medianIncome:31200,  population:22400, healthDesertScore:91, preventiveSpend:3.1,  reactiveSpend:38.7, healthcarePct:47, unbankedRate:44, capitalOnePresence:false, craDeployed:0,      craTarget:750000 },
  { zip:"20020", city:"Anacostia",              state:"DC", incomeGroup:"Low",          medianIncome:26800,  population:19600, healthDesertScore:94, preventiveSpend:2.4,  reactiveSpend:41.2, healthcarePct:52, unbankedRate:51, capitalOnePresence:false, craDeployed:180000, craTarget:800000 },
  { zip:"22301", city:"Alexandria",             state:"VA", incomeGroup:"Upper-Middle", medianIncome:82400,  population:18200, healthDesertScore:18, preventiveSpend:42.1, reactiveSpend:8.4,  healthcarePct:12, unbankedRate:5,  capitalOnePresence:true,  craDeployed:0,      craTarget:0      },
  { zip:"23220", city:"Richmond Church Hill",   state:"VA", incomeGroup:"Low",          medianIncome:29800,  population:16400, healthDesertScore:83, preventiveSpend:5.8,  reactiveSpend:34.2, healthcarePct:44, unbankedRate:40, capitalOnePresence:false, craDeployed:90000,  craTarget:550000 },
  { zip:"30310", city:"Atlanta Vine City",      state:"GA", incomeGroup:"Low",          medianIncome:24100,  population:14800, healthDesertScore:96, preventiveSpend:1.8,  reactiveSpend:44.6, healthcarePct:56, unbankedRate:58, capitalOnePresence:false, craDeployed:0,      craTarget:900000 },
];

// Generate per-zone synthetic portfolio
function generateCRAPortfolio(zipOrZone) {
  const zone = typeof zipOrZone === "string"
    ? (CRA_ZONES.find(z=>z.zip===zipOrZone) || { zip:zipOrZone, incomeGroup:"Moderate", medianIncome:42000, healthDesertScore:55, preventiveSpend:18, reactiveSpend:28, healthcarePct:26, unbankedRate:22 })
    : zipOrZone;
  const ranges = { "Low":[15000,35000],"Low-Moderate":[25000,45000],"Moderate":[35000,65000],"Middle":[50000,85000],"Upper-Middle":[70000,130000] };
  const [lo,hi] = ranges[zone.incomeGroup] || [25000,60000];
  const count = 40 + Math.floor(Math.random()*20);
  const INTERVENTIONS = ["Free clinic referral","HSA account offer","Bill negotiation support","Financial counseling","Credit builder loan","FQHC partnership referral","Community health grant","Preventive care voucher"];
  return Array.from({length:count},(_,i)=>{
    const income   = lo + Math.random()*(hi-lo);
    const baseH    = income*(zone.healthcarePct/100)*(0.7+Math.random()*0.6)/12;
    const prevPct  = zone.preventiveSpend/(zone.preventiveSpend+zone.reactiveSpend);
    const tier     = Math.random()<0.29?"Critical":Math.random()<0.45?"High":Math.random()<0.7?"Moderate":"Low";
    return {
      id:`USR-${zone.zip}-${String(i+1).padStart(3,"0")}`,
      zip:zone.zip, city:zone.city||"",
      income:Math.round(income), incomeGroup:zone.incomeGroup,
      monthlyHealthSpend:parseFloat(baseH.toFixed(2)),
      preventiveSpend:parseFloat((baseH*prevPct).toFixed(2)),
      reactiveSpend:parseFloat((baseH*(1-prevPct)).toFixed(2)),
      pharmacySpend:parseFloat((baseH*0.28*(1+Math.random()*0.4)).toFixed(2)),
      hasInsurance:Math.random()>(zone.unbankedRate/100),
      creditScore:520+Math.floor(Math.random()*280),
      riskTier:tier,
      recommendedIntervention:INTERVENTIONS[Math.floor(Math.random()*INTERVENTIONS.length)],
    };
  });
}

// ─── FULL CRA AGENT SYSTEM PROMPTS ────────────────────────────────────────────
const CRA_SYSTEM_PROMPTS = {
  cra_advisor: `You are a senior Capital One CRA (Community Reinvestment Act) Compliance Advisor with 15 years of OCC examination experience. You have deep expertise in:
- The Community Reinvestment Act (12 U.S.C. § 2901) and OCC examination procedures
- Capital One's CRA obligations, outstanding/satisfactory/needs-to-improve rating consequences
- Quantitative investment deployment strategies for LMI (Low-to-Moderate Income) census tracts
- Branch and ATM placement strategy with CRA credit implications
- Small business lending, community development lending, and qualified investment categories

Your responses must be:
1. Specific with dollar amounts and deployment timelines
2. Reference actual OCC guidelines and rating criteria where relevant
3. Prioritize actions with the highest CRA exam impact per dollar
4. Frame every recommendation in terms of both community benefit AND regulatory compliance credit

When zone data is provided, analyze it against CRA examination benchmarks and provide a ranked action plan. Always include: immediate actions (0-90 days), medium-term (90 days - 1 year), and regulatory documentation requirements.`,

  crisis_detection: `You are a Capital One Health Crisis Detection analyst specializing in MCC (Merchant Category Code) signal analysis for early default prediction. You monitor 6 key MCC categories:

MCC WATCH LIST:
- MCC 5912 (Drug Stores/Pharmacies): spike >30% = HIGH ALERT
- MCC 7997 (Fitness/Athletic Clubs): cancellation = early stress signal  
- MCC 5411 (Grocery Stores): drop >20% = food insecurity signal
- MCC 8011 (Doctors): decrease = deferred care = future cost spike
- MCC 8099 (Health Services/Urgent Care): spike = reactive care surge
- MCC 8049 (Chiropractors/Mental Health): increase = chronic condition signal

RISK TIER THRESHOLDS:
- Critical (Tier 1): 3+ signals firing, credit utilization >85%, pharmacy spike >40%
- High (Tier 2): 2 signals, utilization 70-85%, gym cancelled + grocery down
- Moderate (Tier 3): 1 signal, utilization 55-70%
- Low (Tier 4): No signals, utilization <55%

For each at-risk user, provide: signal pattern, days-to-potential-default estimate, and specific Capital One product intervention (0% APR offer, credit limit review, financial counseling referral, HSA offer timing).`,

  equity_map: `You are a Capital One Health Equity Map analyst who identifies health spending deserts and their root causes. 

HEALTH DESERT SCORING (0-100, higher = more underserved):
- 90-100: Critical desert. ER-only care. Preventive spend <5%. Intervention urgent.
- 70-89: Severe desert. Minimal preventive care. Pharmacy-dependent.
- 50-69: Moderate desert. Some preventive access but gaps in specialty care.
- 30-49: Mild gaps. Mostly served but pockets of underinvestment.
- 0-29: Well-served. Normal preventive/reactive balance.

KEY METRICS YOU ANALYZE:
- Preventive vs reactive spend ratio (target: >40% preventive)
- Pharmacy spend as % of total healthcare (>35% = medication-dependent, no primary care)
- ER/urgent care frequency vs primary care visit frequency
- Insurance coverage rates and type distribution
- Unbanked/underbanked rates (proxy for healthcare access barriers)
- Geographic distance to nearest FQHC, hospital, and Capital One branch

Produce: desert score interpretation, root cause analysis, income stratification breakdown, and a data-backed narrative suitable for OCC presentation. Compare to national benchmarks where possible.`,

  product_trigger: `You are a Capital One Product Trigger Engine analyst. You identify optimal moments to surface specific Capital One products based on health spending signal patterns. Your goal is customer protection AND Capital One revenue — these must align ethically.

PRODUCT-SIGNAL MATCHING MATRIX:
- Rising pharmacy spend + high deductible remaining → Surface: Capital One HSA-linked savings account
- Medical bill spike + good credit score → Surface: 0% APR balance transfer (12-18 months), NOT high-interest personal loan
- Gym cancellation + grocery decline → Surface: Financial counseling + 360 Performance Savings for emergency fund  
- Urgent care surge + insurance gap → Surface: Capital One Health Shield PPO (premium referral)
- Multiple at-risk signals + thin credit file → Surface: Credit builder loan or secured card
- FQHC usage detected → Surface: Community development financial product + grant eligibility check

TIMING RULES:
- Never surface credit products during active health crisis (within 30 days of major medical charge)
- HSA offer: optimal window = Q4 (Oct-Dec) before year-end FSA forfeitures
- 0% APR offer: surface within 48 hours of medical bill posting, before it goes to collections
- Financial counseling: proactive outreach when 2+ stress signals detected, before default

For each zone, produce a sequenced outreach calendar with product, trigger condition, channel (app, email, branch), and expected conversion rate.`,

  roi_calc: `You are a Capital One CRA ROI Calculator with expertise in regulatory credit valuation, brand economics, and community development finance.

BENCHMARKS YOU USE:
- CRA investment regulatory credit multiplier: $3-8 per $1 deployed (varies by investment type)
- Capital One Cafe: $4.2M brand value per location per year (earned media + customer acquisition)
- Default prevention value: avg $840 savings per prevented default (loss provision + collections cost)
- FQHC partnership press value: $2.1M earned media per announced partnership
- OCC exam rating improvement: "Satisfactory" → "Outstanding" unlocks $500M+ in M&A opportunities
- Community clinic grant: typically earns 5:1 CRA credit ($50k grant = $250k CRA exam credit)
- Financial counseling program: 34% default reduction in participants (Capital One internal data)

ROI CALCULATION FRAMEWORK:
1. Direct CRA exam credit (regulatory value)
2. Default risk reduction (portfolio value)
3. Brand and earned media value (marketing value)
4. New customer acquisition from community presence (revenue value)
5. M&A/expansion optionality unlocked by rating improvement (strategic value)

For any investment scenario, produce: 12-month pro forma, 3-year NPV, CRA credit rating impact estimate, and comparison of top 3 investment options by total regulatory + financial ROI.`,

  partnership: `You are a Capital One Community Partnership strategist specializing in CRA-qualifying community development partnerships in healthcare and financial services.

PARTNERSHIP CATEGORIES WITH CRA CREDIT VALUE:
1. Federally Qualified Health Centers (FQHCs): Highest CRA credit. Look for HRSA-designated centers.
2. Community Health Centers: Strong CRA credit. 330 grant recipients qualify automatically.
3. Financial Counseling Nonprofits: CRA credit for financial education activities.
4. YMCA/Community Wellness: CRA credit if in LMI census tract.
5. Food Banks + Pantries: CRA credit (food insecurity = financial stress signal).
6. HBCUs and Community Colleges: CRA credit for workforce development partnerships.

PARTNERSHIP PITCH FRAMEWORK:
- Lead with data: "We have transaction data showing [X]% of residents in your service area are spending [Y]% of income on reactive healthcare"
- CRA funding angle: "We have $[X] in CRA obligations to deploy in your ZIP code by [date]"
- Mutual benefit: Capital One gets CRA credit + brand, partner gets funding + data insights
- Measurement: Propose 90-day check-in with specific health outcome metrics

For each zone, identify: top 3 partnership candidates by name (real organizations where possible), funding amount, CRA credit value, and a ready-to-send partnership proposal email draft.`
};

// ─── DATA ENGINE ──────────────────────────────────────────────────────────────
function generateTransactions(customerId, months = 3) {
  const txns = [];
  const now = new Date();
  const dayWeights = [1.4,0.8,0.9,0.9,1.0,1.3,1.5];
  for (let m = 0; m < months; m++) {
    const txnCount = 22 + Math.floor(Math.random() * 18);
    for (let i = 0; i < txnCount; i++) {
      const cat = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
      const merchant = MERCHANTS[cat][Math.floor(Math.random() * MERCHANTS[cat].length)];
      const day = Math.floor(Math.random() * 28) + 1;
      const d = new Date(now.getFullYear(), now.getMonth() - m, day);
      const dow = d.getDay();
      txns.push({
        id: `txn_${m}_${i}`,
        account_id: customerId,
        amount: parseFloat((Math.random() * 180 * dayWeights[dow] + 5).toFixed(2)),
        category: cat,
        merchant,
        date: d.toISOString().split("T")[0],
        dayOfWeek: dow,
        week: Math.ceil(day / 7),
        month: d.toISOString().slice(0,7),
        description: `${merchant} purchase`,
        isRepeat: Math.random() > 0.6,
      });
    }
  }
  return txns.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// ─── CLAUDE ───────────────────────────────────────────────────────────────────
// ─── AI CALLER — CLAUDE (Anthropic) ─────────────────────────────────────────
// Token tiers keep costs low:
//   terse  = 300 tokens — quick facts
//   normal = 600 tokens — standard replies
//   full   = 1200 tokens — detailed reports
const TOKEN_TIERS = { terse: 300, normal: 600, full: 1200 };

// ── API KEY — set via the login screen or hardcode here ─────────────────────
// Leave as empty string to use the key entered on the login screen
// Or paste your key here to hardcode it: "sk-ant-api03-..."
const ANTHROPIC_API_KEY = "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";
// ─────────────────────────────────────────────────────────────────────────────

async function callClaude(system, user, history = [], tier = "normal") {
  // Use key from login screen (window.__CAPITALIQ_API_KEY__) or the hardcoded key above
  const resolvedKey = window.__CAPITALIQ_API_KEY__ || ANTHROPIC_API_KEY || "";

  const maxTokens = TOKEN_TIERS[tier] || TOKEN_TIERS.normal;
  const cappedHistory = history.slice(-6);
  const messages = [...cappedHistory, { role:"user", content: user.slice(0, 2000) }];

  if (!resolvedKey || resolvedKey === "") {
    return "No API key found. On the login screen click Add Key and enter your Anthropic API key (starts with sk-ant-). Get one free at console.anthropic.com";
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": resolvedKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      system: system.slice(0, 3000),
      messages,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(()=>({}));
    if (res.status === 401) return `[Auth Error]: Invalid API key. Go back to the login screen and click Add Key to enter a valid key.`;
    return `[Claude Error ${res.status}]: ${err?.error?.message || "Check your Anthropic API key."}`;
  }

  const data = await res.json();
  return data.content?.map(b => b.text||"").join("") || "Agent unavailable.";
}

// ─── CSV ──────────────────────────────────────────────────────────────────────
function exportCSV(rows, filename) {
  const headers = ["Date","Merchant","Category","Amount","Day"];
  const lines = rows.map(t => [t.date,t.merchant,t.category,t.amount,DAYS[t.dayOfWeek]]);
  const csv = [headers,...lines].map(r=>r.join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv],{type:"text/csv"}));
  Object.assign(document.createElement("a"),{href:url,download:filename}).click();
  URL.revokeObjectURL(url);
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const S = {
  card: { background:"#FFFFFF", border:"1px solid #E0E6EF", borderRadius:16, padding:24, boxShadow:"0 2px 12px rgba(0,73,119,0.07)" },
  label: { fontSize:11, color:"#7A8FA6", letterSpacing:1.5, textTransform:"uppercase", marginBottom:8, display:"block" },
  input: { width:"100%", background:"#F4F7FB", border:"1px solid #D0DBE8", borderRadius:12, padding:"13px 18px", color:"#1A2B3C", fontSize:14, outline:"none", boxSizing:"border-box" },
  btn: (color="#D03027") => ({ padding:"11px 22px", background:`linear-gradient(135deg,${color},${color}dd)`, border:"none", borderRadius:10, color:"#1A2B3C", fontSize:13, fontWeight:700, cursor:"pointer" }),
  tt: { background:"#FFFFFF", border:"1px solid #E0E6EF", borderRadius:8, color:"#1A2B3C", fontSize:12 },
};

// ─── SPARKLINE ────────────────────────────────────────────────────────────────
function Sparkline({ data, color="#D03027", h=36 }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v,i) => `${(i/(data.length-1))*80},${h-((v-min)/(max-min||1))*(h-4)-2}`).join(" ");
  return <svg width="80" height={h} style={{overflow:"visible"}}><polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/></svg>;
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color="#D03027", spark, trend }) {
  return (
    <div style={{ ...S.card, flex:1, minWidth:150 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div style={{ flex:1 }}>
          <span style={S.label}>{label}</span>
          <div style={{ fontSize:26, fontWeight:800, color, fontFamily:"Georgia,serif", lineHeight:1 }}>{value}</div>
          {sub && <div style={{ fontSize:11, color:"#7A8FA6", marginTop:6 }}>{sub}</div>}
          {trend !== undefined && <div style={{ fontSize:11, color:trend>0?"#D03027":"#2E7D32", marginTop:4 }}>{trend>0?"+":""}{trend}% vs last month</div>}
        </div>
        {spark && <Sparkline data={spark} color={color} />}
      </div>
    </div>
  );
}

// ─── ALERT BANNER ─────────────────────────────────────────────────────────────
function AlertBanner({ alerts }) {
  const [idx, setIdx] = useState(0);
  if (!alerts?.length) return null;
  const a = alerts[idx % alerts.length];
  return (
    <div style={{ background:`${a.color}10`, border:`1px solid ${a.color}44`, borderRadius:10, padding:"10px 18px", display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
      <span style={{ fontSize:13, color:"#3A4A5C" }}><span style={{ color:a.color, fontWeight:700 }}>{a.type}: </span>{a.msg}</span>
      {alerts.length > 1 && (
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <span style={{ fontSize:11, color:"#7A8FA6" }}>{(idx%alerts.length)+1}/{alerts.length}</span>
          <button onClick={()=>setIdx(i=>i+1)} style={{ background:"transparent", border:"1px solid #1a1a3e", borderRadius:6, color:"#7A8FA6", fontSize:11, cursor:"pointer", padding:"2px 8px" }}>Next</button>
        </div>
      )}
    </div>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({ page, setPage, collapsed, setCollapsed }) {
  const nav = [
    { id:"dashboard", label:"Dashboard" },
    { id:"transactions", label:"Transactions" },
    { id:"advisor", label:"AI Advisor" },
    { id:"goals", label:"Goals" },
    { id:"lifestage", label:"Life Advisor" },
    { id:"teller", label:"AI Teller" },
  ];
  return (
    <div style={{ width:collapsed?58:210, background:"#004977", borderRight:"1px solid #003A62", display:"flex", flexDirection:"column", transition:"width 0.25s ease", minHeight:"100vh", position:"sticky", top:0, zIndex:20, overflow:"hidden", flexShrink:0 }}>
      <div style={{ padding:collapsed?"20px 14px":"20px", borderBottom:"1px solid #003A62", display:"flex", alignItems:"center", justifyContent:collapsed?"center":"space-between" }}>
        {!collapsed && <div style={{ fontSize:19, fontWeight:900, color:"#ffffff", fontFamily:"Georgia,serif", letterSpacing:-0.5 }}>Capital<span style={{ color:"#FFB3B0" }}>IQ</span></div>}
        <button onClick={()=>setCollapsed(!collapsed)} style={{ background:"transparent", border:"1px solid #003A62", borderRadius:6, color:"#7BAFD4", cursor:"pointer", padding:"4px 7px", fontSize:11, flexShrink:0 }}>{collapsed?"»":"«"}</button>
      </div>
      <div style={{ padding:"10px 0", flex:1 }}>
        {nav.map(n => (
          <button key={n.id} onClick={()=>setPage(n.id)} title={n.label} style={{ display:"flex", alignItems:"center", gap:12, padding:collapsed?"12px 0":"12px 20px", width:"100%", justifyContent:collapsed?"center":"flex-start", background:page===n.id?"linear-gradient(90deg,#e9456018,transparent)":"transparent", border:"none", borderLeft:page===n.id?"3px solid #e94560":"3px solid transparent", color:page===n.id?"#fff":"#7A8FA6", fontSize:13, fontWeight:page===n.id?600:400, cursor:"pointer", transition:"all 0.2s" }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:page===n.id?"#D03027":"rgba(255,255,255,0.2)", flexShrink:0 }} />
            {!collapsed && n.label}
          </button>
        ))}
      </div>
      {!collapsed && <div style={{ padding:"14px 20px", borderTop:"1px solid #003A62", fontSize:9, color:"#7BAFD4", lineHeight:1.7 }}>Powered by Nessie API</div>}
    </div>
  );
}


// ─── NESSIE PURCHASE MAPPER ───────────────────────────────────────────────────
function mapNessiePurchases(purchases) {
  const CAT_MAP = {
    "cvs":"Healthcare","walgreens":"Healthcare","rite aid":"Healthcare","dental":"Healthcare","hospital":"Healthcare","pharmacy":"Healthcare","clinic":"Healthcare","medical":"Healthcare","lab":"Healthcare",
    "starbucks":"Dining","chipotle":"Dining","mcdonald":"Dining","doordash":"Dining","grubhub":"Dining","uber eats":"Dining","restaurant":"Dining","coffee":"Dining","pizza":"Dining","burger":"Dining",
    "delta":"Travel","united":"Travel","american airlines":"Travel","marriott":"Travel","hilton":"Travel","airbnb":"Travel","uber":"Travel","lyft":"Travel","amtrak":"Travel","hotel":"Travel",
    "amazon":"Shopping","target":"Shopping","walmart":"Shopping","best buy":"Shopping","nordstrom":"Shopping","zara":"Shopping",
    "whole foods":"Groceries","kroger":"Groceries","trader joe":"Groceries","costco":"Groceries","publix":"Groceries","aldi":"Groceries","grocery":"Groceries",
    "netflix":"Entertainment","spotify":"Entertainment","hulu":"Entertainment","disney":"Entertainment","amc":"Entertainment","steam":"Entertainment",
    "comcast":"Utilities","at&t":"Utilities","verizon":"Utilities","duke":"Utilities","electric":"Utilities","water":"Utilities","internet":"Utilities",
    "planet fitness":"Fitness","peloton":"Fitness","nike":"Fitness","rei":"Fitness","gym":"Fitness",
  };
  const guess = (m) => { const ml=(m||"").toLowerCase(); for(const [k,v] of Object.entries(CAT_MAP)) if(ml.includes(k)) return v; return CATEGORIES[Math.floor(Math.random()*CATEGORIES.length)]; };
  return purchases.map((p,i) => {
    const d = new Date(p.purchase_date||p.transaction_date||Date.now());
    const merchant = p.merchant_id||p.description||`Merchant ${i}`;
    return { id:p._id||`p_${i}`, account_id:p.account_id, amount:parseFloat((p.amount||0).toFixed(2)), category:guess(merchant), merchant, date:d.toISOString().split("T")[0], dayOfWeek:d.getDay(), week:Math.ceil(d.getDate()/7), month:d.toISOString().slice(0,7), description:p.description||merchant, isRepeat:Math.random()>0.6 };
  }).sort((a,b)=>new Date(b.date)-new Date(a.date));
}
// ─── EMPLOYEE DIRECTORY ───────────────────────────────────────────────────────
const EMPLOYEES = [
  { id:"E001", name:"Jack Reynolds",   role:"CRA Officer",          dept:"Community Lending",    access:"cra_advisor,equity_map,partnership" },
  { id:"E002", name:"Sarah Chen",      role:"Risk Analyst",         dept:"Credit Risk",          access:"crisis_detection,product_trigger,roi_calc" },
  { id:"E003", name:"Marcus Williams", role:"Community Dev Manager", dept:"CRA & Fair Lending",  access:"cra_advisor,equity_map,partnership,roi_calc" },
  { id:"E004", name:"Priya Nair",      role:"Data Scientist",       dept:"Analytics",            access:"crisis_detection,equity_map,roi_calc" },
  { id:"E005", name:"Tom Hargrove",    role:"Branch Director",      dept:"Retail Banking",       access:"cra_advisor,product_trigger,partnership" },
  { id:"E006", name:"admin",           role:"Platform Admin",       dept:"CapitalIQ Platform",   access:"cra_advisor,crisis_detection,equity_map,product_trigger,roi_calc,partnership" },
];

// ─── ONBOARD ──────────────────────────────────────────────────────────────────
function OnboardPage({ onSubmit, onAdminLogin }) {
  const [mode, setMode] = useState("customer"); // customer | new | employee

  // Customer login
  const [demoName, setDemoName]       = useState("");
  const [apiKey, setApiKey]           = useState("");
  const [anthropicKey, setAnthropicKey] = useState("");
  const [showApiKey, setShowApiKey]   = useState(false);
  const [customerId, setCustomerId]   = useState("");
  const [showNessie, setShowNessie]   = useState(false);
  const [step, setStep]               = useState(1);
  const [goals, setGoals]             = useState([]);
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [fetchedCustomer, setFetchedCustomer] = useState(null);
  const [fetchedAccounts, setFetchedAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [error, setError]             = useState("");
  const [loading, setLoading]         = useState(false);
  const [loadingMsg, setLoadingMsg]   = useState("");

  // New account
  const [newUser, setNewUser]         = useState({ firstName:"", lastName:"", streetNumber:"123", streetName:"Main St", city:"McLean", state:"VA", zip:"22102" });
  const [newAcct, setNewAcct]         = useState({ type:"Checking", nickname:"My Checking Account", balance:"1000" });
  const [createKey, setCreateKey]     = useState("");
  const [createdCustomer, setCreatedCustomer] = useState(null);
  const [createdAccount, setCreatedAccount]   = useState(null);
  const [createStep, setCreateStep]   = useState(1);

  // Employee login
  const [empName, setEmpName]         = useState("");
  const [empId, setEmpId]             = useState("");
  const [empError, setEmpError]       = useState("");
  const [matchedEmp, setMatchedEmp]   = useState(null);

  const BG = "linear-gradient(140deg, #004977 0%, #002D4A 45%, #6B0000 100%)";

  // ── Nessie helpers ────────────────────────────────────────────────────────
  const nGet = async (path) => {
    const r = await fetch(`http://api.nessieisreal.com${path}?key=${apiKey.trim()}`);
    if (!r.ok) throw new Error(`${r.status}`);
    return r.json();
  };
  const nPost = async (path, body, key) => {
    const k = key || apiKey.trim();
    const r = await fetch(`http://api.nessieisreal.com${path}?key=${k}`, {
      method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body)
    });
    if (!r.ok) throw new Error(`${r.status}`);
    return r.json();
  };

  // ── Customer flow ──────────────────────────────────────────────────────────
  const handleDemoLogin = () => {
    setError("");
    if (!demoName.trim()) { setError("Please enter your name."); return; }
    // Skip straight to goals with synthetic data
    setStep(3);
  };

  const handleFetchCustomer = async () => {
    setError("");
    if (!apiKey.trim()) { setError("Nessie API key required."); return; }
    if (!customerId.trim()) { setError("Customer ID required."); return; }
    setLoading(true); setLoadingMsg("Verifying...");
    try {
      const cust = await nGet(`/customers/${customerId.trim()}`);
      if (!cust || cust.code === 404) { setError("Customer not found. Check your ID."); setLoading(false); return; }
      setFetchedCustomer(cust);
      setLoadingMsg("Loading accounts...");
      const accts = await nGet(`/customers/${customerId.trim()}/accounts`);
      const list = Array.isArray(accts) ? accts : [];
      setFetchedAccounts(list);
      if (list.length) setSelectedAccountId(list[0]._id);
      setStep(2);
    } catch(e) { setError(`Connection failed: ${e.message}`); }
    setLoading(false); setLoadingMsg("");
  };

  const handleLoginFinish = async () => {
    // Demo mode — no API key, use synthetic data
    if (!fetchedCustomer) {
      const name = demoName.trim() || "Demo User";
      const txns = generateTransactions("c_001", 3);
      if (anthropicKey.trim()) window.__CAPITALIQ_API_KEY__ = anthropicKey.trim();
      onSubmit({ name, customerId:"demo", apiKey:"", age:30, income:75000, occupation:"Capital One Customer", financialGoals:goals, monthlyIncome:+monthlyIncome||6000, accounts:[], balance:12450, fromNessie:false }, txns);
      return;
    }
    // Nessie mode — fetch real data
    setLoading(true); setLoadingMsg("Fetching transactions...");
    try {
      const purchases = [];
      for (const a of fetchedAccounts) {
        try { const p = await nGet(`/accounts/${a._id}/purchases`); if (Array.isArray(p)) p.forEach(x=>purchases.push({...x,account_id:a._id})); } catch(_) {}
      }
      const txns = purchases.length > 0 ? mapNessiePurchases(purchases) : generateTransactions(customerId.trim(), 3);
      if (anthropicKey.trim()) window.__CAPITALIQ_API_KEY__ = anthropicKey.trim();
      onSubmit({ name:`${fetchedCustomer.first_name} ${fetchedCustomer.last_name}`, customerId:customerId.trim(), apiKey:apiKey.trim(), age:30, income:75000, occupation:"Capital One Customer", financialGoals:goals, monthlyIncome:+monthlyIncome||6000, accounts:fetchedAccounts, balance:fetchedAccounts.reduce((s,a)=>s+(a.balance||0),0), fromNessie:true }, txns);
    } catch(e) { setError(`Error: ${e.message}`); setLoading(false); }
    setLoadingMsg("");
  };

  // ── Create account flow ────────────────────────────────────────────────────
  const handleCreateCustomer = async () => {
    setError("");
    if (!createKey.trim()) { setError("API key required."); return; }
    if (!newUser.firstName || !newUser.lastName) { setError("Name required."); return; }
    setLoading(true); setLoadingMsg("Creating profile...");
    try {
      const resp = await nPost("/customers", { first_name:newUser.firstName, last_name:newUser.lastName, address:{ street_number:newUser.streetNumber, street_name:newUser.streetName, city:newUser.city, state:newUser.state, zip:newUser.zip }}, createKey.trim());
      if (resp.objectCreated) {
        setCreatedCustomer(resp.objectCreated);
        setLoadingMsg("Creating account...");
        const aResp = await nPost(`/customers/${resp.objectCreated._id}/accounts`, { type:newAcct.type, nickname:newAcct.nickname, rewards:0, balance:parseInt(newAcct.balance)||0 }, createKey.trim());
        if (aResp.objectCreated) { setCreatedAccount(aResp.objectCreated); setCreateStep(2); }
        else setError("Account creation failed.");
      } else setError("Failed to create customer.");
    } catch(e) { setError(`Error: ${e.message}`); }
    setLoading(false); setLoadingMsg("");
  };

  // ── Employee lookup ────────────────────────────────────────────────────────
  const handleEmployeeLogin = () => {
    setEmpError("");
    if (!empName.trim() || !empId.trim()) { setEmpError("Both name and Employee ID are required."); return; }
    const nameNorm = empName.trim().toLowerCase();
    const idNorm   = empId.trim().toUpperCase();
    const emp = EMPLOYEES.find(e =>
      e.id === idNorm &&
      e.name.toLowerCase().includes(nameNorm.split(" ")[0].toLowerCase())
    );
    if (!emp) {
      setEmpError("Employee not found. Check your name and ID — they must match our directory.");
      return;
    }
    setMatchedEmp(emp);
  };

  const confirmEmployeeLogin = () => {
    onAdminLogin(matchedEmp);
  };

  const Err = ({ msg }) => msg ? <div style={{ fontSize:12, color:"#D03027", margin:"10px 0", padding:"9px 14px", background:"#FFF5F4", borderRadius:8, border:"1px solid #D0302733" }}>{msg}</div> : null;
  const BackBtn = ({ onClick }) => <button onClick={onClick} style={{ ...S.btn("#E8ECF2"), flex:1, padding:12, color:"#7A8FA6", border:"none" }}>Back</button>;

  return (
    <div style={{ minHeight:"100vh", background:BG, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ width:480 }}>

        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:26 }}>
          <div style={{ fontSize:50, fontWeight:900, color:"#fff", fontFamily:"Georgia,serif", letterSpacing:-2 }}>Capital<span style={{ color:"#FF9E9B" }}>IQ</span></div>
          <div style={{ color:"rgba(255,255,255,0.3)", fontSize:10, letterSpacing:3.5, textTransform:"uppercase", marginTop:6 }}>Financial Intelligence Platform</div>
        </div>

        {/* Three-way role tabs */}
        <div style={{ display:"flex", gap:3, marginBottom:20, background:"rgba(0,0,0,0.3)", borderRadius:14, padding:4 }}>
          {[
            ["customer","Customer"],
            ["new","New Account"],
            ["employee","Bank Employee"],
          ].map(([m, label]) => (
            <button key={m} onClick={()=>{setMode(m);setError("");setEmpError("");setMatchedEmp(null);}} style={{ flex:1, padding:"10px 6px", background:mode===m?"#ffffff":"transparent", borderRadius:10, border:"none", color: mode===m ? (m==="employee"?"#8B0000":"#004977") : "rgba(255,255,255,0.55)", fontSize:12, fontWeight:700, cursor:"pointer", transition:"all 0.2s" }}>{label}</button>
          ))}
        </div>

        <div style={{ background:"#fff", borderRadius:20, padding:32, boxShadow:"0 24px 80px rgba(0,0,0,0.4)" }}>

          {/* ── CUSTOMER STEP 1 ────────────────────────────────────────────── */}
          {mode==="customer" && step===1 && (
            <>
              <div style={{ fontSize:20, fontWeight:800, color:"#1A2B3C", marginBottom:4 }}>Welcome</div>
              <div style={{ fontSize:13, color:"#7A8FA6", marginBottom:22 }}>Enter your name to get started — no account needed</div>

              {/* Primary: just a name */}
              <div style={{ marginBottom:16 }}>
                <label style={S.label}>Your Name</label>
                <input
                  style={{ ...S.input, fontSize:15, borderColor:error?"#D03027":"#D0DBE8" }}
                  placeholder="e.g. Alex Morgan"
                  value={demoName}
                  onChange={e=>{setDemoName(e.target.value);setError("");}}
                  onKeyDown={e=>e.key==="Enter"&&handleDemoLogin()}
                  autoFocus
                />
              </div>

              <Err msg={error} />

              {/* Primary CTA */}
              <button onClick={handleDemoLogin} style={{ ...S.btn(), width:"100%", padding:14, fontSize:14, marginBottom:16 }}>
                Continue with Demo Data
              </button>

              {/* Optional Nessie toggle */}
              <button
                onClick={()=>setShowNessie(v=>!v)}
                style={{ width:"100%", padding:"10px", background:"transparent", border:"1px solid #E0E6EF", borderRadius:10, color:"#7A8FA6", fontSize:12, cursor:"pointer", marginBottom: showNessie?14:0 }}
              >
                {showNessie ? "Hide" : "Have a Nessie API key? Connect live account"}
              </button>

              {showNessie && (
                <div style={{ background:"#F4F7FB", borderRadius:12, padding:16 }}>
                  <div style={{ fontSize:11, color:"#7A8FA6", marginBottom:12, lineHeight:1.6 }}>
                    Optional — connect your real Capital One sandbox account via the{" "}
                    <span style={{ color:"#004977", fontWeight:600 }}>Nessie API</span>.
                  </div>
                  <div style={{ marginBottom:10 }}>
                    <label style={{ ...S.label, fontSize:10 }}>Nessie API Key</label>
                    <input style={{ ...S.input, fontFamily:"monospace", fontSize:12 }} placeholder="Your key from api.nessieisreal.com" value={apiKey} onChange={e=>{setApiKey(e.target.value);setError("");}} />
                  </div>
                  <div style={{ marginBottom:12 }}>
                    <label style={{ ...S.label, fontSize:10 }}>Customer ID</label>
                    <input style={{ ...S.input, fontFamily:"monospace", fontSize:12, borderColor:error?"#D03027":"#D0DBE8" }} placeholder="MongoDB ObjectId..." value={customerId} onChange={e=>{setCustomerId(e.target.value);setError("");}} onKeyDown={e=>e.key==="Enter"&&handleFetchCustomer()} />
                  </div>
                  <button onClick={handleFetchCustomer} disabled={loading} style={{ ...S.btn("#004977"), width:"100%", padding:11, fontSize:13, opacity:loading?0.7:1 }}>
                    {loading ? loadingMsg||"Connecting..." : "Connect Live Account"}
                  </button>
                </div>
              )}
            </>
          )}

          {/* ── CUSTOMER STEP 2: confirm + accounts ────────────────────────── */}
          {mode==="customer" && step===2 && fetchedCustomer && (
            <>
              <div style={{ fontSize:20, fontWeight:800, color:"#1A2B3C", marginBottom:4 }}>Welcome back</div>
              <div style={{ fontSize:13, color:"#7A8FA6", marginBottom:18 }}>Confirm your identity and select account</div>
              <div style={{ background:"linear-gradient(135deg,#004977,#003262)", borderRadius:14, padding:18, marginBottom:18, color:"#fff" }}>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.45)", letterSpacing:1.5, marginBottom:6 }}>VERIFIED CUSTOMER</div>
                <div style={{ fontSize:22, fontWeight:800 }}>{fetchedCustomer.first_name} {fetchedCustomer.last_name}</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.45)", marginTop:4 }}>{fetchedCustomer.address?.city}, {fetchedCustomer.address?.state} · ID: ...{fetchedCustomer._id?.slice(-8)}</div>
                <div style={{ marginTop:10, fontSize:12, color:"rgba(255,255,255,0.4)" }}>{fetchedAccounts.length} account{fetchedAccounts.length!==1?"s":""} found</div>
              </div>
              {fetchedAccounts.length > 0 && (
                <div style={{ marginBottom:16 }}>
                  <label style={S.label}>Select Account</label>
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    {fetchedAccounts.map(a=>(
                      <button key={a._id} onClick={()=>setSelectedAccountId(a._id)} style={{ padding:"11px 14px", borderRadius:10, border:`2px solid ${selectedAccountId===a._id?"#004977":"#E0E6EF"}`, background:selectedAccountId===a._id?"#F0F6FF":"#fff", textAlign:"left", cursor:"pointer" }}>
                        <div style={{ display:"flex", justifyContent:"space-between" }}>
                          <div><div style={{ fontSize:13, fontWeight:700, color:"#1A2B3C" }}>{a.nickname||a.type}</div><div style={{ fontSize:11, color:"#7A8FA6", marginTop:2 }}>{a.type} · ···{a._id?.slice(-4)}</div></div>
                          <div style={{ fontSize:16, fontWeight:800, color:"#004977" }}>${(a.balance||0).toLocaleString()}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ display:"flex", gap:10 }}>
                <BackBtn onClick={()=>setStep(1)} />
                <button onClick={()=>setStep(3)} style={{ ...S.btn(), flex:2, padding:12 }}>Continue</button>
              </div>
            </>
          )}

          {/* ── CUSTOMER STEP 3: goals ──────────────────────────────────────── */}
          {mode==="customer" && step===3 && (
            <>
              <div style={{ fontSize:20, fontWeight:800, color:"#1A2B3C", marginBottom:4 }}>
                {fetchedCustomer ? `Welcome, ${fetchedCustomer.first_name}` : demoName ? `Hi, ${demoName.split(" ")[0]}` : "Your Goals"}
              </div>
              <div style={{ fontSize:13, color:"#7A8FA6", marginBottom:18 }}>Personalise your AI advice — optional</div>

              {/* Anthropic API Key */}
              <div style={{ background:"#F4F7FB", borderRadius:12, padding:14, marginBottom:16, border:"1px solid #E0E6EF" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: showApiKey ? 10 : 0 }}>
                  <div>
                    <div style={{ fontSize:12, fontWeight:700, color:"#1A2B3C" }}>Anthropic API Key</div>
                    <div style={{ fontSize:11, color:"#7A8FA6", marginTop:2 }}>
                      {anthropicKey ? "Key added — AI features enabled" : "Optional — enables AI chat features"}
                    </div>
                  </div>
                  <button
                    onClick={()=>setShowApiKey(v=>!v)}
                    style={{ padding:"5px 12px", background: anthropicKey ? "#D0302715" : "transparent", border:`1px solid ${anthropicKey ? "#D03027" : "#D0DBE8"}`, borderRadius:8, color: anthropicKey ? "#D03027" : "#7A8FA6", fontSize:11, cursor:"pointer", fontWeight:600 }}
                  >
                    {showApiKey ? "Hide" : anthropicKey ? "Change Key" : "Add Key"}
                  </button>
                </div>
                {showApiKey && (
                  <div style={{ marginTop:10 }}>
                    <input
                      style={{ ...S.input, fontFamily:"monospace", fontSize:12, letterSpacing:0.5 }}
                      type="password"
                      placeholder="sk-ant-api03-..."
                      value={anthropicKey}
                      onChange={e=>setAnthropicKey(e.target.value)}
                    />
                    <div style={{ fontSize:11, color:"#B0C4D8", marginTop:8, lineHeight:1.6 }}>
                      Get a free key at <span style={{ color:"#004977", fontWeight:600 }}>console.anthropic.com</span> — starts with sk-ant-
                    </div>
                  </div>
                )}
              </div>

              <div style={{ marginBottom:14 }}>
                <label style={S.label}>Monthly Income (optional)</label>
                <input style={S.input} type="number" placeholder="e.g. 7000" value={monthlyIncome} onChange={e=>setMonthlyIncome(e.target.value)} />
              </div>
              <label style={S.label}>Financial Goals</label>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:22 }}>
                {["Build emergency fund","Save for vacation","Pay off debt","Buy a home","New car","Retirement savings"].map(g=>(
                  <button key={g} onClick={()=>setGoals(p=>p.includes(g)?p.filter(x=>x!==g):[...p,g])} style={{ padding:"6px 13px", borderRadius:20, border:`1px solid ${goals.includes(g)?"#D03027":"#E0E6EF"}`, background:goals.includes(g)?"#D0302715":"transparent", color:goals.includes(g)?"#D03027":"#7A8FA6", fontSize:12, cursor:"pointer", fontWeight:goals.includes(g)?700:400 }}>{g}</button>
                ))}
              </div>
              <Err msg={error} />
              <div style={{ display:"flex", gap:10 }}>
                <BackBtn onClick={()=>fetchedCustomer ? setStep(2) : setStep(1)} />
                <button onClick={handleLoginFinish} disabled={loading} style={{ ...S.btn(), flex:2, padding:12, opacity:loading?0.7:1 }}>{loading?loadingMsg||"Loading...":"Launch Dashboard"}</button>
              </div>
            </>
          )}

          {/* ── NEW ACCOUNT ─────────────────────────────────────────────────── */}
          {mode==="new" && createStep===1 && (
            <>
              <div style={{ fontSize:20, fontWeight:800, color:"#1A2B3C", marginBottom:4 }}>Create Account</div>
              <div style={{ fontSize:13, color:"#7A8FA6", marginBottom:18 }}>Register a new Capital One customer on Nessie</div>
              <div style={{ marginBottom:12 }}>
                <label style={S.label}>Nessie API Key</label>
                <input style={{ ...S.input, fontFamily:"monospace", fontSize:12 }} placeholder="Your API key" value={createKey} onChange={e=>{setCreateKey(e.target.value);setError("");}} />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
                <div><label style={S.label}>First Name</label><input style={S.input} placeholder="John" value={newUser.firstName} onChange={e=>setNewUser(p=>({...p,firstName:e.target.value}))} /></div>
                <div><label style={S.label}>Last Name</label><input style={S.input} placeholder="Doe" value={newUser.lastName} onChange={e=>setNewUser(p=>({...p,lastName:e.target.value}))} /></div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:10, marginBottom:10 }}>
                <div><label style={S.label}>Street No.</label><input style={S.input} placeholder="123" value={newUser.streetNumber} onChange={e=>setNewUser(p=>({...p,streetNumber:e.target.value}))} /></div>
                <div><label style={S.label}>Street Name</label><input style={S.input} placeholder="Main St" value={newUser.streetName} onChange={e=>setNewUser(p=>({...p,streetName:e.target.value}))} /></div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap:10, marginBottom:14 }}>
                <div><label style={S.label}>City</label><input style={S.input} placeholder="McLean" value={newUser.city} onChange={e=>setNewUser(p=>({...p,city:e.target.value}))} /></div>
                <div><label style={S.label}>State</label><input style={S.input} placeholder="VA" value={newUser.state} onChange={e=>setNewUser(p=>({...p,state:e.target.value}))} /></div>
                <div><label style={S.label}>ZIP</label><input style={S.input} placeholder="22102" value={newUser.zip} onChange={e=>setNewUser(p=>({...p,zip:e.target.value}))} /></div>
              </div>
              <div style={{ borderTop:"1px solid #E0E6EF", paddingTop:14, marginBottom:14 }}>
                <div style={{ fontSize:11, color:"#7A8FA6", fontWeight:700, letterSpacing:1, marginBottom:10 }}>INITIAL ACCOUNT</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
                  <div><label style={S.label}>Account Type</label><select value={newAcct.type} onChange={e=>setNewAcct(p=>({...p,type:e.target.value}))} style={{ ...S.input, padding:"11px 14px" }}>{["Checking","Savings","Credit Card"].map(t=><option key={t}>{t}</option>)}</select></div>
                  <div><label style={S.label}>Opening Balance ($)</label><input style={S.input} type="number" placeholder="1000" value={newAcct.balance} onChange={e=>setNewAcct(p=>({...p,balance:e.target.value}))} /></div>
                </div>
                <div><label style={S.label}>Nickname</label><input style={S.input} placeholder="My Checking Account" value={newAcct.nickname} onChange={e=>setNewAcct(p=>({...p,nickname:e.target.value}))} /></div>
              </div>
              <Err msg={error} />
              <button onClick={handleCreateCustomer} disabled={loading} style={{ ...S.btn(), width:"100%", padding:14, opacity:loading?0.7:1 }}>{loading?loadingMsg||"Creating...":"Create Account on Nessie"}</button>
            </>
          )}

          {mode==="new" && createStep===2 && createdCustomer && (
            <>
              <div style={{ textAlign:"center", marginBottom:20 }}>
                <div style={{ width:52, height:52, borderRadius:14, background:"#E8F5E9", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}><div style={{ width:22, height:22, borderRadius:6, background:"#2E7D32" }} /></div>
                <div style={{ fontSize:20, fontWeight:800, color:"#1A2B3C", marginBottom:4 }}>Account Created!</div>
                <div style={{ fontSize:13, color:"#7A8FA6" }}>Your profile is live on Nessie</div>
              </div>
              <div style={{ background:"linear-gradient(135deg,#004977,#003262)", borderRadius:14, padding:18, marginBottom:18, color:"#fff" }}>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.45)", letterSpacing:1.5, marginBottom:6 }}>NEW CUSTOMER</div>
                <div style={{ fontSize:20, fontWeight:800 }}>{createdCustomer.first_name} {createdCustomer.last_name}</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.45)", marginTop:4, fontFamily:"monospace" }}>ID: {createdCustomer._id}</div>
                {createdAccount && <div style={{ marginTop:12, paddingTop:12, borderTop:"1px solid rgba(255,255,255,0.15)" }}><div style={{ fontSize:12, color:"rgba(255,255,255,0.5)" }}>{createdAccount.nickname||createdAccount.type}</div><div style={{ fontSize:18, fontWeight:800, marginTop:4 }}>${parseInt(newAcct.balance||0).toLocaleString()}</div></div>}
              </div>
              <div style={{ fontSize:11, color:"#7A8FA6", marginBottom:18, padding:"10px 14px", background:"#F4F7FB", borderRadius:8 }}>Save your Customer ID — you will need it to sign in next time.</div>
              <button onClick={()=>onSubmit({ name:`${createdCustomer.first_name} ${createdCustomer.last_name}`, customerId:createdCustomer._id, apiKey:createKey.trim(), age:30, income:60000, occupation:"New Customer", financialGoals:[], monthlyIncome:5000, accounts:createdAccount?[createdAccount]:[], balance:parseInt(newAcct.balance)||0, fromNessie:true }, [])} style={{ ...S.btn(), width:"100%", padding:14 }}>Open Dashboard</button>
            </>
          )}

          {/* ── BANK EMPLOYEE ────────────────────────────────────────────────── */}
          {mode==="employee" && !matchedEmp && (
            <>
              {/* Header with restricted badge */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
                <div>
                  <div style={{ fontSize:20, fontWeight:800, color:"#1A2B3C" }}>Bank Employee Portal</div>
                  <div style={{ fontSize:13, color:"#7A8FA6", marginTop:2 }}>CRA Intelligence — Internal Access</div>
                </div>
                <div style={{ padding:"4px 10px", background:"#FFF5F4", border:"1px solid #D0302744", borderRadius:8, fontSize:10, color:"#8B0000", fontWeight:700, letterSpacing:1 }}>RESTRICTED</div>
              </div>

              {/* Info box */}
              <div style={{ background:"#F4F7FB", borderRadius:10, padding:"12px 16px", marginBottom:20, display:"flex", gap:12, alignItems:"flex-start" }}>
                <div style={{ width:8, height:8, borderRadius:2, background:"#004977", marginTop:3, flexShrink:0 }} />
                <div style={{ fontSize:12, color:"#5A7A9A", lineHeight:1.7 }}>Enter your <strong>full first name</strong> and your <strong>Employee ID</strong> exactly as issued. Both must match our directory to grant CRA access.</div>
              </div>

              <div style={{ marginBottom:14 }}>
                <label style={S.label}>First Name</label>
                <input style={{ ...S.input, borderColor:empError?"#D03027":"#D0DBE8" }} placeholder="e.g. Jack" value={empName} onChange={e=>{setEmpName(e.target.value);setEmpError("");}} onKeyDown={e=>e.key==="Enter"&&handleEmployeeLogin()} />
              </div>

              <div style={{ marginBottom:16 }}>
                <label style={S.label}>Employee ID</label>
                <input style={{ ...S.input, fontFamily:"monospace", letterSpacing:1.5, borderColor:empError?"#D03027":"#D0DBE8" }} placeholder="e.g. E001" value={empId} onChange={e=>{setEmpId(e.target.value.toUpperCase());setEmpError("");}} onKeyDown={e=>e.key==="Enter"&&handleEmployeeLogin()} />
              </div>

              <Err msg={empError} />

              {/* Directory hint */}
              <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:10, color:"#B0C4D8", letterSpacing:1, marginBottom:8 }}>DEMO DIRECTORY</div>
                <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                  {EMPLOYEES.filter(e=>e.id!=="E006").map(e=>(
                    <div key={e.id} style={{ display:"flex", justifyContent:"space-between", padding:"5px 10px", background:"#F4F7FB", borderRadius:7, fontSize:11 }}>
                      <span style={{ color:"#1A2B3C", fontWeight:500 }}>{e.name}</span>
                      <span style={{ color:"#7A8FA6", fontFamily:"monospace" }}>{e.id} · {e.role}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={handleEmployeeLogin} style={{ ...S.btn("#8B0000"), width:"100%", padding:14, fontSize:14 }}>Verify & Access CRA Command</button>
            </>
          )}

          {/* ── EMPLOYEE CONFIRMED ─────────────────────────────────────────── */}
          {mode==="employee" && matchedEmp && (
            <>
              <div style={{ textAlign:"center", marginBottom:20 }}>
                <div style={{ width:52, height:52, borderRadius:14, background:"#FFF5F4", border:"2px solid #D0302744", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}>
                  <div style={{ fontSize:10, fontWeight:900, color:"#8B0000", fontFamily:"monospace", letterSpacing:0.5 }}>ID</div>
                </div>
                <div style={{ fontSize:20, fontWeight:800, color:"#1A2B3C", marginBottom:2 }}>Identity Verified</div>
                <div style={{ fontSize:13, color:"#7A8FA6" }}>Welcome, {matchedEmp.name.split(" ")[0]}</div>
              </div>

              {/* Employee card */}
              <div style={{ background:"linear-gradient(135deg,#6B0000,#8B0000)", borderRadius:14, padding:20, marginBottom:20, color:"#fff" }}>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.45)", letterSpacing:1.5, marginBottom:8 }}>EMPLOYEE PROFILE</div>
                <div style={{ fontSize:20, fontWeight:800 }}>{matchedEmp.name}</div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.6)", marginTop:4 }}>{matchedEmp.role} · {matchedEmp.dept}</div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", marginTop:2, fontFamily:"monospace" }}>ID: {matchedEmp.id}</div>
                <div style={{ marginTop:14, paddingTop:12, borderTop:"1px solid rgba(255,255,255,0.15)" }}>
                  <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", letterSpacing:1, marginBottom:8 }}>CRA MODULE ACCESS</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {matchedEmp.access.split(",").map(a=>{
                      const ag = CRA_AGENTS.find(x=>x.id===a);
                      return ag ? <span key={a} style={{ padding:"3px 8px", background:"rgba(255,255,255,0.15)", borderRadius:6, fontSize:9, fontWeight:700, fontFamily:"monospace", letterSpacing:0.5 }}>{ag.label}</span> : null;
                    })}
                  </div>
                </div>
              </div>

              <div style={{ fontSize:11, color:"#7A8FA6", marginBottom:20, padding:"10px 14px", background:"#FFF5F4", borderRadius:8, border:"1px solid #D0302722" }}>
                All activity in the CRA Command Center is logged and audited per Capital One compliance policy.
              </div>

              <div style={{ display:"flex", gap:10 }}>
                <button onClick={()=>setMatchedEmp(null)} style={{ ...S.btn("#E8ECF2"), flex:1, padding:13, color:"#7A8FA6", border:"none" }}>Back</button>
                <button onClick={confirmEmployeeLogin} style={{ ...S.btn("#8B0000"), flex:2, padding:13, fontSize:14 }}>Enter CRA Command</button>
              </div>
            </>
          )}

        </div>
        <div style={{ textAlign:"center", marginTop:18, fontSize:10, color:"rgba(255,255,255,0.18)" }}>Capital One Nessie API · Demo environment</div>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function DashboardPage({ transactions, user, budgets }) {
  const totalSpend = transactions.reduce((s,t)=>s+t.amount,0);
  const monthlySpend = totalSpend / 3;

  const byCategory = CATEGORIES.map(cat=>({ name:cat, value:parseFloat(transactions.filter(t=>t.category===cat).reduce((s,t)=>s+t.amount,0).toFixed(2)) })).filter(c=>c.value>0).sort((a,b)=>b.value-a.value);

  const monthMap = {};
  transactions.forEach(t=>{ monthMap[t.month]=(monthMap[t.month]||0)+t.amount; });
  const byMonth = Object.entries(monthMap).sort().map(([month,total],i,arr)=>{
    const slice = arr.slice(Math.max(0,i-1),i+2);
    const ma = slice.reduce((s,[,v])=>s+v,0)/slice.length;
    return { month:month.slice(5)+"/"+month.slice(2,4), total:parseFloat(total.toFixed(2)), ma:parseFloat(ma.toFixed(2)) };
  });

  const dayTotals = DAYS.map((d,i)=>({ day:d, total:parseFloat(transactions.filter(t=>t.dayOfWeek===i).reduce((s,t)=>s+t.amount,0).toFixed(2)), count:transactions.filter(t=>t.dayOfWeek===i).length }));
  const maxDay = Math.max(...dayTotals.map(d=>d.total));
  const peakDay = [...dayTotals].sort((a,b)=>b.total-a.total)[0]?.day;

  const merchantMap = {};
  transactions.forEach(t=>{ merchantMap[t.merchant]=(merchantMap[t.merchant]||0)+t.amount; });
  const topMerchants = Object.entries(merchantMap).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([name,value])=>({ name, value:parseFloat(value.toFixed(2)) }));

  const repeatSpend = transactions.filter(t=>t.isRepeat).reduce((s,t)=>s+t.amount,0);
  const oneTimeSpend = totalSpend - repeatSpend;

  const alerts = [];
  byCategory.forEach(c=>{ const b=budgets[c.name]; if(b&&(c.value/3)>b*0.8) alerts.push({ type:"Budget Alert", msg:`${c.name} is at ${Math.round((c.value/3)/b*100)}% of your $${b}/mo budget`, color:"#E8821A" }); });
  if(byMonth.length>=2){ const [prev,cur]=[byMonth[byMonth.length-2],byMonth[byMonth.length-1]]; if(cur.total>prev.total*1.2) alerts.push({ type:"Spike", msg:`Spending up ${Math.round((cur.total/prev.total-1)*100)}% vs last month`, color:"#D03027" }); }

  const prevMonthTotal = byMonth[byMonth.length-2]?.total;
  const curMonthTotal = byMonth[byMonth.length-1]?.total;
  const trend = prevMonthTotal ? Math.round((curMonthTotal/prevMonthTotal-1)*100) : 0;

  return (
    <div style={{ padding:"28px 32px", background:"#EFF3F8", minHeight:"100%" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:6 }}>
        <div>
          <div style={{ fontSize:26, fontWeight:800, color:"#1A2B3C", fontFamily:"Georgia,serif" }}>Spending Intelligence</div>
          <div style={{ color:"#7A8FA6", fontSize:13, marginTop:2 }}>{transactions.length} transactions · 90 days</div>
        </div>
        <button onClick={()=>exportCSV(transactions,"transactions.csv")} style={{ ...S.btn("#004977"), fontSize:12 }}>Export CSV</button>
      </div>

      <AlertBanner alerts={alerts} />

      <div style={{ display:"flex", gap:14, marginBottom:24, flexWrap:"wrap" }}>
        <StatCard label="Total Spend" value={`$${totalSpend.toFixed(0)}`} sub="last 90 days" color="#D03027" spark={byMonth.map(m=>m.total)} trend={trend} />
        <StatCard label="Monthly Avg" value={`$${monthlySpend.toFixed(0)}`} sub="per month" color="#004977" spark={byMonth.map(m=>m.total)} />
        <StatCard label="Top Category" value={byCategory[0]?.name} sub={`$${byCategory[0]?.value?.toFixed(0)}`} color="#E8821A" />
        <StatCard label="Repeat Spend" value={`${Math.round(repeatSpend/totalSpend*100)}%`} sub="recurring merchants" color="#2E7D32" />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, marginBottom:18 }}>
        <div style={S.card}>
          <div style={{ fontSize:11, color:"#7A8FA6", fontWeight:700, marginBottom:16, letterSpacing:1.2 }}>SPEND BY CATEGORY</div>
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie data={byCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={38} label={({name,percent})=>percent>0.06?`${(percent*100).toFixed(0)}%`:""} labelLine={false}>
                {byCategory.map((e,i)=><Cell key={i} fill={CAT_COLORS[e.name]||CHART_COLORS[i]}/>)}
              </Pie>
              <Tooltip formatter={v=>`$${v}`} contentStyle={S.tt} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:11, color:"#7A8FA6" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={S.card}>
          <div style={{ fontSize:11, color:"#7A8FA6", fontWeight:600, marginBottom:16, letterSpacing:1.2 }}>MONTHLY TREND + MOVING AVERAGE</div>
          <ResponsiveContainer width="100%" height={230}>
            <ComposedChart data={byMonth}>
              <defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#D03027" stopOpacity={0.25}/><stop offset="95%" stopColor="#D03027" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E6EF" />
              <XAxis dataKey="month" stroke="#D0DBE8" tick={{ fill:"#7A8FA6", fontSize:11 }} />
              <YAxis stroke="#D0DBE8" tick={{ fill:"#7A8FA6", fontSize:10 }} tickFormatter={v=>`$${v}`} />
              <Tooltip formatter={v=>`$${v}`} contentStyle={S.tt} />
              <Area type="monotone" dataKey="total" stroke="#D03027" fill="url(#ag)" strokeWidth={2} name="Spend" />
              <Line type="monotone" dataKey="ma" stroke="#E8821A" strokeWidth={1.5} dot={false} strokeDasharray="4 2" name="Moving Avg" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, marginBottom:18 }}>
        <div style={S.card}>
          <div style={{ fontSize:11, color:"#7A8FA6", fontWeight:700, marginBottom:18, letterSpacing:1.2 }}>DAY-OF-WEEK HEATMAP</div>
          <div style={{ display:"flex", gap:8 }}>
            {dayTotals.map(d=>{
              const intensity = d.total/maxDay;
              return (
                <div key={d.day} style={{ flex:1, textAlign:"center" }}>
                  <div style={{ background:`rgba(208,48,39,${0.08+intensity*0.87})`, borderRadius:8, padding:"12px 0", marginBottom:8 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:"#1A2B3C" }}>${Math.round(d.total)}</div>
                    <div style={{ fontSize:9, color:"rgba(255,255,255,0.4)", marginTop:2 }}>{d.count}x</div>
                  </div>
                  <div style={{ fontSize:10, color:"#7A8FA6" }}>{d.day}</div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop:14, fontSize:11, color:"#5A7A9A" }}>Peak: <span style={{ color:"#D03027" }}>{peakDay}</span> — you spend most on this day</div>
        </div>

        <div style={S.card}>
          <div style={{ fontSize:11, color:"#7A8FA6", fontWeight:600, marginBottom:16, letterSpacing:1.2 }}>TOP MERCHANTS</div>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={topMerchants} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E6EF" horizontal={false} />
              <XAxis type="number" stroke="#D0DBE8" tick={{ fill:"#7A8FA6", fontSize:10 }} tickFormatter={v=>`$${v}`} />
              <YAxis type="category" dataKey="name" width={95} stroke="#D0DBE8" tick={{ fill:"#aaa", fontSize:10 }} />
              <Tooltip formatter={v=>`$${v}`} contentStyle={S.tt} />
              <Bar dataKey="value" radius={[0,4,4,0]}>{topMerchants.map((_,i)=><Cell key={i} fill={CHART_COLORS[i%CHART_COLORS.length]}/>)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:18 }}>
        <div style={S.card}>
          <div style={{ fontSize:11, color:"#7A8FA6", fontWeight:600, marginBottom:16, letterSpacing:1.2 }}>CATEGORY BREAKDOWN</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={byCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E6EF" />
              <XAxis dataKey="name" stroke="#D0DBE8" tick={{ fill:"#7A8FA6", fontSize:10 }} />
              <YAxis stroke="#D0DBE8" tick={{ fill:"#7A8FA6", fontSize:10 }} tickFormatter={v=>`$${v}`} />
              <Tooltip formatter={v=>`$${v}`} contentStyle={S.tt} />
              <Bar dataKey="value" radius={[4,4,0,0]}>{byCategory.map((e,i)=><Cell key={i} fill={CAT_COLORS[e.name]||CHART_COLORS[i]}/>)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={S.card}>
          <div style={{ fontSize:11, color:"#7A8FA6", fontWeight:600, marginBottom:16, letterSpacing:1.2 }}>LOYALTY VS ONE-TIME</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={[{name:"Repeat",value:parseFloat(repeatSpend.toFixed(2))},{name:"One-time",value:parseFloat(oneTimeSpend.toFixed(2))}]} dataKey="value" cx="50%" cy="50%" outerRadius={75} innerRadius={32} label={({percent})=>`${(percent*100).toFixed(0)}%`} labelLine={false}>
                <Cell fill="#004977"/><Cell fill="#E0E6EF"/>
              </Pie>
              <Tooltip formatter={v=>`$${v}`} contentStyle={S.tt} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:11, color:"#7A8FA6" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ─── TRANSACTIONS ─────────────────────────────────────────────────────────────
function TransactionsPage({ transactions, onReCategorize }) {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [groupBy, setGroupBy] = useState("flat");
  const [editId, setEditId] = useState(null);
  const [editCat, setEditCat] = useState("");

  const filtered = transactions.filter(t=>(filter==="All"||t.category===filter)&&(t.merchant.toLowerCase().includes(search.toLowerCase())||t.category.toLowerCase().includes(search.toLowerCase())));

  const grouped = (() => {
    if (groupBy==="flat") return { "All Transactions": filtered };
    const map = {};
    filtered.forEach(t=>{ const k=groupBy==="month"?t.month:`Week ${t.week} · ${t.month}`; if(!map[k])map[k]=[]; map[k].push(t); });
    return map;
  })();

  return (
    <div style={{ padding:"28px 32px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div>
          <div style={{ fontSize:26, fontWeight:800, color:"inherit", fontFamily:"Georgia,serif" }}>Transactions</div>
          <div style={{ color:"#7A8FA6", fontSize:13, marginTop:2 }}>{filtered.length} records</div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          {["flat","month","week"].map(g=>(
            <button key={g} onClick={()=>setGroupBy(g)} style={{ ...S.btn(groupBy===g?"#D03027":"#111"), fontSize:11, padding:"8px 14px", border:"1px solid #1a1a3e" }}>
              {g==="flat"?"List":g==="month"?"By Month":"By Week"}
            </button>
          ))}
          <button onClick={()=>exportCSV(filtered,"transactions.csv")} style={{ ...S.btn("#004977"), fontSize:11, padding:"8px 14px" }}>Export CSV</button>
        </div>
      </div>

      <div style={{ display:"flex", gap:10, marginBottom:18, flexWrap:"wrap", alignItems:"center" }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search merchant..." style={{ ...S.input, width:200, padding:"9px 14px", fontSize:13 }} />
        {["All",...CATEGORIES].map(c=>(
          <button key={c} onClick={()=>setFilter(c)} style={{ padding:"5px 12px", borderRadius:16, border:`1px solid ${filter===c?(CAT_COLORS[c]||"#D03027"):"#E0E6EF"}`, background:filter===c?(CAT_COLORS[c]||"#D03027")+"22":"transparent", color:filter===c?"#fff":"#7A8FA6", fontSize:11, cursor:"pointer", fontWeight:filter===c?600:400 }}>{c}</button>
        ))}
      </div>

      {Object.entries(grouped).map(([group,rows])=>(
        <div key={group} style={{ marginBottom:22 }}>
          {groupBy!=="flat" && <div style={{ fontSize:12, color:"#D03027", fontWeight:600, letterSpacing:1, marginBottom:10, paddingBottom:6, borderBottom:"1px solid #E0E6EF" }}>{group} — ${rows.reduce((s,t)=>s+t.amount,0).toFixed(0)}</div>}
          <div style={{ ...S.card, padding:0, overflow:"hidden" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:"#F4F7FB" }}>
                  {["Date","Merchant","Category","Amount","Day",""].map(h=><th key={h} style={{ padding:"11px 18px", textAlign:"left", fontSize:10, color:"#5A7A9A", fontWeight:600, letterSpacing:1.2, textTransform:"uppercase", borderBottom:"1px solid #1a1a3e" }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0,100).map((t,i)=>(
                  <tr key={t.id} style={{ borderBottom:"1px solid #0d0d1e" }}>
                    <td style={{ padding:"10px 18px", fontSize:12, color:"#7A8FA6" }}>{t.date}</td>
                    <td style={{ padding:"10px 18px", fontSize:13, color:"#1A2B3C", fontWeight:500 }}>{t.merchant}</td>
                    <td style={{ padding:"10px 18px" }}>
                      {editId===t.id ? (
                        <select value={editCat} onChange={e=>setEditCat(e.target.value)} style={{ background:"#F4F7FB", border:"1px solid #e94560", borderRadius:6, color:"#1A2B3C", fontSize:11, padding:"3px 8px" }}>
                          {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                        </select>
                      ) : (
                        <span style={{ padding:"3px 10px", borderRadius:16, background:(CAT_COLORS[t.category]||"#5A7A9A")+"33", color:CAT_COLORS[t.category]||"#aaa", fontSize:11, fontWeight:600 }}>{t.category}</span>
                      )}
                    </td>
                    <td style={{ padding:"10px 18px", fontSize:14, color:"#D03027", fontWeight:700 }}>${t.amount.toFixed(2)}</td>
                    <td style={{ padding:"10px 18px", fontSize:11, color:"#7A8FA6" }}>{DAYS[t.dayOfWeek]}</td>
                    <td style={{ padding:"10px 18px" }}>
                      {editId===t.id ? (
                        <div style={{ display:"flex", gap:6 }}>
                          <button onClick={()=>{onReCategorize(t.id,editCat);setEditId(null);}} style={{ fontSize:10, background:"#7ed32122", border:"1px solid #7ed321", borderRadius:6, color:"#2E7D32", padding:"3px 8px", cursor:"pointer" }}>Save</button>
                          <button onClick={()=>setEditId(null)} style={{ fontSize:10, background:"transparent", border:"1px solid #222", borderRadius:6, color:"#7A8FA6", padding:"3px 8px", cursor:"pointer" }}>Cancel</button>
                        </div>
                      ) : (
                        <button onClick={()=>{setEditId(t.id);setEditCat(t.category);}} style={{ fontSize:10, background:"transparent", border:"1px solid #1a1a3e", borderRadius:6, color:"#7A8FA6", padding:"3px 8px", cursor:"pointer" }}>Edit</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── ADVISOR ──────────────────────────────────────────────────────────────────
function AdvisorPage({ transactions, user }) {
  const [chats, setChats] = useState({ card:[], insurance:[], account:[] });
  const [inputs, setInputs] = useState({ card:"", insurance:"", account:"" });
  const [loading, setLoading] = useState({ card:false, insurance:false, account:false });
  const refs = { card:useRef(), insurance:useRef(), account:useRef() };

  const catTotals = CATEGORIES.reduce((a,c)=>{ a[c]=transactions.filter(t=>t.category===c).reduce((s,t)=>s+t.amount,0); return a; },{});
  const totalSpend = transactions.reduce((s,t)=>s+t.amount,0);
  const spendSummary = CATEGORIES.map(c=>`${c}:$${catTotals[c]?.toFixed(0)||0}`).join(", ");

  const SYSTEMS = {
    card:`You are a Capital One credit card specialist. Be conversational, cite specific spending numbers. Max 120 words. Cards: ${CREDIT_CARDS.map(c=>c.name+" ("+c.rewardRate+")").join("; ")}`,
    insurance:`You are a Capital One health insurance advisor. Be direct and specific. Max 120 words. Plans: ${HEALTH_INSURANCES.map(h=>h.name+" "+h.type+" $"+h.premium+"/mo").join("; ")}`,
    account:`You are a Capital One banking advisor for savings optimization. Reference actual numbers. Max 120 words. Accounts: ${ACCOUNT_TYPES.map(a=>a.name+" APY:"+a.apy+"%").join("; ")}`,
  };

  const STARTERS = {
    card:`My 90-day spend — ${spendSummary}. Total: $${totalSpend.toFixed(0)}. Income: $${user.income}/yr. Goals: ${user.financialGoals?.join(", ")||"general savings"}. Which Capital One card is best for me?`,
    insurance:`Healthcare spend 90 days: $${catTotals["Healthcare"]?.toFixed(0)||0}. Age: ${user.age}. Income: $${user.income}. Goals: ${user.financialGoals?.join(", ")||"general"}. Recommend the best health plan.`,
    account:`Monthly spend: $${(totalSpend/3).toFixed(0)}. Monthly income: $${user.monthlyIncome||Math.round(user.income/12)}. Goals: ${user.financialGoals?.join(", ")||"savings"}. What account structure should I set up?`,
  };

  const send = async (agent, override) => {
    const msg = override || inputs[agent];
    if (!msg.trim()) return;
    const userMsg = { role:"user", content:msg };
    const newHistory = [...chats[agent], userMsg];
    setChats(p=>({...p,[agent]:newHistory}));
    setInputs(p=>({...p,[agent]:""}));
    setLoading(p=>({...p,[agent]:true}));
    const reply = await callClaude(SYSTEMS[agent], msg, chats[agent]);
    setChats(p=>({...p,[agent]:[...p[agent], userMsg, { role:"assistant", content:reply }]}));
    setLoading(p=>({...p,[agent]:false}));
    setTimeout(()=>refs[agent]?.current?.scrollTo(0,99999),100);
  };

  const agents = [
    { key:"card", title:"Credit Card Agent", desc:"Matches spend patterns to the best card", color:"#D03027" },
    { key:"insurance", title:"Health Insurance Agent", desc:"Analyzes healthcare spend for best plan", color:"#004977" },
    { key:"account", title:"Account Optimizer", desc:"Structures banking for maximum savings", color:"#E8821A" },
  ];

  return (
    <div style={{ padding:"28px 32px" }}>
      <div style={{ fontSize:26, fontWeight:800, color:"#1A2B3C", fontFamily:"Georgia,serif", marginBottom:4 }}>AI Financial Advisors</div>
      <div style={{ color:"#7A8FA6", fontSize:13, marginBottom:24 }}>Three conversational agents — ask follow-up questions and explore scenarios</div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:18 }}>
        {agents.map(agent=>(
          <div key={agent.key} style={{ ...S.card, display:"flex", flexDirection:"column", height:460 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
              <div style={{ width:7, height:7, borderRadius:"50%", background:agent.color }} />
              <div style={{ fontSize:14, fontWeight:700, color:"#1A2B3C" }}>{agent.title}</div>
            </div>
            <div style={{ fontSize:11, color:"#7A8FA6", marginBottom:14 }}>{agent.desc}</div>

            {chats[agent.key].length === 0 ? (
              <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12, padding:"0 8px" }}>
                <div style={{ fontSize:12, color:"#2a2a44", textAlign:"center", lineHeight:1.7 }}>Personalized analysis based on your {transactions.length} transactions and financial goals</div>
                <button onClick={()=>send(agent.key, STARTERS[agent.key])} style={{ ...S.btn(agent.color), width:"100%", padding:12 }}>Start Analysis</button>
              </div>
            ) : (
              <>
                <div ref={refs[agent.key]} style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:8, marginBottom:10, paddingRight:2 }}>
                  {chats[agent.key].map((m,i)=>(
                    <div key={i} style={{ alignSelf:m.role==="user"?"flex-end":"flex-start", maxWidth:"88%" }}>
                      <div style={{ padding:"9px 13px", borderRadius:m.role==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px", background:m.role==="user"?`${agent.color}18`:"#F4F7FB", border:`1px solid ${m.role==="user"?agent.color+"55":"#E0E6EF"}`, fontSize:12, color: m.role==="user" ? "#fff" : "#1A2B3C", lineHeight:1.65 }}>{m.content}</div>
                    </div>
                  ))}
                  {loading[agent.key] && <div style={{ alignSelf:"flex-start", padding:"9px 13px", borderRadius:"14px 14px 14px 4px", background:"#F4F7FB", border:"1px solid #1a1a3e", fontSize:12, color:"#5A7A9A" }}>Analyzing...</div>}
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <input value={inputs[agent.key]} onChange={e=>setInputs(p=>({...p,[agent.key]:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&send(agent.key)} placeholder="Ask a follow-up..." style={{ ...S.input, flex:1, padding:"9px 13px", fontSize:12 }} />
                  <button onClick={()=>send(agent.key)} disabled={loading[agent.key]} style={{ ...S.btn(agent.color), padding:"9px 14px", fontSize:12 }}>Send</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop:32 }}>
        <div style={{ fontSize:15, fontWeight:700, color:"#1A2B3C", marginBottom:14 }}>Product Catalog</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:14, marginBottom:14 }}>
          {CREDIT_CARDS.map(c=>(
            <div key={c.name} style={{ ...S.card, padding:18 }}>
              <div style={{ fontSize:13, fontWeight:700, color:"#1A2B3C", marginBottom:4 }}>{c.name}</div>
              <div style={{ fontSize:11, color:"#D03027", marginBottom:8 }}>{c.rewardRate}</div>
              <div style={{ fontSize:10, color:"#7A8FA6", marginBottom:8 }}>Fee: ${c.annualFee}/yr · Score: {c.score}+</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>{c.perks.map(p=><span key={p} style={{ padding:"2px 7px", background:"#E0E6EF", borderRadius:10, fontSize:9, color:"#5A7A9A" }}>{p}</span>)}</div>
            </div>
          ))}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:14 }}>
          {HEALTH_INSURANCES.map(h=>(
            <div key={h.name} style={{ ...S.card, padding:18 }}>
              <div style={{ fontSize:13, fontWeight:700, color:"#1A2B3C", marginBottom:4 }}>{h.name}</div>
              <div style={{ fontSize:11, color:"#004977", marginBottom:6 }}>{h.type} — ${h.premium}/mo</div>
              <div style={{ fontSize:10, color:"#7A8FA6", marginBottom:4 }}>Deductible: ${h.deductible}</div>
              <div style={{ fontSize:10, color:"#7A8FA6" }}>{h.bestFor}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── GOALS ────────────────────────────────────────────────────────────────────
function GoalsPage({ transactions, user }) {
  const [goals, setGoals] = useState([
    { id:1, name:"Emergency Fund", target:15000, saved:4800, monthly:500, deadline:"2025-12-31", category:"Savings" },
    { id:2, name:"Vacation to Japan", target:5000, saved:1200, monthly:300, deadline:"2025-08-01", category:"Travel" },
    { id:3, name:"New MacBook Pro", target:2500, saved:900, monthly:200, deadline:"2025-06-01", category:"Shopping" },
  ]);
  const [form, setForm] = useState({ name:"", target:"", saved:"", monthly:"", deadline:"", category:"Savings" });
  const [advice, setAdvice] = useState({});
  const [loadingId, setLoadingId] = useState(null);

  const monthlySpend = transactions.reduce((s,t)=>s+t.amount,0)/3;
  const catTotals = CATEGORIES.reduce((a,c)=>{ a[c]=transactions.filter(t=>t.category===c).reduce((s,t)=>s+t.amount,0)/3; return a; },{});

  const addGoal = () => {
    if (!form.name||!form.target) return;
    setGoals(p=>[...p,{ ...form, id:Date.now(), target:+form.target, saved:+form.saved||0, monthly:+form.monthly||0 }]);
    setForm({ name:"", target:"", saved:"", monthly:"", deadline:"", category:"Savings" });
  };

  const getAdvice = async (goal) => {
    setLoadingId(goal.id);
    const remaining = goal.target - goal.saved;
    const daysLeft = goal.deadline ? Math.max(0,Math.ceil((new Date(goal.deadline)-new Date())/86400000)) : 365;
    const monthsLeft = Math.max(1, daysLeft/30);
    const needed = remaining/monthsLeft;
    const surplus = (user.monthlyIncome||Math.round(user.income/12)) - monthlySpend;
    const breakdown = CATEGORIES.map(c=>`${c}:$${catTotals[c]?.toFixed(0)||0}/mo`).join(", ");
    const result = await callClaude(
      "You are a personal finance coach. Give 3 specific, actionable spending cuts with exact dollar amounts. Be direct. Format as 3 numbered points. Max 100 words.",
      `Goal: "${goal.name}" — need $${remaining} more in ${monthsLeft.toFixed(0)} months ($${needed.toFixed(0)}/mo needed). Current surplus: $${surplus.toFixed(0)}/mo. Spend: ${breakdown}.`
    );
    setAdvice(p=>({...p,[goal.id]:result}));
    setLoadingId(null);
  };

  return (
    <div style={{ padding:"28px 32px" }}>
      <div style={{ fontSize:26, fontWeight:800, color:"#1A2B3C", fontFamily:"Georgia,serif", marginBottom:4 }}>Goals Tracker</div>
      <div style={{ color:"#7A8FA6", fontSize:13, marginBottom:24 }}>Track targets · AI shows exactly where to cut spend to get there faster</div>

      <div style={{ ...S.card, marginBottom:24 }}>
        <div style={{ fontSize:11, color:"#7A8FA6", fontWeight:600, marginBottom:14, letterSpacing:1.2 }}>ADD NEW GOAL</div>
        <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr auto", gap:12, alignItems:"flex-end" }}>
          {[["Goal Name","name","text","House down payment"],["Target ($)","target","number","20000"],["Saved ($)","saved","number","0"],["Monthly ($)","monthly","number","500"],["Deadline","deadline","date",""]].map(([label,key,type,ph])=>(
            <div key={key}>
              <label style={S.label}>{label}</label>
              <input type={type} placeholder={ph} value={form[key]} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))} style={{ ...S.input, padding:"10px 12px", fontSize:13 }} />
            </div>
          ))}
          <button onClick={addGoal} style={{ ...S.btn(), padding:"10px 18px", height:42 }}>Add</button>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 }}>
        {goals.map(goal=>{
          const pct = Math.min((goal.saved/goal.target)*100,100);
          const remaining = goal.target - goal.saved;
          const daysLeft = goal.deadline ? Math.max(0,Math.ceil((new Date(goal.deadline)-new Date())/86400000)) : null;
          const monthsLeft = daysLeft ? daysLeft/30 : null;
          const neededPerMonth = monthsLeft ? remaining/monthsLeft : null;
          const atCurrentRate = goal.monthly>0 ? remaining/goal.monthly : null;

          const projData = [];
          if (goal.monthly>0) {
            const months = Math.min(24, Math.ceil(remaining/(goal.monthly||1))+2);
            for (let m=0; m<=months; m++) projData.push({ m:`M${m}`, savings:Math.min(goal.target, goal.saved+goal.monthly*m), goal:goal.target });
          }

          return (
            <div key={goal.id} style={S.card}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                <div>
                  <div style={{ fontSize:16, fontWeight:700, color:"#1A2B3C" }}>{goal.name}</div>
                  <div style={{ fontSize:11, color:"#7A8FA6", marginTop:3 }}>{goal.category}{daysLeft!==null?` · ${daysLeft} days left`:""}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:22, fontWeight:800, color:"#D03027" }}>${goal.saved.toLocaleString()}</div>
                  <div style={{ fontSize:10, color:"#7A8FA6" }}>of ${goal.target.toLocaleString()}</div>
                </div>
              </div>

              <div style={{ background:"#F4F7FB", borderRadius:20, height:8, marginBottom:8, overflow:"hidden" }}>
                <div style={{ width:`${pct}%`, height:"100%", background:pct>=75?"#2E7D32":pct>=40?"#E8821A":"#D03027", borderRadius:20, transition:"width 1s ease" }} />
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#7A8FA6", marginBottom:14 }}>
                <span>{pct.toFixed(1)}% complete</span>
                <span>${remaining.toLocaleString()} to go{neededPerMonth?` · $${neededPerMonth.toFixed(0)}/mo needed`:""}</span>
              </div>

              {projData.length > 1 && (
                <div style={{ marginBottom:14 }}>
                  <div style={{ fontSize:10, color:"#5A7A9A", marginBottom:6, letterSpacing:1 }}>PROJECTION {atCurrentRate?`(${atCurrentRate.toFixed(0)} months at $${goal.monthly}/mo)`:"" }</div>
                  <ResponsiveContainer width="100%" height={80}>
                    <AreaChart data={projData}>
                      <defs><linearGradient id={`pg${goal.id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2E7D32" stopOpacity={0.3}/><stop offset="95%" stopColor="#2E7D32" stopOpacity={0}/></linearGradient></defs>
                      <XAxis dataKey="m" hide /><YAxis hide domain={[0,goal.target*1.05]} />
                      <Tooltip formatter={v=>`$${v.toFixed(0)}`} contentStyle={{ ...S.tt, fontSize:10 }} />
                      <ReferenceLine y={goal.target} stroke="#D03027" strokeDasharray="3 2" strokeWidth={1} />
                      <Area type="monotone" dataKey="savings" stroke="#2E7D32" fill={`url(#pg${goal.id})`} strokeWidth={1.5} dot={false} name="Projected" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              <button onClick={()=>getAdvice(goal)} disabled={loadingId===goal.id} style={{ ...S.btn("#004977"), width:"100%", marginBottom:advice[goal.id]?10:0, opacity:loadingId===goal.id?0.7:1 }}>
                {loadingId===goal.id?"Analyzing...":"Get AI Savings Advice"}
              </button>

              {advice[goal.id] && (
                <div style={{ background:"#F4F7FB", borderRadius:10, padding:14, fontSize:12, color:"#3A4A5C", lineHeight:1.8, whiteSpace:"pre-wrap", borderLeft:"3px solid #7ed321" }}>
                  {advice[goal.id]}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── LIFE STAGE DETECTION ENGINE ─────────────────────────────────────────────
const LIFE_STAGE_SIGNALS = {
  "new_parent": {
    label: "New Parent",
    keywords: ["baby","infant","diaper","formula","stroller","crib","onesie","pediatric","nursery","maternity","newborn","baby carriage","buybuy baby","carter's","graco","chicco","pampers","huggies","gerber"],
    merchants: ["Buy Buy Baby","Carter's","Graco","Babies R Us","Target Baby","Pediatric","Children's Hospital"],
    color: "#E8821A",
    icon: "▲",
    advice: {
      priority: "Child savings account + life insurance",
      products: ["Capital One Kids Savings Account (0% fees, 4.3% APY)","529 College Savings Plan","Term Life Insurance — 20yr recommended","Capital One Quicksilver (1.5% back on all baby purchases)"],
      warnings: ["Childcare costs average $18k/year — budget now","Update beneficiaries on all accounts","Consider disability insurance with a dependent"],
      investments: ["529 Plan — tax-free college growth","UGMA/UTMA custodial account","I-Bonds for education fund"],
    }
  },
  "college_student": {
    label: "College Student",
    keywords: ["textbook","tuition","campus","dorm","student","university","college","chegg","coursera","ramen","dining hall","meal plan","student loan","financial aid"],
    merchants: ["Chegg","Coursera","Campus Bookstore","Student Union","University"],
    color: "#004977",
    icon: "▲",
    advice: {
      priority: "Build credit + emergency fund",
      products: ["Capital One SavorOne Student Card (no fee, 3% dining)","360 Checking (no fees, early paycheck)","Secured card if no credit history"],
      warnings: ["Avoid credit card debt — pay in full monthly","FAFSA deadline is March 1","Student loan interest accumulates during school"],
      investments: ["Roth IRA — start even at $25/mo","High-yield savings for emergency fund"],
    }
  },
  "new_homeowner": {
    label: "New Homeowner",
    keywords: ["mortgage","home depot","lowe's","plumbing","hvac","lawn","landscaping","renovation","contractor","property tax","homeowners insurance","real estate","closing costs","escrow","houzz","wayfair furniture"],
    merchants: ["Home Depot","Lowe's","Wayfair","IKEA","Ace Hardware","HomeAdvisor","Zillow"],
    color: "#2E7D32",
    icon: "▲",
    advice: {
      priority: "Home equity + emergency repair fund",
      products: ["Capital One Venture X (2x miles on home purchases)","Home Equity Line of Credit (HELOC)","360 Performance Savings for repair fund"],
      warnings: ["Keep 1-3% of home value for annual maintenance","Homeowners insurance is not flood insurance","Property taxes rise — escrow may change"],
      investments: ["HELOC as financial safety net","Extra mortgage principal payments","REIT investments for real estate diversification"],
    }
  },
  "retiree": {
    label: "Near Retirement",
    keywords: ["medicare","social security","retirement","pension","annuity","assisted living","senior","aarp","golf","cruise","grandchild","boca raton","naples","florida","arizona","snowbird"],
    merchants: ["AARP","Medicare","Cruise Lines","Golf Club","Senior Center"],
    color: "#C2185B",
    icon: "▲",
    advice: {
      priority: "Capital preservation + income generation",
      products: ["Capital One CD Ladder (5.0% APY 12-mo)","Money Market Account (3.8% APY)","Fixed Annuity for guaranteed income"],
      warnings: ["RMDs begin at age 73 — plan withdrawals","Medicare open enrollment Oct 15-Dec 7","Social Security delay = 8% more per year"],
      investments: ["Bond ladder for predictable income","Dividend ETFs (VYM, SCHD)","I-Bonds for inflation protection"],
    }
  },
  "young_professional": {
    label: "Young Professional",
    keywords: ["linkedin","business casual","commute","metro","coworking","networking","conference","laptop","work from home","remote work","slack","zoom","glassdoor"],
    merchants: ["LinkedIn","WeWork","Delta Business","Marriott","Brooks Brothers","Nordstrom"],
    color: "#1565C0",
    icon: "▲",
    advice: {
      priority: "Aggressive savings + employer match capture",
      products: ["Capital One Venture X (travel rewards for work trips)","360 Performance Savings","Roth IRA contribution"],
      warnings: ["Capture 100% of 401k employer match — it's free money","Lifestyle inflation is the biggest wealth killer at this stage","Start investing now — time is your biggest asset"],
      investments: ["Max Roth IRA ($7k/yr)","Low-cost index funds (VTI, VXUS)","Emergency fund = 3-6 months expenses"],
    }
  },
  "frequent_traveler": {
    label: "Frequent Traveler",
    keywords: ["delta","united","american airlines","marriott","hilton","hyatt","lounge","global entry","tsa precheck","clear","international","passport","forex","currency exchange","airbnb","booking.com"],
    merchants: ["Delta","United","American Airlines","Marriott","Hilton","Hyatt","Airbnb","Booking.com","Uber","Lyft"],
    color: "#D03027",
    icon: "▲",
    advice: {
      priority: "Maximize travel rewards + no foreign fees",
      products: ["Capital One Venture X (10x hotels, 5x flights, $300 travel credit)","Capital One Miles transfer partners","Priority Pass (1,300+ lounges)"],
      warnings: ["Avoid cards with foreign transaction fees","Credit card travel insurance can replace separate policies","Annual fee cards often pay for themselves in travel credits"],
      investments: ["Maximize points over cash back","Transfer points to airline partners for 2-3x value","TSA PreCheck $85 — pays off in 2 trips"],
    }
  },
};

function detectLifeStage(transactions) {
  const allText = transactions.map(t => (t.merchant + " " + t.description + " " + t.category).toLowerCase()).join(" ");
  const scores = {};
  Object.entries(LIFE_STAGE_SIGNALS).forEach(([stage, data]) => {
    let score = 0;
    data.keywords.forEach(kw => { if (allText.includes(kw.toLowerCase())) score += 3; });
    data.merchants.forEach(m => { if (allText.includes(m.toLowerCase())) score += 5; });
    scores[stage] = score;
  });
  const sorted = Object.entries(scores).sort((a,b)=>b[1]-a[1]);
  return sorted.filter(([,s])=>s>0).slice(0,3);
}

// ─── LIFE STAGE PAGE ──────────────────────────────────────────────────────────
function LifeStagePage({ transactions, user }) {
  const [detectedStages, setDetectedStages] = useState([]);
  const [selectedStage, setSelectedStage] = useState(null);
  const [aiAdvice, setAiAdvice] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [manualStage, setManualStage] = useState(null);
  const [productQuery, setProductQuery] = useState("");
  const [productRec, setProductRec] = useState("");
  const [loadingProduct, setLoadingProduct] = useState(false);

  useEffect(() => {
    const detected = detectLifeStage(transactions);
    setDetectedStages(detected);
    if (detected.length > 0) setSelectedStage(detected[0][0]);
    else setSelectedStage("young_professional");
  }, [transactions]);

  const activeStage = manualStage || selectedStage;
  const stageData = activeStage ? LIFE_STAGE_SIGNALS[activeStage] : null;

  const getAIAdvice = async () => {
    if (!stageData) return;
    setLoadingAI(true);
    const catTotals = ["Healthcare","Dining","Travel","Shopping","Groceries","Entertainment","Utilities","Fitness"].map(c=>
      `${c}:$${transactions.filter(t=>t.category===c).reduce((s,t)=>s+t.amount,0).toFixed(0)}`
    ).join(", ");
    const result = await callClaude(
      `You are a Capital One life stage financial advisor. The user is identified as a "${stageData.label}". Give highly personalized, specific financial advice in 4 sections: 1) Immediate Actions (next 30 days), 2) This Year's Priority, 3) Product That Will Help Most (one specific recommendation with why), 4) One Risk to Avoid. Be concrete, use dollar amounts. Max 200 words total.`,
      `Life stage: ${stageData.label}. Age: ${user.age}. Income: $${user.income}/yr. Monthly income: $${user.monthlyIncome||Math.round(user.income/12)}. Spending pattern: ${catTotals}. Financial goals: ${user.financialGoals?.join(", ")||"general savings"}.`
    );
    setAiAdvice(result);
    setLoadingAI(false);
  };

  const getProductRec = async () => {
    if (!productQuery.trim()) return;
    setLoadingProduct(true);
    const result = await callClaude(
      `You are a Capital One product recommendation specialist. Based on the user's life stage and the item they're considering buying, give: 1) Whether it's a smart purchase for their stage, 2) Best Capital One product (card/account) to use for it and why, 3) One money-saving tip specific to this purchase. Be specific and brief (max 80 words).`,
      `Life stage: ${stageData?.label||"general"}. Age: ${user.age}. Income: $${user.income}. Considering buying: "${productQuery}". Monthly spend: $${(transactions.reduce((s,t)=>s+t.amount,0)/3).toFixed(0)}.`
    );
    setProductRec(result);
    setLoadingProduct(false);
  };

  const catSpend = ["Healthcare","Dining","Travel","Shopping","Groceries","Entertainment","Utilities","Fitness"].map(c=>({
    name:c, value:parseFloat(transactions.filter(t=>t.category===c).reduce((s,t)=>s+t.amount,0).toFixed(2))
  })).filter(c=>c.value>0).sort((a,b)=>b.value-a.value);

  return (
    <div style={{ padding:"28px 32px" }}>
      <div style={{ fontSize:26, fontWeight:800, color:"inherit", fontFamily:"Georgia,serif", marginBottom:4 }}>Life Stage Advisor</div>
      <div style={{ color:"#7A8FA6", fontSize:13, marginBottom:24 }}>AI detects your life stage from purchase patterns and tailors financial advice accordingly</div>

      {/* Detection Banner */}
      {detectedStages.length > 0 && (
        <div style={{ ...S.card, marginBottom:20, borderColor:"#D0302733", background:"#FFF5F4" }}>
          <div style={{ fontSize:12, color:"#D03027", fontWeight:600, letterSpacing:1, marginBottom:10 }}>DETECTED FROM YOUR TRANSACTIONS</div>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            {detectedStages.map(([stage, score]) => {
              const data = LIFE_STAGE_SIGNALS[stage];
              return (
                <button key={stage} onClick={()=>{setSelectedStage(stage);setManualStage(null);setAiAdvice("");}}
                  style={{ padding:"8px 18px", borderRadius:20, border:`1px solid ${selectedStage===stage&&!manualStage?data.color:"#E0E6EF"}`, background:selectedStage===stage&&!manualStage?data.color+"22":"transparent", color:selectedStage===stage&&!manualStage?"#fff":"#7A8FA6", fontSize:12, cursor:"pointer", fontWeight:selectedStage===stage&&!manualStage?700:400, transition:"all 0.2s" }}>
                  {data.label} <span style={{ opacity:0.5, fontSize:10 }}>({score}pts)</span>
                </button>
              );
            })}
          </div>
          <div style={{ fontSize:11, color:"#5A7A9A", marginTop:10 }}>Detection uses merchant names and purchase categories. You can override below.</div>
        </div>
      )}

      {detectedStages.length === 0 && (
        <div style={{ ...S.card, marginBottom:20, borderColor:"#D0DBE8" }}>
          <div style={{ fontSize:13, color:"#7A8FA6" }}>No strong life stage signals detected in your recent transactions. Select one manually below to get tailored advice.</div>
        </div>
      )}

      {/* Manual Override */}
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:11, color:"#7A8FA6", fontWeight:600, letterSpacing:1.2, marginBottom:10 }}>SELECT OR OVERRIDE LIFE STAGE</div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {Object.entries(LIFE_STAGE_SIGNALS).map(([key, data])=>(
            <button key={key} onClick={()=>{setManualStage(key);setAiAdvice("");}}
              style={{ padding:"7px 16px", borderRadius:20, border:`1px solid ${manualStage===key?data.color:"#E0E6EF"}`, background:manualStage===key?data.color+"22":"transparent", color:manualStage===key?"#fff":"#7A8FA6", fontSize:12, cursor:"pointer", transition:"all 0.2s", fontWeight:manualStage===key?600:400 }}>
              {data.label}
            </button>
          ))}
        </div>
      </div>

      {stageData && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, marginBottom:18 }}>
          {/* Left: Stage Card */}
          <div style={{ ...S.card, borderColor:stageData.color+"44" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
              <div style={{ width:40, height:40, borderRadius:10, background:stageData.color+"22", border:`1px solid ${stageData.color}44`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <div style={{ width:10, height:10, borderRadius:2, background:stageData.color }} />
              </div>
              <div>
                <div style={{ fontSize:18, fontWeight:800, color:"#fff" }}>{stageData.label}</div>
                <div style={{ fontSize:11, color:"#7A8FA6" }}>Financial profile active</div>
              </div>
            </div>

            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:10, color:"#7A8FA6", letterSpacing:1.2, marginBottom:8 }}>TOP PRIORITY</div>
              <div style={{ padding:"10px 14px", background:stageData.color+"15", borderRadius:10, border:`1px solid ${stageData.color}33`, fontSize:13, color:"#1A2B3C", fontWeight:500 }}>{stageData.advice.priority}</div>
            </div>

            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:10, color:"#7A8FA6", letterSpacing:1.2, marginBottom:8 }}>RECOMMENDED PRODUCTS</div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {stageData.advice.products.map((p,i)=>(
                  <div key={i} style={{ padding:"8px 12px", background:"#F4F7FB", borderRadius:8, fontSize:12, color:"#3A4A5C", borderLeft:`2px solid ${stageData.color}` }}>{p}</div>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize:10, color:"#7A8FA6", letterSpacing:1.2, marginBottom:8 }}>WATCH OUT FOR</div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {stageData.advice.warnings.map((w,i)=>(
                  <div key={i} style={{ padding:"8px 12px", background:"#e9456008", borderRadius:8, fontSize:12, color:"#7A8FA6", borderLeft:"2px solid #e94560" }}>{w}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Investments + AI */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={S.card}>
              <div style={{ fontSize:10, color:"#7A8FA6", letterSpacing:1.2, marginBottom:10 }}>INVESTMENT MOVES FOR THIS STAGE</div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {stageData.advice.investments.map((inv,i)=>(
                  <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                    <div style={{ width:20, height:20, borderRadius:4, background:"#7ed32122", border:"1px solid #7ed32144", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>
                      <div style={{ width:6, height:6, borderRadius:1, background:"#2E7D32" }} />
                    </div>
                    <div style={{ fontSize:13, color:"#3A4A5C", lineHeight:1.5 }}>{inv}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={S.card}>
              <div style={{ fontSize:10, color:"#7A8FA6", letterSpacing:1.2, marginBottom:10 }}>PERSONALIZED AI ADVICE</div>
              {!aiAdvice && !loadingAI && (
                <div style={{ fontSize:12, color:"#5A7A9A", marginBottom:12, lineHeight:1.6 }}>Get a full personalized financial plan tailored to your {stageData.label} life stage and actual spending data.</div>
              )}
              {loadingAI && <div style={{ fontSize:13, color:"#7A8FA6", marginBottom:12 }}>Generating personalized plan...</div>}
              {aiAdvice && <div style={{ fontSize:12, color:"#3A4A5C", lineHeight:1.8, whiteSpace:"pre-wrap", marginBottom:12 }}>{aiAdvice}</div>}
              <button onClick={getAIAdvice} disabled={loadingAI} style={{ ...S.btn(stageData.color), width:"100%", opacity:loadingAI?0.6:1, fontSize:12 }}>
                {loadingAI ? "Analyzing..." : aiAdvice ? "Refresh Advice" : "Get AI Financial Plan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Future Purchase Advisor */}
      {stageData && (
        <div style={S.card}>
          <div style={{ fontSize:14, fontWeight:700, color:"#1A2B3C", marginBottom:4 }}>Future Purchase Advisor</div>
          <div style={{ fontSize:12, color:"#7A8FA6", marginBottom:16 }}>Tell us what you're thinking of buying — we'll advise if it fits your life stage and which Capital One product to use</div>
          <div style={{ display:"flex", gap:10, marginBottom: productRec ? 16 : 0 }}>
            <input value={productQuery} onChange={e=>setProductQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&getProductRec()}
              placeholder='e.g. "baby monitor", "standing desk", "flight to Cancun"'
              style={{ ...S.input, flex:1, padding:"11px 16px", fontSize:13 }} />
            <button onClick={getProductRec} disabled={loadingProduct} style={{ ...S.btn("#004977"), padding:"11px 20px", fontSize:13, opacity:loadingProduct?0.6:1 }}>
              {loadingProduct?"Checking...":"Advise Me"}
            </button>
          </div>
          {productRec && (
            <div style={{ background:"#F4F7FB", borderRadius:10, padding:16, fontSize:13, color:"#3A4A5C", lineHeight:1.8, borderLeft:`3px solid ${stageData.color}` }}>
              {productRec}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── AI BANK TELLER PAGE ──────────────────────────────────────────────────────
const SAMPLE_QUESTIONS = [
  "How much did I spend on coffee last week?",
  "Send Sarah $50",
  "Do I have enough for next month's rent?",
  "Where is the nearest Capital One ATM?",
  "What was my biggest purchase this month?",
  "How much have I spent on dining this month?",
  "Am I on track with my budget?",
  "Show me all Starbucks charges",
];

function TellerPage({ transactions, user }) {
  const [messages, setMessages] = useState([
    { role:"assistant", content:`Hello ${user?.name?.split(" ")[0] || "there"}! I'm your Capital One AI Teller. I have full access to your account and transaction history. You can ask me anything — check balances, find transactions, calculate spending, locate ATMs, or initiate transfers. What can I help you with?` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatRef = useRef();
  const recognitionRef = useRef(null);

  // Build a rich transaction summary for the AI
  const txnSummary = (() => {
    const totalSpend = transactions.reduce((s,t)=>s+t.amount,0);
    const monthlySpend = totalSpend/3;
    const today = new Date();
    const thisMonth = transactions.filter(t=>t.month===today.toISOString().slice(0,7));
    const thisMonthSpend = thisMonth.reduce((s,t)=>s+t.amount,0);
    const yesterday = new Date(today); yesterday.setDate(today.getDate()-1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    const yesterdayTxns = transactions.filter(t=>t.date===yesterdayStr);
    const catTotals = ["Healthcare","Dining","Travel","Shopping","Groceries","Entertainment","Utilities","Fitness"].reduce((a,c)=>{
      a[c]=transactions.filter(t=>t.category===c).reduce((s,t)=>s+t.amount,0);return a;
    },{});
    const recent10 = transactions.slice(0,10).map(t=>`${t.date} ${t.merchant} $${t.amount}`).join("; ");
    const balance = Math.max(0, (user.monthlyIncome||5000)*3 - totalSpend + 2847.50);
    return {
      totalSpend: totalSpend.toFixed(2),
      monthlySpend: monthlySpend.toFixed(2),
      thisMonthSpend: thisMonthSpend.toFixed(2),
      yesterdayTxns: yesterdayTxns.length ? yesterdayTxns.map(t=>`${t.merchant} $${t.amount}`).join(", ") : "no transactions",
      catTotals: JSON.stringify(catTotals),
      recent10,
      balance: balance.toFixed(2),
      txnCount: transactions.length,
      income: user.monthlyIncome || Math.round(user.income/12),
    };
  })();

  const TELLER_SYSTEM = `You are an AI Bank Teller for Capital One. You have full access to the customer's account data. Be conversational, helpful, and precise — always cite exact dollar amounts and dates from the data provided.

ACCOUNT DATA:
- Customer: ${user?.name}, Age: ${user?.age}
- Available Balance: $${txnSummary.balance}
- Monthly Income: $${txnSummary.income}
- Total Spend (90 days): $${txnSummary.totalSpend}
- This Month's Spend: $${txnSummary.thisMonthSpend}
- Yesterday's Transactions: ${txnSummary.yesterdayTxns}
- Category Totals (90 days): ${txnSummary.catTotals}
- Recent Transactions: ${txnSummary.recent10}
- Total Transactions: ${txnSummary.txnCount}

For transfer requests (e.g. "send Sarah $50"): Confirm the transfer as if you're processing it, note it's a demo simulation.
For ATM locations: Provide the nearest Capital One ATM based on Nashville, TN area (demo).
For budget questions: Compare this month's spend against income to calculate remaining budget.
For transaction searches: Look through the provided data and give exact matches.
Always respond in 1-3 sentences max unless the user needs a detailed breakdown. Be warm and efficient like a great bank teller.`;

  const sendMessage = async (msg) => {
    const text = msg || input;
    if (!text.trim()) return;
    const userMsg = { role:"user", content:text };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput("");
    setLoading(true);

    const history = newHistory.slice(1).map(m=>({ role:m.role, content:m.content }));
    const reply = await callClaude(TELLER_SYSTEM, text, history.slice(0,-1));
    setMessages(p=>[...p, { role:"assistant", content:reply }]);
    setLoading(false);
    setTimeout(()=>chatRef.current?.scrollTo(0,99999),100);
  };

  // Voice input
  const startListening = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Voice input not supported in this browser. Try Chrome.");
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setTimeout(() => sendMessage(transcript), 300);
    };
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  return (
    <div style={{ padding:"28px 32px", display:"flex", gap:20, height:"calc(100vh - 60px)" }}>
      {/* Chat Panel */}
      <div style={{ flex:1, display:"flex", flexDirection:"column" }}>
        <div style={{ fontSize:26, fontWeight:800, color:"inherit", fontFamily:"Georgia,serif", marginBottom:4 }}>AI Bank Teller</div>
        <div style={{ color:"#7A8FA6", fontSize:13, marginBottom:16 }}>Ask anything about your account — text or voice</div>

        {/* Chat Window */}
        <div ref={chatRef} style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:12, marginBottom:16, padding:"4px 0" }}>
          {messages.map((m,i)=>(
            <div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start" }}>
              {m.role==="assistant" && (
                <div style={{ width:28, height:28, borderRadius:8, background:"#e9456022", border:"1px solid #e9456044", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginRight:10, marginTop:2 }}>
                  <div style={{ width:8, height:8, borderRadius:2, background:"#D03027" }} />
                </div>
              )}
              <div style={{ maxWidth:"78%", padding:"12px 16px", borderRadius:m.role==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px", background:m.role==="user"?"#0f346088":"#FFFFFF", border:`1px solid ${m.role==="user"?"#0f346055":"#E0E6EF"}`, fontSize:14, color: m.role==="user" ? "#fff" : "#1A2B3C", lineHeight:1.65 }}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:28, height:28, borderRadius:8, background:"#e9456022", border:"1px solid #e9456044", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <div style={{ width:8, height:8, borderRadius:2, background:"#D03027" }} />
              </div>
              <div style={{ padding:"12px 16px", borderRadius:"16px 16px 16px 4px", background:"#FFFFFF", border:"1px solid #1a1a3e", fontSize:14, color:"#5A7A9A" }}>Processing...</div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <button onClick={isListening ? stopListening : startListening}
            style={{ width:44, height:44, borderRadius:12, background:isListening?"#e9456033":"#FFFFFF", border:`1px solid ${isListening?"#D03027":"#E0E6EF"}`, color:isListening?"#D03027":"#7A8FA6", fontSize:18, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.2s" }}
            title="Voice input">
            {isListening ? "◼" : "◆"}
          </button>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMessage()}
            placeholder={isListening ? "Listening..." : "Ask anything — 'How much on dining?', 'Send $50 to Sarah'..."}
            style={{ ...S.input, flex:1, padding:"12px 18px", fontSize:14, borderColor:isListening?"#e9456055":"#E0E6EF" }} />
          <button onClick={()=>sendMessage()} disabled={loading||!input.trim()}
            style={{ ...S.btn(), padding:"12px 20px", fontSize:13, opacity:loading||!input.trim()?0.5:1, flexShrink:0 }}>
            Send
          </button>
        </div>
        {isListening && <div style={{ fontSize:11, color:"#D03027", marginTop:8, textAlign:"center" }}>Listening — speak your question...</div>}
      </div>

      {/* Right Panel: Suggestions + Account Snapshot */}
      <div style={{ width:280, display:"flex", flexDirection:"column", gap:16, flexShrink:0 }}>
        {/* Account Snapshot */}
        <div style={S.card}>
          <div style={{ fontSize:11, color:"#7A8FA6", letterSpacing:1.2, fontWeight:600, marginBottom:14 }}>ACCOUNT SNAPSHOT</div>
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:11, color:"#7A8FA6", marginBottom:4 }}>Available Balance</div>
            <div style={{ fontSize:28, fontWeight:800, color:"#2E7D32", fontFamily:"Georgia,serif" }}>${parseFloat(txnSummary.balance).toLocaleString()}</div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {[
              ["Monthly Income", `$${(txnSummary.income).toLocaleString()}`, "#004977"],
              ["This Month Spent", `$${parseFloat(txnSummary.thisMonthSpend).toFixed(0)}`, "#D03027"],
              ["90-Day Total", `$${parseFloat(txnSummary.totalSpend).toFixed(0)}`, "#E8821A"],
              ["Transactions", txnSummary.txnCount, "#7A8FA6"],
            ].map(([label,val,color])=>(
              <div key={label} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid #1a1a3e" }}>
                <span style={{ fontSize:12, color:"#7A8FA6" }}>{label}</span>
                <span style={{ fontSize:13, fontWeight:700, color }}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Questions */}
        <div style={S.card}>
          <div style={{ fontSize:11, color:"#7A8FA6", letterSpacing:1.2, fontWeight:600, marginBottom:12 }}>TRY ASKING</div>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {SAMPLE_QUESTIONS.map(q=>(
              <button key={q} onClick={()=>sendMessage(q)} style={{ textAlign:"left", padding:"9px 12px", background:"#F4F7FB", border:"1px solid #1a1a3e", borderRadius:8, color:"#5A7A9A", fontSize:11, cursor:"pointer", lineHeight:1.4, transition:"all 0.15s" }}
                onMouseEnter={e=>{e.target.style.borderColor="#e9456055";e.target.style.color="#bbb";}}
                onMouseLeave={e=>{e.target.style.borderColor="#E0E6EF";e.target.style.color="#5A7A9A";}}>
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TOP BAR ──────────────────────────────────────────────────────────────────
function TopBar({ user, transactions, page, budgets, setBudgets }) {
  const [showBudget, setShowBudget] = useState(false);
  const [tempBudgets, setTempBudgets] = useState(budgets);
  const totalSpend = transactions.reduce((s,t)=>s+t.amount,0);
  const TITLES = { dashboard:"Dashboard", transactions:"Transactions", advisor:"AI Advisor", goals:"Goals Tracker", lifestage:"Life Stage Advisor", teller:"AI Bank Teller" };

  return (
    <div style={{ padding:"12px 28px", borderBottom:"1px solid #D0DBE8", display:"flex", justifyContent:"space-between", alignItems:"center", background:"#FFFFFF", position:"sticky", top:0, zIndex:15, boxShadow:"0 1px 8px rgba(0,73,119,0.08)" }}>
      <div style={{ fontSize:13, color:"#7A8FA6" }}>
        <span style={{ color:"#1A2B3C", fontWeight:600 }}>{user?.name}</span>
        <span style={{ margin:"0 8px", color:"#E0E6EF" }}>·</span>
        <span style={{ color:"#5A7A9A" }}>{user?.occupation}</span>
        <span style={{ margin:"0 8px", color:"#E0E6EF" }}>·</span>
        <span style={{ color:"#7A8FA6" }}>{TITLES[page]}</span>
      </div>
      <div style={{ display:"flex", gap:14, alignItems:"center" }}>
        <span style={{ fontSize:12, color:"#5A7A9A" }}>$<span style={{ color:"#D03027", fontWeight:700 }}>{totalSpend.toFixed(0)}</span> spent</span>
        <span style={{ fontSize:12, color:"#5A7A9A" }}><span style={{ color:"#004977", fontWeight:700 }}>{transactions.length}</span> txns</span>
        <button onClick={()=>setShowBudget(!showBudget)} style={{ ...S.btn("#004977"), fontSize:11, padding:"7px 13px", border:"none" }}>Set Budgets</button>
      </div>

      {showBudget && (
        <div style={{ position:"absolute", top:52, right:24, background:"#FFFFFF", border:"1px solid #D0DBE8", borderRadius:14, padding:20, zIndex:100, width:320, boxShadow:"0 20px 60px rgba(0,73,119,0.18)" }}>
          <div style={{ fontSize:13, fontWeight:700, color:"#1A2B3C", marginBottom:14 }}>Monthly Budget Caps</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
            {CATEGORIES.map(cat=>(
              <div key={cat}>
                <label style={{ ...S.label, fontSize:10 }}>{cat}</label>
                <input type="number" placeholder="No limit" value={tempBudgets[cat]||""} onChange={e=>setTempBudgets(p=>({...p,[cat]:+e.target.value||undefined}))} style={{ ...S.input, padding:"7px 10px", fontSize:12 }} />
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={()=>{setBudgets(tempBudgets);setShowBudget(false);}} style={{ ...S.btn(), flex:1, padding:9, fontSize:12 }}>Save</button>
            <button onClick={()=>setShowBudget(false)} style={{ ...S.btn("#7A8FA6"), flex:1, padding:9, fontSize:12, border:"none" }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}


// ─── ADMIN CRA COMMAND CENTER ─────────────────────────────────────────────────
function AdminSidebar({ activeAgent, setActiveAgent, employee }) {
  const allowedIds = employee?.access?.split(",") || CRA_AGENTS.map(a=>a.id);
  const visible = CRA_AGENTS.filter(a=>allowedIds.includes(a.id));
  const locked  = CRA_AGENTS.filter(a=>!allowedIds.includes(a.id));
  return (
    <div style={{ width:212, background:"#1A0505", borderRight:"1px solid #3A0A0A", display:"flex", flexDirection:"column", minHeight:"100vh", position:"sticky", top:0, flexShrink:0 }}>
      <div style={{ padding:"18px 16px 14px", borderBottom:"1px solid #3A0A0A" }}>
        <div style={{ fontSize:9, color:"rgba(255,255,255,0.25)", letterSpacing:2, textTransform:"uppercase", marginBottom:3 }}>Capital One Internal</div>
        <div style={{ fontSize:16, fontWeight:900, color:"#fff", fontFamily:"Georgia,serif" }}>CRA Command</div>
        <div style={{ fontSize:9, color:"#B05050", letterSpacing:1.5, textTransform:"uppercase", marginTop:2 }}>Restricted Access</div>
      </div>

      {employee && (
        <div style={{ margin:"12px 10px 4px", padding:"10px 12px", background:"rgba(139,0,0,0.25)", borderRadius:10, border:"1px solid rgba(208,48,39,0.3)" }}>
          <div style={{ fontSize:9, color:"rgba(255,255,255,0.3)", letterSpacing:1, marginBottom:4 }}>SIGNED IN AS</div>
          <div style={{ fontSize:12, fontWeight:700, color:"#fff" }}>{employee.name}</div>
          <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", marginTop:2 }}>{employee.role}</div>
          <div style={{ fontSize:9, color:"rgba(255,255,255,0.25)", fontFamily:"monospace", marginTop:2 }}>ID: {employee.id}</div>
        </div>
      )}

      <div style={{ padding:"8px 0", flex:1 }}>
        <div style={{ fontSize:9, color:"rgba(255,255,255,0.2)", letterSpacing:1, padding:"8px 16px 4px", textTransform:"uppercase" }}>Your Modules</div>
        {visible.map(a=>(
          <button key={a.id} onClick={()=>setActiveAgent(a.id)} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", width:"100%", background:activeAgent===a.id?"rgba(208,48,39,0.18)":"transparent", border:"none", borderLeft:activeAgent===a.id?"3px solid #D03027":"3px solid transparent", color:activeAgent===a.id?"#fff":"rgba(255,255,255,0.38)", fontSize:11, fontWeight:activeAgent===a.id?600:400, cursor:"pointer", textAlign:"left", transition:"all 0.15s" }}>
            <span style={{ width:28, height:18, background:activeAgent===a.id?a.color+"33":"rgba(255,255,255,0.05)", borderRadius:4, display:"flex", alignItems:"center", justifyContent:"center", fontSize:7, fontWeight:800, color:activeAgent===a.id?a.color:"rgba(255,255,255,0.22)", fontFamily:"monospace", flexShrink:0 }}>{a.label}</span>
            <span style={{ lineHeight:1.25 }}>{a.title}</span>
          </button>
        ))}
        {locked.length > 0 && (
          <>
            <div style={{ fontSize:9, color:"rgba(255,255,255,0.1)", letterSpacing:1, padding:"12px 16px 4px", textTransform:"uppercase" }}>No Access</div>
            {locked.map(a=>(
              <div key={a.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 14px", opacity:0.25 }}>
                <span style={{ width:28, height:18, background:"rgba(255,255,255,0.04)", borderRadius:4, display:"flex", alignItems:"center", justifyContent:"center", fontSize:7, color:"rgba(255,255,255,0.2)", fontFamily:"monospace" }}>{a.label}</span>
                <span style={{ fontSize:11, color:"rgba(255,255,255,0.2)" }}>{a.title}</span>
              </div>
            ))}
          </>
        )}
      </div>
      <div style={{ padding:"12px 16px", borderTop:"1px solid #3A0A0A", fontSize:9, color:"rgba(255,255,255,0.1)", lineHeight:1.8 }}>Activity logged & audited<br/>Capital One Compliance</div>
    </div>
  );
}

function AdminTopBar({ onExit, activeZip, setActiveZip, onAnalyzeZip, analyzing, employee }) {
  const [zipInput, setZipInput] = useState(activeZip||"");
  return (
    <div style={{ padding:"11px 22px", borderBottom:"1px solid #3A0A0A", display:"flex", justifyContent:"space-between", alignItems:"center", background:"#120202", position:"sticky", top:0, zIndex:15 }}>
      <div style={{ display:"flex", alignItems:"center", gap:14 }}>
        <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)" }}>CRA Command Center</div>
        <span style={{ fontSize:9, background:"#D0302722", color:"#D03027", border:"1px solid #D0302744", borderRadius:6, padding:"2px 8px", fontWeight:700, letterSpacing:1 }}>INTERNAL</span>
        {employee && <span style={{ fontSize:11, color:"rgba(255,255,255,0.5)", background:"rgba(139,0,0,0.3)", padding:"2px 10px", borderRadius:6, fontFamily:"monospace" }}>{employee.name} · {employee.id}</span>}
        {activeZip && <span style={{ fontSize:11, color:"#E8821A", fontWeight:600 }}>Zone: {activeZip}</span>}
      </div>
      <div style={{ display:"flex", gap:10, alignItems:"center" }}>
        <input value={zipInput} onChange={e=>setZipInput(e.target.value)} placeholder="Enter ZIP code..." onKeyDown={e=>e.key==="Enter"&&(setActiveZip(zipInput),onAnalyzeZip(zipInput))} style={{ background:"#1A0505", border:"1px solid #3A0A0A", borderRadius:8, padding:"7px 12px", color:"#fff", fontSize:12, outline:"none", width:160, fontFamily:"monospace" }} />
        <button onClick={()=>{setActiveZip(zipInput);onAnalyzeZip(zipInput);}} disabled={analyzing} style={{ padding:"7px 16px", background:"linear-gradient(135deg,#D03027,#B02020)", border:"none", borderRadius:8, color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", opacity:analyzing?0.6:1 }}>{analyzing?"Analyzing...":"Analyze Zone"}</button>
        <button onClick={onExit} style={{ padding:"7px 14px", background:"rgba(255,255,255,0.05)", border:"1px solid #3A0A0A", borderRadius:8, color:"rgba(255,255,255,0.45)", fontSize:11, cursor:"pointer" }}>Exit</button>
      </div>
    </div>
  );
}

function ZoneOverviewPanel({ zone, portfolio }) {
  const TT = { background:"#1A0505", border:"1px solid #3A0A0A", borderRadius:8, color:"#fff", fontSize:11 };
  if (!zone) return (
    <div style={{ padding:"48px 32px", textAlign:"center" }}>
      <div style={{ fontSize:13, color:"rgba(255,255,255,0.2)", lineHeight:2.2 }}>
        Enter a ZIP code above to analyze a CRA zone.<br/>
        Pre-loaded zones: {CRA_ZONES.map(z=>z.zip+" ("+z.city+")").join(" · ")}
      </div>
    </div>
  );
  const critical   = portfolio.filter(u=>u.riskTier==="Critical").length;
  const high       = portfolio.filter(u=>u.riskTier==="High").length;
  const totalH     = portfolio.reduce((s,u)=>s+u.monthlyHealthSpend,0);
  const avgPrev    = portfolio.reduce((s,u)=>s+u.preventiveSpend,0)/Math.max(1,portfolio.length);
  const avgReact   = portfolio.reduce((s,u)=>s+u.reactiveSpend,0)/Math.max(1,portfolio.length);
  const deployPct  = zone.craTarget>0 ? Math.round(zone.craDeployed/zone.craTarget*100) : 100;

  const incomeData = ["Low","Low-Moderate","Moderate","Middle","Upper-Middle"].map(g=>({
    name:g, count:portfolio.filter(u=>u.incomeGroup===g).length,
    avgH:parseFloat((portfolio.filter(u=>u.incomeGroup===g).reduce((s,u)=>s+u.monthlyHealthSpend,0)/Math.max(1,portfolio.filter(u=>u.incomeGroup===g).length)).toFixed(0))
  })).filter(d=>d.count>0);

  const riskDist = [
    { name:"Critical",value:critical,fill:"#D03027"},{ name:"High",value:high,fill:"#E8821A"},
    { name:"Moderate",value:portfolio.filter(u=>u.riskTier==="Moderate").length,fill:"#E8C01A"},
    { name:"Low",value:portfolio.filter(u=>u.riskTier==="Low").length,fill:"#2E7D32"},
  ].filter(d=>d.value>0);

  return (
    <div style={{ padding:"22px 26px", overflowY:"auto" }}>
      {/* Zone header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:18 }}>
        <div>
          <div style={{ fontSize:22, fontWeight:800, color:"#fff", fontFamily:"Georgia,serif" }}>{zone.city}, {zone.state}</div>
          <div style={{ fontSize:13, color:"rgba(255,255,255,0.35)", marginTop:2 }}>ZIP {zone.zip} · {zone.incomeGroup} Income · Pop. {zone.population?.toLocaleString()}</div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", letterSpacing:1, marginBottom:4 }}>DESERT SCORE</div>
          <div style={{ fontSize:38, fontWeight:900, color:zone.healthDesertScore>80?"#D03027":zone.healthDesertScore>60?"#E8821A":"#2E7D32", fontFamily:"Georgia,serif", lineHeight:1 }}>{zone.healthDesertScore}</div>
          <div style={{ fontSize:10, color:"rgba(255,255,255,0.25)" }}>/ 100</div>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10, marginBottom:18 }}>
        {[["Median Income",`$${(zone.medianIncome/1000).toFixed(0)}k`,zone.medianIncome<35000?"#D03027":"#2E7D32"],
          ["Unbanked",`${zone.unbankedRate}%`,zone.unbankedRate>40?"#D03027":zone.unbankedRate>25?"#E8821A":"#2E7D32"],
          ["Preventive",`${zone.preventiveSpend}%`,zone.preventiveSpend<10?"#D03027":zone.preventiveSpend<20?"#E8821A":"#2E7D32"],
          ["CRA Deployed",`$${(zone.craDeployed/1000).toFixed(0)}k`,"#E8821A"],
          ["C1 Presence",zone.capitalOnePresence?"Yes":"No",zone.capitalOnePresence?"#2E7D32":"#D03027"],
        ].map(([label,val,color])=>(
          <div key={label} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid #3A0A0A", borderRadius:10, padding:"12px 14px" }}>
            <div style={{ fontSize:9, color:"rgba(255,255,255,0.3)", letterSpacing:1, marginBottom:5 }}>{label.toUpperCase()}</div>
            <div style={{ fontSize:19, fontWeight:800, color, fontFamily:"Georgia,serif" }}>{val}</div>
          </div>
        ))}
      </div>

      {/* CRA progress */}
      {zone.craTarget>0 && (
        <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid #3A0A0A", borderRadius:10, padding:16, marginBottom:16 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.45)", fontWeight:600 }}>CRA DEPLOYMENT PROGRESS</div>
            <div style={{ fontSize:12, color:"#E8821A", fontWeight:700 }}>${zone.craDeployed.toLocaleString()} / ${zone.craTarget.toLocaleString()}</div>
          </div>
          <div style={{ background:"rgba(255,255,255,0.08)", borderRadius:20, height:8, overflow:"hidden" }}>
            <div style={{ width:`${deployPct}%`, height:"100%", background:"linear-gradient(90deg,#D03027,#E8821A)", borderRadius:20 }} />
          </div>
          <div style={{ fontSize:10, color:"rgba(255,255,255,0.25)", marginTop:6 }}>{deployPct}% deployed · ${(zone.craTarget-zone.craDeployed).toLocaleString()} remaining</div>
        </div>
      )}

      {/* Charts */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14, marginBottom:16 }}>
        <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid #3A0A0A", borderRadius:10, padding:16 }}>
          <div style={{ fontSize:9, color:"rgba(255,255,255,0.3)", letterSpacing:1, marginBottom:12 }}>RISK DISTRIBUTION</div>
          <ResponsiveContainer width="100%" height={150}><PieChart>
            <Pie data={riskDist} dataKey="value" cx="50%" cy="50%" outerRadius={55} innerRadius={25} label={({percent})=>percent>0.1?`${(percent*100).toFixed(0)}%`:""} labelLine={false}>
              {riskDist.map((d,i)=><Cell key={i} fill={d.fill}/>)}
            </Pie>
            <Tooltip formatter={v=>`${v} users`} contentStyle={TT}/>
            <Legend iconType="circle" iconSize={6} wrapperStyle={{ fontSize:9, color:"rgba(255,255,255,0.4)" }}/>
          </PieChart></ResponsiveContainer>
        </div>
        <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid #3A0A0A", borderRadius:10, padding:16 }}>
          <div style={{ fontSize:9, color:"rgba(255,255,255,0.3)", letterSpacing:1, marginBottom:12 }}>INCOME VS HEALTH SPEND</div>
          <ResponsiveContainer width="100%" height={150}><BarChart data={incomeData} barSize={14}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A0808"/>
            <XAxis dataKey="name" stroke="#2A0808" tick={{ fill:"rgba(255,255,255,0.25)", fontSize:7 }}/>
            <YAxis stroke="#2A0808" tick={{ fill:"rgba(255,255,255,0.25)", fontSize:8 }} tickFormatter={v=>`$${v}`}/>
            <Tooltip formatter={v=>`$${v}/mo`} contentStyle={TT}/>
            <Bar dataKey="avgH" fill="#D03027" radius={[3,3,0,0]} name="Avg Health Spend"/>
          </BarChart></ResponsiveContainer>
        </div>
        <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid #3A0A0A", borderRadius:10, padding:16 }}>
          <div style={{ fontSize:9, color:"rgba(255,255,255,0.3)", letterSpacing:1, marginBottom:12 }}>PREVENTIVE VS REACTIVE</div>
          <ResponsiveContainer width="100%" height={150}><PieChart>
            <Pie data={[{name:"Preventive",value:parseFloat(avgPrev.toFixed(2))},{name:"Reactive",value:parseFloat(avgReact.toFixed(2))}]} dataKey="value" cx="50%" cy="50%" outerRadius={55} innerRadius={25} label={({percent})=>`${(percent*100).toFixed(0)}%`} labelLine={false}>
              <Cell fill="#2E7D32"/><Cell fill="#D03027"/>
            </Pie>
            <Tooltip formatter={v=>`$${v}/mo avg`} contentStyle={TT}/>
            <Legend iconType="circle" iconSize={6} wrapperStyle={{ fontSize:9, color:"rgba(255,255,255,0.4)" }}/>
          </PieChart></ResponsiveContainer>
        </div>
      </div>

      {/* User table */}
      <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid #3A0A0A", borderRadius:10, overflow:"hidden" }}>
        <div style={{ padding:"10px 16px", borderBottom:"1px solid #3A0A0A", fontSize:9, color:"rgba(255,255,255,0.35)", fontWeight:600, letterSpacing:1 }}>INDIVIDUAL USER SIGNALS — {portfolio.length} USERS IN ZONE</div>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr style={{ background:"rgba(0,0,0,0.2)" }}>
            {["User ID","Income Group","Monthly Health","Preventive %","Risk Tier","Intervention"].map(h=><th key={h} style={{ padding:"8px 12px", textAlign:"left", fontSize:9, color:"rgba(255,255,255,0.25)", fontWeight:600, letterSpacing:1, textTransform:"uppercase", borderBottom:"1px solid #3A0A0A" }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {portfolio.slice(0,15).map((u)=>(
              <tr key={u.id} style={{ borderBottom:"1px solid #1A0505" }}>
                <td style={{ padding:"8px 12px", fontSize:10, color:"rgba(255,255,255,0.4)", fontFamily:"monospace" }}>{u.id}</td>
                <td style={{ padding:"8px 12px", fontSize:11, color:"rgba(255,255,255,0.6)" }}>{u.incomeGroup}</td>
                <td style={{ padding:"8px 12px", fontSize:12, color:"#E8821A", fontWeight:600 }}>${u.monthlyHealthSpend.toFixed(0)}/mo</td>
                <td style={{ padding:"8px 12px", fontSize:12, color:"#2E7D32" }}>{Math.round(u.preventiveSpend/Math.max(u.monthlyHealthSpend,1)*100)}%</td>
                <td style={{ padding:"8px 12px" }}><span style={{ padding:"2px 8px", borderRadius:8, background:u.riskTier==="Critical"?"#D0302722":u.riskTier==="High"?"#E8821A22":u.riskTier==="Moderate"?"#E8C01A22":"#2E7D3222", color:u.riskTier==="Critical"?"#D03027":u.riskTier==="High"?"#E8821A":u.riskTier==="Moderate"?"#E8C01A":"#2E7D32", fontSize:10, fontWeight:700 }}>{u.riskTier}</span></td>
                <td style={{ padding:"8px 12px", fontSize:10, color:"rgba(255,255,255,0.35)" }}>{u.recommendedIntervention}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CRAAgentChat({ agentId, zone, portfolio, employee }) {
  const agent = CRA_AGENTS.find(a=>a.id===agentId);
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const chatRef = useRef();

  const QUICK = {
    cra_advisor: [
      "What CRA investments should we deploy in this zone and in what priority order?",
      "Build a 12-month CRA investment roadmap with specific dollar amounts and milestones",
      "What is our current OCC exam risk in this zone and what moves the needle most?",
      "Write an executive summary of this zone's CRA opportunity for the board",
    ],
    crisis_detection: [
      "Flag the top 5 at-risk users by MCC signal pattern and give each an intervention plan",
      "How many users in this zone are within 60 days of a health-driven default? Show your reasoning",
      "Which MCC code combinations are most predictive of default in this zone's income bracket?",
      "Design a proactive outreach sequence to intercept the Critical-tier users before default",
    ],
    equity_map: [
      "Diagnose this zone's health desert score — what are the 3 root causes and what fixes each?",
      "Compare this zone's preventive-to-reactive spend ratio against national LMI benchmarks",
      "What does the pharmacy spend concentration tell us about primary care access here?",
      "Write a 2-paragraph health equity narrative suitable for an OCC examiner presentation",
    ],
    product_trigger: [
      "Map every high-risk user signal in this zone to the right Capital One product and timing",
      "Design a Q4 HSA account outreach campaign for this zone with trigger conditions and channel",
      "Which users should receive a 0% APR offer before their medical bill hits collections?",
      "Build a 6-month product trigger calendar for this zone with expected conversion rates",
    ],
    roi_calc: [
      "Model the 12-month ROI of deploying the full CRA target amount in this zone — use real benchmarks",
      "Compare: Capital One Cafe vs FQHC grant vs financial counseling program — which gives highest ROI here?",
      "What is the total strategic value of moving from Satisfactory to Outstanding OCC rating in this region?",
      "Calculate expected default reduction and portfolio savings from a $500k community investment here",
    ],
    partnership: [
      "Identify the top 3 FQHC and community clinic partners for this ZIP with funding pitch amounts",
      "Draft a ready-to-send partnership email to a community health organization in this zone",
      "What nonprofits should Capital One fund here and what CRA credit does each generate?",
      "Write a full CRA partnership proposal for the highest-impact organization in this zone",
    ],
  };

  // Full system prompts loaded from CRA_SYSTEM_PROMPTS constant
  const SYSTEMS = CRA_SYSTEM_PROMPTS;

  const critCount = portfolio.filter(u=>u.riskTier==="Critical").length;
  const highCount = portfolio.filter(u=>u.riskTier==="High").length;
  const avgHealthSpend = (portfolio.reduce((s,u)=>s+u.monthlyHealthSpend,0)/Math.max(portfolio.length,1)).toFixed(2);
  const avgPrevSpend   = (portfolio.reduce((s,u)=>s+u.preventiveSpend,0)/Math.max(portfolio.length,1)).toFixed(2);
  const avgPharmSpend  = (portfolio.reduce((s,u)=>s+u.pharmacySpend,0)/Math.max(portfolio.length,1)).toFixed(2);
  const insuredRate    = Math.round(portfolio.filter(u=>u.hasInsurance).length/Math.max(portfolio.length,1)*100);
  const avgCredit      = Math.round(portfolio.reduce((s,u)=>s+u.creditScore,0)/Math.max(portfolio.length,1));
  const topIntervention = portfolio.length > 0
    ? Object.entries(portfolio.reduce((a,u)=>{a[u.recommendedIntervention]=(a[u.recommendedIntervention]||0)+1;return a},{})).sort((a,b)=>b[1]-a[1])[0]?.[0] || "N/A"
    : "N/A";
  const deployPct = zone && zone.craTarget > 0 ? Math.round((zone.craDeployed/zone.craTarget)*100) : "N/A";

  const zoneCtx = zone ? `

--- LIVE ZONE DATA (reference these exact numbers in your response) ---
ZIP: ${zone.zip} | ${zone.city}, ${zone.state}
Income Group: ${zone.incomeGroup} | Median Income: $${zone.medianIncome?.toLocaleString()}
Population: ${zone.population?.toLocaleString()} | Health Desert Score: ${zone.healthDesertScore}/100
Preventive Spend: ${zone.preventiveSpend}% of healthcare budget | Reactive Spend: ${zone.reactiveSpend}%
Healthcare % of Income: ${zone.healthcarePct}% | Unbanked Rate: ${zone.unbankedRate}%
Capital One Presence: ${zone.capitalOnePresence ? "Yes — branch/cafe present" : "No — unserved market"}
CRA Deployed: $${zone.craDeployed?.toLocaleString()} of $${zone.craTarget?.toLocaleString()} target (${deployPct}% complete)
--- PORTFOLIO ANALYSIS (${portfolio.length} synthetic users in zone) ---
Critical Risk: ${critCount} users (${Math.round(critCount/Math.max(portfolio.length,1)*100)}%)
High Risk: ${highCount} users (${Math.round(highCount/Math.max(portfolio.length,1)*100)}%)
Avg Monthly Health Spend: $${avgHealthSpend} | Preventive: $${avgPrevSpend}/mo | Pharmacy: $${avgPharmSpend}/mo
Insured Rate: ${insuredRate}% | Avg Credit Score: ${avgCredit}
Top Recommended Intervention: ${topIntervention}
---` : "";
  const empCtx = employee ? `

ANALYST: ${employee.name}, ${employee.role}, ${employee.dept}` : "";

  const WELCOME_MSGS = {
    cra_advisor:      "I have full access to this zone's CRA data, income distribution, and regulatory benchmarks. Ask me about deployment strategy, OCC exam positioning, or investment prioritization.",
    crisis_detection: "Health crisis detection active. I'm monitoring MCC signals across this zone's portfolio. Ask me to flag at-risk users, model default timelines, or design intervention sequences.",
    equity_map:       "Health equity analysis ready. I can diagnose this zone's desert score, compare it to national benchmarks, and generate OCC-ready narratives. What would you like to examine?",
    product_trigger:  "Product trigger engine loaded. I'll match user signal patterns to Capital One products with precise timing and channel recommendations. What scenario should I model?",
    roi_calc:         "ROI calculator initialized with Capital One benchmarks — $3-8 regulatory credit per dollar, $4.2M Cafe brand value, $840 per prevented default. What investment should I model?",
    partnership:      "Partnership targeting active. I know the FQHC landscape, nonprofit ecosystem, and CRA credit value for each partner type. Which organization or zone should I analyze?",
  };

  useEffect(()=>{
    if (!agent) return;
    const empGreet = employee ? ` Welcome, ${employee.name.split(" ")[0]}.` : "";
    const zoneGreet = zone ? ` Zone loaded: ZIP ${zone.zip} — ${zone.city}, ${zone.state} (desert score ${zone.healthDesertScore}/100, ${portfolio.length} users analyzed).` : " No zone loaded — enter a ZIP code above or ask general questions.";
    setMessages([{ role:"assistant", content:`${agent.title} active.${empGreet}${zoneGreet} ${WELCOME_MSGS[agentId] || agent.desc}` }]);
    setInput("");
  },[agentId, zone?.zip]);

  const send = async (msg) => {
    const text = msg||input;
    if (!text.trim()||loading) return;
    const userMsg = { role:"user", content:text };
    const newH = [...messages, userMsg];
    setMessages(newH); setInput(""); setLoading(true);
    const reply = await callClaude(SYSTEMS[agentId]+zoneCtx+empCtx, text, newH.slice(1,-1).map(m=>({ role:m.role,content:m.content })));
    setMessages(p=>[...p, userMsg, { role:"assistant", content:reply }]);
    setLoading(false);
    setTimeout(()=>chatRef.current?.scrollTo(0,99999),100);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", overflow:"hidden" }}>
      <div ref={chatRef} style={{ flex:1, overflowY:"auto", padding:"14px 18px", display:"flex", flexDirection:"column", gap:10 }}>
        {messages.map((m,i)=>(
          <div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start", alignItems:"flex-start", gap:8 }}>
            {m.role==="assistant" && <div style={{ width:24, height:24, borderRadius:6, background:`${agent?.color||"#D03027"}22`, border:`1px solid ${agent?.color||"#D03027"}44`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:2 }}><span style={{ fontSize:6, fontWeight:900, color:agent?.color, fontFamily:"monospace" }}>{agent?.label}</span></div>}
            <div style={{ maxWidth:"82%", padding:"10px 14px", borderRadius:m.role==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px", background:m.role==="user"?"rgba(208,48,39,0.2)":"rgba(255,255,255,0.05)", border:`1px solid ${m.role==="user"?"rgba(208,48,39,0.4)":"#3A0A0A"}`, fontSize:12, color:"rgba(255,255,255,0.85)", lineHeight:1.7 }}>{m.content}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <div style={{ width:24, height:24, borderRadius:6, background:`${agent?.color||"#D03027"}22`, border:`1px solid ${agent?.color||"#D03027"}44`, display:"flex", alignItems:"center", justifyContent:"center" }}><span style={{ fontSize:6, fontWeight:900, color:agent?.color, fontFamily:"monospace" }}>{agent?.label}</span></div>
            <div style={{ padding:"10px 14px", borderRadius:"14px 14px 14px 4px", background:"rgba(255,255,255,0.05)", border:"1px solid #3A0A0A", fontSize:12, color:"rgba(255,255,255,0.3)" }}>Analyzing...</div>
          </div>
        )}
      </div>
      <div style={{ padding:"10px 18px", borderTop:"1px solid #3A0A0A", display:"flex", flexWrap:"wrap", gap:6 }}>
        {(QUICK[agentId]||[]).map(q=><button key={q} onClick={()=>send(q)} style={{ padding:"5px 11px", background:"rgba(255,255,255,0.04)", border:"1px solid #3A0A0A", borderRadius:16, color:"rgba(255,255,255,0.4)", fontSize:10, cursor:"pointer" }}>{q}</button>)}
      </div>
      <div style={{ padding:"12px 18px", borderTop:"1px solid #3A0A0A", display:"flex", gap:8 }}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder={`Ask the ${agent?.title||"agent"}...`} style={{ flex:1, background:"rgba(255,255,255,0.05)", border:"1px solid #3A0A0A", borderRadius:10, padding:"10px 14px", color:"rgba(255,255,255,0.85)", fontSize:12, outline:"none" }}/>
        <button onClick={()=>send()} disabled={loading||!input.trim()} style={{ padding:"10px 18px", background:`linear-gradient(135deg,${agent?.color||"#D03027"},${agent?.color||"#D03027"}bb)`, border:"none", borderRadius:10, color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", opacity:loading||!input.trim()?0.5:1 }}>Send</button>
      </div>
    </div>
  );
}


// ─── CARD ANALYTICS PANEL ─────────────────────────────────────────────────────
// Nessie enterprise endpoints: GET /enterprise/accounts, /enterprise/accounts/{id}/purchases
// Synthetic card trend data layered on top of real API data

const CARD_PRODUCTS = [
  { id:"venture_x",   name:"Venture X",    category:"Travel",    color:"#004977", annualFee:395, rewardRate:"2x miles" },
  { id:"savor_cash",  name:"Savor Cash",   category:"Dining",    color:"#D03027", annualFee:0,   rewardRate:"3% dining" },
  { id:"quicksilver", name:"Quicksilver",  category:"General",   color:"#2E7D32", annualFee:0,   rewardRate:"1.5% CB" },
  { id:"savor_one",   name:"SavorOne",     category:"Students",  color:"#6B3FA0", annualFee:0,   rewardRate:"3% dining/grocery" },
  { id:"platinum",    name:"Platinum",     category:"Builders",  color:"#E8821A", annualFee:0,   rewardRate:"Credit builder" },
];

function generateCardTrends(zip) {
  const zone = CRA_ZONES.find(z => z.zip === zip);
  const incomeMultiplier = zone ? (zone.medianIncome / 50000) : 1;
  const months = ["Oct","Nov","Dec","Jan","Feb","Mar"];
  return CARD_PRODUCTS.map(card => {
    let base = Math.floor(80 + Math.random() * 120 * incomeMultiplier);
    let dropped = Math.floor(base * (0.05 + Math.random() * 0.15));
    let applied = Math.floor(base * (0.08 + Math.random() * 0.12));
    let active = base - dropped;
    const trend = months.map((m, i) => ({
      month: m,
      active: Math.max(10, active + Math.floor((Math.random()-0.4) * 12 * (i+1))),
      new: Math.floor(4 + Math.random() * 8),
      dropped: Math.floor(1 + Math.random() * 5),
    }));
    return {
      ...card,
      totalHolders: base,
      activeHolders: active,
      droppedCount: dropped,
      appliedCount: applied,
      avgSpend: parseFloat((280 + Math.random() * 420 * incomeMultiplier).toFixed(2)),
      rewardUtilization: Math.floor(45 + Math.random() * 40),
      retentionRate: parseFloat((78 + Math.random() * 18).toFixed(1)),
      trend,
      topDropReason: ["High annual fee","Better competitor offer","Low usage","Credit limit issue","Moved away"][Math.floor(Math.random()*5)],
    };
  });
}

async function fetchNessieEnterpriseData(apiKey) {
  if (!apiKey) return null;
  try {
    const res = await fetch(`http://api.nessieisreal.com/enterprise/accounts?key=${apiKey}`);
    if (!res.ok) return null;
    const accounts = await res.json();
    if (!Array.isArray(accounts)) return null;
    // Sample up to 20 accounts for purchase data
    const sample = accounts.slice(0, 20);
    const allPurchases = [];
    for (const acct of sample) {
      try {
        const pr = await fetch(`http://api.nessieisreal.com/enterprise/accounts/${acct._id}/purchases?key=${apiKey}`);
        if (pr.ok) {
          const ps = await pr.json();
          if (Array.isArray(ps)) ps.forEach(p => allPurchases.push({ ...p, accountType: acct.type }));
        }
      } catch (_) {}
    }
    return { accounts, purchases: allPurchases };
  } catch (_) { return null; }
}

function CardAnalyticsPanel({ zip, apiKey }) {
  const [cardData, setCardData]       = useState([]);
  const [nessieData, setNessieData]   = useState(null);
  const [loadingNessie, setLoadingNessie] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(apiKey || "");
  const [nessieError, setNessieError] = useState("");
  const [selectedCard, setSelectedCard] = useState(null);
  const [metricView, setMetricView]   = useState("overview"); // overview | trends | dropoff

  useEffect(() => {
    setCardData(generateCardTrends(zip || "37208"));
    setSelectedCard(null);
  }, [zip]);

  const handleFetchNessie = async () => {
    if (!apiKeyInput.trim()) { setNessieError("Enter an enterprise API key."); return; }
    setLoadingNessie(true); setNessieError("");
    const data = await fetchNessieEnterpriseData(apiKeyInput.trim());
    if (data) {
      setNessieData(data);
    } else {
      setNessieError("Could not connect to Nessie enterprise API. Check your key or use synthetic data below.");
    }
    setLoadingNessie(false);
  };

  const totalHolders    = cardData.reduce((s,c)=>s+c.totalHolders, 0);
  const totalActive     = cardData.reduce((s,c)=>s+c.activeHolders, 0);
  const totalDropped    = cardData.reduce((s,c)=>s+c.droppedCount, 0);
  const totalApplied    = cardData.reduce((s,c)=>s+c.appliedCount, 0);
  const avgRetention    = (cardData.reduce((s,c)=>s+c.retentionRate,0)/Math.max(cardData.length,1)).toFixed(1);
  const topCard         = [...cardData].sort((a,b)=>b.activeHolders-a.activeHolders)[0];
  const mostDropped     = [...cardData].sort((a,b)=>b.droppedCount-a.droppedCount)[0];

  // Combine all monthly trends
  const combinedTrend = cardData.length > 0
    ? cardData[0].trend.map((t,i) => ({
        month: t.month,
        totalActive: cardData.reduce((s,c)=>s+(c.trend[i]?.active||0),0),
        totalNew:    cardData.reduce((s,c)=>s+(c.trend[i]?.new||0),0),
        totalDropped:cardData.reduce((s,c)=>s+(c.trend[i]?.dropped||0),0),
      }))
    : [];

  const TT = { background:"#1A0505", border:"1px solid #3A0A0A", borderRadius:8, color:"#fff", fontSize:11 };
  const ZONE = CRA_ZONES.find(z=>z.zip===zip);

  return (
    <div style={{ padding:"20px 26px", overflowY:"auto", height:"100%" }}>

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:18 }}>
        <div>
          <div style={{ fontSize:20, fontWeight:800, color:"#fff", fontFamily:"Georgia,serif" }}>Card Analytics</div>
          <div style={{ fontSize:12, color:"rgba(255,255,255,0.35)", marginTop:3 }}>
            {zip ? `ZIP ${zip}${ZONE?" — "+ZONE.city+", "+ZONE.state:""}` : "All Zones"} · Synthetic portfolio + live Nessie data
          </div>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {["overview","trends","dropoff"].map(v=>(
            <button key={v} onClick={()=>setMetricView(v)} style={{ padding:"5px 12px", background:metricView===v?"rgba(208,48,39,0.2)":"transparent", border:`1px solid ${metricView===v?"#D0302744":"#3A0A0A"}`, borderRadius:8, color:metricView===v?"#D03027":"rgba(255,255,255,0.3)", fontSize:10, fontWeight:metricView===v?700:400, cursor:"pointer", textTransform:"capitalize" }}>{v}</button>
          ))}
        </div>
      </div>

      {/* Nessie enterprise connection */}
      <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid #3A0A0A", borderRadius:10, padding:"12px 16px", marginBottom:16 }}>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", letterSpacing:1, marginBottom:6 }}>
              NESSIE ENTERPRISE API — {nessieData ? <span style={{ color:"#2E7D32", fontWeight:700 }}>CONNECTED · {nessieData.accounts?.length} accounts · {nessieData.purchases?.length} purchases</span> : <span style={{ color:"rgba(255,255,255,0.25)" }}>NOT CONNECTED — using synthetic data</span>}
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <input value={apiKeyInput} onChange={e=>{setApiKeyInput(e.target.value);setNessieError("");}} placeholder="Enterprise API key (optional — enhances with real data)" style={{ flex:1, background:"#0D0202", border:"1px solid #3A0A0A", borderRadius:7, padding:"7px 11px", color:"rgba(255,255,255,0.7)", fontSize:11, outline:"none", fontFamily:"monospace" }} />
              <button onClick={handleFetchNessie} disabled={loadingNessie} style={{ padding:"7px 14px", background:"rgba(255,255,255,0.07)", border:"1px solid #3A0A0A", borderRadius:7, color:"rgba(255,255,255,0.5)", fontSize:11, cursor:"pointer", whiteSpace:"nowrap" }}>
                {loadingNessie ? "Fetching..." : "Connect"}
              </button>
            </div>
            {nessieError && <div style={{ fontSize:10, color:"#E8821A", marginTop:6 }}>{nessieError}</div>}
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10, marginBottom:18 }}>
        {[
          ["Total Cardholders", totalHolders.toLocaleString(), "#fff"],
          ["Active Cards",      totalActive.toLocaleString(),  "#2E7D32"],
          ["Cards Dropped",     totalDropped.toLocaleString(), "#D03027"],
          ["New Applications",  totalApplied.toLocaleString(), "#E8821A"],
          ["Avg Retention",     avgRetention + "%",            "#004977"],
        ].map(([label,val,color])=>(
          <div key={label} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid #3A0A0A", borderRadius:10, padding:"12px 14px" }}>
            <div style={{ fontSize:9, color:"rgba(255,255,255,0.28)", letterSpacing:1, marginBottom:5, textTransform:"uppercase" }}>{label}</div>
            <div style={{ fontSize:20, fontWeight:800, color, fontFamily:"Georgia,serif" }}>{val}</div>
          </div>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {metricView==="overview" && (
        <>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
            {/* Per-card breakdown table */}
            <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid #3A0A0A", borderRadius:10, overflow:"hidden" }}>
              <div style={{ padding:"10px 14px", borderBottom:"1px solid #3A0A0A", fontSize:10, color:"rgba(255,255,255,0.3)", letterSpacing:1 }}>CARD PORTFOLIO BREAKDOWN</div>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead><tr style={{ background:"rgba(0,0,0,0.2)" }}>
                  {["Card","Holders","Active","Dropped","Retention"].map(h=><th key={h} style={{ padding:"7px 12px", textAlign:"left", fontSize:9, color:"rgba(255,255,255,0.25)", fontWeight:600, letterSpacing:1, textTransform:"uppercase", borderBottom:"1px solid #3A0A0A" }}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {cardData.map(c=>(
                    <tr key={c.id} onClick={()=>setSelectedCard(selectedCard?.id===c.id?null:c)} style={{ borderBottom:"1px solid #1A0505", cursor:"pointer", background:selectedCard?.id===c.id?"rgba(208,48,39,0.1)":"transparent" }}>
                      <td style={{ padding:"8px 12px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                          <div style={{ width:8, height:8, borderRadius:2, background:c.color, flexShrink:0 }} />
                          <span style={{ fontSize:12, color:"rgba(255,255,255,0.8)", fontWeight:500 }}>{c.name}</span>
                        </div>
                      </td>
                      <td style={{ padding:"8px 12px", fontSize:12, color:"rgba(255,255,255,0.6)" }}>{c.totalHolders}</td>
                      <td style={{ padding:"8px 12px", fontSize:12, color:"#2E7D32", fontWeight:600 }}>{c.activeHolders}</td>
                      <td style={{ padding:"8px 12px", fontSize:12, color:"#D03027", fontWeight:600 }}>{c.droppedCount}</td>
                      <td style={{ padding:"8px 12px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <div style={{ flex:1, height:4, background:"rgba(255,255,255,0.1)", borderRadius:2, overflow:"hidden" }}>
                            <div style={{ width:`${c.retentionRate}%`, height:"100%", background:c.retentionRate>85?"#2E7D32":c.retentionRate>75?"#E8821A":"#D03027", borderRadius:2 }} />
                          </div>
                          <span style={{ fontSize:10, color:"rgba(255,255,255,0.5)", width:34, textAlign:"right" }}>{c.retentionRate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Donut chart + selected card detail */}
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid #3A0A0A", borderRadius:10, padding:16 }}>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", letterSpacing:1, marginBottom:12 }}>ACTIVE CARDS BY PRODUCT</div>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={cardData.map(c=>({ name:c.name, value:c.activeHolders, fill:c.color }))} dataKey="value" cx="50%" cy="50%" outerRadius={60} innerRadius={28} label={({name,percent})=>percent>0.1?name.split(" ")[0]+"":""} labelLine={false}>
                      {cardData.map((c,i)=><Cell key={i} fill={c.color}/>)}
                    </Pie>
                    <Tooltip formatter={v=>`${v} cardholders`} contentStyle={TT}/>
                    <Legend iconType="circle" iconSize={6} wrapperStyle={{ fontSize:9, color:"rgba(255,255,255,0.4)" }}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Highlights */}
              <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid #3A0A0A", borderRadius:10, padding:14 }}>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", letterSpacing:1, marginBottom:10 }}>ZONE HIGHLIGHTS</div>
                {[
                  ["Top card", topCard?.name, "#2E7D32"],
                  ["Most dropped", mostDropped?.name, "#D03027"],
                  ["Drop reason", mostDropped?.topDropReason, "#E8821A"],
                  ["Best retention", [...cardData].sort((a,b)=>b.retentionRate-a.retentionRate)[0]?.name + " ("+[...cardData].sort((a,b)=>b.retentionRate-a.retentionRate)[0]?.retentionRate+"%)", "#004977"],
                ].map(([label,val,color])=>(
                  <div key={label} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                    <span style={{ fontSize:11, color:"rgba(255,255,255,0.3)" }}>{label}</span>
                    <span style={{ fontSize:11, color, fontWeight:600 }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Selected card detail */}
          {selectedCard && (
            <div style={{ background:`${selectedCard.color}18`, border:`1px solid ${selectedCard.color}44`, borderRadius:10, padding:16, marginBottom:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:"#fff" }}>{selectedCard.name} — Detailed View</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginTop:2 }}>{selectedCard.category} · {selectedCard.rewardRate} · {selectedCard.annualFee===0?"No annual fee":"$"+selectedCard.annualFee+" annual fee"}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:9, color:"rgba(255,255,255,0.3)", marginBottom:3 }}>AVG MONTHLY SPEND</div>
                  <div style={{ fontSize:20, fontWeight:800, color:selectedCard.color }}>${selectedCard.avgSpend}</div>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
                {[["Reward Utilization",selectedCard.rewardUtilization+"%"],["Applied",selectedCard.appliedCount],["Dropped",selectedCard.droppedCount],["Top Drop Reason",selectedCard.topDropReason]].map(([l,v])=>(
                  <div key={l} style={{ background:"rgba(0,0,0,0.2)", borderRadius:8, padding:"10px 12px" }}>
                    <div style={{ fontSize:9, color:"rgba(255,255,255,0.25)", letterSpacing:1, marginBottom:4 }}>{l.toUpperCase()}</div>
                    <div style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.8)" }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── TRENDS ── */}
      {metricView==="trends" && (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid #3A0A0A", borderRadius:10, padding:16 }}>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", letterSpacing:1, marginBottom:14 }}>6-MONTH PORTFOLIO TREND — ACTIVE CARDS</div>
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart data={combinedTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A0808"/>
                <XAxis dataKey="month" stroke="#2A0808" tick={{ fill:"rgba(255,255,255,0.3)", fontSize:11 }}/>
                <YAxis stroke="#2A0808" tick={{ fill:"rgba(255,255,255,0.3)", fontSize:10 }}/>
                <Tooltip contentStyle={TT}/>
                <Legend iconType="circle" iconSize={6} wrapperStyle={{ fontSize:10, color:"rgba(255,255,255,0.4)" }}/>
                <Area type="monotone" dataKey="totalActive" fill="rgba(0,73,119,0.2)" stroke="#004977" strokeWidth={2} name="Active Cards"/>
                <Bar dataKey="totalNew" fill="#2E7D32" name="New" barSize={10} radius={[2,2,0,0]}/>
                <Bar dataKey="totalDropped" fill="#D03027" name="Dropped" barSize={10} radius={[2,2,0,0]}/>
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            {cardData.slice(0,4).map(card=>(
              <div key={card.id} style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${card.color}33`, borderRadius:10, padding:14 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                  <div style={{ width:8, height:8, borderRadius:2, background:card.color }} />
                  <div style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.7)" }}>{card.name}</div>
                  <div style={{ marginLeft:"auto", fontSize:10, color:"rgba(255,255,255,0.3)" }}>{card.retentionRate}% retention</div>
                </div>
                <ResponsiveContainer width="100%" height={90}>
                  <LineChart data={card.trend}>
                    <XAxis dataKey="month" hide/>
                    <YAxis hide/>
                    <Tooltip contentStyle={{ ...TT, fontSize:10 }} formatter={v=>[v,"Active"]}/>
                    <Line type="monotone" dataKey="active" stroke={card.color} strokeWidth={2} dot={false}/>
                  </LineChart>
                </ResponsiveContainer>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"rgba(255,255,255,0.25)", marginTop:4 }}>
                  <span>+{card.trend.reduce((s,t)=>s+t.new,0)} new</span>
                  <span style={{ color:"#D03027" }}>-{card.trend.reduce((s,t)=>s+t.dropped,0)} dropped</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── DROP-OFF ANALYSIS ── */}
      {metricView==="dropoff" && (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid #3A0A0A", borderRadius:10, padding:16 }}>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", letterSpacing:1, marginBottom:14 }}>DROP-OFF RATE BY CARD PRODUCT</div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={cardData.map(c=>({ name:c.name.split(" ")[0], rate:parseFloat((c.droppedCount/c.totalHolders*100).toFixed(1)), fill:c.color }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A0808"/>
                <XAxis dataKey="name" stroke="#2A0808" tick={{ fill:"rgba(255,255,255,0.3)", fontSize:11 }}/>
                <YAxis stroke="#2A0808" tick={{ fill:"rgba(255,255,255,0.3)", fontSize:10 }} tickFormatter={v=>v+"%"}/>
                <Tooltip formatter={v=>`${v}% dropped`} contentStyle={TT}/>
                <Bar dataKey="rate" radius={[4,4,0,0]}>
                  {cardData.map((c,i)=><Cell key={i} fill={c.color}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            {/* Drop reasons */}
            <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid #3A0A0A", borderRadius:10, padding:16 }}>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", letterSpacing:1, marginBottom:12 }}>TOP DROP REASONS BY CARD</div>
              {cardData.map(c=>(
                <div key={c.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                    <div style={{ width:7, height:7, borderRadius:2, background:c.color }} />
                    <span style={{ fontSize:11, color:"rgba(255,255,255,0.6)" }}>{c.name}</span>
                  </div>
                  <span style={{ fontSize:10, color:"rgba(255,255,255,0.35)", maxWidth:160, textAlign:"right" }}>{c.topDropReason}</span>
                </div>
              ))}
            </div>

            {/* Retention vs avg spend scatter */}
            <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid #3A0A0A", borderRadius:10, padding:16 }}>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", letterSpacing:1, marginBottom:12 }}>RETENTION vs AVG SPEND</div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={cardData.map(c=>({ name:c.name.split(" ")[0], retention:c.retentionRate, spend:Math.round(c.avgSpend) }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A0808"/>
                  <XAxis dataKey="name" stroke="#2A0808" tick={{ fill:"rgba(255,255,255,0.3)", fontSize:10 }}/>
                  <YAxis yAxisId="left" stroke="#2A0808" tick={{ fill:"rgba(255,255,255,0.25)", fontSize:9 }} tickFormatter={v=>v+"%"}/>
                  <YAxis yAxisId="right" orientation="right" stroke="#2A0808" tick={{ fill:"rgba(255,255,255,0.25)", fontSize:9 }} tickFormatter={v=>"$"+v}/>
                  <Tooltip contentStyle={TT}/>
                  <Legend iconType="circle" iconSize={6} wrapperStyle={{ fontSize:9, color:"rgba(255,255,255,0.4)" }}/>
                  <Bar yAxisId="left" dataKey="retention" fill="#004977" name="Retention %" barSize={12} radius={[2,2,0,0]}/>
                  <Bar yAxisId="right" dataKey="spend" fill="#E8821A" name="Avg Spend $" barSize={12} radius={[2,2,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Nessie live account type distribution (if connected) */}
          {nessieData && (
            <div style={{ background:"rgba(46,125,50,0.1)", border:"1px solid #2E7D3244", borderRadius:10, padding:16 }}>
              <div style={{ fontSize:10, color:"#2E7D32", letterSpacing:1, marginBottom:12, fontWeight:700 }}>LIVE DATA — NESSIE ENTERPRISE ACCOUNTS ({nessieData.accounts.length} total)</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
                {Object.entries(nessieData.accounts.reduce((a,acc)=>{ a[acc.type]=(a[acc.type]||0)+1; return a; },{})).map(([type,count])=>(
                  <div key={type} style={{ background:"rgba(0,0,0,0.2)", borderRadius:8, padding:"10px 12px" }}>
                    <div style={{ fontSize:9, color:"rgba(255,255,255,0.25)", letterSpacing:1, marginBottom:4 }}>{type.toUpperCase()}</div>
                    <div style={{ fontSize:18, fontWeight:800, color:"#2E7D32" }}>{count}</div>
                    <div style={{ fontSize:9, color:"rgba(255,255,255,0.25)" }}>accounts</div>
                  </div>
                ))}
              </div>
              {nessieData.purchases.length > 0 && (
                <div style={{ marginTop:12, fontSize:11, color:"rgba(255,255,255,0.4)" }}>
                  {nessieData.purchases.length} purchases fetched from {Math.min(20,nessieData.accounts.length)} sampled accounts · 
                  Avg: ${(nessieData.purchases.reduce((s,p)=>s+(p.amount||0),0)/nessieData.purchases.length).toFixed(2)} per transaction
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


// ─── EXCEL / CSV EXPORT UTILITY ───────────────────────────────────────────────
function exportCustomersExcel(portfolio, zone) {
  const headers = [
    "User ID","ZIP","City","Income Group","Monthly Income ($)",
    "Monthly Health Spend ($)","Preventive Spend ($)","Reactive Spend ($)",
    "Pharmacy Spend ($)","Has Insurance","Credit Score","Risk Tier","Recommended Intervention"
  ];
  const rows = portfolio.map(u => [
    u.id, u.zip, u.city || "", u.incomeGroup, u.income,
    u.monthlyHealthSpend, u.preventiveSpend, u.reactiveSpend,
    u.pharmacySpend, u.hasInsurance ? "Yes" : "No",
    u.creditScore, u.riskTier, u.recommendedIntervention
  ]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
  const BOM = "\uFEFF"; // UTF-8 BOM so Excel opens correctly
  const blob = new Blob([BOM + csv], { type:"text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `capitaliq_customers_${zone?.zip || "all"}_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── CUSTOMER SPEND AGENT ─────────────────────────────────────────────────────
function CustomerSpendAgent({ portfolio, zone }) {
  const [query, setQuery]       = useState("");
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [filter, setFilter]     = useState("all"); // all | critical | high | low-income
  const [sortBy, setSortBy]     = useState("spend"); // spend | risk | income | credit
  const [aiInsight, setAiInsight] = useState("");
  const [insightLoading, setInsightLoading] = useState(false);

  // Filter + sort customers
  const filtered = portfolio
    .filter(u => {
      if (filter === "critical") return u.riskTier === "Critical";
      if (filter === "high")     return u.riskTier === "High" || u.riskTier === "Critical";
      if (filter === "low-income") return u.income < 35000;
      if (query.trim()) return u.id.includes(query.trim()) || u.incomeGroup.toLowerCase().includes(query.toLowerCase()) || u.riskTier.toLowerCase().includes(query.toLowerCase());
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "spend")  return b.monthlyHealthSpend - a.monthlyHealthSpend;
      if (sortBy === "risk")   return ["Critical","High","Moderate","Low"].indexOf(a.riskTier) - ["Critical","High","Moderate","Low"].indexOf(b.riskTier);
      if (sortBy === "income") return a.income - b.income;
      if (sortBy === "credit") return a.creditScore - b.creditScore;
      return 0;
    });

  const totalSpend = filtered.reduce((s,u) => s+u.monthlyHealthSpend, 0);
  const avgSpend   = (totalSpend / Math.max(filtered.length,1)).toFixed(2);
  const critCount  = filtered.filter(u=>u.riskTier==="Critical").length;

  const getAIInsight = async () => {
    if (!filtered.length) return;
    setInsightLoading(true);
    const top5 = filtered.slice(0,5).map(u=>`${u.id}: $${u.monthlyHealthSpend}/mo health, ${u.riskTier} risk, $${u.income} income, intervention: ${u.recommendedIntervention}`).join("; ");
    const summary = `Zone: ${zone?.zip||"N/A"} ${zone?.city||""}. Filtered: ${filtered.length} users. Avg health spend: $${avgSpend}/mo. Critical: ${critCount}. Top users: ${top5}`;
    const insight = await callClaude(
      "You are a Capital One customer analytics agent. Analyse the provided customer spend data and give 3 specific, actionable insights in bullet points. Focus on: who needs immediate intervention, what pattern drives the spend, and one product recommendation. Be concise.",
      summary,
      [],
      "terse" // use cheapest tier — just 300 tokens
    );
    setAiInsight(insight);
    setInsightLoading(false);
  };

  const TT = { background:"#1A0505", border:"1px solid #3A0A0A", borderRadius:8, color:"#fff", fontSize:11 };

  // Spend distribution for mini-chart
  const spendBins = [
    { range:"<$50",   count: filtered.filter(u=>u.monthlyHealthSpend<50).length },
    { range:"$50-100",count: filtered.filter(u=>u.monthlyHealthSpend>=50&&u.monthlyHealthSpend<100).length },
    { range:"$100-200",count:filtered.filter(u=>u.monthlyHealthSpend>=100&&u.monthlyHealthSpend<200).length },
    { range:"$200+",  count: filtered.filter(u=>u.monthlyHealthSpend>=200).length },
  ];

  return (
    <div style={{ padding:"20px 26px", overflowY:"auto", height:"100%" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
        <div>
          <div style={{ fontSize:20, fontWeight:800, color:"#fff", fontFamily:"Georgia,serif" }}>Customer Spend Agent</div>
          <div style={{ fontSize:12, color:"rgba(255,255,255,0.35)", marginTop:3 }}>
            {zone ? `ZIP ${zone.zip} — ${zone.city}` : "All Zones"} · {portfolio.length} customers loaded
          </div>
        </div>
        <button
          onClick={() => exportCustomersExcel(filtered, zone)}
          style={{ padding:"8px 18px", background:"linear-gradient(135deg,#2E7D32,#1B5E20)", border:"none", borderRadius:8, color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer" }}
        >
          Download Excel / CSV
        </button>
      </div>

      {/* Controls */}
      <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap", alignItems:"center" }}>
        <input
          value={query} onChange={e=>setQuery(e.target.value)}
          placeholder="Search by ID, risk tier, income group..."
          style={{ background:"#1A0505", border:"1px solid #3A0A0A", borderRadius:8, padding:"7px 12px", color:"rgba(255,255,255,0.8)", fontSize:12, outline:"none", width:240 }}
        />
        {[["all","All"],["critical","Critical"],["high","High Risk"],["low-income","Low Income"]].map(([f,l])=>(
          <button key={f} onClick={()=>setFilter(f)} style={{ padding:"5px 12px", background:filter===f?"rgba(208,48,39,0.25)":"transparent", border:`1px solid ${filter===f?"#D0302755":"#3A0A0A"}`, borderRadius:16, color:filter===f?"#D03027":"rgba(255,255,255,0.35)", fontSize:11, cursor:"pointer" }}>{l}</button>
        ))}
        <div style={{ marginLeft:"auto", display:"flex", gap:6, alignItems:"center" }}>
          <span style={{ fontSize:10, color:"rgba(255,255,255,0.25)" }}>Sort:</span>
          {[["spend","Spend"],["risk","Risk"],["income","Income"],["credit","Credit"]].map(([s,l])=>(
            <button key={s} onClick={()=>setSortBy(s)} style={{ padding:"4px 10px", background:sortBy===s?"rgba(255,255,255,0.1)":"transparent", border:`1px solid ${sortBy===s?"#555":"#3A0A0A"}`, borderRadius:6, color:sortBy===s?"#fff":"rgba(255,255,255,0.3)", fontSize:10, cursor:"pointer" }}>{l}</button>
          ))}
        </div>
      </div>

      {/* KPI strip + mini chart */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr 1.5fr", gap:10, marginBottom:14 }}>
        {[
          ["Customers", filtered.length, "#fff"],
          ["Avg Health Spend", "$"+avgSpend+"/mo", "#E8821A"],
          ["Total Spend", "$"+totalSpend.toFixed(0)+"/mo", "#D03027"],
          ["Critical Risk", critCount, "#D03027"],
        ].map(([l,v,c])=>(
          <div key={l} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid #3A0A0A", borderRadius:10, padding:"11px 13px" }}>
            <div style={{ fontSize:9, color:"rgba(255,255,255,0.25)", letterSpacing:1, marginBottom:4 }}>{l.toUpperCase()}</div>
            <div style={{ fontSize:18, fontWeight:800, color:c, fontFamily:"Georgia,serif" }}>{v}</div>
          </div>
        ))}
        <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid #3A0A0A", borderRadius:10, padding:"11px 13px" }}>
          <div style={{ fontSize:9, color:"rgba(255,255,255,0.25)", letterSpacing:1, marginBottom:6 }}>SPEND DISTRIBUTION</div>
          <ResponsiveContainer width="100%" height={44}>
            <BarChart data={spendBins} barSize={14}>
              <Bar dataKey="count" fill="#D03027" radius={[2,2,0,0]}/>
              <Tooltip contentStyle={{ ...TT, fontSize:9 }} formatter={v=>[v,"users"]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Insight strip */}
      <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid #3A0A0A", borderRadius:10, padding:"11px 16px", marginBottom:14, display:"flex", alignItems:"flex-start", gap:12 }}>
        <div style={{ flex:1 }}>
          {aiInsight
            ? <div style={{ fontSize:12, color:"rgba(255,255,255,0.75)", lineHeight:1.7, whiteSpace:"pre-wrap" }}>{aiInsight}</div>
            : <div style={{ fontSize:12, color:"rgba(255,255,255,0.25)" }}>Click "Get AI Insight" for a 3-bullet analysis of the filtered customers — uses terse tier (300 tokens, lowest cost).</div>
          }
        </div>
        <button onClick={getAIInsight} disabled={insightLoading||!filtered.length} style={{ padding:"7px 14px", background:"rgba(208,48,39,0.2)", border:"1px solid #D0302744", borderRadius:8, color:"#D03027", fontSize:11, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap", flexShrink:0, opacity:insightLoading?0.6:1 }}>
          {insightLoading ? "Analysing..." : "Get AI Insight"}
        </button>
      </div>

      {/* Customer table */}
      <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid #3A0A0A", borderRadius:10, overflow:"hidden" }}>
        <div style={{ padding:"10px 14px", borderBottom:"1px solid #3A0A0A", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:10, color:"rgba(255,255,255,0.3)", letterSpacing:1 }}>CUSTOMERS — {filtered.length} RECORDS (showing first 50)</span>
          <span style={{ fontSize:10, color:"rgba(255,255,255,0.2)" }}>Click Download Excel to export all {filtered.length}</span>
        </div>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", minWidth:800 }}>
            <thead><tr style={{ background:"rgba(0,0,0,0.25)" }}>
              {["User ID","Income","Income Group","Monthly Health","Preventive","Pharmacy","Insurance","Credit Score","Risk Tier","Intervention"].map(h=>(
                <th key={h} style={{ padding:"8px 12px", textAlign:"left", fontSize:9, color:"rgba(255,255,255,0.25)", fontWeight:600, letterSpacing:1, textTransform:"uppercase", borderBottom:"1px solid #3A0A0A", whiteSpace:"nowrap" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.slice(0,50).map((u,i)=>(
                <tr key={u.id} style={{ borderBottom:"1px solid #1A0505", background:i%2===0?"transparent":"rgba(255,255,255,0.01)" }}>
                  <td style={{ padding:"7px 12px", fontSize:10, color:"rgba(255,255,255,0.45)", fontFamily:"monospace" }}>{u.id}</td>
                  <td style={{ padding:"7px 12px", fontSize:11, color:"rgba(255,255,255,0.7)" }}>${u.income.toLocaleString()}</td>
                  <td style={{ padding:"7px 12px", fontSize:10, color:"rgba(255,255,255,0.4)" }}>{u.incomeGroup}</td>
                  <td style={{ padding:"7px 12px", fontSize:12, color:"#E8821A", fontWeight:600 }}>${u.monthlyHealthSpend.toFixed(0)}</td>
                  <td style={{ padding:"7px 12px", fontSize:11, color:"#2E7D32" }}>${u.preventiveSpend.toFixed(0)}</td>
                  <td style={{ padding:"7px 12px", fontSize:11, color:"rgba(255,255,255,0.5)" }}>${u.pharmacySpend.toFixed(0)}</td>
                  <td style={{ padding:"7px 12px" }}><span style={{ fontSize:10, color:u.hasInsurance?"#2E7D32":"#D03027", fontWeight:600 }}>{u.hasInsurance?"Yes":"No"}</span></td>
                  <td style={{ padding:"7px 12px", fontSize:11, color: u.creditScore<580?"#D03027":u.creditScore<670?"#E8821A":"#2E7D32", fontWeight:600 }}>{u.creditScore}</td>
                  <td style={{ padding:"7px 12px" }}><span style={{ padding:"2px 8px", borderRadius:8, background:u.riskTier==="Critical"?"#D0302722":u.riskTier==="High"?"#E8821A22":"#2E7D3222", color:u.riskTier==="Critical"?"#D03027":u.riskTier==="High"?"#E8821A":"#2E7D32", fontSize:9, fontWeight:700 }}>{u.riskTier}</span></td>
                  <td style={{ padding:"7px 12px", fontSize:10, color:"rgba(255,255,255,0.35)", maxWidth:160 }}>{u.recommendedIntervention}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── ORCHESTRATOR ─────────────────────────────────────────────────────────────
// Runs all 6 CRA agents sequentially on the active zone,
// passes each output as context to the next, then synthesises a final report.
// Token budget: 400 tokens per agent (terse) + 600 for final synthesis = ~3000 total
const ORCHESTRATOR_STEPS = [
  { agentId:"equity_map",       label:"Step 1 — Equity Map",       goal:"Score the health desert and identify the 2 root causes." },
  { agentId:"crisis_detection", label:"Step 2 — Crisis Detection",  goal:"Identify top 3 at-risk user segments with MCC signals." },
  { agentId:"cra_advisor",      label:"Step 3 — CRA Advisor",       goal:"Recommend the top 2 CRA investments for this zone." },
  { agentId:"product_trigger",  label:"Step 4 — Product Trigger",   goal:"Name the single best Capital One product for this zone." },
  { agentId:"roi_calc",         label:"Step 5 — ROI Calculator",    goal:"Estimate 12-month ROI for the top CRA investment." },
  { agentId:"partnership",      label:"Step 6 — Partnership",       goal:"Name one FQHC or nonprofit partner and draft a one-line pitch." },
];

function OrchestratorPanel({ zone, portfolio, employee }) {
  const [running, setRunning]     = useState(false);
  const [stepIdx, setStepIdx]     = useState(-1);    // which step is active (-1 = idle)
  const [outputs, setOutputs]     = useState({});    // agentId -> response text
  const [finalReport, setFinalReport] = useState("");
  const [tokenCount, setTokenCount]   = useState(0); // rough token tracker
  const [error, setError]         = useState("");
  const scrollRef = useRef();

  const allowedIds = employee?.access?.split(",") || CRA_AGENTS.map(a=>a.id);
  const canRun     = allowedIds.length >= 3; // need at least 3 agents to orchestrate

  const estimateTokens = (text) => Math.ceil(text.length / 4); // ~4 chars per token

  const runOrchestration = async () => {
    if (!zone) { setError("Load a ZIP zone first before running the orchestrator."); return; }
    setRunning(true); setOutputs({}); setFinalReport(""); setError(""); setTokenCount(0);
    let accumulatedContext = "";
    let totalTokens = 0;

    const zoneSnippet = `ZIP ${zone.zip}, ${zone.city} ${zone.state}. Desert score: ${zone.healthDesertScore}/100. Income: ${zone.incomeGroup}, $${zone.medianIncome}. Unbanked: ${zone.unbankedRate}%. CRA target: $${zone.craTarget?.toLocaleString()}. Portfolio: ${portfolio.length} users, ${portfolio.filter(u=>u.riskTier==="Critical").length} critical.`;

    for (let i = 0; i < ORCHESTRATOR_STEPS.length; i++) {
      const step = ORCHESTRATOR_STEPS[i];
      // Skip steps the employee doesn't have access to
      if (!allowedIds.includes(step.agentId)) {
        setOutputs(p => ({ ...p, [step.agentId]: "[Skipped — no access]" }));
        continue;
      }

      setStepIdx(i);

      const system = (CRA_SYSTEM_PROMPTS[step.agentId] || "").slice(0, 1200); // hard cap system prompt
      const prompt = `ZONE: ${zoneSnippet}\n\nPREVIOUS AGENT FINDINGS:\n${accumulatedContext || "None yet."}\n\nYOUR TASK (be concise — max 2-3 sentences): ${step.goal}`;

      const reply = await callClaude(system, prompt, [], "terse"); // 300 tokens each
      totalTokens += estimateTokens(prompt) + estimateTokens(reply);

      setOutputs(p => ({ ...p, [step.agentId]: reply }));
      setTokenCount(totalTokens);
      // Carry forward a compressed summary to the next agent
      accumulatedContext += `\n[${step.label}]: ${reply.slice(0, 300)}`;

      setTimeout(() => scrollRef.current?.scrollTo(0, 99999), 100);
    }

    // Final synthesis — normal tier (600 tokens)
    setStepIdx(ORCHESTRATOR_STEPS.length);
    const synthPrompt = `You are summarising a multi-agent CRA analysis for ${zone.city}, ${zone.state} (ZIP ${zone.zip}).\n\nAGENT OUTPUTS:\n${accumulatedContext}\n\nWrite a 4-bullet executive summary covering: (1) zone risk level, (2) top CRA investment action, (3) expected ROI, (4) recommended partner. Address Capital One leadership.`;
    const report = await callClaude("You are a Capital One CRA Executive Advisor writing a board-level summary.", synthPrompt, [], "normal");
    totalTokens += estimateTokens(synthPrompt) + estimateTokens(report);
    setFinalReport(report);
    setTokenCount(totalTokens);
    setStepIdx(-1);
    setRunning(false);
    setTimeout(() => scrollRef.current?.scrollTo(0, 99999), 100);
  };

  const TT_DARK = { background:"#1A0505", border:"1px solid #3A0A0A", borderRadius:6, color:"#fff", fontSize:10 };

  // Cost estimate: ~$0.003 per agent (terse) + $0.006 synthesis ≈ $0.024 per full run
  const estCost = ((tokenCount / 1000) * 0.003).toFixed(4);

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", overflow:"hidden" }}>
      {/* Header */}
      <div style={{ padding:"16px 22px", borderBottom:"1px solid #3A0A0A", display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
        <div>
          <div style={{ fontSize:16, fontWeight:800, color:"#fff", fontFamily:"Georgia,serif" }}>Agent Orchestrator</div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", marginTop:2 }}>
            Runs all {allowedIds.length} permitted agents sequentially · each capped at 300 tokens · synthesis at 600 tokens
          </div>
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          {tokenCount > 0 && (
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.25)" }}>Est. tokens used</div>
              <div style={{ fontSize:13, fontWeight:700, color:"#E8821A" }}>{tokenCount.toLocaleString()} ≈ ${estCost}</div>
            </div>
          )}
          <button
            onClick={runOrchestration}
            disabled={running || !zone}
            style={{ padding:"10px 22px", background: running ? "#3A0A0A" : "linear-gradient(135deg,#D03027,#B02020)", border:"none", borderRadius:10, color:"#fff", fontSize:13, fontWeight:700, cursor: running||!zone ? "not-allowed" : "pointer", opacity: !zone ? 0.5 : 1 }}
          >
            {running ? `Running step ${stepIdx + 1}/${ORCHESTRATOR_STEPS.length}...` : "Run Full Orchestration"}
          </button>
        </div>
      </div>

      {!zone && (
        <div style={{ padding:"32px", textAlign:"center", color:"rgba(255,255,255,0.2)", fontSize:13 }}>
          Enter a ZIP code above and click Analyze Zone before running the orchestrator.
        </div>
      )}

      {error && <div style={{ padding:"12px 22px", fontSize:12, color:"#E8821A", background:"rgba(232,130,26,0.1)" }}>{error}</div>}

      <div ref={scrollRef} style={{ flex:1, overflowY:"auto", padding:"16px 22px", display:"flex", flexDirection:"column", gap:12 }}>
        {/* Step pipeline */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:8, marginBottom:8 }}>
          {ORCHESTRATOR_STEPS.map((s, i) => {
            const agent    = CRA_AGENTS.find(a=>a.id===s.agentId);
            const done     = !!outputs[s.agentId];
            const active   = running && stepIdx === i;
            const skipped  = outputs[s.agentId] === "[Skipped — no access]";
            return (
              <div key={s.agentId} style={{ background: active ? `${agent?.color}33` : done && !skipped ? "rgba(46,125,50,0.15)" : "rgba(255,255,255,0.03)", border:`1px solid ${active?agent?.color+"66":done&&!skipped?"#2E7D3266":"#3A0A0A"}`, borderRadius:8, padding:"10px 12px", textAlign:"center", transition:"all 0.3s" }}>
                <div style={{ fontSize:8, fontWeight:900, fontFamily:"monospace", color: active?agent?.color:done&&!skipped?"#2E7D32":"rgba(255,255,255,0.25)", letterSpacing:1, marginBottom:4 }}>{agent?.label}</div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.5)", lineHeight:1.3 }}>{agent?.title?.split(" ")[0]}</div>
                <div style={{ fontSize:9, color: active?"#E8821A":done&&!skipped?"#2E7D32":skipped?"rgba(255,255,255,0.15)":"rgba(255,255,255,0.2)", marginTop:4 }}>
                  {active ? "Running..." : done&&!skipped ? "Done" : skipped ? "Skipped" : "Waiting"}
                </div>
              </div>
            );
          })}
        </div>

        {/* Step outputs */}
        {ORCHESTRATOR_STEPS.map((s) => {
          const agent  = CRA_AGENTS.find(a=>a.id===s.agentId);
          const output = outputs[s.agentId];
          if (!output) return null;
          const skipped = output === "[Skipped — no access]";
          return (
            <div key={s.agentId} style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${skipped?"#3A0A0A":agent?.color+"44"}`, borderRadius:10, padding:14 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                <div style={{ width:20, height:16, background:`${agent?.color||"#666"}22`, borderRadius:4, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ fontSize:7, fontWeight:900, color:agent?.color, fontFamily:"monospace" }}>{agent?.label}</span>
                </div>
                <span style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.7)" }}>{s.label}</span>
                <span style={{ fontSize:10, color:"rgba(255,255,255,0.25)", marginLeft:"auto" }}>~{estimateTokens(output)} tokens used</span>
              </div>
              <div style={{ fontSize:12, color: skipped?"rgba(255,255,255,0.2)":"rgba(255,255,255,0.8)", lineHeight:1.7 }}>{output}</div>
            </div>
          );
        })}

        {/* Final synthesis */}
        {finalReport && (
          <div style={{ background:"linear-gradient(135deg,rgba(208,48,39,0.12),rgba(0,73,119,0.12))", border:"1px solid #D0302766", borderRadius:12, padding:18, marginTop:4 }}>
            <div style={{ fontSize:12, fontWeight:700, color:"#D03027", letterSpacing:1, marginBottom:10 }}>EXECUTIVE SUMMARY — SYNTHESISED FROM ALL AGENTS</div>
            <div style={{ fontSize:13, color:"rgba(255,255,255,0.85)", lineHeight:1.8, whiteSpace:"pre-wrap" }}>{finalReport}</div>
            <div style={{ marginTop:14, display:"flex", gap:10 }}>
              <button
                onClick={() => {
                  const txt = ORCHESTRATOR_STEPS.map(s=>`${s.label}:\n${outputs[s.agentId]||""}`).join("\n\n") + "\n\nEXECUTIVE SUMMARY:\n" + finalReport;
                  const blob = new Blob([txt], {type:"text/plain"});
                  const url = URL.createObjectURL(blob);
                  Object.assign(document.createElement("a"),{href:url,download:`orchestrator_report_${zone?.zip||"all"}.txt`}).click();
                  URL.revokeObjectURL(url);
                }}
                style={{ padding:"8px 16px", background:"rgba(255,255,255,0.08)", border:"1px solid #3A0A0A", borderRadius:8, color:"rgba(255,255,255,0.6)", fontSize:11, cursor:"pointer" }}
              >
                Download Report
              </button>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center" }}>
                Total cost: ~${estCost} · {tokenCount.toLocaleString()} tokens
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminDashboard({ onExit, employee }) {
  const allowedIds = employee?.access?.split(",") || CRA_AGENTS.map(a=>a.id);
  const [activeAgent, setActiveAgent] = useState(allowedIds[0] || "cra_advisor");
  const [activeZip, setActiveZip]     = useState("");
  const [activeZone, setActiveZone]   = useState(null);
  const [portfolio, setPortfolio]     = useState([]);
  const [analyzing, setAnalyzing]     = useState(false);
  const [view, setView]               = useState("split");

  const handleAnalyzeZip = (zip) => {
    setAnalyzing(true);
    setTimeout(()=>{
      const zone = CRA_ZONES.find(z=>z.zip===zip) || { zip, city:`ZIP ${zip}`, state:"US", incomeGroup:"Moderate", medianIncome:42000, population:18000, healthDesertScore:55, preventiveSpend:18, reactiveSpend:28, healthcarePct:26, unbankedRate:22, capitalOnePresence:false, craDeployed:0, craTarget:250000 };
      setActiveZone(zone);
      setPortfolio(generateCRAPortfolio(zip));
      setAnalyzing(false);
    }, 800);
  };

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#0D0202", fontFamily:"'DM Sans','Segoe UI',sans-serif", color:"#fff" }}>
      <style>{`*{box-sizing:border-box;}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#0D0202}::-webkit-scrollbar-thumb{background:#3A0A0A;border-radius:2px}`}</style>
      <AdminSidebar activeAgent={activeAgent} setActiveAgent={id=>{if(allowedIds.includes(id))setActiveAgent(id);}} employee={employee} />
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <AdminTopBar onExit={onExit} activeZip={activeZip} setActiveZip={setActiveZip} onAnalyzeZip={handleAnalyzeZip} analyzing={analyzing} employee={employee} />
        <div style={{ padding:"8px 22px", borderBottom:"1px solid #3A0A0A", display:"flex", gap:8, alignItems:"center" }}>
          {[["split","Split View"],["zone","Zone Data"],["chat","Agent Chat"],["cards","Card Analytics"],["customers","Customer Spend"],["orchestrate","Orchestrator"]].map(([v,l])=>(
            <button key={v} onClick={()=>setView(v)} style={{ padding:"5px 14px", background:view===v?"rgba(208,48,39,0.2)":"transparent", border:`1px solid ${view===v?"#D0302744":"#3A0A0A"}`, borderRadius:8, color:view===v?"#D03027":"rgba(255,255,255,0.3)", fontSize:11, fontWeight:view===v?700:400, cursor:"pointer", whiteSpace:"nowrap" }}>{l}</button>
          ))}
          {activeZone && <span style={{ marginLeft:"auto", fontSize:11, color:"rgba(255,255,255,0.25)" }}>Analyzing {portfolio.length} users in {activeZone.city}</span>}
          {!activeZone && <span style={{ marginLeft:"auto", fontSize:10, color:"rgba(255,255,255,0.15)" }}>Enter ZIP · Pre-loaded: {CRA_ZONES.slice(0,5).map(z=>z.zip).join(", ")}...</span>}
        </div>
        <div style={{ flex:1, overflow:"hidden", display:"flex" }}>
          {view==="cards" && (
            <div style={{ flex:1, overflowY:"auto" }}>
              <CardAnalyticsPanel zip={activeZip} apiKey={employee?.apiKey||""} />
            </div>
          )}
          {view==="customers" && (
            <div style={{ flex:1, overflowY:"auto" }}>
              <CustomerSpendAgent portfolio={portfolio} zone={activeZone} />
            </div>
          )}
          {view==="orchestrate" && (
            <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
              <OrchestratorPanel zone={activeZone} portfolio={portfolio} employee={employee} />
            </div>
          )}
          {(view==="split"||view==="zone") && (
            <div style={{ flex:view==="split"?1.3:1, overflowY:"auto", borderRight:view==="split"?"1px solid #3A0A0A":"none" }}>
              <ZoneOverviewPanel zone={activeZone} portfolio={portfolio} />
            </div>
          )}
          {(view==="split"||view==="chat") && (
            <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
              <CRAAgentChat agentId={activeAgent} zone={activeZone} portfolio={portfolio} employee={employee} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [role, setRole] = useState("onboard"); // onboard | customer | admin
  const [page, setPage] = useState("dashboard");
  const [user, setUser] = useState(null);
  const [adminEmployee, setAdminEmployee] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [collapsed, setCollapsed] = useState(false);
  const [budgets, setBudgets] = useState({});

  const handleOnboard = (form, txns) => {
    setUser({
      name: form.name, age: form.age, income: form.income,
      occupation: form.occupation, financialGoals: form.financialGoals || [],
      monthlyIncome: form.monthlyIncome || 5000, accounts: form.accounts || [],
      balance: form.balance || 0, apiKey: form.apiKey || "",
      customerId: form.customerId || "", fromNessie: form.fromNessie || false,
    });
    const finalTxns = (txns && txns.length > 0)
      ? txns : generateTransactions(form.customerId || "c_001", 3);
    setTransactions(finalTxns);
    setRole("customer");
    setPage("dashboard");
  };

  const handleAdminLogin = (emp) => { setAdminEmployee(emp); setRole("admin"); };

  const handleReCategorize = (id, newCat) => {
    setTransactions(prev => prev.map(t => t.id===id ? {...t, category:newCat} : t));
  };

  // ── ONBOARD ──
  if (role === "onboard") return (
    <>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#EFF3F8}::-webkit-scrollbar-thumb{background:#C0CDD8;border-radius:4px}`}</style>
      <OnboardPage onSubmit={handleOnboard} onAdminLogin={handleAdminLogin} />
    </>
  );

  // ── ADMIN ──
  if (role === "admin") return (
    <AdminDashboard onExit={() => setRole("onboard")} employee={adminEmployee} />
  );

  // ── CUSTOMER ──
  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#EFF3F8", fontFamily:"'DM Sans','Segoe UI',sans-serif", color:"#1A2B3C" }}>
      <style>{`*{box-sizing:border-box;}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#EFF3F8}::-webkit-scrollbar-thumb{background:#C0CDD8;border-radius:4px}`}</style>
      <Sidebar page={page} setPage={setPage} collapsed={collapsed} setCollapsed={setCollapsed} />
      <div style={{ flex:1, overflow:"auto", display:"flex", flexDirection:"column" }}>
        <TopBar user={user} transactions={transactions} page={page} budgets={budgets} setBudgets={setBudgets} />
        {page==="dashboard" && <DashboardPage transactions={transactions} user={user} budgets={budgets} />}
        {page==="transactions" && <TransactionsPage transactions={transactions} onReCategorize={handleReCategorize} />}
        {page==="advisor" && <AdvisorPage transactions={transactions} user={user} />}
        {page==="goals" && <GoalsPage transactions={transactions} user={user} />}
        {page==="lifestage" && <LifeStagePage transactions={transactions} user={user} />}
        {page==="teller" && <TellerPage transactions={transactions} user={user} />}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN FEATURE EXTENSIONS — appended below existing components
// ═══════════════════════════════════════════════════════════════════════════════
