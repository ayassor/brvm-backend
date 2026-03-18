import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export type ShareholderType = 'institutionnel' | 'etat' | 'public' | 'fondateur';

interface ShareholderAttributes {
  id: number;
  ticker: string;
  name: string;
  pct: number;
  type: ShareholderType;
}
interface ShareholderCreationAttributes extends Optional<ShareholderAttributes, 'id'> {}

export class Shareholder extends Model<ShareholderAttributes, ShareholderCreationAttributes>
  implements ShareholderAttributes {
  public id!: number;
  public ticker!: string;
  public name!: string;
  public pct!: number;
  public type!: ShareholderType;
}

Shareholder.init({
  id:     { type: DataTypes.INTEGER,       autoIncrement: true, primaryKey: true },
  ticker: { type: DataTypes.STRING(20),    allowNull: false },
  name:   { type: DataTypes.STRING(255),   allowNull: false },
  pct:    { type: DataTypes.DECIMAL(6, 2), allowNull: false },
  type:   { type: DataTypes.ENUM('institutionnel', 'etat', 'public', 'fondateur'), allowNull: false },
}, {
  sequelize,
  tableName: 'shareholders',
  timestamps: false,
  indexes: [{ fields: ['ticker'] }],
});

export default Shareholder;
