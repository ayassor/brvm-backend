import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface SubscriptionAttributes {
  id: number;
  user_id: number;
  plan: 'free' | 'premium';
  start_date: string;
  end_date: string | null;
  status: 'active' | 'cancelled' | 'expired';
  amount_paid: number;
  payment_reference: string | null;
}

interface SubscriptionCreationAttributes
  extends Optional<SubscriptionAttributes, 'id' | 'end_date' | 'amount_paid' | 'payment_reference'> {}

export class Subscription
  extends Model<SubscriptionAttributes, SubscriptionCreationAttributes>
  implements SubscriptionAttributes
{
  public id!: number;
  public user_id!: number;
  public plan!: 'free' | 'premium';
  public start_date!: string;
  public end_date!: string | null;
  public status!: 'active' | 'cancelled' | 'expired';
  public amount_paid!: number;
  public payment_reference!: string | null;
}

Subscription.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    plan: { type: DataTypes.ENUM('free', 'premium'), defaultValue: 'free' },
    start_date: { type: DataTypes.DATEONLY, allowNull: false },
    end_date: { type: DataTypes.DATEONLY },
    status: { type: DataTypes.ENUM('active', 'cancelled', 'expired'), defaultValue: 'active' },
    amount_paid: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    payment_reference: { type: DataTypes.STRING(255) },
  },
  {
    sequelize,
    tableName: 'subscriptions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Subscription;
