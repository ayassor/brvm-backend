import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class CompanyRecommendation extends Model {
  declare id: number;
  declare ticker: string;
  declare consensus: string;
  declare fair_value: string | null;
  declare buy_price: string | null;
  declare stop_loss: string | null;
  declare horizon: string | null;
  declare methodology: string | null;
  declare updated_at: Date;
  declare published_at: Date | null;
}

CompanyRecommendation.init(
  {
    id:          { type: DataTypes.INTEGER,       autoIncrement: true, primaryKey: true },
    ticker:      { type: DataTypes.STRING(10),    allowNull: false, unique: true },
    consensus:   { type: DataTypes.ENUM('ACHAT FORT','ACHAT','NEUTRE','ALLÉGEMENT','VENTE'), allowNull: false },
    fair_value:  { type: DataTypes.DECIMAL(12,2), allowNull: true },
    buy_price:   { type: DataTypes.DECIMAL(12,2), allowNull: true },
    stop_loss:   { type: DataTypes.DECIMAL(12,2), allowNull: true },
    horizon:     { type: DataTypes.STRING(100),   allowNull: true },
    methodology: { type: DataTypes.TEXT,          allowNull: true },
    published_at:{ type: DataTypes.DATE,          allowNull: true },
  },
  {
    sequelize,
    tableName: 'company_recommendations',
    timestamps: true,
    createdAt: false,
    updatedAt: 'updated_at',
  },
);

export default CompanyRecommendation;
