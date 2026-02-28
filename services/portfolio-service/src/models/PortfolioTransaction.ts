import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface PortfolioTransactionAttributes {
  id: number; portfolio_id: number; company_id: number; ticker: string;
  type: 'BUY' | 'SELL'; quantity: number; price: number; total: number; executed_at: Date;
}
interface PortfolioTransactionCreationAttributes extends Optional<PortfolioTransactionAttributes, 'id' | 'executed_at'> {}

export class PortfolioTransaction extends Model<PortfolioTransactionAttributes, PortfolioTransactionCreationAttributes> implements PortfolioTransactionAttributes {
  public id!: number; public portfolio_id!: number; public company_id!: number;
  public ticker!: string; public type!: 'BUY' | 'SELL'; public quantity!: number;
  public price!: number; public total!: number; public executed_at!: Date;
}
PortfolioTransaction.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  portfolio_id: { type: DataTypes.INTEGER, allowNull: false },
  company_id: { type: DataTypes.INTEGER, allowNull: false },
  ticker: { type: DataTypes.STRING(20), allowNull: false },
  type: { type: DataTypes.ENUM('BUY','SELL'), allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  price: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  total: { type: DataTypes.DECIMAL(20,2), allowNull: false },
  executed_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { sequelize, tableName: 'portfolio_transactions', timestamps: false });
export default PortfolioTransaction;
