import { Sequelize } from 'sequelize';

// Separate connection to the education database (for course_access table)
const educationSequelize = new Sequelize(
  'brvm_education',
  process.env.DB_USER!,
  process.env.DB_PASSWORD!,
  {
    host: process.env.DB_HOST || 'host.docker.internal',
    port: parseInt(process.env.DB_PORT || '3306'),
    dialect: 'mysql',
    logging: false,
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
  }
);

export default educationSequelize;
