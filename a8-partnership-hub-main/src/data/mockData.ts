import { 
  Opportunity,
  OpportunityStatus,
  GroupCompany,
  User,
  ChartDataPoint,
  LineChartDataPoint,
} from "@/types";

// Define BalanceData type to export
export interface BalanceData {
  partnerName: string;
  sent: number;
  received: number;
  balance: number;
}

// Group companies
export const groupCompanies: GroupCompany[] = [
  "Cryah",
  "Lomadee",
  "Monitfy",
  "Boone",
  "SAIO"
];

// External partners
export const externalPartners: string[] = [
  "TechCorp",
  "InnovateSoft",
  "GlobalSystems",
  "DataDrive",
  "NexusNetwork",
  "OptimaTech",
  "QuantumIT",
  "VisionaryTech",
  "PrimePartners",
  "FutureForge"
];

// Opportunity status options
export const statusOptions: OpportunityStatus[] = [
  "New",
  "In Progress",
  "Won",
  "Lost",
  "On Hold"
];

// Generate mock users
export const mockUsers: User[] = [
  { id: "u1", name: "João Silva", email: "joao@cryah.com", company: "Cryah", role: "admin" },
  { id: "u2", name: "Maria Costa", email: "maria@lomadee.com", company: "Lomadee", role: "user" },
  { id: "u3", name: "Pedro Santos", email: "pedro@monitfy.com", company: "Monitfy", role: "user" },
  { id: "u4", name: "Ana Pereira", email: "ana@boone.com", company: "Boone", role: "admin" },
  { id: "u5", name: "Carlos Oliveira", email: "carlos@saio.com", company: "SAIO", role: "user" },
  { id: "u6", name: "Luiza Almeida", email: "luiza@cryah.com", company: "Cryah", role: "user" },
  { id: "u7", name: "Rafael Torres", email: "rafael@lomadee.com", company: "Lomadee", role: "admin" },
  { id: "u8", name: "Fernanda Lima", email: "fernanda@monitfy.com", company: "Monitfy", role: "user" },
  { id: "u9", name: "Gustavo Rocha", email: "gustavo@boone.com", company: "Boone", role: "user" },
  { id: "u10", name: "Mariana Souza", email: "mariana@saio.com", company: "SAIO", role: "admin" }
];

// Generate a random date within the last year
const getRandomDate = () => {
  const today = new Date();
  const pastDate = new Date(today);
  pastDate.setMonth(today.getMonth() - Math.floor(Math.random() * 12));
  pastDate.setDate(Math.floor(Math.random() * 28) + 1);
  return pastDate.toISOString().split('T')[0];
};

// Generate a random phone number
const getRandomPhone = () => {
  return `(${Math.floor(Math.random() * 90) + 10}) 9${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`;
};

// Generate internal opportunities
const generateInternalOpportunities = (count: number): Opportunity[] => {
  const opportunities: Opportunity[] = [];

  for (let i = 0; i < count; i++) {
    const sourceCompanyIndex = Math.floor(Math.random() * groupCompanies.length);
    let targetCompanyIndex = Math.floor(Math.random() * groupCompanies.length);
    
    while (targetCompanyIndex === sourceCompanyIndex) {
      targetCompanyIndex = Math.floor(Math.random() * groupCompanies.length);
    }

    const sourceCompany = groupCompanies[sourceCompanyIndex];
    const targetCompany = groupCompanies[targetCompanyIndex];
    const responsibleUser = mockUsers.find(user => user.company === sourceCompany) || mockUsers[0];

    opportunities.push({
      id: `int-${i + 1}`,
      type: 'internal',
      date: getRandomDate(),
      responsibleName: responsibleUser.name,
      sourceCompany,
      targetCompany,
      status: statusOptions[Math.floor(Math.random() * statusOptions.length)],
      targetCompanyName: `Client ${i + 1}`,
      contactName: `Contact ${i + 1}`,
      contactEmail: `contact${i + 1}@example.com`,
      contactPhone: getRandomPhone(),
      notes: Math.random() > 0.3 ? `This is a potential opportunity for ${targetCompany}.` : undefined,
      history: [
        {
          id: `hist-int-${i}-1`,
          date: getRandomDate(),
          user: responsibleUser.name,
          action: "Created opportunity"
        }
      ],
      attachments: Math.random() > 0.7 ? [
        {
          id: `att-${i}-1`,
          name: "Proposal.pdf",
          type: "application/pdf",
          size: Math.floor(Math.random() * 5000000),
          uploadDate: getRandomDate(),
          uploadedBy: responsibleUser.name,
          url: "#"
        }
      ] : undefined
    });
  }

  return opportunities;
};

// Generate incoming opportunities from external partners
const generateIncomingOpportunities = (count: number): Opportunity[] => {
  const opportunities: Opportunity[] = [];

  for (let i = 0; i < count; i++) {
    const partnerName = externalPartners[Math.floor(Math.random() * externalPartners.length)];
    const targetCompany = groupCompanies[Math.floor(Math.random() * groupCompanies.length)];
    const responsibleUser = mockUsers.find(user => user.company === targetCompany) || mockUsers[0];

    opportunities.push({
      id: `inc-${i + 1}`,
      type: 'incoming',
      date: getRandomDate(),
      responsibleName: responsibleUser.name,
      partnerName,
      targetCompany,
      status: statusOptions[Math.floor(Math.random() * statusOptions.length)],
      targetCompanyName: `External Client ${i + 1}`,
      contactName: `External Contact ${i + 1}`,
      contactEmail: `extcontact${i + 1}@example.com`,
      contactPhone: getRandomPhone(),
      notes: Math.random() > 0.3 ? `Lead received from ${partnerName}.` : undefined,
      history: [
        {
          id: `hist-inc-${i}-1`,
          date: getRandomDate(),
          user: responsibleUser.name,
          action: `Received opportunity from ${partnerName}`
        }
      ],
      attachments: Math.random() > 0.7 ? [
        {
          id: `att-inc-${i}-1`,
          name: "Partner Info.docx",
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          size: Math.floor(Math.random() * 3000000),
          uploadDate: getRandomDate(),
          uploadedBy: responsibleUser.name,
          url: "#"
        }
      ] : undefined
    });
  }

  return opportunities;
};

// Generate outgoing opportunities to external partners
const generateOutgoingOpportunities = (count: number): Opportunity[] => {
  const opportunities: Opportunity[] = [];

  for (let i = 0; i < count; i++) {
    // Get 1-3 random partners for each opportunity
    const partnerCount = Math.floor(Math.random() * 3) + 1;
    const partners: string[] = [];
    const usedIndexes: number[] = [];
    
    for (let j = 0; j < partnerCount; j++) {
      let partnerIndex: number;
      do {
        partnerIndex = Math.floor(Math.random() * externalPartners.length);
      } while (usedIndexes.includes(partnerIndex));
      
      usedIndexes.push(partnerIndex);
      partners.push(externalPartners[partnerIndex]);
    }

    const sourceCompany = groupCompanies[Math.floor(Math.random() * groupCompanies.length)];
    const responsibleUser = mockUsers.find(user => user.company === sourceCompany) || mockUsers[0];

    opportunities.push({
      id: `out-${i + 1}`,
      type: 'outgoing',
      date: getRandomDate(),
      responsibleName: responsibleUser.name,
      sourceCompany,
      partners,
      status: statusOptions[Math.floor(Math.random() * statusOptions.length)],
      targetCompanyName: `Outgoing Client ${i + 1}`,
      contactName: `Outgoing Contact ${i + 1}`,
      contactEmail: `outcontact${i + 1}@example.com`,
      contactPhone: getRandomPhone(),
      notes: Math.random() > 0.3 ? `Opportunity shared with ${partners.join(', ')}.` : undefined,
      history: [
        {
          id: `hist-out-${i}-1`,
          date: getRandomDate(),
          user: responsibleUser.name,
          action: `Sent opportunity to ${partners.join(', ')}`
        }
      ],
      attachments: Math.random() > 0.7 ? [
        {
          id: `att-out-${i}-1`,
          name: "Opportunity Details.xlsx",
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          size: Math.floor(Math.random() * 2000000),
          uploadDate: getRandomDate(),
          uploadedBy: responsibleUser.name,
          url: "#"
        }
      ] : undefined
    });
  }

  return opportunities;
};

// Generate all opportunities
export const mockOpportunities: Opportunity[] = [
  ...generateInternalOpportunities(35),
  ...generateIncomingOpportunities(25),
  ...generateOutgoingOpportunities(20)
];

// Calculate monthly opportunity counts for charts
export const getMonthlyDataForChart = (): LineChartDataPoint[] => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentYear = new Date().getFullYear();
  const data: LineChartDataPoint[] = [];

  for (let i = 0; i < 12; i++) {
    const monthData: LineChartDataPoint = { name: months[i] };
    
    // Initialize counts for each company
    groupCompanies.forEach(company => {
      monthData[company] = 0;
    });

    // Filter opportunities for this month and count by company
    mockOpportunities.forEach(opp => {
      const oppDate = new Date(opp.date);
      if (oppDate.getMonth() === i && oppDate.getFullYear() === currentYear) {
        if (opp.type === 'internal') {
          monthData[opp.sourceCompany] = (monthData[opp.sourceCompany] as number) + 1;
        } else if (opp.type === 'outgoing') {
          monthData[opp.sourceCompany] = (monthData[opp.sourceCompany] as number) + 1;
        }
      }
    });

    data.push(monthData);
  }

  return data;
};

// Calculate partner balance data
export const getPartnerBalanceData = (): BalanceData[] => {
  const balanceData: BalanceData[] = [];

  externalPartners.forEach(partner => {
    const sent = mockOpportunities.filter(
      opp => opp.type === 'outgoing' && opp.partners && opp.partners.includes(partner)
    ).length;
    
    const received = mockOpportunities.filter(
      opp => opp.type === 'incoming' && opp.partnerName === partner
    ).length;

    balanceData.push({
      partnerName: partner,
      sent,
      received,
      balance: received - sent
    });
  });

  return balanceData;
};

// Calculate opportunity distribution by company
export const getOpportunityDistributionByCompany = (): ChartDataPoint[] => {
  const distribution: Record<string, number> = {};

  groupCompanies.forEach(company => {
    distribution[company] = 0;
  });

  mockOpportunities.forEach(opp => {
    if (opp.type === 'internal') {
      distribution[opp.sourceCompany] += 1;
    } else if (opp.type === 'outgoing') {
      distribution[opp.sourceCompany] += 1;
    }
  });

  return Object.entries(distribution).map(([name, value]) => ({ name, value }));
};

// Calculate quarterly opportunity data
export const getQuarterlyData = (): ChartDataPoint[] => {
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  const data: ChartDataPoint[] = quarters.map(name => ({ name, value: 0 }));
  const currentYear = new Date().getFullYear();

  mockOpportunities.forEach(opp => {
    const oppDate = new Date(opp.date);
    if (oppDate.getFullYear() === currentYear) {
      const quarter = Math.floor(oppDate.getMonth() / 3);
      data[quarter].value += 1;
    }
  });

  return data;
};

// Get intragroup exchange data
export const getIntraGroupExchangeData = () => {
  const exchangeMatrix: Record<string, Record<string, number>> = {};

  groupCompanies.forEach(source => {
    exchangeMatrix[source] = {};
    groupCompanies.forEach(target => {
      exchangeMatrix[source][target] = 0;
    });
  });

  mockOpportunities
    .filter(opp => opp.type === 'internal')
    .forEach(opp => {
      const internalOpp = opp as any; // Type issue workaround
      exchangeMatrix[internalOpp.sourceCompany][internalOpp.targetCompany] += 1;
    });

  return exchangeMatrix;
};

// Calculate the overall balance between A&eight group and external partners
export const getGroupPartnerBalanceData = () => {
  // Total sent to external partners
  const totalSent = mockOpportunities.filter(
    opp => opp.type === 'outgoing'
  ).length;
  
  // Total received from external partners
  const totalReceived = mockOpportunities.filter(
    opp => opp.type === 'incoming'
  ).length;
  
  // Balance calculation
  const balance = totalReceived - totalSent;
  
  // Monthly balance data for chart
  const monthlyBalanceData = Array.from({ length: 12 }, (_, i) => {
    const month = new Date();
    month.setMonth(i);
    const monthName = month.toLocaleString('default', { month: 'short' });
    
    const sent = mockOpportunities.filter(opp => {
      const oppDate = new Date(opp.date);
      return opp.type === 'outgoing' && oppDate.getMonth() === i;
    }).length;
    
    const received = mockOpportunities.filter(opp => {
      const oppDate = new Date(opp.date);
      return opp.type === 'incoming' && oppDate.getMonth() === i;
    }).length;
    
    return {
      name: monthName,
      sent,
      received,
      balance: received - sent
    };
  });
  
  return {
    totalSent,
    totalReceived,
    balance,
    monthlyBalanceData
  };
};
