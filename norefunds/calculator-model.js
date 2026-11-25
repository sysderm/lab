// Shared calculator data for the screen receipt and Zazzle print editions.
export const CURRENCIES = ["CHF","USD","EUR","GBP","CAD","AUD","JPY","CNY","INR","BRL","MXN","SEK","SGD","AED","ZAR"];

/* ═══ i18n — EN/DE/FR/ES/ZH, auto-picked from browser language, ?lang= overrides ═══ */
export const I18N = {
en:{locale:"en-US",
 tagline:"THE LIFETIME RECEIPT", meta1:"REGISTER 03 · CASHIER: TIME", final:"ALL SALES FINAL",
 lage:'Your age <span class="req-chip">required</span>',
 lplan:'Warranty plan <span class="opt">(life expectancy)</span>',
 w81:"STANDARD — 81 YRS (GLOBAL-NORTH AVG)", w92:"EXTENDED — 92 YRS (EATS VEGETABLES)", w100:"COLLECTOR'S — 100 YRS (PURE SPITE)",
 lincome:'Annual income <span class="opt">(optional — adds the money lines)</span>',
 lvisits:'Times you see your parents per year <span class="opt">(optional — careful)</span>',
 lpage:"Their average age", print:"▸ Print receipt",
 err:"The register needs your age. It already knows everything else.",
 anon:"100% anonymous · nothing is saved · the math never leaves your device",
 elapsed:"LIFE ELAPSED", planAdj:"PLAN ADJUSTED: EXTENDED WARRANTY", autoApplied:"AUTO-APPLIED",
 sTime:"TIME, REMAINING", weeks:"WEEKS", mondays:"MONDAYS", weekends:"WEEKENDS", summers:"SUMMERS", moons:"FULL MOONS",
 sCons:"CONSUMPTION, REMAINING (EST.)", coffees:"COFFEES", meals:"MEALS", phones:"PHONES YOU'LL OWN", cars:"CARS",
 haircuts:"HAIRCUTS", vacations:"NIGHTS OF VACATION", books:"BOOKS YOU'LL FINISH",
 sGoes:"WHERE IT ACTUALLY GOES", stare:"STARING AT YOUR PHONE", yrs:"YRS",
 ofYears:n=>"of your remaining "+n+" years", workh:"HOURS AT WORK (TO 65)",
 sMoney:"MONEY, STILL INBOUND", futureEarn:"FUTURE EARNINGS (TO 65)", grossNote:"gross · flat wage · enjoy taxes",
 sPeople:"PEOPLE", parents:"TIMES YOU'LL SEE YOUR PARENTS", priceless:"PRICELESS",
 makeCount:"make them count", assumeNote:"assuming ~20 more of their years",
 subtotal:"SUBTOTAL", everything:"EVERYTHING YOU'LL EVER HAVE", payMethod:"PAYMENT METHOD", timeW:"TIME", change:"CHANGE DUE",
 stampS:"NO EXCHANGES · SALE IS FINAL", wRemaining:"YOUR REMAINING WEEKS",
 thanks:"THANK YOU FOR LIVING<br>COME AGAIN · WHILE SUPPLIES LAST",
 copyBtn:"Copy my receipt", copied:"Copied — go cause perspective", copyFail:"Screenshot the receipt instead",
 shareBtn:"Share it",
 nudge:"Screenshot it. Send it to someone you'd like more time with.",
 tipTitle:"Tip the cashier",
 shareLead:"My lifetime receipt 🧾", shareWeekends:"weekends left", shareCoffees:"coffees left",
 shareStare:(s,y)=>"~"+s+" of my remaining "+y+" years staring at my phone",
 shareParents:n=>"I'll see my parents ~"+n+" more times", shareTail:"No refunds. Print yours: ",
 fine:'<b>Fine print.</b> Estimates, not prophecy: averages stitched from public life-expectancy and consumption data (3 meals &amp; ~5h of screen time a day, 1.5 coffees, a phone every 3 years, a car every 8 until 78, haircuts every 6 weeks, 12 nights of vacation and 5 finished books a year, working years to 65, parents’ expectancy 85). Your mileage will vary — that is the point. Everything is computed in your browser; nothing you type is stored or sent anywhere. Not medical, financial, or existential advice.'},
de:{locale:"de-CH",
 tagline:"DER KASSENZETTEL DEINES LEBENS", meta1:"KASSE 03 · ES BEDIENTE DICH: DIE ZEIT", final:"KEIN UMTAUSCH",
 lage:'Dein Alter <span class="req-chip">Pflichtfeld</span>',
 lplan:'Garantieplan <span class="opt">(Lebenserwartung)</span>',
 w81:"STANDARD — 81 J. (Ø GLOBALER NORDEN)", w92:"VERLÄNGERT — 92 J. (ISST GEMÜSE)", w100:"SAMMLER-EDITION — 100 J. (AUS PUREM TROTZ)",
 lincome:'Jahreseinkommen <span class="opt">(optional — schaltet die Geldzeilen frei)</span>',
 lvisits:'Wie oft siehst du deine Eltern pro Jahr? <span class="opt">(optional — Vorsicht)</span>',
 lpage:"Durchschnittsalter deiner Eltern", print:"▸ Kassenzettel drucken",
 err:"Die Kasse braucht dein Alter. Alles andere weiss sie schon.",
 anon:"100% anonym · nichts wird gespeichert · die Rechnung verlässt dein Gerät nie",
 elapsed:"LEBEN VERBRAUCHT", planAdj:"GARANTIE VERLÄNGERT", autoApplied:"AUTOMATISCH",
 sTime:"ZEIT — RESTBESTAND", weeks:"WOCHEN", mondays:"MONTAGE", weekends:"WOCHENENDEN", summers:"SOMMER", moons:"VOLLMONDE",
 sCons:"KONSUM — RESTBESTAND (CA.)", coffees:"KAFFEES", meals:"MAHLZEITEN", phones:"HANDYS, DIE DU NOCH KAUFST", cars:"AUTOS",
 haircuts:"HAARSCHNITTE", vacations:"FERIENNÄCHTE", books:"BÜCHER, DIE DU FERTIG LIEST",
 sGoes:"WOFÜR ES WIRKLICH DRAUFGEHT", stare:"AUFS HANDY STARREN", yrs:"JAHRE",
 ofYears:n=>"von deinen verbleibenden "+n+" Jahren", workh:"ARBEITSSTUNDEN (BIS 65)",
 sMoney:"GELD, NOCH UNTERWEGS", futureEarn:"KÜNFTIGER LOHN (BIS 65)", grossNote:"brutto · konstanter Lohn · viel Spass mit den Steuern",
 sPeople:"MENSCHEN", parents:"WIE OFT DU DEINE ELTERN NOCH SIEHST", priceless:"UNBEZAHLBAR",
 makeCount:"jedes einzelne zählt", assumeNote:"angenommen, ihnen bleiben noch ~20 Jahre",
 subtotal:"ZWISCHENSUMME", everything:"ALLES, WAS DU JE HABEN WIRST", payMethod:"ZAHLUNGSART", timeW:"ZEIT", change:"RÜCKGELD",
 stampS:"VOM UMTAUSCH AUSGESCHLOSSEN", wRemaining:"DEINE VERBLEIBENDEN WOCHEN",
 thanks:"DANKE FÜRS VORBEILEBEN<br>KOMM WIEDER · SOLANGE DER VORRAT REICHT",
 copyBtn:"Zettel kopieren", copied:"Kopiert — geh Perspektive stiften", copyFail:"Mach lieber einen Screenshot",
 shareBtn:"Teilen",
 nudge:"Mach einen Screenshot. Schick ihn jemandem, mit dem du mehr Zeit verbringen willst.",
 tipTitle:"Trinkgeld für die Kassiererin",
 shareLead:"Mein Lebens-Kassenzettel 🧾", shareWeekends:"Wochenenden übrig", shareCoffees:"Kaffees übrig",
 shareStare:(s,y)=>"~"+s+" meiner verbleibenden "+y+" Jahre starre ich aufs Handy",
 shareParents:n=>"Ich sehe meine Eltern noch ~"+n+" Mal", shareTail:"Kein Umtausch. Druck deinen: ",
 fine:'<b>Das Kleingedruckte.</b> Schätzungen, keine Prophezeiung: Durchschnittswerte aus öffentlichen Daten zu Lebenserwartung und Konsum (3 Mahlzeiten &amp; ~5h Bildschirmzeit pro Tag, 1.5 Kaffees, ein Handy alle 3 Jahre, ein Auto alle 8 Jahre bis 78, Haarschnitt alle 6 Wochen, 12 Feriennächte und 5 gelesene Bücher pro Jahr, Arbeitsjahre bis 65, Lebenserwartung der Eltern 85). Bei dir wird es anders sein — genau darum geht es. Alles wird in deinem Browser berechnet; nichts wird gespeichert oder gesendet. Keine medizinische, finanzielle oder existenzielle Beratung.'},
fr:{locale:"fr-CH",
 tagline:"LE TICKET DE CAISSE DE TA VIE", meta1:"CAISSE 03 · CAISSIER : LE TEMPS", final:"AUCUN REMBOURSEMENT",
 lage:'Ton âge <span class="req-chip">obligatoire</span>',
 lplan:'Formule de garantie <span class="opt">(espérance de vie)</span>',
 w81:"STANDARD — 81 ANS (MOYENNE PAYS RICHES)", w92:"PROLONGÉE — 92 ANS (MANGE DES LÉGUMES)", w100:"ÉDITION COLLECTOR — 100 ANS (PAR PUR ESPRIT DE CONTRADICTION)",
 lincome:'Revenu annuel <span class="opt">(facultatif — débloque les lignes argent)</span>',
 lvisits:'Combien de fois vois-tu tes parents par an ? <span class="opt">(facultatif — attention)</span>',
 lpage:"Leur âge moyen", print:"▸ Imprimer le ticket",
 err:"La caisse a besoin de ton âge. Elle sait déjà tout le reste.",
 anon:"100 % anonyme · rien n’est enregistré · le calcul ne quitte jamais ton appareil",
 elapsed:"VIE ÉCOULÉE", planAdj:"GARANTIE PROLONGÉE", autoApplied:"AUTOMATIQUE",
 sTime:"TEMPS RESTANT", weeks:"SEMAINES", mondays:"LUNDIS", weekends:"WEEK-ENDS", summers:"ÉTÉS", moons:"PLEINES LUNES",
 sCons:"CONSO RESTANTE (ESTIM.)", coffees:"CAFÉS", meals:"REPAS", phones:"TÉLÉPHONES À VENIR", cars:"VOITURES",
 haircuts:"COUPES DE CHEVEUX", vacations:"NUITS DE VACANCES", books:"LIVRES QUE TU FINIRAS",
 sGoes:"OÙ ÇA PART VRAIMENT", stare:"FIXER TON TÉLÉPHONE", yrs:"ANS",
 ofYears:n=>"sur tes "+n+" années restantes", workh:"HEURES DE TRAVAIL (JUSQU’À 65)",
 sMoney:"ARGENT ENCORE À VENIR", futureEarn:"SALAIRE FUTUR (JUSQU’À 65 ANS)", grossNote:"brut · salaire constant · bon courage avec les impôts",
 sPeople:"LES GENS", parents:"FOIS OÙ TU REVERRAS TES PARENTS", priceless:"ÇA N'A PAS DE PRIX",
 makeCount:"que chacune compte", assumeNote:"en leur comptant encore ~20 ans",
 subtotal:"SOUS-TOTAL", everything:"TOUT CE QUE TU AURAS DANS TA VIE", payMethod:"MOYEN DE PAIEMENT", timeW:"LE TEMPS", change:"RENDU MONNAIE",
 stampS:"NI REPRIS, NI ÉCHANGÉ, NI REMBOURSÉ", wRemaining:"TES SEMAINES RESTANTES",
 thanks:"MERCI DE VIVRE<br>REVIENS · JUSQU’À ÉPUISEMENT DES STOCKS",
 copyBtn:"Copier mon ticket", copied:"Copié — va faire relativiser quelqu'un", copyFail:"Fais plutôt une capture d’écran",
 shareBtn:"Partager",
 nudge:"Fais une capture d’écran. Envoie-la à quelqu’un avec qui tu voudrais passer plus de temps.",
 tipTitle:"Un pourboire pour le caissier",
 shareLead:"Le ticket de caisse de ma vie 🧾", shareWeekends:"week-ends restants", shareCoffees:"cafés restants",
 shareStare:(s,y)=>"~"+s+" de mes "+y+" années restantes à fixer mon téléphone",
 shareParents:n=>"Je verrai encore mes parents ~"+n+" fois", shareTail:"Aucun remboursement. Imprime le tien : ",
 fine:'<b>Les petites lignes.</b> Des estimations, pas une prophétie : moyennes tirées de données publiques d’espérance de vie et de consommation (3 repas et ~5h d’écran par jour, 1,5 café, un téléphone tous les 3 ans, une voiture tous les 8 ans jusqu’à 78, une coupe toutes les 6 semaines, 12 nuits de vacances et 5 livres finis par an, travail jusqu’à 65 ans, espérance de vie des parents 85). Chez toi, ce sera différent — c’est justement l’idée. Tout est calculé dans ton navigateur ; rien n’est enregistré ni envoyé. Ni conseil médical, ni financier, ni existentiel.'},
es:{locale:"es-419",
 tagline:"EL TICKET DE TU VIDA", meta1:"CAJA 03 · CAJERO: EL TIEMPO", final:"VENTA FINAL",
 lage:'Tu edad <span class="req-chip">obligatorio</span>',
 lplan:'Plan de garantía <span class="opt">(esperanza de vida)</span>',
 w81:"ESTÁNDAR — 81 AÑOS (PROMEDIO DEL NORTE GLOBAL)", w92:"EXTENDIDA — 92 AÑOS (COME VERDURAS)", w100:"EDICIÓN COLECCIONISTA — 100 AÑOS (PURA TERQUEDAD)",
 lincome:'Ingresos anuales <span class="opt">(opcional — añade las líneas de dinero)</span>',
 lvisits:'¿Cuántas veces ves a tus padres al año? <span class="opt">(opcional — cuidado)</span>',
 lpage:"Su edad promedio", print:"▸ Imprimir el ticket",
 err:"La caja necesita tu edad. Todo lo demás ya lo sabe.",
 anon:"100% anónimo · no se guarda nada · el cálculo nunca sale de tu dispositivo",
 elapsed:"VIDA CONSUMIDA", planAdj:"GARANTÍA EXTENDIDA", autoApplied:"AUTOMÁTICA",
 sTime:"TIEMPO RESTANTE", weeks:"SEMANAS", mondays:"LUNES", weekends:"FINES DE SEMANA", summers:"VERANOS", moons:"LUNAS LLENAS",
 sCons:"CONSUMO RESTANTE (EST.)", coffees:"CAFÉS", meals:"COMIDAS", phones:"TELÉFONOS QUE TENDRÁS", cars:"AUTOS",
 haircuts:"CORTES DE PELO", vacations:"NOCHES DE VACACIONES", books:"LIBROS QUE TERMINARÁS",
 sGoes:"ADÓNDE SE VA DE VERDAD", stare:"MIRAR EL TELÉFONO", yrs:"AÑOS",
 ofYears:n=>"de tus "+n+" años restantes", workh:"HORAS DE TRABAJO (HASTA LOS 65)",
 sMoney:"DINERO POR COBRAR", futureEarn:"SUELDO FUTURO (HASTA LOS 65)", grossNote:"bruto · sueldo constante · disfruta de los impuestos",
 sPeople:"PERSONAS", parents:"VECES QUE VERÁS A TUS PADRES", priceless:"IMPAGABLE",
 makeCount:"aprovecha cada una", assumeNote:"suponiendo que les quedan ~20 años",
 subtotal:"SUBTOTAL", everything:"TODO LO QUE LLEGARÁS A TENER", payMethod:"FORMA DE PAGO", timeW:"TIEMPO", change:"CAMBIO",
 stampS:"SIN DEVOLUCIONES · VENTA FINAL", wRemaining:"TUS SEMANAS RESTANTES",
 thanks:"GRACIAS POR VIVIR<br>VUELVE PRONTO · HASTA AGOTAR EXISTENCIAS",
 copyBtn:"Copiar mi ticket", copied:"Copiado — reparte perspectiva", copyFail:"Mejor haz una captura",
 shareBtn:"Compartir",
 nudge:"Haz una captura. Mándasela a alguien con quien quieras pasar más tiempo.",
 tipTitle:"Propina para el cajero",
 shareLead:"El ticket de mi vida 🧾", shareWeekends:"fines de semana restantes", shareCoffees:"cafés restantes",
 shareStare:(s,y)=>"~"+s+" de mis "+y+" años restantes mirando el teléfono",
 shareParents:n=>"Veré a mis padres ~"+n+" veces más", shareTail:"Sin devoluciones. Imprime el tuyo: ",
 fine:'<b>La letra pequeña.</b> Estimaciones, no profecía: promedios tomados de datos públicos de esperanza de vida y consumo (3 comidas y ~5h de pantalla al día, 1,5 cafés, un teléfono cada 3 años, un auto cada 8 hasta los 78, corte de pelo cada 6 semanas, 12 noches de vacaciones y 5 libros terminados al año, trabajo hasta los 65, esperanza de vida de los padres 85). Lo tuyo será distinto — de eso se trata. Todo se calcula en tu navegador; nada se guarda ni se envía. No es consejo médico, financiero ni existencial.'},
zh:{locale:"zh-CN",
 tagline:"人生收银小票", meta1:"03号收银台 · 收银员：时间", final:"概不退换",
 lage:'你的年龄 <span class="req-chip">必填</span>',
 lplan:'保修方案 <span class="opt">（预期寿命）</span>',
 w81:"标准版 — 81岁（发达国家平均）", w92:"延长版 — 92岁（爱吃蔬菜）", w100:"收藏版 — 100岁（纯属不服）",
 lincome:'年收入 <span class="opt">（选填——解锁跟钱有关的几行）</span>',
 lvisits:'每年见父母几次？<span class="opt">（选填——慎填）</span>',
 lpage:"他们的平均年龄", print:"▸ 打印小票",
 err:"收银机需要你的年龄。别的它都已经知道了。",
 anon:"100%匿名 · 不保存任何数据 · 所有计算都不出你的设备",
 elapsed:"人生进度", planAdj:"保修已延长", autoApplied:"自动生效",
 sTime:"剩余时间", weeks:"周", mondays:"周一", weekends:"周末", summers:"夏天", moons:"满月",
 sCons:"剩余消费（估算）", coffees:"咖啡", meals:"餐食", phones:"还要换的手机", cars:"汽车",
 haircuts:"理发次数", vacations:"度假（晚）", books:"还能读完的书",
 sGoes:"时间真正的去向", stare:"刷手机", yrs:"年",
 ofYears:n=>"（你一共还剩"+n+"年）", workh:"工作小时数（到65岁）",
 sMoney:"还未到账的钱", futureEarn:"未来收入（到65岁）", grossNote:"税前 · 工资不变 · 祝报税愉快",
 sPeople:"家人", parents:"你还能见父母的次数", priceless:"无价",
 makeCount:"珍惜每一次", assumeNote:"假设他们还有约20年",
 subtotal:"小计", everything:"你此生拥有的一切", payMethod:"支付方式", timeW:"时间", change:"找零",
 stampS:"一经售出 · 概不退换", wRemaining:"你剩余的周数",
 thanks:"感谢惠顾人生<br>欢迎再来 · 售完即止",
 copyBtn:"复制我的小票", copied:"已复制——去让别人也清醒一下", copyFail:"还是截图吧",
 shareBtn:"分享",
 nudge:"截个图，发给你想多陪陪的人。",
 tipTitle:"打赏收银员",
 shareLead:"我的人生小票 🧾", shareWeekends:"个周末可用", shareCoffees:"杯咖啡待喝",
 shareStare:(s,y)=>"剩下的"+y+"年里约"+s+"年在刷手机",
 shareParents:n=>"我还能见父母约"+n+"次", shareTail:"概不退换。来打一张你自己的：",
 fine:'<b>细则。</b>估算而非预言：基于公开的预期寿命与消费数据的平均值（每天3餐、约5小时屏幕时间、1.5杯咖啡，每3年换一部手机，78岁前每8年换一辆车，每6周理一次发，每年度假12晚、读完5本书，工作到65岁，父母预期寿命85岁）。你的人生会不一样——这正是重点。一切都在你的浏览器中计算；你输入的内容不会被保存或发送。不构成医疗、财务或人生建议。'}
};

export const EDITIONS = {standard:"THE LIFETIME RECEIPT",medical:"BODY WARRANTY",goth:"MEMENTO MORI",sunny:"SUNSHINE"};
export function buildReceipt(input) {
  const age=Number(input.age);
  if(!Number.isFinite(age)||age<1||age>119) throw new RangeError("Age must be between 1 and 119.");
  if(![81,92,100].includes(Number(input.plan || 81))) throw new RangeError("Invalid warranty plan.");
  if(!Object.hasOwn(EDITIONS,input.edition || "standard")) throw new RangeError("Invalid edition.");
  const language=Object.hasOwn(I18N,input.language)?input.language:"en";
  const T=I18N[language], nf=new Intl.NumberFormat(T.locale);
  const money=(value,currency)=>new Intl.NumberFormat(T.locale,{style:"currency",currency,notation:"compact",maximumFractionDigits:1}).format(value);
  const ED=input.edition || "standard";
  const TT=(ED==="standard")?T:I18N.en;

  let exp = Number(input.plan || 81);
  let extended=false;
  if(age >= exp-2){ exp = age+10; extended=true; }
  const Y = exp-age;

  const cur = CURRENCIES.includes(input.currency) ? input.currency : "CHF";
  const income = parseFloat(input.income);
  const visits = parseFloat(input.visits);
  const pAge = parseFloat(input.parentAge);

  const weeks=Math.round(Y*52.18), summers=Math.round(Y), moons=Math.round(Y*12.37);
  const coffees=Math.round(Y*365*1.5), meals=Math.round(Y*365*3);
  const phones=Math.max(1,Math.round(Math.min(Y,Math.max(0,78-age))/3));
  const cars=Math.round(Math.min(Y,Math.max(0,78-age))/8);
  const haircuts=Math.round(Y*8.7), vacations=Math.round(Y*12), books=Math.round(Y*5);
  const screenYrs=Y*5/24;
  const workYrs=Math.max(0,Math.min(65,exp)-age);
  const workHours=Math.round(workYrs*1800);
  const elapsed=Math.min(99,Math.round(age/exp*100));
  const blocks="▓".repeat(Math.round(elapsed/100*14)).padEnd(14,"░");

  const L=[];
  const line=(lab,val,cls)=>L.push({t:"li",lab,val,cls});
  const sect=t=>L.push({t:"sect",lab:t});
  const rule=()=>L.push({t:"rule"});
  const note=lab=>L.push({t:"li",lab:"",val:lab,cls:"note small"});

  if(extended) line(TT.planAdj,TT.autoApplied,"warn small");
  L.push({t:"li",lab:TT.elapsed+"  "+elapsed+"%",val:blocks,cls:"barline"});
  rule();
  sect(TT.sTime);
  line(TT.weeks,nf.format(weeks));
  line(TT.mondays,nf.format(weeks));
  line(TT.weekends,nf.format(weeks));
  line(TT.summers,nf.format(summers));
  line(TT.moons,nf.format(moons));
  rule();
  if(ED==="medical"){
    sect("PARTS &amp; LABOUR, REMAINING (POPULATION AVG.)");
    line("HIPS, ORIGINAL PARTS",(age<70?Math.round(70-age)+" YRS":"AFTERMARKET ERA"));
    line("KNEES, FACTORY SPEC",(age<66?Math.round(66-age)+" YRS":"LISTEN TO THEM"));
    line("READING WITHOUT GLASSES",(age<45?Math.round(45-age)+" YRS":"SQUINTING ALREADY"));
    line("FULL-RANGE HEARING",(age<55?Math.round(55-age)+" YRS":"PARDON?"));
    rule();
    sect("MAINTENANCE SCHEDULE (EST.)");
    line("YEARS BEFORE DAILY PILLS",(age<57?Math.round(57-age):"IN PROGRESS"));
    line("YEARS WITHOUT REGULAR PAIN",(age<52?Math.round(52-age):"CHECK YOUR BACK"));
    line("HOSPITAL-FREE YEARS AHEAD",(age<63?Math.round(63-age):"KEEP THE CARD HANDY"));
    line("DENTIST VISITS REMAINING",nf.format(Math.round(Y*2)));
    line("COLONOSCOPIES AHEAD",(age<75?Math.max(1,Math.ceil((75-Math.max(age,50))/10))+" (ENJOY)":"0 (CONGRATS)"));
    note("population averages, heavily satirical — your doctor knows you, this receipt does not");
  } else if(ED==="goth"){
    sect("THE DARK LEDGER, REMAINING");
    line("HEARTBREAKS","~"+Math.max(1,Math.round(Y/18)));
    line("NEAR MISSES, UNNOTICED","~"+Math.round(Y*2));
    line("FUNERALS TO ATTEND","~"+Math.round(Y*0.9));
    line("GRAVEYARD VISITS","~"+Math.round(Y*1.6));
    line("BLACK GARMENTS TO BUY","~"+Math.round(Y*3));
    line("CANDLES TO BURN","~"+nf.format(Math.round(Y*40)));
    rule();
    sect("THE FINAL ARRANGEMENTS");
    line("TIME ABOVE GROUND",Y.toFixed(0)+" YRS");
    line("TIME IN GRAVE","ETERNITY (INCL.)","small");
    line("LAST SONG YOU'LL HEAR","ALREADY WRITTEN","warn small");
    note("the management will see you eventually");
  } else if(ED==="sunny"){
    sect("JOY INVENTORY, REMAINING (EST.)");
    line("LAUGHS",nf.format(Math.round(Y*365*13)));
    line("HUGS",nf.format(Math.round(Y*365*4)));
    line("DOGS YOU'LL PET",nf.format(Math.round(Y*130)));
    line("SWIMS IN OPEN WATER",nf.format(Math.round(Y*8)));
    line("SNOWFALLS",nf.format(Math.round(Y*12)));
    line("BIRTHDAY CAKES",Math.round(Y));
    line("NAPS",nf.format(Math.round(Y*80)));
    rule();
    sect("SPECIAL OFFERS");
    line("FIRST TIMES STILL AHEAD","MORE THAN YOU THINK","small");
    line("TIMES YOU'LL FALL IN LOVE","AT LEAST ONCE MORE","warn small");
    note("averages, generously rounded up — joy compounds");
  } else {
    sect(TT.sCons);
    line(TT.coffees,nf.format(coffees));
    line(TT.meals,nf.format(meals));
    line(TT.phones,nf.format(phones));
    if(cars>0) line(TT.cars,nf.format(cars));
    line(TT.haircuts,nf.format(haircuts));
    line(TT.vacations,nf.format(vacations));
    line(TT.books,nf.format(books));
    rule();
    sect(TT.sGoes);
    line(TT.stare,screenYrs.toFixed(1)+" "+TT.yrs);
    note(TT.ofYears(Y.toFixed(0)));
    if(workHours>0){
      line(TT.workh,nf.format(workHours));
    }
  }
  if(isFinite(income)&&income>0&&workYrs>0){
    rule();
    sect(TT.sMoney);
    line(TT.futureEarn,money(income*workYrs,cur));
    note(TT.grossNote);
  }
  if(isFinite(visits)&&visits>0){
    rule();
    sect(TT.sPeople);
    if(isFinite(pAge)&&pAge>=18&&pAge<85){
      line(TT.parents,"~"+nf.format(Math.round(visits*(85-pAge))),"warn");
    }else if(isFinite(pAge)&&pAge>=85){
      line(TT.parents,TT.priceless,"warn small");
    }else{
      line(TT.parents,"~"+nf.format(Math.round(visits*20)),"warn");
      note(TT.assumeNote);
    }
    note(TT.makeCount);
  }
  rule();
  L.push({t:"li",lab:TT.subtotal,val:TT.everything,cls:"subtotal small"});
  line(TT.payMethod,TT.timeW,"small");
  line(TT.change,"0.00","small");
  L.push({t:"stamp"});
  rule();
  L.push({t:"barcode",weeks});
  L.push({t:"bnum",lab:"W-"+weeks+"  ·  "+TT.wRemaining});
  L.push({t:"thanks"});

  let shareOv=null;
  if(ED==="medical") shareOv="My Body Warranty receipt 🧾\n· Hips: "+(age<70?Math.round(70-age)+" yrs of original parts":"aftermarket era")+"\n· Years before daily pills: "+(age<57?Math.round(57-age):"in progress")+"\n· Colonoscopies ahead: "+(age<75?Math.max(1,Math.ceil((75-Math.max(age,50))/10)):0)+"\nAs-is, no warranty claims. Print yours:";
  else if(ED==="goth") shareOv="My Memento Mori receipt 🕯️\n· Funerals to attend: ~"+Math.round(Y*0.9)+"\n· Graveyard visits: ~"+Math.round(Y*1.6)+"\n· The last song I'll hear: already written\nNo refunds. Print yours:";
  else if(ED==="sunny") shareOv="My Sunshine receipt ☀️\n· Laughs left: "+nf.format(Math.round(Y*365*13))+"\n· Dogs I'll pet: "+nf.format(Math.round(Y*130))+"\n· Times I'll fall in love: at least once more\nNo refunds on joy. Print yours:";
  return {lines:L,edition:ED,age,exp,extended,language,plan:Number(input.plan || 81),currency:cur,income,weeks,coffees,screenYrs,Y,visits,pAge,shareOv,
    parents:(isFinite(visits)&&visits>0&&isFinite(pAge)&&pAge<85)?Math.round(visits*(85-pAge)):null};
}
