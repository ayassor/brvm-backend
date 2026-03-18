import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface CompanyNewsAttributes {
  id: number;
  ticker: string;
  date: string;
  headline: string;
  positive: boolean | null;
}
interface CompanyNewsCreationAttributes extends Optional<CompanyNewsAttributes, 'id' | 'positive'> {}

export class CompanyNews extends Model<CompanyNewsAttributes, CompanyNewsCreationAttributes>
  implements CompanyNewsAttributes {
  public id!: number;
  public ticker!: string;
  public date!: string;
  public headline!: string;
  public positive!: boolean | null;
}

CompanyNews.init({
  id:       { type: DataTypes.INTEGER,  autoIncrement: true, primaryKey: true },
  ticker:   { type: DataTypes.STRING(20), allowNull: false },
  date:     { type: DataTypes.DATEONLY,  allowNull: false },
  headline: { type: DataTypes.TEXT,      allowNull: false },
  positive: { type: DataTypes.BOOLEAN },
}, {
  sequelize,
  tableName: 'company_news',
  timestamps: false,
  indexes: [
    { fields: ['ticker'] },
    { fields: ['date'] },
  ],
});

export default CompanyNews;
