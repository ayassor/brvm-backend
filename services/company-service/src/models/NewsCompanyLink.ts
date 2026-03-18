import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class NewsCompanyLink extends Model {
  declare article_id: number;
  declare ticker: string;
}

NewsCompanyLink.init(
  {
    article_id: { type: DataTypes.BIGINT, allowNull: false, primaryKey: true },
    ticker:     { type: DataTypes.STRING(10), allowNull: false, primaryKey: true },
  },
  {
    sequelize,
    tableName: 'news_company_links',
    timestamps: false,
  },
);

export default NewsCompanyLink;
