/**
 * Modular Department Directory Configuration
 * Supports multi-department civic grievance workflows across Indian Public Services.
 */
export const DEPARTMENTS = {
  railway: {
    id: 'railway',
    code: 'RLY',
    name: 'Railway Department',
    authority: 'Ministry of Railways / Indian Railways',
    description: 'Handles train passenger amenities, track safety, station cleanliness, platform infrastructure, signaling, and ticketing facilities.',
    icon: 'Train',
    categories: [
      'Pothole / Road Damage',
      'Garbage / Waste',
      'Water Leakage',
      'Broken Streetlight',
      'Drainage Problem',
      'Railway Infrastructure Damage',
      'Station Cleanliness',
      'Track / Railway Area Issue',
      'Passenger Facility Problem',
      'Coach Cleanliness & Bio-Toilet',
      'Other'
    ],
    urgencyLevels: ['Low', 'Medium', 'High', 'Critical'],
    slaHours: {
      Critical: 12,
      High: 24,
      Medium: 48,
      Low: 72
    }
  },
  municipality: {
    id: 'municipality',
    code: 'MUN',
    name: 'Municipal Corporation',
    authority: 'Urban Local Body & Civic Services',
    description: 'Handles urban sanitation, solid waste management, illegal encroachments, public park maintenance, and civic building repairs.',
    icon: 'Building2',
    categories: [
      'Garbage / Waste',
      'Illegal Encroachment',
      'Drainage Problem',
      'Public Park Maintenance',
      'Stray Animal Nuisance',
      'Public Toilet Cleanliness',
      'Building Construction Violation',
      'Other'
    ],
    urgencyLevels: ['Low', 'Medium', 'High', 'Critical'],
    slaHours: {
      Critical: 12,
      High: 24,
      Medium: 48,
      Low: 72
    }
  },
  water_supply: {
    id: 'water_supply',
    code: 'WTR',
    name: 'Water Supply & Sewerage Board',
    authority: 'Public Health Engineering & Jal Board',
    description: 'Handles drinking water pipelines, contaminated water supply, water pressure issues, sewer line blockages, and overflow.',
    icon: 'Droplets',
    categories: [
      'Water Leakage',
      'Contaminated Water Supply',
      'Low Pressure / No Water Supply',
      'Sewage Overflow',
      'Damaged Water Meter / Pipeline',
      'Open Manhole Hazard',
      'Other'
    ],
    urgencyLevels: ['Low', 'Medium', 'High', 'Critical'],
    slaHours: {
      Critical: 6,
      High: 18,
      Medium: 36,
      Low: 72
    }
  },
  roads_infra: {
    id: 'roads_infra',
    code: 'RDS',
    name: 'Roads & Infrastructure (PWD)',
    authority: 'Public Works Department / State Highway Authority',
    description: 'Handles arterial roads, potholes, damaged bridges, missing guardrails, traffic island upkeep, and broken pedestrian walkways.',
    icon: 'Milestone',
    categories: [
      'Pothole / Road Damage',
      'Broken Footpath / Paver Blocks',
      'Damaged Bridge / Flyover Guardrail',
      'Waterlogging on Main Carriage Way',
      'Broken Road Signboard / Divider',
      'Other'
    ],
    urgencyLevels: ['Low', 'Medium', 'High', 'Critical'],
    slaHours: {
      Critical: 12,
      High: 24,
      Medium: 48,
      Low: 72
    }
  },
  electricity: {
    id: 'electricity',
    code: 'ELE',
    name: 'Electricity Board (DISCOM)',
    authority: 'Power Distribution Corporation',
    description: 'Handles power outages, dangling live electric wires, damaged transformers, flickering/broken streetlights, and meter faults.',
    icon: 'Zap',
    categories: [
      'Broken Streetlight',
      'Hanging Live Wire / Shock Hazard',
      'Frequent Power Outage / Voltage Fluctuation',
      'Transformer Sparking / Blast Hazard',
      'Damaged Electric Pole',
      'Other'
    ],
    urgencyLevels: ['Low', 'Medium', 'High', 'Critical'],
    slaHours: {
      Critical: 4,
      High: 12,
      Medium: 24,
      Low: 48
    }
  },
  health_sanitation: {
    id: 'health_sanitation',
    code: 'HLT',
    name: 'Public Health & Sanitation',
    authority: 'Department of Health & Family Welfare',
    description: 'Handles government hospital amenities, mosquito fogging, vector control, medical waste disposal, and public clinic services.',
    icon: 'HeartPulse',
    categories: [
      'Mosquito Breeding / Stagnant Water',
      'Medical Waste Dumping',
      'PHC / Government Hospital Facility Issue',
      'Food Safety / Adulteration',
      'Other'
    ],
    urgencyLevels: ['Low', 'Medium', 'High', 'Critical'],
    slaHours: {
      Critical: 8,
      High: 24,
      Medium: 48,
      Low: 72
    }
  },
  education: {
    id: 'education',
    code: 'EDU',
    name: 'Department of Education',
    authority: 'School Education & Literacy Directorate',
    description: 'Handles government school infrastructure, mid-day meal quality, drinking water in schools, and classroom safety.',
    icon: 'GraduationCap',
    categories: [
      'Government School Building Damage',
      'Mid-Day Meal Quality Issue',
      'School Drinking Water & Sanitation',
      'Classroom Furniture / Blackboards',
      'Other'
    ],
    urgencyLevels: ['Low', 'Medium', 'High', 'Critical'],
    slaHours: {
      Critical: 12,
      High: 24,
      Medium: 48,
      Low: 72
    }
  },
  public_transport: {
    id: 'public_transport',
    code: 'TRN',
    name: 'State Public Transport (RTC / Metro)',
    authority: 'Road Transport Corporation & Metro Rail',
    description: 'Handles public buses, bus shelter maintenance, metro station cleanliness, accessibility ramps, and driver/conductor grievances.',
    icon: 'Bus',
    categories: [
      'Damaged Bus Shelter / Stand',
      'Overcrowded / Unscheduled Bus Route',
      'Metro Station Escalator / Lift Outage',
      'Bus Rash Driving / Safety Hazard',
      'Other'
    ],
    urgencyLevels: ['Low', 'Medium', 'High', 'Critical'],
    slaHours: {
      Critical: 8,
      High: 24,
      Medium: 48,
      Low: 72
    }
  }
};

export const getDepartmentById = (deptId = 'railway') => {
  return DEPARTMENTS[deptId] || DEPARTMENTS.railway;
};

export const getDepartmentCategories = (deptId = 'railway') => {
  const dept = getDepartmentById(deptId);
  return dept.categories || [];
};

export const getAllDepartmentsList = () => {
  return Object.values(DEPARTMENTS);
};
