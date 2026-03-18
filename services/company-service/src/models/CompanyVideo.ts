import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class CompanyVideo extends Model {
  declare id: number;
  declare ticker: string;
  declare title: string;
  declare url: string;
  declare thumbnail_url: string | null;
  declare duration_sec: number | null;
  declare source: string | null;
  declare published_at: Date | null;
  declare sort_order: number;
  declare is_published: boolean;
  declare created_at: Date;
}

CompanyVideo.init(
  {
    id:            { type: DataTypes.INTEGER,     autoIncrement: true, primaryKey: true },
    ticker:        { type: DataTypes.STRING(10),  allowNull: false },
    title:         { type: DataTypes.STRING(300), allowNull: false },
    url:           { type: DataTypes.TEXT,        allowNull: false },
    thumbnail_url: { type: DataTypes.TEXT,        allowNull: true },
    duration_sec:  { type: DataTypes.INTEGER,     allowNull: true },
    source:        { type: DataTypes.STRING(100), allowNull: true },
    published_at:  { type: DataTypes.DATE,        allowNull: true },
    sort_order:    { type: DataTypes.TINYINT,     allowNull: false, defaultValue: 0 },
    is_published:  { type: DataTypes.BOOLEAN,     allowNull: false, defaultValue: true },
  },
  {
    sequelize,
    tableName: 'company_videos',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  },
);

export default CompanyVideo;
