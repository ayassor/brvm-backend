import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class AnalystRecommendation extends Model {
  declare id: number;
  declare ticker: string;
  declare firm: string;
  declare analyst_name: string | null;
  declare consensus: string;
  declare target_price: string | null;
  declare published_at: Date | null;
}

AnalystRecommendation.init(
  {
    id:           { type: DataTypes.INTEGER,       autoIncrement: true, primaryKey: true },
    ticker:       { type: DataTypes.STRING(10),    allowNull: false },
    firm:         { type: DataTypes.STRING(200),   allowNull: false },
    analyst_name: { type: DataTypes.STRING(200),   allowNull: true },
    consensus:    { type: DataTypes.ENUM('ACHAT FORT','ACHAT','NEUTRE','ALLÉGEMENT','VENTE'), allowNull: false },
    target_price: { type: DataTypes.DECIMAL(12,2), allowNull: true },
    published_at: { type: DataTypes.DATE,          allowNull: true },
  },
  {
    sequelize,
    tableName: 'analyst_recommendations',
    timestamps: false,
  },
);

export default AnalystRecommendation;
