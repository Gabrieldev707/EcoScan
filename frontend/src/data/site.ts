export const loginFeatures = [
  {
    number: '01',
    title: 'Privacidade por padrão',
    description: 'Imagens processadas no dispositivo. Nada é armazenado sem permissão explícita.',
  },
  {
    number: '02',
    title: 'Pontuação que importa',
    description: 'Cada descarte correto vira EcoPoints — convertíveis em descontos com parceiros locais.',
  },
  {
    number: '03',
    title: 'Grupos colaborativos',
    description: 'Escolas, empresas e bairros criam grupos e medem o impacto coletivo em tempo real.',
  },
];

export const dashboardMetrics = [
  { value: '147', unit: '', label: 'Scans este mês', delta: '+18%' },
  { value: '12,4', unit: 'kg', label: 'Material reciclado', delta: '+24%' },
  { value: '3,2', unit: 'kg', label: 'CO₂ evitado', delta: '+9%' },
  { value: '1.760', unit: '', label: 'EcoPoints acumulados', delta: '+42%' },
];

export const weeklyActivity = [
  { day: 'Seg', height: '55%', scans: 18 },
  { day: 'Ter', height: '72%', scans: 24 },
  { day: 'Qua', height: '36%', scans: 12 },
  { day: 'Qui', height: '92%', scans: 31 },
  { day: 'Sex', height: '82%', scans: 28 },
  { day: 'Sáb', height: '64%', scans: 22 },
  { day: 'Dom', height: '38%', scans: 12 },
];

export const recentScans = [
  { name: 'Garrafa PET — 600 ml', meta: 'Hoje, 09:42 · Lixeira amarela', points: '+12', tone: '' },
  { name: 'Caixa de papelão', meta: 'Hoje, 08:11 · Lixeira azul', points: '+8', tone: 'pap' },
  { name: 'Pilha AA · 4 un', meta: 'Ontem, 17:30 · Ponto especial', points: '+30', tone: 'met' },
  { name: 'Carregador de celular', meta: 'Ontem, 14:05 · E-lixo', points: '+22', tone: 'eco' },
  { name: 'Resto orgânico — 1,2 kg', meta: '19/04, 19:20 · Compostagem', points: '+6', tone: 'org' },
];

export const guideBins = [
  {
    id: 'azul',
    label: 'Azul',
    category: 'PAPEL',
    sub: 'Papel e Papelão',
    color: '#3b82f6',
    rgb: '59,130,246',
    particleShape: 'rect',
    photo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80',
    accepts: ['Jornal', 'Revista', 'Caderno', 'Caixa de papelão', 'Folhas de papel', 'Papel craft', 'Envelope', 'Caixa de cereal', 'Papel de embrulho', 'Caixa de sapato'],
    tip: 'Amasse o papelão para economizar espaço, mas não rasgue em pedaços muito pequenos — dificulta o processo de reciclagem nas usinas.',
    rejects: ['Papel higiênico', 'Guardanapo usado', 'Papel molhado', 'Papel carbono', 'Papel plastificado', 'Papel encerado'],
  },
  {
    id: 'vermelho',
    label: 'Vermelho',
    category: 'PLÁSTICO',
    sub: 'Embalagens Plásticas',
    color: '#ef4444',
    rgb: '239,68,68',
    particleShape: 'circle',
    photo: 'https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=900&q=80',
    accepts: ['Garrafa PET', 'Pote de iogurte', 'Embalagem de shampoo', 'Caixinha longa vida', 'Filme plástico', 'Pote de margarina', 'Embalagem de detergente', 'Tampa plástica', 'Sacola plástica', 'Canudo'],
    tip: 'Lave as embalagens antes de descartar. Plástico com resíduo de alimento contamina o lote inteiro e impede a reciclagem de tudo.',
    rejects: ['Fralda descartável', 'Esponja', 'Celofane', 'Talheres sujos', 'Mangueira velha', 'Plástico com isopor'],
  },
  {
    id: 'amarelo',
    label: 'Amarelo',
    category: 'METAL',
    sub: 'Metais e Alumínio',
    color: '#eab308',
    rgb: '234,179,8',
    particleShape: 'hex',
    photo: 'https://images.unsplash.com/photo-1567177662154-dfeb4c93b6ae?w=900&q=80',
    accepts: ['Lata de alumínio', 'Lata de conserva', 'Tampinha de garrafa', 'Folha de alumínio', 'Panela velha', 'Arame', 'Clipe de papel', 'Lata de tinta vazia', 'Prego', 'Parafuso'],
    tip: 'Latas de alumínio são 100% recicláveis infinitas vezes sem perda de qualidade. Amassar economiza espaço e facilita o transporte.',
    rejects: ['Pilha', 'Bateria', 'Lâmpada', 'Espelho', 'Metal com tinta tóxica', 'Eletrônico'],
  },
  {
    id: 'verde',
    label: 'Verde',
    category: 'VIDRO',
    sub: 'Vidros e Frascos',
    color: '#22c55e',
    rgb: '34,197,94',
    particleShape: 'diamond',
    photo: 'https://images.unsplash.com/photo-1550782674-fa597bc8d32d?w=900&q=80',
    accepts: ['Garrafa de vidro', 'Pote de conserva', 'Frasco de perfume', 'Vidro de remédio', 'Copo de vidro', 'Jarra', 'Vidro de maionese', 'Frasco de molho'],
    tip: 'Vidro quebrado pode ser reciclado — embale em papel antes de descartar para evitar acidentes. Nunca misture vidro temperado com vidro comum.',
    rejects: ['Espelho', 'Lâmpada', 'Vidro temperado (box)', 'Cristal', 'Cerâmica', 'Porcelana', 'Ampola médica'],
  },
  {
    id: 'cinza',
    label: 'Cinza',
    category: 'REJEITO',
    sub: 'Não Reciclável',
    color: '#6b7280',
    rgb: '107,114,128',
    particleShape: 'square',
    photo: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=900&q=80',
    accepts: ['Papel higiênico', 'Guardanapo usado', 'Fralda descartável', 'Absorvente', 'Toco de cigarro', 'Chiclete', 'Cotonete', 'Esponja usada', 'Papel carbono', 'Cerâmica quebrada'],
    tip: 'Rejeito é o que ainda não tem como ser reciclado. Mas cuidado — pilhas, remédios, óleo e eletrônicos têm descarte especial em ecopontos.',
    rejects: ['Pilha (ecoponto)', 'Remédio vencido (farmácia)', 'Óleo de cozinha (ecoponto)', 'Eletrônico (loja)', 'Lâmpada (ecoponto)'],
  },
];

export const aboutFeatures = [
  {
    title: 'Câmera que reconhece',
    description: 'Aponte para qualquer resíduo. A IA identifica material, categoria e destinação correta em segundos.',
    tag: 'Visão computacional',
  },
  {
    title: 'Mapa de descarte',
    description: 'Pontos de coleta a até 500 m, com horário, tipo de material aceito e rota até o local.',
    tag: 'Geolocalização',
  },
  {
    title: 'Gamificação real',
    description: 'EcoPoints, conquistas e ranking. Hábito virtuoso vira algo que você quer fazer todo dia.',
    tag: 'Engajamento',
  },
  {
    title: 'Grupos colaborativos',
    description: 'Escolas, empresas e turmas criam grupos e medem o impacto coletivo em tempo real.',
    tag: 'Comunidade',
  },
  {
    title: 'Relatórios ESG',
    description: 'Empresas exportam relatórios mensais de redução de pegada de carbono prontos para auditoria.',
    tag: 'Para empresas',
  },
  {
    title: 'Educação contextual',
    description: 'Cada scan vem com uma micro-lição sobre por que aquele material precisa daquela destinação.',
    tag: 'Aprendizado',
  },
];

export const impactStats = [
  { value: '80', suffix: 'mi t', label: 'Resíduos sólidos gerados anualmente no Brasil.', source: 'ABRELPE · 2024' },
  { value: '<4', suffix: '%', label: 'Reciclado de fato — o restante vai para aterro ou lixão.', source: 'SNIS · 2023' },
  { value: '76', suffix: '%', label: 'Brasileiros que querem reciclar mas não sabem como.', source: 'Akatu · 2023' },
  { value: '12', suffix: 'x', label: 'Mais engajamento em apps de gamificação ambiental.', source: 'Behavioral Insights · 2022' },
];

export const personas = [
  {
    initials: 'AM',
    role: 'Persona 01 · Escola',
    name: 'Ana Moreira',
    description: 'Estudante do 9º ano que usa o EcoScan na aula de ciências, com a turma toda competindo num ranking de bairro — gamificação puxa engajamento real de quem normalmente não pararia para separar lixo.',
    age: '14',
  },
  {
    initials: 'RS',
    role: 'Persona 02 · Condomínio',
    name: 'Rafael Sousa',
    description: 'Síndico que cria o grupo do prédio e gera relatório mensal do quanto material foi desviado do aterro. Transparência transforma reciclagem em pauta de assembleia.',
    age: '42',
  },
  {
    initials: 'LC',
    role: 'Persona 03 · Empresa',
    name: 'Luiza Costa',
    description: 'Gestora ESG que mede pegada de carbono dos colaboradores e converte EcoPoints em benefícios internos. Sustentabilidade vira métrica auditável, não greenwashing.',
    age: '38',
  },
  {
    initials: 'MO',
    role: 'Persona 04 · Cooperativa',
    name: 'Marcos Oliveira',
    description: 'Catador de cooperativa que recebe alertas dos pontos onde foi solicitada coleta, otimizando a rota diária. EcoScan vira ferramenta de trabalho, não só consumo.',
    age: '51',
  },
  {
    initials: 'CB',
    role: 'Persona 05 · Pesquisa',
    name: 'Clara Bento',
    description: 'Professora que usa os dados agregados para artigos sobre comportamento sustentável e educação ambiental. Cada scan vira amostra de campo num estudo nacional.',
    age: '29',
  },
];
