document.addEventListener("DOMContentLoaded", (event) => {
    const metricsURL = "https://metrics.octobot.online/metrics/community";
    const recentBotsWindow = 3600 * 24;

    const fetchBotCount = async (year, month, day, elementID) => {
        const element = document.querySelector(`#${elementID}`);
        if (element !== null) {
            try {
                const response = await axios.get(`${metricsURL}/count/${year}/${month}/${day}`);
                element.innerText = response.data.total;
            } catch (error) {
                console.log(error);
            }
        }
    }

    const fetchTopExchanges = async (topExchangesElement, lastDayMinUptime) => {
        try {
            const response = await axios.get(`${metricsURL}/top/exchanges/${lastDayMinUptime}`);
            fillTop(topExchangesElement, response.data);
        } catch (error) {
            console.log(error);
        }
    }

    const fetchTopTradingModes = async (topTradingModesElement, lastDayMinUptime) => {
        try {
            const response = await axios.get(`${metricsURL}/top/trading_modes/${lastDayMinUptime}`);
            fillTop(topTradingModesElement, response.data);
        } catch (error) {
            console.log(error);
        }
    }

    const fetchTopProfitabilities = async (profit_1, profit_2, profit_3, lastDayMinUptime) => {
        try {
            const response = await axios.get(`${metricsURL}/top/profitabilities/${lastDayMinUptime}/3`);
            fillTopProfits(profit_1, profit_2, profit_3, response.data)
        } catch (error) {
            console.log(error);
        }
    }

    const fillTop = (element, top) => {
        const minTopCount = 3;
        top.forEach(
            (topElement, index) => {
                if (topElement.count > minTopCount){
                    element.appendChild(createTopRow(index + 1, topElement.name, topElement.count))
                }
            }
        )
    }

    const createTopRow = (rank, name, count) => {
        const tr = document.createElement("tr");
        tr.appendChild(createCol(rank));
        tr.appendChild(createCol(name));
        tr.appendChild(createCol(count));
        return tr
    }

    const createCol = (text) => {
        const td = document.createElement("td");
        td.innerText = text;
        return td
    }

    const fillTopProfits = (profit_1, profit_2, profit_3, topProfits) => {
        profit_1.innerText = formatProfits(topProfits[0]);
        profit_2.innerText = formatProfits(topProfits[1]);
        profit_3.innerText = formatProfits(topProfits[2]);
    }

    const formatProfits = (profit_value) => {
        const prefix = profit_value > 0 ? "+" : "";
        return `${prefix}${round_digits(profit_value, 2)}`
    }

    const round_digits = (number, decimals) => {
        const rounded = Number(Math.round(`${number}e${decimals}`) + `e-${decimals}`);
        return isNaN(rounded) ? 0 : rounded;
    }

    const fetchOnlineBotsMetrics = async () => {
        await Promise.all([
            fetchBotCount(0, 0, -1, "daily-bots"),
            fetchBotCount(0, -1, 0, "monthly-bots"),
            fetchBotCount(0, 0, 0, "all-bots"),
        ]);
    }

    const fetchCommunityMetrics = async () => {
        // only trigger requests if there is something to diplay results on
        const topExchangesElement = document.querySelector("#top-exchanges-tbody");
        const topTradingModesElement = document.querySelector("#top-trading-modes-tbody");
        const profit_1 = document.querySelector("#profit-1");
        const profit_2 = document.querySelector("#profit-2");
        const profit_3 = document.querySelector("#profit-3");
        if (topExchangesElement !== null || topTradingModesElement != null) {
            const lastDayMinUptime = Math.floor(Date.now() / 1000) - recentBotsWindow;
            await Promise.all([
                fetchOnlineBotsMetrics(),
                fetchTopExchanges(topExchangesElement, lastDayMinUptime),
                fetchTopTradingModes(topTradingModesElement, lastDayMinUptime),
                fetchTopProfitabilities(profit_1, profit_2, profit_3, lastDayMinUptime),
            ]);
            const fetchedPartDiv = document.querySelector("#fetched-part");
            if (fetchedPartDiv != null){
                fetchedPartDiv.classList.remove("d-none");
            }
            const loaderPartDiv = document.querySelector("#loader");
            if (loaderPartDiv != null){
                loaderPartDiv.classList.add("d-none");
            }
            return true;
        }
        return false;
    }

    const render = async () => {
        if(!(await fetchCommunityMetrics())){
            await fetchOnlineBotsMetrics();
        }
    }

    const loadAnalytics = () => {
        if(typeof gtag !== "undefined"){
            gtag('config', 'G-WF9W9FMD0E', {'page_location': event.data.url});
        }
    }

    render();
    loadAnalytics();

});
