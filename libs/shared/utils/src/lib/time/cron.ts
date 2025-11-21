const cronRegex = /^(\*|([0-5]?\d))( (\*|([01]?\d|2[0-3]))){2}( (\*|([1-9]|[12]\d|3[01])))( (\*|(1[0-2]|0?[1-9])))( (\*|([0-6])))$/;

export const isValidCron = (expr: string): boolean => cronRegex.test(expr.trim());
