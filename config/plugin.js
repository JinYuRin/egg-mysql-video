'use strict';

/** @type Egg.EggPlugin */
module.exports = {
  sequelize: {
    enable: true,
    package: 'egg-sequelize',
  },
  cors: {
    enable: true,
    package: 'egg-cors',
  },
  valparams: {
    enable: true,
    package: 'egg-valparams',
  },
  jwt: {
    enable: true,
    package: "egg-jwt"
  },
  redis: {
    enable: true,
    package: 'egg-redis',
  }

  // had enabled by egg
  // static: {
  //   enable: true,
  // }
};
