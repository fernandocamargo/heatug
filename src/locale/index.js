import first from 'lodash/first';

export default () => {
  const {
    navigator: { language, languages, userLanguage },
  } = window;
  const locale = first(languages) || language || userLanguage || 'en-US';

  return locale;
};
