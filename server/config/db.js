import mongoose from 'mongoose';
import { User } from '../models/User.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/grievance_platform');
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);

    // Automatically synchronize Super Admin & Official Department Officers
    try {
      await User.updateMany(
        { role: 'SUPER_ADMIN' },
        { $set: { name: 'Phaniswar' } }
      );

      // 1. K. Kiran Sai Karthik -> Railway Department
      await User.updateOne(
        { $or: [{ email: 'officer.railway@jansahayata.gov.in' }, { employeeId: 'RLY-EMP-1001' }] },
        { $set: { name: 'K. Kiran Sai Karthik' } }
      );

      // 2. P. Balaji Sri Ram -> Water Supply & Sewerage Board
      await User.updateOne(
        { $or: [{ email: 'officer.water@jansahayata.gov.in' }, { employeeId: 'WTR-EMP-2001' }] },
        { $set: { name: 'P. Balaji Sri Ram' } }
      );

      // 3. P. Balu Lakshman Pavan -> Municipal Corporation
      await User.updateOne(
        { $or: [{ email: 'officer.muni@jansahayata.gov.in' }, { employeeId: 'MUN-EMP-3001' }] },
        { $set: { name: 'P. Balu Lakshman Pavan' } }
      );

      // 4. K. Pavan Kalyan -> Roads & Infrastructure (PWD)
      await User.updateOne(
        { $or: [{ email: 'officer.roads@jansahayata.gov.in' }, { employeeId: 'RDS-EMP-4001' }] },
        { $set: { name: 'K. Pavan Kalyan' } }
      );

      // 5. Allada Pavan -> Electricity Board (DISCOM)
      const existingEleOfficer = await User.findOne({
        $or: [{ email: 'officer.electricity@jansahayata.gov.in' }, { employeeId: 'ELE-EMP-5001' }, { name: 'Allada Pavan' }]
      });

      if (!existingEleOfficer) {
        const officerPasswordHash = await User.hashPassword('Officer@2026!');
        await User.create({
          name: 'Allada Pavan',
          email: 'officer.electricity@jansahayata.gov.in',
          phone: '+91 94400 55667',
          passwordHash: officerPasswordHash,
          role: 'EMPLOYEE',
          department: {
            id: 'electricity',
            code: 'ELE',
            name: 'Electricity Board (DISCOM)'
          },
          employeeId: 'ELE-EMP-5001',
          designation: 'Assistant Divisional Engineer (Power & Distribution)',
          status: 'Active'
        });
        console.log('[Database] Created Officer: Allada Pavan (Electricity Board)');
      } else {
        await User.updateOne(
          { _id: existingEleOfficer._id },
          { $set: { name: 'Allada Pavan' } }
        );
      }
    } catch (e) {
      console.warn('[Database Sync Warning]', e.message);
    }
  } catch (error) {
    console.error(`[Database Error] ${error.message}`);
    process.exit(1);
  }
};
