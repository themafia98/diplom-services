export const calculateTime = (values, fractionDigits = 1) => {
  return values
    .reduce((startValue, item) => {
      const normalizeValue = item.timeLost.toString().toLowerCase();

      let hour = null;
      let min = null;

      if (normalizeValue.includes('h') || normalizeValue.includes('ч')) {
        const arrayStringHour = normalizeValue.match(/(\w+)[h|ч]/gi) || [];
        hour = !arrayStringHour
          ? 0
          : arrayStringHour.reduce((total, current) => {
              return total + parseFloat(current);
            }, 0) || 0;
      }

      if (normalizeValue.includes('m') || normalizeValue.includes('м')) {
        const arrayStringMin = normalizeValue.match(/(\w+)[m|м]/gi) || [];
        min = !arrayStringMin
          ? 0
          : arrayStringMin.reduce((total, current) => {
              return total + parseFloat(current);
            }, 0);
      }

      const plusValue = !min && hour ? hour : hour && min > 0 ? hour + min / 60 : min > 0 ? min / 60 : 0;
      if (typeof plusValue === 'number') return startValue + plusValue;
      else return startValue;
    }, 0)
    .toFixed(fractionDigits);
};
