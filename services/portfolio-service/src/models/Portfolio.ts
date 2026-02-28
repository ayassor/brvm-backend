import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface PortfolioAttributes {
  id: number; user_id: number; name: string; initial_capital: number; cash_balance: number;
}
interface PortfolioCreationAttributes extends Optional<PortfolioAttributes, 'id'> {}

export class Portfolio extends Model<PortfolioAttributes, PortfolioCreationAttributes> implements PortfolioAttributes {
  public id!: number; public user_id!: number; public name!: string;
  public initial_capital!: number; public cash_balance!: number;
}
Portfolio.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING(255), defaultValue: 'Mon Portefeuille' },
  initial_capital: { type: DataTypes.DECIMAL(20,2), allowNull: false },
  cash_balance: { type: DataTypes.DECIMAL(20,2), allowNull: false },
}, { sequelize, tableName: 'portfolios', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });
export default Portfolio;
