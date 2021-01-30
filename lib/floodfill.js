function floodfill(s) {
	let points = [];

	points.push([s/2, s/2]);

	for(i=((s/2)-1);i>0;i--) {
		for(j=0;j<s/2-i;j++) {
			points.push([j, i])
		}
	}

	return points;
}

console.log(floodfill(12, 12));