const isSameWeek = (date1, date2) => {
	const getStartOfWeek = (date) => {
		const startOfWeek = new Date(date);
		const day = startOfWeek.getDay();
		const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
		startOfWeek.setDate(diff);
		startOfWeek.setHours(0, 0, 0, 0);
		return startOfWeek;
	};
	
	const startOfWeek1 = getStartOfWeek(date1);
	const startOfWeek2 = getStartOfWeek(date2);
	
	return startOfWeek1.getTime() === startOfWeek2.getTime();
}

const getDayOfYear = (date) => {
	const startOfYear = new Date(date.getFullYear(), 0, 0);
	const diff = date - startOfYear;
	const oneDay = 1000 * 60 * 60 * 24;
	return Math.floor(diff / oneDay);
}

const digitToChinese = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

export const convertDateToLocaleAbsoluteString = (inputDate) => {
	const date = new Date(inputDate);
	const currentDate = new Date();
	
	if (!date.getTime()) {
		return "";
	}
	
	const localeTimeString = date.toLocaleTimeString().substring(0, 5);
	
	if (date.getFullYear() !== currentDate.getFullYear()) {
		return `${date.getFullYear() % 100}年${date.getMonth()}月${date.getDate()}日 ${localeTimeString}`;
	} else if (!isSameWeek(date, currentDate)) {
		return `${date.getMonth() + 1}月${date.getDate()}日 ${localeTimeString}`;
	} else if (currentDate.getDay() - date.getDay() > 2) {
		return `周${digitToChinese[date.getDay()]} ${localeTimeString}`;
	} else if (currentDate.getDay() - date.getDay() === 2) {
		return `前天 ${localeTimeString}`;
	} else if (currentDate.getDay() - date.getDay() === 1) {
		return `昨天 ${localeTimeString}`;
	} else {
		return localeTimeString;
	}
}

export const convertDateToLocaleOffsetString = (inputDate) => {
	const date = new Date(inputDate);
	const currentDate = new Date();
	
	if (!date.getTime()) {
		return "";
	}
	
	const localeTimeString = date.toLocaleTimeString().substring(0, 5);
	const dayOfYearOffset = getDayOfYear(currentDate) - getDayOfYear(date);
	
	if (date.getFullYear() !== currentDate.getFullYear()) {
		return `${currentDate.getFullYear() - date.getFullYear()}年前`;
	} else if (dayOfYearOffset > 7) {
		return `${date.getMonth() + 1}月${date.getDate()}日`;
	} else if (dayOfYearOffset > 2) {
		return `${dayOfYearOffset}天前`;
	} else if (dayOfYearOffset === 2) {
		return `前天`;
	} else if (dayOfYearOffset === 1) {
		return `昨天`;
	} else {
		return localeTimeString;
	}
}

export const convertDateToLocaleDateString = (inputDate) => {
	const date = new Date(inputDate);
	
	if (!date.getTime()) {
		return "";
	}
	
	return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}