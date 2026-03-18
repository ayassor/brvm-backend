import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface FinancialHistoryAttributes {
  id: number;
  ticker: string;
  year: number;
  revenue_m_fcfa: number | null;
  net_income_m_fcfa: number | null;
  ebitda_m_fcfa: number | null;
  pe_ratio: number | null;
  eps_fcfa: number | null;
  dividend_per_share_fcfa: number | null;
}
interface FinancialHistoryCreationAttributes extends Optional<
  FinancialHistoryAttributes,
  'id' | 'revenue_m_fcfa' | 'net_income_m_fcfa' | 'ebitda_m_fcfa' | 'pe_ratio' | 'eps_fcfa' | 'dividend_per_share_fcfa'
> {}

export class FinancialHistory extends Model<FinancialHistoryAttributes, FinancialHistoryCreationAttributes>
  implements FinancialHistoryAttributes {
  public id!: number;
  public ticker!: string;
  public year!: number;
  public revenue_m_fcfa!: number | null;
  public net_income_m_fcfa!: number | null;
  public ebitda_m_fcfa!: number | null;
  public pe_ratio!: number | null;
  public eps_fcfa!: number | null;
  public dividend_per_share_fcfa!: number | null;
}

FinancialHistory.init({
  id:                     { type: DataTypes.INTEGER,        autoIncrement: true, primaryKey: true },
  ticker:                 { type: DataTypes.STRING(20),     allowNull: false },
  year:                   { type: DataTypes.INTEGER,        allowNull: false },
  revenue_m_fcfa:         { type: DataTypes.DECIMAL(18, 2) },
  net_income_m_fcfa:      { type: DataTypes.DECIMAL(18, 2) },
  ebitda_m_fcfa:          { type: DataTypes.DECIMAL(18, 2) },
  pe_ratio:               { type: DataTypes.DECIMAL(8, 2) },
  eps_fcfa:               { type: DataTypes.DECIMAL(12, 2) },
  dividend_per_share_fcfa:{ type: DataTypes.DECIMAL(12, 2) },
}, {
  sequelize,
  tableName: 'financial_history',
  timestamps: false,
  indexes: [
    { unique: true, fields: ['ticker', 'year'], name: 'uq_fin_history_ticker_year' },
    { fields: ['ticker'] },
  ],
});

export default FinancialHistory;
