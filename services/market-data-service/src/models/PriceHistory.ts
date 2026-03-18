import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import ListedCompany from './ListedCompany';

interface PriceHistoryAttributes {
  id: number;
  symbol: string;
  date: string;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  volume: number | null;
}

interface PriceHistoryCreationAttributes extends Optional<
  PriceHistoryAttributes,
  'id' | 'open' | 'high' | 'low' | 'close' | 'volume'
> {}

export class PriceHistory
  extends Model<PriceHistoryAttributes, PriceHistoryCreationAttributes>
  implements PriceHistoryAttributes {
  public id!: number;
  public symbol!: string;
  public date!: string;
  public open!: number | null;
  public high!: number | null;
  public low!: number | null;
  public close!: number | null;
  public volume!: number | null;
}

PriceHistory.init({
  id:     { type: DataTypes.INTEGER,        primaryKey: true, autoIncrement: true },
  symbol: { type: DataTypes.STRING(20),     allowNull: false },
  date:   { type: DataTypes.DATEONLY,       allowNull: false },
  open:   { type: DataTypes.DECIMAL(12,2),  allowNull: true },
  high:   { type: DataTypes.DECIMAL(12,2),  allowNull: true },
  low:    { type: DataTypes.DECIMAL(12,2),  allowNull: true },
  close:  { type: DataTypes.DECIMAL(12,2),  allowNull: true },
  volume: { type: DataTypes.BIGINT,         allowNull: true },
}, {
  sequelize,
  tableName: 'price_history',
  timestamps: false,
  indexes: [
    { unique: true, fields: ['symbol', 'date'], name: 'uq_price_symbol_date' },
    { fields: ['symbol'] },
    { fields: ['date'] },
  ],
});

// Association : symbol -> listed_companies
PriceHistory.belongsTo(ListedCompany, { foreignKey: 'symbol', targetKey: 'symbol', as: 'company' });
ListedCompany.hasMany(PriceHistory, { foreignKey: 'symbol', sourceKey: 'symbol', as: 'prices' });

export default PriceHistory;
