import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface PortfolioPositionAttributes {
  id: number; portfolio_id: number; company_id: number; ticker: string;
  quantity: number; avg_buy_price: number;
}
interface PortfolioPositionCreationAttributes extends Optional<PortfolioPositionAttributes, 'id'> {}

export class PortfolioPosition extends Model<PortfolioPositionAttributes, PortfolioPositionCreationAttributes> implements PortfolioPositionAttributes {
  public id!: number; public portfolio_id!: number; public company_id!: number;
  public ticker!: string; public quantity!: number; public avg_buy_price!: number;
}
PortfolioPosition.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  portfolio_id: { type: DataTypes.INTEGER, allowNull: false },
  company_id: { type: DataTypes.INTEGER, allowNull: false },
  ticker: { type: DataTypes.STRING(20), allowNull: false },
  quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
  avg_buy_price: { type: DataTypes.DECIMAL(10,2), allowNull: false },
}, { sequelize, tableName: 'portfolio_positions', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });
export default PortfolioPosition;
