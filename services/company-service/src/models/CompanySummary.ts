import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class CompanySummary extends Model {
  declare id: number;
  declare ticker: string;
  declare executive_text: string | null;
  declare bull_case: string[] | null;
  declare bear_case: string[] | null;
  declare updated_at: Date;
  declare updated_by: string | null;
}

CompanySummary.init(
  {
    id:             { type: DataTypes.INTEGER,     autoIncrement: true, primaryKey: true },
    ticker:         { type: DataTypes.STRING(10),  allowNull: false, unique: true },
    executive_text: { type: DataTypes.TEXT,        allowNull: true },
    bull_case:      { type: DataTypes.JSON,        allowNull: true },
    bear_case:      { type: DataTypes.JSON,        allowNull: true },
    updated_by:     { type: DataTypes.STRING(100), allowNull: true },
  },
  {
    sequelize,
    tableName: 'company_summaries',
    timestamps: true,
    createdAt: false,
    updatedAt: 'updated_at',
  },
);

export default CompanySummary;
