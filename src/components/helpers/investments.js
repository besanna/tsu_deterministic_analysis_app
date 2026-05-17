const InvestAPI = {

    calculateDensity(data, numBins = 100) {
        const min = Math.min(...data);
        const max = Math.max(...data);
        const step = (max - min) / numBins;
        const bins = Array.from({ length: numBins }, (_, i) => min + i * step);
        const density = bins.map(bin => ({
            x: bin,
            y: data.filter(d => d >= bin && d < bin + step).length / data.length,
        }));
        return density;
    },

    computePareto(alpha, min_capital, probability_threshold) {
        const x_values = [];
        const probabilities = [];
        let i = min_capital;
        let probability = 1;
    
        while (probability > probability_threshold) {
            x_values.push(i);
            probability = 1 - (1 - Math.pow(min_capital / i, alpha)); // CDF
            probabilities.push(probability);
            i += (10000 - min_capital) / 100;
        }
    
        return x_values.map((x, index) => ({ x, y: probabilities[index] }));
    },

    analyzeInvestorCapital(capital, probability_threshold = 0.001) {
        const filteredCapital = capital.filter(c => c > 0);
        const minCapital = Math.min(...filteredCapital);
        const alpha = 1 + filteredCapital.length / filteredCapital.reduce((acc, c) => acc + Math.log(c / minCapital), 0);
        console.log("analyzeInvestorCapital: Оценка показателя степени α:", alpha);
        const sortedCapital = filteredCapital.sort((a, b) => b - a);
        const numInvestors = sortedCapital.length;
        const top20PercentCount = Math.ceil(numInvestors * 0.2);
        const keyPlayers = sortedCapital.slice(0, top20PercentCount);
        console.log("analyzeInvestorCapital: Ключевые игроки (20% с наибольшими капиталами):", keyPlayers);

        // const predictedCapital = Array.from({ length: investors }, () => {
        //     let value = (1 - Math.random()) ** (- 1 / (alpha - 1))
        //     return minCapital * value;
        // });



        // console.log("analyzeInvestorCapital: Прогноз капитала:", predictedCapital);
        // const density = this.calculateDensity(predictedCapital, investors);
        const pareto = this.computePareto(alpha, minCapital, probability_threshold);


        // console.log("analyzeInvestorCapital: density:", density);
        return {density: pareto, keyPlayers, alpha};
    },

    randomForChart(count) {
        let arr = [];

        for (let i = 0; i < count; i++) {
            arr.push({x: i, y: Math.random()});
        }

        return arr;
    }
}

export default InvestAPI;