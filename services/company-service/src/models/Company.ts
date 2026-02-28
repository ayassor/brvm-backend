import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface CompanyAttributes {
  id: number; name: string; ticker: string; sector: string | null;
  country: string | null; description: string | null; logo_url: string | null;
  market_cap: number | null; is_active: boolean;
}
interface CompanyCreationAttributes extends Optional<CompanyAttributes, 'id' | 'sector' | 'country' | 'description' | 'logo_url' | 'market_cap' | 'is_active'> {}

export class Company extends Model<CompanyAttributes, CompanyCreationAttributes> implements CompanyAttributes {
  public id!: number; public name!: string; public ticker!: string;
  public sector!: string | null; public country!: string | null;
  public description!: string | null; public logo_url!: string | null;
  public market_cap!: number | null; public is_active!: boolean;
}

Company.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(255), allowNull: false },
  ticker: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  sector: { type: DataTypes.STRING(100) },
  country: { type: DataTypes.STRING(100) },
  description: { type: DataTypes.TEXT },
  logo_url: { type: DataTypes.STRING(500) },
  market_cap: { type: DataTypes.DECIMAL(20, 2) },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { sequelize, tableName: 'companies', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

export default Company;
