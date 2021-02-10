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
        if (profit_1 !== null || profit_2 !== null || profit_3 !== null){
            try {
                const response = await axios.get(`${metricsURL}/top/profitabilities/${lastDayMinUptime}/3`);
                fillTopProfits(profit_1, profit_2, profit_3, response.data)
            } catch (error) {
                console.log(error);
            }
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
        [profit_1, profit_2, profit_3].forEach((profitElement, index) => {
            if (profitElement !== null){
                profitElement.innerText = formatProfits(topProfits[index]);
            }
        })
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
            gtag('config', 'G-WF9W9FMD0E', {'page_location': window.location.href});
        }
    }

    const handleBannerVideo = () => {
        // inspired from https://fynydd.com/blog/properly-handling-html5-video/
        const video = document.querySelector(".video-banner");
        if (video !== null) {
            // breakpoint is the minimum width from which to start playing the video (to avoid mobile data overload)
            const breakpoint = 1024;

            const getDocumentWidth = () => {
                return window.innerWidth
                    || document.documentElement.clientWidth
                    || document.body.clientWidth;
            }

            const enableFallbackPoster = () => {
                video.setAttribute('poster', video.getAttribute("data-fallback-poster"));
            }

            const loadVideo = () => {
                const video = document.querySelector(".video-banner");

                // Remove existing source tags for mobile
                if (getDocumentWidth() < breakpoint + 1) {
                    enableFallbackPoster();
                    while (video.firstChild) {
                        video.removeChild(video.firstChild);
                    }
                }

                // Add source tags if not already present
                if (getDocumentWidth() > breakpoint) {
                    if (document.querySelectorAll(".video-banner > source").length < 1) {
                        const source1 = document.createElement('source');
                        const src = video.getAttribute("data-src");

                        source1.setAttribute('src', src);
                        source1.setAttribute('type', 'video/mp4');

                        video.appendChild(source1);
                    }

                    // Play the video
                    video.play();
                } else {
                    enableFallbackPoster();
                }
            }

            loadVideo();

            // Pause when page is not in the foreground
            window.addEventListener('blur', () => {
                video.pause();
            });

            // Play when page returns to the foreground
            window.addEventListener('focus', () => {
                if (getDocumentWidth() > breakpoint) {
                    video.play();
                } else {
                    enableFallbackPoster();
                }
            });

            // Play video when page resizes
            window.addEventListener('resize', () => {
                loadVideo();
            });

            // Play when page returns from browser history button
            window.addEventListener('popstate', () => {
                if (getDocumentWidth() > breakpoint) {
                    video.play();
                } else {
                    enableFallbackPoster();
                }
            });
        }
    }

    handleBannerVideo();
    render();
    loadAnalytics();

});
