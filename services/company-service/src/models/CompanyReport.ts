import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class CompanyReport extends Model {
  declare id: number;
  declare ticker: string;
  declare year: number;
  declare type: 'annual' | 'semi_annual' | 'quarterly';
  declare label: string;
  declare source: string;
  declare file_url: string | null;
  declare file_size_kb: number | null;
  declare page_count: number | null;
  declare is_published: boolean;
  declare published_at: Date | null;
  declare created_at: Date;
  declare updated_at: Date;
}

CompanyReport.init(
  {
    id:           { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    ticker:       { type: DataTypes.STRING(10),  allowNull: false },
    year:         { type: DataTypes.SMALLINT,    allowNull: false },
    type:         { type: DataTypes.ENUM('annual', 'semi_annual', 'quarterly'), allowNull: false },
    label:        { type: DataTypes.STRING(100), allowNull: false },
    source:       { type: DataTypes.STRING(200), allowNull: false },
    file_url:     { type: DataTypes.TEXT,        allowNull: true },
    file_size_kb: { type: DataTypes.INTEGER,     allowNull: true },
    page_count:   { type: DataTypes.INTEGER,     allowNull: true },
    is_published: { type: DataTypes.BOOLEAN,     allowNull: false, defaultValue: false },
    published_at: { type: DataTypes.DATE,        allowNull: true },
  },
  {
    sequelize,
    tableName: 'company_reports',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
);

export default CompanyReport;
