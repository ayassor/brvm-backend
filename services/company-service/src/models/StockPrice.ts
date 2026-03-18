import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface StockPriceAttributes {
  id: number;
  symbol: string;
  date: string;
  open: number | null;
  close: number | null;
  high: number | null;
  low: number | null;
  previous_close: number | null;
  volume: number | null;
  created_at?: Date;
}

interface StockPriceCreationAttributes extends Optional<
  StockPriceAttributes,
  'id' | 'open' | 'close' | 'high' | 'low' | 'previous_close' | 'volume'
> {}

export class StockPrice extends Model<StockPriceAttributes, StockPriceCreationAttributes> implements StockPriceAttributes {
  public id!: number;
  public symbol!: string;
  public date!: string;
  public open!: number | null;
  public close!: number | null;
  public high!: number | null;
  public low!: number | null;
  public previous_close!: number | null;
  public volume!: number | null;
  public readonly created_at!: Date;
}

StockPrice.init({
  id:             { type: DataTypes.INTEGER,        autoIncrement: true, primaryKey: true },
  symbol:         { type: DataTypes.STRING(20),     allowNull: false },
  date:           { type: DataTypes.DATEONLY,       allowNull: false },
  open:           { type: DataTypes.DECIMAL(12, 2), allowNull: true },
  close:          { type: DataTypes.DECIMAL(12, 2), allowNull: true },
  high:           { type: DataTypes.DECIMAL(12, 2), allowNull: true },
  low:            { type: DataTypes.DECIMAL(12, 2), allowNull: true },
  previous_close: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
  volume:         { type: DataTypes.BIGINT,         allowNull: true },
}, {
  sequelize,
  tableName: 'stock_prices',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { unique: true, fields: ['symbol', 'date'], name: 'uq_stock_symbol_date' },
    { fields: ['symbol'] },
    { fields: ['date'] },
  ],
});

export default StockPrice;
