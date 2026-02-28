import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface CourseAttributes {
  id: number; title: string; description: string | null; level: 'beginner'|'intermediate'|'advanced';
  is_paid: boolean; price: number; thumbnail_url: string | null; is_active: boolean;
}
interface CourseCreationAttributes extends Optional<CourseAttributes, 'id'|'description'|'price'|'thumbnail_url'|'is_active'> {}

export class Course extends Model<CourseAttributes, CourseCreationAttributes> implements CourseAttributes {
  public id!: number; public title!: string; public description!: string | null;
  public level!: 'beginner'|'intermediate'|'advanced'; public is_paid!: boolean;
  public price!: number; public thumbnail_url!: string | null; public is_active!: boolean;
}
Course.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT },
  level: { type: DataTypes.ENUM('beginner','intermediate','advanced'), defaultValue: 'beginner' },
  is_paid: { type: DataTypes.BOOLEAN, defaultValue: false },
  price: { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
  thumbnail_url: { type: DataTypes.STRING(500) },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { sequelize, tableName: 'courses', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });
export default Course;
