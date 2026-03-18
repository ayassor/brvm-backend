import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class CompanyThesisPoint extends Model {
  declare id: number;
  declare ticker: string;
  declare type: 'bull' | 'risk' | 'exit';
  declare body: string;
  declare sort_order: number;
}

CompanyThesisPoint.init(
  {
    id:         { type: DataTypes.INTEGER,    autoIncrement: true, primaryKey: true },
    ticker:     { type: DataTypes.STRING(10), allowNull: false },
    type:       { type: DataTypes.ENUM('bull','risk','exit'), allowNull: false },
    body:       { type: DataTypes.TEXT,       allowNull: false },
    sort_order: { type: DataTypes.TINYINT,   allowNull: false, defaultValue: 0 },
  },
  {
    sequelize,
    tableName: 'company_thesis_points',
    timestamps: false,
  },
);

export default CompanyThesisPoint;
