import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/educationDatabase';

interface CourseAccessAttributes {
  id: number;
  user_id: number;
  course_id: number;
  granted_by: number;
  granted_at?: Date;
  expires_at?: Date | null;
  note?: string | null;
}

interface CourseAccessCreationAttributes extends Optional<CourseAccessAttributes, 'id' | 'granted_at' | 'expires_at' | 'note'> {}

export class CourseAccess extends Model<CourseAccessAttributes, CourseAccessCreationAttributes> implements CourseAccessAttributes {
  public id!: number;
  public user_id!: number;
  public course_id!: number;
  public granted_by!: number;
  public readonly granted_at!: Date;
  public expires_at!: Date | null;
  public note!: string | null;
}

CourseAccess.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  course_id: { type: DataTypes.INTEGER, allowNull: false },
  granted_by: { type: DataTypes.INTEGER, allowNull: false },
  granted_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  expires_at: { type: DataTypes.DATE, allowNull: true },
  note: { type: DataTypes.STRING(500), allowNull: true },
}, {
  sequelize,
  tableName: 'course_access',
  timestamps: false,
});

export default CourseAccess;
