import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ListedCompanyAttributes {
  symbol: string;
  name: string | null;
  sector: string | null;
  country: string | null;
  isin: string | null;
  currency: string;
  market_cap: number | null;
  listing_date: string | null;
  description: string | null;
  logo_url: string | null;
  is_active: boolean;
}

interface ListedCompanyCreationAttributes extends Optional<
  ListedCompanyAttributes,
  'name' | 'sector' | 'country' | 'isin' | 'currency' | 'market_cap' | 'listing_date' | 'description' | 'logo_url' | 'is_active'
> {}

export class ListedCompany
  extends Model<ListedCompanyAttributes, ListedCompanyCreationAttributes>
  implements ListedCompanyAttributes {
  public symbol!: string;
  public name!: string | null;
  public sector!: string | null;
  public country!: string | null;
  public isin!: string | null;
  public currency!: string;
  public market_cap!: number | null;
  public listing_date!: string | null;
  public description!: string | null;
  public logo_url!: string | null;
  public is_active!: boolean;
}

ListedCompany.init({
  symbol:       { type: DataTypes.STRING(20),    primaryKey: true },
  name:         { type: DataTypes.STRING(255),   allowNull: true },
  sector:       { type: DataTypes.STRING(100),   allowNull: true },
  country:      { type: DataTypes.STRING(10),    allowNull: true },
  isin:         { type: DataTypes.STRING(12),    allowNull: true },
  currency:     { type: DataTypes.STRING(5),     defaultValue: 'XOF' },
  market_cap:   { type: DataTypes.DECIMAL(20,2), allowNull: true },
  listing_date: { type: DataTypes.DATEONLY,      allowNull: true },
  description:  { type: DataTypes.TEXT,          allowNull: true },
  logo_url:     { type: DataTypes.STRING(500),   allowNull: true },
  is_active:    { type: DataTypes.BOOLEAN,       defaultValue: true },
}, {
  sequelize,
  tableName: 'listed_companies',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default ListedCompany;
