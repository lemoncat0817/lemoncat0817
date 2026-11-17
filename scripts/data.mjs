const get = async (url, init = {}) => {
  const res = await fetch(url, { ...init, signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
};

const LEVELS = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 };

// 任何失敗都回 null，橫幅退回沒有心情、沒有貢獻圖的樣子，build 不會因此中斷
export const fetchCalendar = async (login) => {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return null;
  try {
    const query = `query($login:String!){user(login:$login){contributionsCollection{contributionCalendar{totalContributions weeks{contributionDays{date contributionCount contributionLevel}}}}}}`;
    const json = await get('https://api.github.com/graphql', {
      method: 'POST',
      headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'profile-readme-builder' },
      body: JSON.stringify({ query, variables: { login } }),
    });
    const cal = json.data.user.contributionsCollection.contributionCalendar;
    return {
      total: cal.totalContributions,
      weeks: cal.weeks.map((w) => w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount, level: LEVELS[d.contributionLevel] ?? 0 }))),
    };
  } catch (error) {
    console.warn(`calendar: ${error.message}`);
    return null;
  }
};

export const moodOf = (calendar, today) => {
  if (!calendar) return null;
  const last = calendar.weeks.flat().filter((d) => d.count > 0 && d.date <= today).at(-1)?.date;
  if (!last) return 'bored';
  // 貢獻日曆以 UTC 切日，跟台灣差 8 小時，所以「今天或昨天有貢獻」都算開心
  const gap = (Date.parse(today) - Date.parse(last)) / 86_400_000;
  return gap <= 1 ? 'happy' : gap >= 7 ? 'bored' : 'normal';
};

export const PLACES = {
  臺北市: [25.04, 121.56], 新北市: [25.01, 121.46], 基隆市: [25.13, 121.74], 桃園市: [24.99, 121.3],
  新竹市: [24.8, 120.97], 新竹縣: [24.83, 121.01], 苗栗縣: [24.56, 120.82], 臺中市: [24.15, 120.67],
  彰化縣: [24.08, 120.54], 南投縣: [23.91, 120.68], 雲林縣: [23.71, 120.43], 嘉義市: [23.48, 120.45],
  嘉義縣: [23.46, 120.33], 臺南市: [22.99, 120.21], 高雄市: [22.63, 120.3], 屏東縣: [22.67, 120.49],
  宜蘭縣: [24.75, 121.75], 花蓮縣: [23.99, 121.6], 臺東縣: [22.76, 121.14], 澎湖縣: [23.57, 119.58],
  金門縣: [24.44, 118.32], 連江縣: [26.16, 119.95],
};

// WMO 天氣代碼歸成五類；台灣幾乎不下雪，雪的代碼併進陰天
const kindOf = (code) => {
  if (code <= 1) return 'clear';
  if (code === 2) return 'partly';
  if (code >= 95) return 'thunder';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
  return 'cloudy';
};

const SEVERITY = ['clear', 'partly', 'cloudy', 'rain', 'thunder'];

// 排程間隔好幾小時，用接下來 6 小時的逐時預報取最常出現的類型；同票時取較嚴重的
export const fetchWeather = async (place) => {
  const coords = PLACES[place];
  if (!coords) return null;
  try {
    const [lat, lon] = coords;
    const json = await get(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=weather_code&forecast_hours=6&timezone=Asia%2FTaipei`,
    );
    const codes = json.hourly.weather_code;
    console.log(`weather codes: ${codes.join(',')}`);
    const votes = {};
    for (const code of codes) votes[kindOf(code)] = (votes[kindOf(code)] ?? 0) + 1;
    return Object.keys(votes).sort((a, b) => votes[b] - votes[a] || SEVERITY.indexOf(b) - SEVERITY.indexOf(a))[0];
  } catch (error) {
    console.warn(`weather: ${error.message}`);
    return null;
  }
};
