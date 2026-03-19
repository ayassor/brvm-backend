import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface LessonAttributes {
  id: number; course_id: number; title: string; content: string | null;
  video_url: string | null; pdf_url: string | null; order_num: number;
  duration_minutes: number; is_active: boolean;
  chapter_id: number | null; video_id: string | null;
}
interface LessonCreationAttributes extends Optional<LessonAttributes, 'id'|'content'|'video_url'|'pdf_url'|'order_num'|'duration_minutes'|'is_active'|'chapter_id'|'video_id'> {}

export class Lesson extends Model<LessonAttributes, LessonCreationAttributes> implements LessonAttributes {
  public id!: number; public course_id!: number; public title!: string;
  public content!: string | null; public video_url!: string | null; public pdf_url!: string | null;
  public order_num!: number; public duration_minutes!: number; public is_active!: boolean;
  public chapter_id!: number | null; public video_id!: string | null;
}
Lesson.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  course_id: { type: DataTypes.INTEGER, allowNull: false },
  chapter_id: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
  title: { type: DataTypes.STRING(255), allowNull: false },
  content: { type: DataTypes.TEXT('long') },
  video_url: { type: DataTypes.STRING(500) },
  video_id: { type: DataTypes.STRING(100), allowNull: true, defaultValue: null },
  pdf_url: { type: DataTypes.STRING(500) },
  order_num: { type: DataTypes.INTEGER, defaultValue: 0 },
  duration_minutes: { type: DataTypes.INTEGER, defaultValue: 0 },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { sequelize, tableName: 'lessons', timestamps: false });
export default Lesson;
