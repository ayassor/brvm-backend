import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
interface GlossaryAttributes { id: number; term: string; definition: string; category: string | null; }
interface GlossaryCreationAttributes extends Optional<GlossaryAttributes, 'id'|'category'> {}
export class Glossary extends Model<GlossaryAttributes, GlossaryCreationAttributes> implements GlossaryAttributes {
  public id!: number; public term!: string; public definition!: string; public category!: string | null;
}
Glossary.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  term: { type: DataTypes.STRING(255), allowNull: false, unique: true },
  definition: { type: DataTypes.TEXT, allowNull: false },
  category: { type: DataTypes.STRING(100) },
}, { sequelize, tableName: 'glossary', timestamps: false });
export default Glossary;
