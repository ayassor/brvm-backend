import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class CompanyAnnouncement extends Model {
  declare id: number;
  declare ticker: string;
  declare category: string;
  declare title: string;
  declare body: string;
  declare published_at: Date;
  declare is_published: boolean;
  declare source: string | null;
  declare created_at: Date;
  declare updated_at: Date;
}

CompanyAnnouncement.init(
  {
    id:           { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    ticker:       { type: DataTypes.STRING(10),  allowNull: false },
    category:     {
      type: DataTypes.ENUM('Résultats','AGO','Dividende','Partenariat','Nomination','Stratégie','Autre'),
      allowNull: false,
    },
    title:        { type: DataTypes.STRING(500), allowNull: false },
    body:         { type: DataTypes.TEXT,        allowNull: false },
    published_at: { type: DataTypes.DATE,        allowNull: false },
    is_published: { type: DataTypes.BOOLEAN,     allowNull: false, defaultValue: true },
    source:       { type: DataTypes.STRING(200), allowNull: true },
  },
  {
    sequelize,
    tableName: 'company_announcements',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
);

export default CompanyAnnouncement;
