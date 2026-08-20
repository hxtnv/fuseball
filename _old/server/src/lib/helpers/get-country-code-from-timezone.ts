import timezoneToCountryMap from "../const/timezone-country-map";
import countryCodeToNameMap from "../const/country-code-to-name-map";

const getCountryCodeFromTimezone = (timezone: string) => {
  const countryFromTimezone = timezoneToCountryMap[timezone] ?? "United States";
  const countryCodeIndex = Object.keys(countryCodeToNameMap).findIndex(
    (key) => {
      if (Array.isArray(countryCodeToNameMap[key])) {
        return countryCodeToNameMap[key].includes(countryFromTimezone);
      }

      return countryCodeToNameMap[key] === countryFromTimezone;
    }
  );

  if (countryCodeIndex === -1) {
    return "US";
  }

  return Object.keys(countryCodeToNameMap)[countryCodeIndex];
};

export default getCountryCodeFromTimezone;
