import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface CompanyAttributes {
  id: number; name: string; ticker: string; sector: string | null;
  country: string | null; description: string | null; logo_url: string | null;
  market_cap: number | null; is_active: boolean;
  // Fundamentals fields
  shares_count: number | null;
  ceo: string | null; ceo_title: string | null;
  founded: number | null; employees: number | null;
  website: string | null; free_float_pct: number | null;
  activities: string[] | null; certifications: string[] | null;
}
interface CompanyCreationAttributes extends Optional<CompanyAttributes,
  'id' | 'sector' | 'country' | 'description' | 'logo_url' | 'market_cap' | 'is_active' |
  'shares_count' | 'ceo' | 'ceo_title' | 'founded' | 'employees' | 'website' |
  'free_float_pct' | 'activities' | 'certifications'
> {}

export class Company extends Model<CompanyAttributes, CompanyCreationAttributes> implements CompanyAttributes {
  public id!: number; public name!: string; public ticker!: string;
  public sector!: string | null; public country!: string | null;
  public description!: string | null; public logo_url!: string | null;
  public market_cap!: number | null; public is_active!: boolean;
  public shares_count!: number | null;
  public ceo!: string | null; public ceo_title!: string | null;
  public founded!: number | null; public employees!: number | null;
  public website!: string | null; public free_float_pct!: number | null;
  public activities!: string[] | null; public certifications!: string[] | null;
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
  shares_count: { type: DataTypes.BIGINT },
  ceo: { type: DataTypes.STRING(255) },
  ceo_title: { type: DataTypes.STRING(255) },
  founded: { type: DataTypes.INTEGER },
  employees: { type: DataTypes.INTEGER },
  website: { type: DataTypes.STRING(500) },
  free_float_pct: { type: DataTypes.DECIMAL(5, 2) },
  activities: { type: DataTypes.JSON },
  certifications: { type: DataTypes.JSON },
}, { sequelize, tableName: 'companies', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

export default Company;
