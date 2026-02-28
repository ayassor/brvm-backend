import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface DividendAttributes {
  id: number; company_id: number; amount: number; payment_date: string; ex_date: string | null;
}
interface DividendCreationAttributes extends Optional<DividendAttributes, 'id' | 'ex_date'> {}

export class Dividend extends Model<DividendAttributes, DividendCreationAttributes> implements DividendAttributes {
  public id!: number; public company_id!: number; public amount!: number;
  public payment_date!: string; public ex_date!: string | null;
}

Dividend.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  company_id: { type: DataTypes.INTEGER, allowNull: false },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  payment_date: { type: DataTypes.DATEONLY, allowNull: false },
  ex_date: { type: DataTypes.DATEONLY },
}, { sequelize, tableName: 'dividends', timestamps: true, createdAt: 'created_at', updatedAt: false });

export default Dividend;
