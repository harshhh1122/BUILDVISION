import { Sequelize, DataTypes } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize SQLite database
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: false
});

// Define User Model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isPro: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
});

// Define SearchRecord Model (to log user search parameters)
const SearchRecord = sequelize.define('SearchRecord', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  plotWidth: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  plotLength: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  bedrooms: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  bathrooms: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  style: {
    type: DataTypes.STRING,
    allowNull: false
  },
  area: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  layoutVariation: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'A'
  }
});

// Define Saved Project Model (to save custom blueprints)
const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  plotWidth: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  plotLength: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  floors: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  bedrooms: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  bathrooms: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  style: {
    type: DataTypes.STRING,
    allowNull: false
  },
  budget: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  layoutOption: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'A'
  }
});

// Setup relationships
User.hasMany(SearchRecord, { foreignKey: 'userId', onDelete: 'CASCADE' });
SearchRecord.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Project, { foreignKey: 'userId', onDelete: 'CASCADE' });
Project.belongsTo(User, { foreignKey: 'userId' });

export { sequelize, User, SearchRecord, Project };
