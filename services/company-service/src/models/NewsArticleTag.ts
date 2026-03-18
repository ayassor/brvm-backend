import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class NewsArticleTag extends Model {
  declare article_id: number;
  declare tag_id: number;
}

NewsArticleTag.init(
  {
    article_id: { type: DataTypes.BIGINT, allowNull: false, primaryKey: true },
    tag_id:     { type: DataTypes.BIGINT, allowNull: false, primaryKey: true },
  },
  {
    sequelize,
    tableName: 'news_article_tags',
    timestamps: false,
  },
);

export default NewsArticleTag;
