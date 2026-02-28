import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ArticleAttributes {
  id: number; title: string; content: string | null; summary: string | null;
  author: string | null; category: string | null; is_paid: boolean; is_active: boolean;
}
interface ArticleCreationAttributes extends Optional<ArticleAttributes, 'id'|'content'|'summary'|'author'|'category'|'is_active'> {}

export class Article extends Model<ArticleAttributes, ArticleCreationAttributes> implements ArticleAttributes {
  public id!: number; public title!: string; public content!: string | null;
  public summary!: string | null; public author!: string | null;
  public category!: string | null; public is_paid!: boolean; public is_active!: boolean;
}
Article.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING(255), allowNull: false },
  content: { type: DataTypes.TEXT('long') },
  summary: { type: DataTypes.TEXT },
  author: { type: DataTypes.STRING(255) },
  category: { type: DataTypes.STRING(100) },
  is_paid: { type: DataTypes.BOOLEAN, defaultValue: false },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { sequelize, tableName: 'articles', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });
export default Article;
