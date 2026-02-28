import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface StockPriceAttributes {
  id: number; company_id: number; date: string;
  open: number | null; close: number; high: number | null; low: number | null; volume: number;
}
interface StockPriceCreationAttributes extends Optional<StockPriceAttributes, 'id' | 'open' | 'high' | 'low' | 'volume'> {}

export class StockPrice extends Model<StockPriceAttributes, StockPriceCreationAttributes> implements StockPriceAttributes {
  public id!: number; public company_id!: number; public date!: string;
  public open!: number | null; public close!: number; public high!: number | null;
  public low!: number | null; public volume!: number;
}

StockPrice.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  company_id: { type: DataTypes.INTEGER, allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  open: { type: DataTypes.DECIMAL(10, 2) },
  close: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  high: { type: DataTypes.DECIMAL(10, 2) },
  low: { type: DataTypes.DECIMAL(10, 2) },
  volume: { type: DataTypes.BIGINT, defaultValue: 0 },
}, { sequelize, tableName: 'stock_prices', timestamps: true, createdAt: 'created_at', updatedAt: false });

export default StockPrice;
