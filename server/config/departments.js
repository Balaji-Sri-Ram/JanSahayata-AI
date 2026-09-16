/**
 * Modular Department Directory Configuration
 * Designed to support future departments (Municipality, Water Supply, Electricity, etc.)
 * without altering core complaint processing pipelines.
 */
export const DEPARTMENTS = {
  railway: {
    id: 'railway',
    code: 'RLY',
    name: 'Railway Department',
    authority: 'Indian Railways / Ministry of Railways',
    description: 'Handles passenger amenities, track safety, station cleanliness, railway infrastructure, and ticketing facilities.',
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
    authority: 'Urban Local Body',
    description: 'Handles city roads, urban sanitation, parks, and local civic issues.',
    categories: [
      'Pothole / Road Damage',
      'Garbage / Waste',
      'Broken Streetlight',
      'Drainage Problem',
      'Encroachment',
      'Public Park Maintenance',
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
    authority: 'Public Health Engineering',
    description: 'Handles drinking water pipelines, contamination, and sewage leaks.',
    categories: [
      'Water Leakage',
      'Contaminated Water Supply',
      'Low Pressure / No Water',
      'Sewage Overflow',
      'Other'
    ],
    urgencyLevels: ['Low', 'Medium', 'High', 'Critical'],
    slaHours: {
      Critical: 6,
      High: 18,
      Medium: 36,
      Low: 72
    }
  }
};

export const getDepartmentById = (deptId = 'railway') => {
  return DEPARTMENTS[deptId] || DEPARTMENTS.railway;
};

export const getDepartmentCategories = (deptId = 'railway') => {
  const dept = getDepartmentById(deptId);
  return dept.categories;
};
