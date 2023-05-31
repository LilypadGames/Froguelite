export default {
	// random
	random: {
		// get a random integer (inclusive of both min and max)
		int: function (min: number = 1, max: number = 100) {
			return Math.floor(Math.random() * (max - min + 1) + min);
		},

		// get random entry from provided array
		fromArray: function (array: Array<any>) {
			return array[Math.floor(Math.random() * array.length)];
		},
	},

	// time
	time: {
		// get current timestamp
		currentTimestamp: function () {
			var timestamp = new Date(Date.now()).toLocaleString();
			return timestamp;
		},

		// get todays date
		currentDate: function () {
			const today = new Date();
			return this.formatDate(today);
		},

		// format date
		formatDate: function (day: Date) {
			return (
				day.getFullYear() +
				"-" +
				(day.getMonth() + 1) +
				"-" +
				day.getDate()
			);
		},
	},

	// convert hex color codes
	hex: {
		// from number to string
		toString(hexColor: number) {
			return "#" + hexColor.toString(16).padStart(6, "0");
		},

		// from string to number
		toDecimal(hexColor: string) {
			return parseInt(hexColor, 16);
		},

		// from hex to rgb
		toRGB(hexColor: string | number) {
			// convert to string if number
			if (typeof hexColor === "number")
				hexColor = this.toString(hexColor);

			// convert to rgb
			const result = String(
				/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexColor)
			);
			return {
				r: this.toDecimal(result[1]),
				g: this.toDecimal(result[2]),
				b: this.toDecimal(result[3]),
			};
		},
	},

	// sanitize
	sanitize: {
		// strings
		string: function (input: string) {
			return typeof input === "string" && input.trim().length > 0
				? input.trim()
				: "";
		},
		// booleans
		boolean: function (input: boolean) {
			return typeof input === "boolean" && input === true ? true : false;
		},
		// arrays
		array: function (input: Array<any>) {
			return typeof input === "object" && input instanceof Array
				? input
				: [];
		},
		// numbers
		number: function (input: number) {
			return typeof input === "number" && input % 1 === 0 ? input : 0;
		},
		// objects
		object: function (input: Record<string, any>) {
			return typeof input === "object" &&
				!(input instanceof Array) &&
				input !== null
				? input
				: {};
		},
	},

	// sort
	sort: {
		// object
		object: function (object: Record<string, any>, asc: boolean = false) {
			const sortedObject: Record<string, any> = {};
			Object.keys(object)
				.sort((a, b) => object[asc ? a : b] - object[asc ? b : a])
				.forEach((s) => (sortedObject[s] = object[s]));
			return sortedObject;
		},
	},

	// merge two objects, overwriting first one with second one
	mergeObjects: function (
		arrayA: Record<string, any>,
		arrayB: Record<string, any>
	) {
		// init new merged array
		var mergedArray: Record<string, any> = {};

		// merge provided arrays into new array
		let key: keyof typeof arrayA;
		for (key in arrayA) {
			mergedArray[key] = arrayA[key];
		}
		for (key in arrayB) {
			mergedArray[key] = arrayB[key];
		}

		// return new merged array
		return mergedArray;
	},
};
