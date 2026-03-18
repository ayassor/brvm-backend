import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class NewsArticle extends Model {
  declare id: number;
  declare title: string;
  declare summary: string;
  declare body: string;
  declare category: string;
  declare source: string;
  declare author: string | null;
  declare published_at: Date;
  declare is_positive: boolean | null;
  declare reading_time: number;
  declare is_published: boolean;
  declare views_count: number;
  declare created_at: Date;
  declare updated_at: Date;
  // associations (populated via include)
  declare tags?: any[];
}

NewsArticle.init(
  {
    id:           { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    title:        { type: DataTypes.STRING(500), allowNull: false },
    summary:      { type: DataTypes.TEXT, allowNull: false },
    body:         { type: DataTypes.TEXT('long'), allowNull: false },
    category:     { type: DataTypes.STRING(50), allowNull: false },
    source:       { type: DataTypes.STRING(200), allowNull: false },
    author:       { type: DataTypes.STRING(200), allowNull: true },
    published_at: { type: DataTypes.DATE, allowNull: false },
    is_positive:  { type: DataTypes.BOOLEAN, allowNull: true },
    reading_time: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 3 },
    is_published: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    views_count:  { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  },
  {
    sequelize,
    tableName: 'news_articles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
);

export default NewsArticle;
