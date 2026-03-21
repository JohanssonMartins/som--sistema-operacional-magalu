export type Role = 'ADMIN' | 'AUDITOR' | 'DIRETORIA' | 'GERENTE_DIVISIONAL' | 'GERENTE_DO_CD' | 'DONO_DO_PILAR' | 'COLABORADOR';

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  unidade: string;
  password?: string;
  photo?: string;
  active: boolean;
};

export const MOCK_USERS: User[] = [
  { id: '1', name: 'Ana (Admin)', email: 'admin@magalu.com', role: 'ADMIN', password: '123', unidade: 'Master', active: true },
  { id: '7', name: 'Gisele (Diretoria)', email: 'diretoria@magalu.com', role: 'DIRETORIA', password: '123', unidade: 'Master', active: true },
  { id: '2', name: 'Beto (Gerente CD)', email: 'gerentecd@magalu.com', role: 'GERENTE_DO_CD', password: '123', unidade: '6991', active: true },
  { id: '3', name: 'Carlos (Colab)', email: 'colab@magalu.com', role: 'COLABORADOR', password: '123', unidade: '994', active: true },
  { id: '4', name: 'Diana (Divisional)', email: 'divisional@magalu.com', role: 'GERENTE_DIVISIONAL', password: '123', unidade: 'Master', active: true },
  { id: '5', name: 'Eduardo (Dono Pilar)', email: 'donopilar@magalu.com', role: 'DONO_DO_PILAR', password: '123', unidade: '6991', active: true },
  { id: '6', name: 'Fábio (Auditor)', email: 'auditor@magalu.com', role: 'AUDITOR', password: '123', unidade: 'Master', active: true },
];

export type ChecklistItem = {
  id: string;
  code: string;
  pilar: string;
  bloco: string;
  trilha: string;
  item: string;
  descricao: string;
  criterios?: string;
  exigeEvidencia: boolean;
  ativo: boolean;
  order: number;
  assigneeId?: string;
  assigneeId2?: string;
  assigneeId3?: string;
  completed?: boolean;
  aderente?: boolean;
  completedAt?: string;
  nossaAcao?: string;
  periodoAcao?: string;
  justificativaResponsavel?: string;
  prioridade?: 'Alta' | 'Média' | 'Baixa';
  prazo?: string;
  evidencias?: { name: string; url: string; category: string }[];
  unidade?: string;
  auditoriaTexto?: string;
  auditoriaRealizada?: boolean;
  auditoriaAderente?: boolean;
  auditoriaCompletedAt?: string;
};

export type EvidenciaAutoauditoria = {
  id?: string;
  name: string;
  url: string; // Pode ser a URL ou base64
};

export type AutoauditoriaItem = {
  id?: string;
  baseItemId: string;
  score?: string;
  nossaAcao?: string;
  evidencias?: EvidenciaAutoauditoria[];
};

export type Autoauditoria = {
  id?: string;
  unidade: string;
  mesAno: string;
  tipo?: 'AUTO' | 'EXTERNA';
  status?: string;
  items: AutoauditoriaItem[];
  createdAt?: string;
  updatedAt?: string;
};

export const INITIAL_CHECKLIST: ChecklistItem[] = [
  { id: '1', pilar: 'Pessoas', bloco: 'Reconhecimento', trilha: 'Básico bem feito', item: 'Programa de reconhecimento formalizado e divulgado?', descricao: 'Verificar se existe um programa de reconhecimento (ex: funcionário do mês, bônus) e se o time o conhece.', exigeEvidencia: true, ativo: true, order: 1, code: 'PES-REC-01' },
  { id: '2', pilar: 'Pessoas', bloco: 'Reconhecimento', trilha: 'Básico bem feito', item: 'Ações de reconhecimento são executadas na frequência definida?', descricao: 'Conferir se as cerimônias ou pagamentos de reconhecimento ocorrem conforme o planejado.', exigeEvidencia: true, ativo: true, order: 2, code: 'PES-REC-02' },
  { id: '3', pilar: 'Pessoas', bloco: 'Carreira', trilha: 'Básico bem feito', item: 'Plano de carreira (Y-career) é divulgado e acessível?', descricao: 'Garantir que os colaboradores saibam as possibilidades de crescimento na empresa.', exigeEvidencia: false, ativo: true, order: 1, code: 'PES-CAR-01' },
  { id: '4', pilar: 'Pessoas', bloco: 'Carreira', trilha: 'Básico bem feito', item: 'Conversas sobre carreira são realizadas periodicamente?', descricao: 'Verificar se os líderes conversam com seus liderados sobre suas aspirações de carreira.', exigeEvidencia: false, ativo: true, order: 2, code: 'PES-CAR-02' },
  { id: '5', pilar: 'Pessoas', bloco: 'Desenvolvimento', trilha: 'Básico bem feito', item: 'PDI (Plano de Desenvolvimento Individual) é utilizado?', descricao: 'Checar se os colaboradores possuem um PDI ativo e se há acompanhamento do líder.', exigeEvidencia: true, ativo: true, order: 1, code: 'PES-DES-01' },
  { id: '6', pilar: 'Pessoas', bloco: 'Desenvolvimento', trilha: 'Básico bem feito', item: 'Treinamentos obrigatórios estão em dia?', descricao: 'Validar se 100% do time completou os treinamentos de segurança, compliance, etc.', exigeEvidencia: true, ativo: true, order: 2, code: 'PES-DES-02' },
  { id: '7', pilar: 'Pessoas', bloco: 'Clima', trilha: 'Básico bem feito', item: 'Pesquisa de clima é respondida pela equipe?', descricao: 'Acompanhar a adesão da equipe à pesquisa de clima organizacional.', exigeEvidencia: false, ativo: true, order: 1, code: 'PES-CLI-01' },
  { id: '8', pilar: 'Pessoas', bloco: 'Clima', trilha: 'Básico bem feito', item: 'Plano de ação da pesquisa de clima anterior foi executado?', descricao: 'Verificar se as ações propostas para melhorar o clima foram implementadas.', exigeEvidencia: true, ativo: true, order: 2, code: 'PES-CLI-02' },
  { id: '9', pilar: 'Pessoas', bloco: 'Retenção', trilha: 'Básico bem feito', item: 'Entrevistas de desligamento são realizadas?', descricao: 'Verificar se todas as saídas voluntárias passam por entrevista de desligamento para coletar feedback.', exigeEvidencia: true, ativo: true, order: 1, code: 'PES-RET-01' },
  { id: '10', pilar: 'Pessoas', bloco: 'Atração', trilha: 'Básico bem feito', item: 'Vagas são divulgadas internamente antes de abertas ao mercado?', descricao: 'Confirmar se o processo de recrutamento interno é priorizado.', exigeEvidencia: false, ativo: true, order: 1, code: 'PES-ATR-01' },
  {
    id: '44',
    pilar: 'Pessoas',
    bloco: 'Atração',
    trilha: 'Básico bem feito',
    item: 'Existe banco de talentos estruturado e atualizado?',
    descricao: 'Verificar a existência e o volume do banco de talentos em relação ao quadro ativo.',
    criterios: '3 - Existe banco estruturado, atualizado e com volume ≥ 10% do quadro ativo da unidade, sendo utilizado no preenchimento de vagas.\n1 - Existe banco de talentos estruturado, atualizado e utilizado ativamente no preenchimento de vagas, com volume mínimo de ≥9% do quadro ativo da unidade\n0 - Não existe banco de talentos estruturado.',
    exigeEvidencia: true,
    ativo: true,
    order: 2,
    code: 'PES-ATR-02'
  },
  { id: '11', pilar: 'Pessoas', bloco: 'Cultura', trilha: 'Básico bem feito', item: 'Valores da empresa são comunicados em reuniões de time?', descricao: 'Verificar se a cultura e os valores são reforçados na rotina da liderança.', exigeEvidencia: false, ativo: true, order: 1, code: 'PES-CUL-01' },
  { id: '12', pilar: 'Pessoas', bloco: 'Diversidade', trilha: 'Básico bem feito', item: 'Ações de conscientização sobre diversidade e inclusão são realizadas?', descricao: 'Checar a realização de eventos, palestras ou comunicados sobre o tema.', exigeEvidencia: true, ativo: true, order: 1, code: 'PES-DIV-01' },
  { id: '13', pilar: 'Segurança', bloco: 'Gestão de Acidente', trilha: 'Básico bem feito', item: 'Relatórios de acidente (CAT) são preenchidos e investigados no prazo?', descricao: 'Verificar se todos os acidentes geram um relatório de investigação com causa raiz.', exigeEvidencia: true, ativo: true, order: 1, code: 'SSM-GES-01' },
  { id: '14', pilar: 'Segurança', bloco: 'Gestão de Acidente', trilha: 'Básico bem feito', item: 'Plano de ação para acidentes é acompanhado semanalmente?', descricao: 'Conferir se as ações corretivas e preventivas são registradas e têm seu status atualizado.', exigeEvidencia: true, ativo: true, order: 2, code: 'SSM-GES-02' },
  { id: '15', pilar: 'Segurança', bloco: 'Ergonomia', trilha: 'Básico bem feito', item: 'Análise Ergonômica do Trabalho (AET) está atualizada?', descricao: 'Verificar se o documento existe e contempla todas as funções atuais do CD.', exigeEvidencia: true, ativo: true, order: 1, code: 'SSM-ERG-01' },
  { id: '16', pilar: 'Segurança', bloco: 'Ergonomia', trilha: 'Básico bem feito', item: 'Equipe recebeu treinamento sobre postura e ergonomia?', descricao: 'Checar listas de presença ou registros de treinamento sobre práticas ergonômicas.', exigeEvidencia: true, ativo: true, order: 2, code: 'SSM-ERG-02' },
  { id: '17', pilar: 'Sustentabilidade', bloco: 'Gestão de Fornecedores', trilha: 'Básico bem feito', item: 'Fornecedores críticos de SSMA são homologados?', descricao: 'Verificar documentação e contratos dos fornecedores.', exigeEvidencia: true, ativo: true, order: 1, code: 'SSM-GES-01' },
  { id: '18', pilar: 'Segurança', bloco: 'Segurança Sanitária', trilha: 'Básico bem feito', item: 'Plano de limpeza e higienização de áreas comuns e armazém é seguido?', descricao: 'Conferir cronogramas de limpeza e registros de execução.', exigeEvidencia: true, ativo: true, order: 1, code: 'SSM-SEG-01' },
  { id: '19', pilar: 'Segurança', bloco: 'Segurança Sanitária', trilha: 'Básico bem feito', item: 'Controle de pragas está em dia?', descricao: 'Verificar o certificado de execução do serviço, válido para o período.', exigeEvidencia: true, ativo: true, order: 2, code: 'SSM-SEG-02' },
  { id: '20', pilar: 'Sustentabilidade', bloco: 'PAE', trilha: 'Básico bem feito', item: 'Plano de Atendimento a Emergências (PAE) está divulgado e acessível?', descricao: 'Verificar se o PAE está em local visível e se a equipe sabe onde encontrá-lo.', exigeEvidencia: false, ativo: true, order: 1, code: 'SSM-PAE-01' },
  { id: '21', pilar: 'Sustentabilidade', bloco: 'PAE', trilha: 'Básico bem feito', item: 'Simulados de emergência são realizados anualmente?', descricao: 'Checar relatório do último simulado, com data, participantes e lições aprendidas.', exigeEvidencia: true, ativo: true, order: 2, code: 'SSM-PAE-02' },
  { id: '22', pilar: 'Sustentabilidade', bloco: 'Manutenção', trilha: 'Básico bem feito', item: 'Plano de manutenção preventiva de equipamentos de segurança é cumprido?', descricao: 'Verificar ordens de serviço ou planilhas de controle da manutenção.', exigeEvidencia: true, ativo: true, order: 1, code: 'SSM-MAN-01' },
  { id: '23', pilar: 'Segurança', bloco: 'Saúde', trilha: 'Básico bem feito', item: 'PCMSO está atualizado e os ASOs estão em dia?', descricao: 'Verificar a validade do PCMSO e a conformidade dos ASOs dos colaboradores.', exigeEvidencia: true, ativo: true, order: 1, code: 'SSM-SAU-01' },
  { id: '24', pilar: 'Sustentabilidade', bloco: 'Gestão Meio Ambiente', trilha: 'Básico bem feito', item: 'Licenças ambientais (operação, bombeiros) estão válidas?', descricao: 'Conferir a data de validade de todas as licenças obrigatórias para a operação do CD.', exigeEvidencia: true, ativo: true, order: 1, code: 'SSM-GES-01' },
  { id: '25', pilar: 'Sustentabilidade', bloco: 'Gestão Meio Ambiente', trilha: 'Básico bem feito', item: 'Gerenciamento de resíduos (coleta seletiva, descarte) é feito corretamente?', descricao: 'Observar a segregação dos resíduos e os registros de descarte.', exigeEvidencia: true, ativo: true, order: 2, code: 'SSM-GES-02' },
  { id: '26', pilar: 'Segurança', bloco: 'Comportamento Seguro', trilha: 'Básico bem feito', item: 'Programa de observação de comportamento seguro (ex: DDS) está ativo?', descricao: 'Verificar a realização de Diálogos Diários de Segurança e os temas abordados.', exigeEvidencia: true, ativo: true, order: 1, code: 'SSM-COM-01' },
  { id: '27', pilar: 'Cliente', bloco: 'Prazo', trilha: 'Básico bem feito', item: 'Indicador de On-Time Delivery (OTD) é acompanhado diariamente?', descricao: 'Verificar se há um painel ou relatório diário de acompanhamento do OTD.', exigeEvidencia: true, ativo: true, order: 1, code: 'CLI-PRA-01' },
  { id: '28', pilar: 'Cliente', bloco: 'Prazo', trilha: 'Básico bem feito', item: 'Análise de causa raiz para desvios de prazo é realizada?', descricao: 'Checar se os principais motivos de atraso são investigados e tratados.', exigeEvidencia: true, ativo: true, order: 2, code: 'CLI-PRA-02' },
  { id: '29', pilar: 'Cliente', bloco: 'Gestão do Transportador', trilha: 'Básico bem feito', item: 'Reuniões de performance com as principais transportadoras são realizadas?', descricao: 'Verificar atas de reunião ou convites que comprovem a rotina.', exigeEvidencia: true, ativo: true, order: 1, code: 'CLI-GES-01' },
  { id: '30', pilar: 'Cliente', bloco: 'Encantamento', trilha: 'Básico bem feito', item: 'Ações para encantar o cliente são executadas?', descricao: 'Verificar se as iniciativas de encantamento definidas estão sendo aplicadas.', exigeEvidencia: false, ativo: true, order: 1, code: 'CLI-ENC-01' },
  { id: '31', pilar: 'Cliente', bloco: 'Experiência do Cliente', trilha: 'Básico bem feito', item: 'Indicadores de satisfação (NPS, Reclame Aqui) são monitorados?', descricao: 'Verificar se a liderança acompanha os indicadores e discute os resultados com o time.', exigeEvidencia: true, ativo: true, order: 1, code: 'CLI-EXP-01' },
  { id: '32', pilar: 'Gestão', bloco: 'Maga Lean', trilha: 'Básico bem feito', item: 'Ferramentas do Maga Lean (ex: 5S, Kaizen) são aplicadas na rotina?', descricao: 'Verificar a existência de quadros de gestão à vista, relatórios de 5S ou eventos Kaizen.', exigeEvidencia: true, ativo: true, order: 1, code: 'GES-MAG-01' },
  { id: '33', pilar: 'Gestão', bloco: 'Resolução de problema', trilha: 'Básico bem feito', item: 'Método de Análise e Solução de Problemas (MASP/PDCA) é utilizado para desvios?', descricao: 'Verificar se problemas complexos são tratados com uma metodologia estruturada.', exigeEvidencia: true, ativo: true, order: 1, code: 'GES-RES-01' },
  { id: '34', pilar: 'Gestão', bloco: 'Kaizen', trilha: 'Básico bem feito', item: 'Eventos Kaizen de melhoria contínua são realizados?', descricao: 'Checar o cronograma e os relatórios de resultados dos eventos Kaizen.', exigeEvidencia: true, ativo: true, order: 1, code: 'GES-KAI-01' },
  { id: '35', pilar: 'Gestão', bloco: 'Conselho', trilha: 'Básico bem feito', item: 'Reunião de conselho do CD ocorre na frequência definida?', descricao: 'Verificar ata ou pauta da última reunião de conselho.', exigeEvidencia: true, ativo: true, order: 1, code: 'GES-CON-01' },
  { id: '36', pilar: 'Gestão', bloco: '5S', trilha: 'Básico bem feito', item: 'Auditorias de 5S são realizadas nas áreas?', descricao: 'Verificar os relatórios de auditoria de 5S e os planos de ação gerados.', exigeEvidencia: true, ativo: true, order: 1, code: 'GES-5S-01' },
  { id: '37', pilar: 'Gestão', bloco: 'Agenda da Rotina', trilha: 'Básico bem feito', item: 'Líderes possuem uma agenda padrão de rotinas (reuniões, gemba)?', descricao: 'Verificar se a agenda da liderança contempla os rituais de gestão definidos.', exigeEvidencia: false, ativo: true, order: 1, code: 'GES-AGE-01' },
  { id: '38', pilar: 'Armazém', bloco: 'Recebimento', trilha: 'Básico bem feito', item: 'Processo de conferência no recebimento (físico vs. nota) é seguido?', descricao: 'Acompanhar um recebimento para validar a execução do processo padrão.', exigeEvidencia: false, ativo: true, order: 1, code: 'ARM-REC-01' },
  { id: '39', pilar: 'Armazém', bloco: 'Acuracidade', trilha: 'Básico bem feito', item: 'Contagem cíclica de inventário é realizada diariamente?', descricao: 'Verificar o cronograma de contagem e os relatórios de acuracidade.', exigeEvidencia: true, ativo: true, order: 1, code: 'ARM-ACU-01' },
  { id: '40', pilar: 'Armazém', bloco: 'Acuracidade', trilha: 'Básico bem feito', item: 'Análise de divergências de estoque é feita e tratada?', descricao: 'Checar se as divergências encontradas na contagem geram investigação e plano de ação.', exigeEvidencia: true, ativo: true, order: 2, code: 'ARM-ACU-02' },
  { id: '41', pilar: 'Armazém', bloco: 'Expedição Leves', trilha: 'Básico bem feito', item: 'Conferência de picking e packing é feita por sistema ou dupla checagem?', descricao: 'Validar se o processo de expedição possui uma etapa de conferência para evitar erros.', exigeEvidencia: false, ativo: true, order: 1, code: 'ARM-EXP-01' },
  { id: '42', pilar: 'Armazém', bloco: 'Expedição Pesado', trilha: 'Básico bem feito', item: 'Checklist de carregamento de veículos é utilizado?', descricao: 'Verificar o preenchimento do checklist que garante a segurança e a qualidade do carregamento.', exigeEvidencia: true, ativo: true, order: 1, code: 'ARM-EXP-01' },
  { id: '43', pilar: 'Armazém', bloco: 'Intralogística', trilha: 'Básico bem feito', item: 'Abastecimento de picking é feito de forma a não interromper a operação?', descricao: 'Observar a operação para checar se há paradas por falta de produto na área de picking.', exigeEvidencia: false, ativo: true, order: 1, code: 'ARM-INT-01' },
];
