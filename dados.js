// ============================================================
// RADAR BUINHO — DADOS (snapshot 2026-07-04)
// Fonte: candidaturas/radar-financiamento.md (3 Jul) +
//        candidaturas/radar-calls-ue.md (v2, 4 Jul) +
//        candidaturas/matriz-configuracoes.md (4 Jul)
// Futuro: este bloco vira dados.json servido pelo buinho-assistant;
// o Zé actualiza os .md, o módulo regenera isto.
// ============================================================
const DADOS = {
  actualizado: "2026-07-04",
  configs: {
    C1: { nome: "Buinho sozinho", cor: "#2364ff", desc: "ESFL rural, Baixo Alentejo. Trunfo: baixa densidade. Limite: tesouraria (sem pré-financiamento nem contrapartidas altas)." },
    C2: { nome: "+ CEBAL", cor: "#1a9e6e", desc: "Mudança de categoria: entrada no mundo I&D. TRL e credibilidade científica. Relação real mas informal (SUBSTRACTO, cardo, O4 por concretizar)." },
    C3: { nome: "+ CML / Lisboa", cor: "#8a4fd3", desc: "Braço metropolitano: programas municipais/urbanos com escala. Pendente-mãe por selar: CML-entidade vs extensão." },
    C4: { nome: "Zingarelho (SME)", cor: "#e07b00", desc: "Estatuto PME: EISMEA, economia social, linhas empresariais. Já activa — falta higiene (OID por reconciliar)." },
    "C2+C3": { nome: "CEBAL + CML", cor: "#c23fa4", desc: "Ciência + escala urbana: a única via realista para Horizon-grade (NEB, Mission Soil). Horizonte 2028-34." }
  },
  // veredicto por configuração: aberto | destrava | parcial | fechado | armadilha | na
  programas: [
    { id:"promove", nome:"Promove — O Futuro do Interior", org:"la Caixa + BPI + FCT", prazo:"2027-02-12", janela:"nov 2026–fev 2027 (provável)", verba:"150K (piloto) / 250K (I&D) · 75-80%", ramo:"T/E", opp:5, fit:5, estado:"prevista", aposta:1,
      configs:{ C1:{v:"parcial", t:"Só o tier piloto 150K/75%. O tier I&D 250K/80% exige liderança de unidade I&D FCT «Muito Bom/Excelente» — fechado sozinhos."},
                C2:{v:"destrava", t:"A CEBAL dá a unidade FCT líder (classificação A CONFIRMAR) → tier 250K/80%. A porta condicional mais valiosa da matriz: +100K por uma relação meio-feita. Custo: consórcio em Set-Out."} } },
    { id:"bioeco", nome:"Alentejo 2030 — Bioeconomia Sustentável", org:"CCDR Alentejo / PT2030", prazo:"2026-10-30", janela:"ABERTA, fecha 30 Out 2026", verba:"envelope 3,5M€ FEDER", ramo:"T", opp:5, fit:4, estado:"aberta", aposta:2,
      configs:{ C1:{v:"parcial", t:"Formalmente elegível (ESFL), na prática fraco: FEDER exige músculo administrativo e bioeconomia sem parceiro científico não convence."},
                C2:{v:"destrava", t:"A CEBAL satisfaz o critério de mérito técnico-científico. A porta C2 mais próxima no tempo — e o TESTE da configuração inteira. Go/no-go em Agosto."} } },
    { id:"fct", nome:"FCT — Projetos IC&DT", org:"FCT", prazo:"2027-03-25", janela:"ciclo ~2027 (2026 fechou 25 Mar)", verba:"~250K por projecto", ramo:"T/X", opp:3, fit:3, estado:"prevista", aposta:3,
      configs:{ C1:{v:"fechado", t:"Beneficiários são instituições de I&D. Sem unidade, historial ou investigadores próprios, o Buinho sozinho não passa do papel."},
                C2:{v:"destrava", t:"Consórcio liderado pela CEBAL → Buinho como instituição participante (categoria «outras sem fins lucrativos que participem em investigação»). Equipa orçamentada + historial FCT. Rota paralela: Carlos via CIDEHUS."} } },
    { id:"amif", nome:"AMIF — Integration at Local Level", org:"DG HOME", prazo:"2026-10-02", janela:"ABERTA, fecha 2 Out 2026", verba:"parte de 77M€ · 90%", ramo:"X", opp:5, fit:4, estado:"aberta", aposta:4,
      configs:{ C1:{v:"fechado", t:"Beneficiários são autoridades locais, via Autoridade Gestora nacional AMIF. Não há candidatura directa de ONG."},
                C3:{v:"destrava", t:"Município no papel de beneficiário; Buinho executa (biofab×deslocação). Custo: pendente-mãe CML + lobby à AG (carta em Julho; sem reacção até fim de Agosto, larga-se). Plano B: municípios AML de alta densidade migrante (Amadora, Loures, Sintra, Odivelas)."} } },
    { id:"eismea", nome:"EISMEA/SMP — economia social & green SME", org:"DG GROW / EISMEA", prazo:"2027-06-30", janela:"reabre 2027", verba:"750K-1M · até 95%", ramo:"E/T", opp:4, fit:4, estado:"prevista", aposta:5,
      configs:{ C1:{v:"fechado", t:"Linhas pagam serviços a PMEs e pedem perfil empresarial/intermediário — a associação não encaixa."},
                C4:{v:"destrava", t:"Estatuto SME da Zingarelho (EYE como Intermediary Org, Social Economy Missions, greening SMEs). Custo: reconciliar OID JÁ + LEAR/contas no F&T Portal."} } },
    { id:"circpme", nome:"Alentejo 2030 — Economia Circular (PME)", org:"CCDR Alentejo", prazo:"2026-11-30", janela:"ABERTA, fecha 30 Nov 2026", verba:"envelope 1M€", ramo:"T", opp:4, fit:3, estado:"aberta",
      configs:{ C1:{v:"fechado", t:"Lógica de investimento empresarial — só PME."},
                C4:{v:"destrava", t:"Zingarelho como PME: eco-design, subprodutos, modelos circulares (repair/biomateriais). Depende da mesma higiene de OID."} } },
    { id:"life", nome:"LIFE — Circular Economy / Nature", org:"CINEA", prazo:"2026-09-22", janela:"SAP fecha 22 Set 2026", verba:"2-10M · cofin. 60% (75% Nature prior.)", ramo:"T", opp:3, fit:2, estado:"aberta", armadilha:true,
      configs:{ C1:{v:"armadilha", t:"Elegibilidade formal aberta a qualquer entidade — o fecho é estrutural: cofin. 40% do nosso lado, escala 2-10M, capacidade de implementação. «Território de lince» é argumento temático, não estrutural; Nature é terreno de actores de conservação (ICNF, ONGA). LIFE NGO OG exige ONG primarily active em ambiente — não somos."},
                C2:{v:"parcial", t:"Deixa de ser armadilha, passa a porta entreaberta 2028+: parceiro menor num consórcio LIFE-Circular ancorado em I&D de terceiros (via CEBAL/biomassa), SÓ depois de a O4 produzir ciência. Não é aposta 2026-27. A resposta ao instinto territorial é a Bioeconomia agora, LIFE depois."} } },
    { id:"urbact", nome:"URBACT IV / EUI", org:"URBACT / DG REGIO", prazo:"2028-06-01", janela:"próximo ciclo ~2028", verba:"~400K/rede · EUI até 2M", ramo:"X", opp:5, fit:5, estado:"futura",
      configs:{ C1:{v:"fechado", t:"Parceiros são cidades; Lead Partner é administração municipal."},
                C3:{v:"parcial", t:"CORRECÇÃO da matriz: nem a CML nos faz parceiros — non-city partners (máx 1) têm de ser organismos públicos. O que abre: Buinho como fornecedor/perito da rede da CML (Carlos no pool de Validated Experts). Valor real mas indirecto — honorários e posição, não grant."} } },
    { id:"horizon", nome:"Horizon: NEB Facility · Mission Soil · S+T+ARTS", org:"DG RTD / REA / Cl.4", prazo:"2026-12-01", janela:"NEB 1 Dez · Soil 23 Set 2026", verba:"3,5-12M por consórcio", ramo:"T/G", opp:3, fit:3, estado:"aberta", armadilha:true,
      configs:{ C1:{v:"armadilha", t:"Horizon-grade: consórcios científicos, overhead brutal para equipa de 5. Via barata para o selo NEB = NEB Prizes (um formulário)."},
                "C2+C3":{v:"parcial", t:"A única configuração onde deixa de ser fantasia: site rural (Messejana/cardo) + ciência (CEBAL) + escala urbana (CML/AML) + âncora universitária. Como parceiros, nunca a coordenar. Horizonte 2028-34 — registar, não perseguir."} } },
    { id:"agakhan", nome:"Aga Khan Portugal", org:"AKF PT", prazo:null, janela:"sem calls — via relacional", verba:"parcerias caso a caso", ramo:"X", opp:2, fit:3, estado:"futura",
      configs:{ C1:{v:"fechado", t:"Não publica calls a terceiros; geografias Lisboa/Grande Lisboa/Porto."},
                C3:{v:"destrava", t:"Equipa de Lisboa a trabalhar integração com municípios AML é o perfil das parcerias deles (Human-Centered Design, migrantes). Veia relacional — bónus de C3, nunca razão para C3."} } },
    { id:"cerv", nome:"CERV — Town-Twinning", org:"EACEA / DG JUST", prazo:"2026-09-23", janela:"ABERTA, fecha 23 Set 2026", verba:"8,4-50,7K lump sum", ramo:"X", opp:4, fit:4, estado:"aberta", aposta:6,
      configs:{ C1:{v:"parcial", t:"Sozinho fechado (não «representamos» autoridades locais) — mas C1+Aljustrel JÁ DESTRAVA: a Câmara coordena, nós desenhamos o programa. Decisão de Julho."},
                C3:{v:"parcial", t:"A CML é alternativa com mais escala, NÃO condição. Se não selar até fim de Julho → Aljustrel sem hesitar (decidido no radar)."} } },
    { id:"ka220", nome:"Erasmus+ KA220 (coordenação)", org:"ANs", prazo:"2027-03-15", janela:"~Mar 2027 — ronda de CREDENCIAÇÃO", verba:"120-400K lump sum", ramo:"X", opp:3, fit:5, estado:"prevista",
      configs:{ C1:{v:"parcial", t:"O bloqueio dos 250K provavelmente NÃO é formal: o Guide 2026 presume capacidade financeira a orgs de educação/juventude com >50% receita pública 2 anos (% Buinho a confirmar). É decisão de risco/caixa do Carlos, não de elegibilidade. WeRepair escalado = candidata a coordenação própria."},
                C2:{v:"parcial", t:"CEBAL como parceira em KA220 biofab (CRITICAL MASS, Micélio #10) sobe o Quality of Partnership. Célula pequena mas gratuita."} } },
    { id:"cbvet", nome:"Erasmus+ CB-VET", org:"EACEA", prazo:"2027-03-26", janela:"~26 Mar 2027", verba:"500K · 80% · limiar 60", ramo:"E/T", opp:4, fit:4, estado:"prevista", aposta:7,
      configs:{ C1:{v:"aberto", t:"⭐ A joia C1: o Buinho PODE coordenar sozinho. Nenhuma configuração acrescenta — o pendente é interno (enquadramento VET a confirmar). Plano B de credenciação."} } },
    { id:"eea", nome:"EEA Grants — Green Transition / Culture", org:"Mecanismo EEA (op. ApC)", prazo:"2026-12-31", janela:"calls 2026-27 (agreements assinados 2 Jul)", verba:"parte de 29,5M + 9M", ramo:"T/G", opp:4, fit:4, estado:"prevista", aposta:8,
      configs:{ C1:{v:"aberto", t:"ONG elegíveis — já aberto sozinhos. NB: pessoal+equipamento não elegíveis."},
                C2:{v:"parcial", t:"Melhora competitividade em nature-based/circular, não elegibilidade."} } },
    { id:"pice", nome:"AC/E — PICE (Residencias)", org:"Acción Cultural Española", prazo:"2026-09-07", janela:"contínua ATÉ 7 SET 2026", verba:"até 20K/entidade", ramo:"G", opp:4, fit:5, estado:"aberta", aposta:9,
      configs:{ C1:{v:"aberto", t:"O host estrangeiro É o beneficiário formal — Buinho candidata directo. Primeira receita de reciprocidade. Nenhuma configuração acrescenta; nenhuma deve perturbar."} } },
    { id:"cme", nome:"Culture Moves Europe — Hosts", org:"CE / Goethe", prazo:"2026-12-15", janela:"próxima ~Dez 2026", verba:"50€/dia/residente + extras", ramo:"G", opp:5, fit:5, estado:"prevista", aposta:10,
      configs:{ C1:{v:"aberto", t:"Ruralidade é critério VALORIZADO. Preparar dossier Set-Nov, submeter à abertura. Leque que nenhuma configuração deve perturbar."} } },
    { id:"partis", nome:"PARTIS & Art for Change (4ª ed.)", org:"FCG + la Caixa", prazo:"2026-12-31", janela:"vigiar anúncio 2º sem 2026", verba:"~100K/3 anos · 80% fora das AM", ramo:"G/X", opp:4, fit:5, estado:"prevista", aposta:11,
      configs:{ C1:{v:"aberto", t:"Majoração explícita FORA de Lisboa/Porto — o trunfo rural em estado puro. ⚠️ C3 mal gerida contamina esta narrativa: braço Lisboa separado, nunca mudança de identidade."} } },
    { id:"leader", nome:"LEADER/CLLD — GAL Esdime", org:"GAL / PEPAC", prazo:null, janela:"avisos rolantes do GAL", verba:"pequeno-médio", ramo:"T/G", opp:4, fit:4, estado:"rolante", aposta:12,
      configs:{ C1:{v:"aberto", t:"Território é Messejana — C3 é irrelevante e até contraproducente. Precedente Nocefresca (residência financiada por LEADER) em mão."} } },
    { id:"empis", nome:"EMPIS — Parcerias p/ Inovação Social", org:"PT2030", prazo:null, janela:"próxima vaga regional a confirmar", verba:"80% FSE+ / 20% investidor social", ramo:"E/T", opp:4, fit:4, estado:"prevista",
      configs:{ C1:{v:"aberto", t:"A condição é o investidor social — resolve-se com a CM Aljustrel (mesma mesa da reunião CEBAL), não com configuração."} } },
    { id:"gulb", nome:"Gulbenkian — Iniciativa Integração", org:"FCG", prazo:"2027-04-30", janela:"~Abr 2027", verba:"70-100K · 90%", ramo:"X", opp:4, fit:4, estado:"prevista",
      configs:{ C1:{v:"aberto", t:"90% raro em fundação; métodos participativos valorizados. Liga ao arco TIG/deslocação."} } },
    { id:"ce", nome:"Creative Europe — Cooperation", org:"EACEA", prazo:"2027-05-15", janela:"~Mai 2027", verba:"200K-1M", ramo:"G", opp:3, fit:3, estado:"prevista",
      configs:{ C1:{v:"aberto", t:"Já é o nosso campeonato (ESPECTROS coord. + TIG, resultados Set/Out). CML não acrescenta — confirmado."} } },
    { id:"ka210", nome:"Erasmus+ KA210 (R2)", org:"ANs", prazo:"2026-10-01", janela:"R2 fecha 1 Out 2026", verba:"30-60K", ramo:"X", opp:2, fit:5, estado:"aberta",
      configs:{ C1:{v:"aberto", t:"Saturado (~10%); vale por track record. R2 desenhada: SENTIR EUROPA (cirurgia Impacto) + INVISIBLE PLAY (checklist DoH). Mapa de elegibilidade ANTES de tudo."},
                C4:{v:"aberto", t:"Zingarelho como parceira (slot DE JUGEND) — depende do OID reconciliado para contagem de caps."} } },
    { id:"dgartes", nome:"DGArtes — Apoio a Projetos", org:"DGArtes/MC", prazo:null, janela:"anual ~Mar (revisão em consulta pode atrasar)", verba:"35K+ patamares", ramo:"G", opp:3, fit:4, estado:"rolante",
      configs:{ C1:{v:"aberto", t:"SUBSTRACTO pendente (~verão). Vaga regional Alentejo = arma. Linhas Programação e Internacionalização = duas portas além da Criação."} } },
    { id:"premios", nome:"Prémios em série (NEB Prizes · EUSIC · MAM · BPI)", org:"CE / EIC / FMAM / la Caixa", prazo:"2027-02-28", janela:"NEB ~Fev · BPI Fev-Jun · MAM Mai 2027", verba:"15-75K · 100%", ramo:"T/E/X", opp:4, fit:4, estado:"prevista",
      configs:{ C1:{v:"aberto", t:"Receita+selo sem consórcio. Rotina de calendário, não projectos. Pré-requisito barato: registo Base de Dados Social (BPI)."} } },
    { id:"digital", nome:"Digital Europe — SKILLS", org:"HaDEA", prazo:"2026-10-01", janela:"fecha 1 Out 2026", verba:"1-5M · cofin. ~50%", ramo:"E", opp:2, fit:2, estado:"aberta", armadilha:true,
      configs:{ C1:{v:"armadilha", t:"Consórcios HEI nacionais, overhead brutal. Só como parceiro minoritário convidado. EDIHs como CLIENTE (custo zero) é o valor real — via Zingarelho."} } }
  ],
  pressupostos: [
    { q:"CEBAL — há acordo escrito para lá do apoio em espécie do SUBSTRACTO? A O4 foi proposta à Fátima Duarte?", condiciona:"toda a coluna C2" },
    { q:"CEBAL — classificação FCT (Muito Bom/Excelente)?", condiciona:"Promove I&D 250K (porta nº1)" },
    { q:"CML — entidade jurídica ou extensão? (prazo prático: fim de Julho)", condiciona:"AMIF 2 Out + desenho CERV TT" },
    { q:"Zingarelho — OID: E10313831 ou E10247788?", condiciona:"caps de Outubro + toda a coluna C4" },
    { q:"Buinho — >50% de receita pública nos últimos 2 exercícios?", condiciona:"capacidade financeira presumida KA220-coordenador" },
    { q:"Enquadramento VET do Buinho", condiciona:"CB-VET (a joia C1)" },
    { q:"SUBSTRACTO — pendente ou aprovado?", condiciona:"peso da credencial CEBAL" }
  ],
  accoes: [
    { mes:"Julho", txt:"Marcar reunião CEBAL + CM Aljustrel (SEM DATA — destrava Bioeconomia e Promove)" },
    { mes:"Julho", txt:"Carta/diligência à AG nacional AMIF (com CML ou Aljustrel)" },
    { mes:"Julho", txt:"Selar CML-entidade vs extensão; senão CERV TT segue com Aljustrel" },
    { mes:"Agosto", txt:"Go/no-go Bioeconomia Alentejo 2030 (leitura integral do aviso + CEBAL)" },
    { mes:"Set", txt:"OID Zingarelho reconciliado antes da ronda de Outubro" },
    { mes:"Set-Out", txt:"Consórcio Promove com a CEBAL (estudar vencedores 2026)" },
    { mes:"Set-Nov", txt:"Dossier CME Hosts + perfil TransArtists; submeter à abertura (~Dez)" }
  ]
};
