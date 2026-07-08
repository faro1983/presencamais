const appJson = require('./app.json');

module.exports = () => {
  const projectId = process.env.EAS_PROJECT_ID || appJson.expo?.extra?.eas?.projectId;

  return {
    ...appJson.expo,
    extra: {
      ...(appJson.expo?.extra || {}),
      eas: {
        ...(appJson.expo?.extra?.eas || {}),
        projectId
      }
    }
  };
};
