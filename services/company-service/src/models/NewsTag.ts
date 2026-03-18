import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class NewsTag extends Model {
  declare id: number;
  declare name: string;
}

NewsTag.init(
  {
    id:   { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  },
  {
    sequelize,
    tableName: 'news_tags',
    timestamps: false,
  },
);

export default NewsTag;
