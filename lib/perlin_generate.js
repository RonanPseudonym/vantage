var SimplexNoise = require('simplex-noise');

function get_perlin_arr(zoom) {
	let offset = (Math.random()*10000);
	let simplex = new SimplexNoise(Math.random);

	let arr = [];

	for(let i=0;i<12;i++) {
		let row = []
		
		for(let j=0;j<12;j++) {
			row.push(simplex.noise2D((i+offset)/zoom, (j+offset)/zoom));
		}

		arr.push(row)
	}

	return arr;
}

function format_perlin_arr(arr, threshold) {
	let new_arr = [];

	for(let i=0;i<arr.length;i++) {
		let row = [];

		for(let j=0;j<arr[i].length;j++) {
			let val = 0;
			if(arr[i][j]>=threshold) {val = 1;}
			row.push(val);
		}

		new_arr.push(row);
	}

	return new_arr;
}

function pretty_print_arr(arr) {
	for(let i=0;i<arr.length;i++) {
		console.log(arr[i].join(""));
	}
}

function perlin_2d() {
	return format_perlin_arr(get_perlin_arr(10), 0.3);
}

module.exports = {get_perlin_arr, format_perlin_arr, pretty_print_arr, perlin_2d}