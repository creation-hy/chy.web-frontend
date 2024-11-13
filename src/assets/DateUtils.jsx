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

const digitToChinese = ['日', '一', '二', '三', '四', '五', '六'];

export const convertDateToLocaleAbsoluteString = (inputDate) => {
	const date = new Date(inputDate);
	const currentDate = new Date();
	
	if (!date.getTime()) {
		return "";
	}
	
	const localeTimeString = date.toLocaleTimeString().substring(0, 5);
	const dayOfYearOffset = getDayOfYear(currentDate) - getDayOfYear(date);
	
	if (date.getFullYear() !== currentDate.getFullYear()) {
		return `${date.getFullYear() % 100}年${date.getMonth()}月${date.getDate()}日 ${localeTimeString}`;
	} else if (!isSameWeek(date, currentDate)) {
		return `${date.getMonth() + 1}月${date.getDate()}日 ${localeTimeString}`;
	} else if (dayOfYearOffset > 2) {
		return `周${digitToChinese[date.getDay()]} ${localeTimeString}`;
	} else if (dayOfYearOffset === 2) {
		return `前天 ${localeTimeString}`;
	} else if (dayOfYearOffset === 1) {
		return `昨天 ${localeTimeString}`;
	} else {
		return localeTimeString;
	}
}

export const convertDateToLocaleShortString = (inputDate) => {
	const date = new Date(inputDate);
	const currentDate = new Date();
	
	if (!date.getTime()) {
		return "";
	}
	
	const localeTimeString = date.toLocaleTimeString().substring(0, 5);
	const dayOfYearOffset = getDayOfYear(currentDate) - getDayOfYear(date);
	
	if (date.getFullYear() !== currentDate.getFullYear()) {
		return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
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

export const convertDateToLocaleOffsetString = (inputDate) => {
	const date = new Date(inputDate);
	const currentDate = new Date();
	
	if (!date.getTime()) {
		return "";
	}
	
	const dayOfYearOffset = getDayOfYear(currentDate) - getDayOfYear(date);
	const monthOffset = (currentDate.getFullYear() - date.getFullYear()) * 12 + (currentDate.getMonth() - date.getMonth());
	const hourOffset = (currentDate.getDate() !== date.getDate() ? 24 : 0) + (currentDate.getHours() - date.getHours());
	const minuteOffset = hourOffset * 60 + (currentDate.getMinutes() - date.getMinutes());
	const secondOffset = minuteOffset * 60 + (currentDate.getSeconds() - date.getSeconds());
	
	if (monthOffset >= 12) {
		return `${currentDate.getFullYear() - date.getFullYear()}年前`;
	} else if (monthOffset >= 1) {
		return `${monthOffset}个月前`;
	} else if (dayOfYearOffset > 2) {
		return `${dayOfYearOffset}天前`;
	} else if (dayOfYearOffset === 2) {
		return `前天`;
	} else if (hourOffset >= 24) {
		return `昨天`;
	} else if (minuteOffset >= 60) {
		return `${hourOffset}小时前`;
	} else if (secondOffset >= 60) {
		return `${minuteOffset}分钟前`;
	} else if (secondOffset >= 10) {
		return `${secondOffset}秒前`;
	} else {
		return `刚刚`;
	}
}

export const convertDateToLocaleDateString = (inputDate) => {
	const date = new Date(inputDate);
	
	if (!date.getTime()) {
		return "";
	}
	
	return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}