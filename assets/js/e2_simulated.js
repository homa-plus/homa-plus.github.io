function simulateE2({
	doseMg,
	areaCm2,
	zoneAbsorption,
	timeHours,
	bodyWeight
}) {
	const F = 0.12; // 12% биодоступность геля
	let D = doseMg * F; // Базовая эффективная доза

	// Усиление абсорбции из-за площади нанесения (≈1–2% на каждые 10 см²)
	const areaFactor = 1 + 0.015 * (areaCm2 / 10);
	D *= areaFactor;
	const ka0 = 0.045; // базовая скорость абсорбции
	const ka = ka0 * zoneAbsorption; 
	const ke = 0.23; // Скорость элиминации (T1/2 ≈ 2–3 ч)
	const Vd = 3.3 * bodyWeight; //Объём распределения с учётом массы тела
	// Формула Бейтмана
	const C_mgL = (D * ka / (Vd * (ka - ke))) *
				(Math.exp(-ke * timeHours) - Math.exp(-ka * timeHours));
	// мг/л → пг/мл
	const C_pgml = C_mgL * 1e6;
	return Math.max(C_pgml, 0);
}

function simulate(dosage, absorbation, aeraSize, bodyWeight, gSize, repeat = 0) {
    const data = []; 
	for(let simulatedTime = 0; simulatedTime < gSize*3;simulatedTime++){
		data.push({x: simulatedTime/2, y: 0})
	}
	function add(time, simulatedTime){
		const idx = parseInt(simulatedTime*2)
		if(idx >= data.length)return
		let value = data[idx]
		value.y += simulateE2({
			doseMg: dosage,
			areaCm2: aeraSize,
			zoneAbsorption: absorbation,
			timeHours: time,
			bodyWeight: bodyWeight
		})
	}
    for (let time = 0; time <= gSize; time += 0.5) {
		add(time, time)
		if(repeat > 0){
			let shift = repeat
			for(let shift = repeat; shift <= gSize; shift += repeat){
				add(time, time+shift)
			}
		}
    }
    return data;
}

const highlightY = {
	id: 'highlightY',
	beforeDraw(chart, args, optionsList) {
		const {ctx, chartArea, scales} = chart;
		optionsList.forEach(options => {
			const yMin = scales.y.getPixelForValue(options.min);
			const yMax = scales.y.getPixelForValue(options.max); 
			const top = Math.min(yMin, yMax);
			const bottom = Math.max(yMin, yMax);
			ctx.save();
			ctx.fillStyle = options.color || 'rgba(255, 0, 0, 0.15)';
			ctx.fillRect(
			chartArea.left,
			top,
			chartArea.right - chartArea.left,
			bottom - top
			);
			ctx.restore();
		});
	}
};