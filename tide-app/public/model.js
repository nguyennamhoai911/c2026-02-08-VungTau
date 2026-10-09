    function parseTime(value) {
      return (!value || value === "-" || value.trim() === "") ? null : value.trim();
    }

    function parseNumber(value) {
      const number = Number.parseFloat(value);
      return Number.isFinite(number) ? number : null;
    }

    function parseTideCSV(text) {
      const rows = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
      const result = [];
      let currentMonth = 0;
      let hasMonthColumn = false;
      let explicitMonth = null;

      rows.forEach(line => {
        const parts = line.split(",").map(part => part.trim());
        const first = Number.parseInt(parts[0], 10);

        if (!Number.isFinite(first)) {
          hasMonthColumn = parts[0].toLowerCase().includes("th");
          if (!hasMonthColumn) {
            explicitMonth = null;
            currentMonth += 1;
          }
          return;
        }

        let month = currentMonth || 1;
        let day = first;
        let offset = 1;

        if (hasMonthColumn) {
          const explicitDay = Number.parseInt(parts[1], 10);
          if (explicitMonth === null || explicitDay === 1 || first >= explicitMonth) {
            explicitMonth = first;
          }
          month = first < explicitMonth && explicitDay > 1 ? explicitMonth : first;
          day = explicitDay;
          offset = 2;
        }

        if (parts.length < 25) return;

        const hours = [];
        for (let hour = 0; hour < 24; hour += 1) {
          const value = Number.parseFloat(parts[hour + offset]);
          hours.push(Number.isFinite(value) ? value : null);
        }

        const highTides = [];
        const lowTides = [];
        const tideStart = offset + 24;
        const high1Time = parseTime(parts[tideStart]);
        const high1Value = parseNumber(parts[tideStart + 1]);
        const high2Time = parseTime(parts[tideStart + 2]);
        const high2Value = parseNumber(parts[tideStart + 3]);
        const low1Time = parseTime(parts[tideStart + 4]);
        const low1Value = parseNumber(parts[tideStart + 5]);
        const low2Time = parseTime(parts[tideStart + 6]);
        const low2Value = parseNumber(parts[tideStart + 7]);

        if (high1Time) highTides.push({ time: high1Time, height: high1Value });
        if (high2Time) highTides.push({ time: high2Time, height: high2Value });
        if (low1Time) lowTides.push({ time: low1Time, height: low1Value });
        if (low2Time) lowTides.push({ time: low2Time, height: low2Value });

        const date = `2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        result.push({ date, month, day, hours, highTides, lowTides });
      });

      return result;
    }


    function scoreHeight(height, threshold, softness = 0.12) {
      if (!Number.isFinite(height)) return 0;
      return 100 / (1 + Math.exp((height - threshold) / softness));
    }

    function scoreRisingFootball(h17, h1730, h18) {
      // Case giống 22/06: 18h >= 2.70m, gần như không đá được
      if (h18 >= 2.70) return 0;

      // Case giống 08/07: 18h khoảng 2.6m, thực tế chỉ khoảng 20%
      if (h18 >= 2.60) return 20;

      // Nếu 17:30 đã cao và 18h tiếp tục cao, rất rủi ro
      if (h1730 >= 2.45 && h18 >= 2.55) return 25;

      // Nếu toàn khung còn thấp, đá tốt dù nước đang dâng
      if (h17 <= 2.10 && h1730 <= 2.25 && h18 <= 2.40) {
        const baseScore = 90;
        const avgHeight = (h17 + h1730) / 2;
        const bonus = Math.max(0, Math.min(10, (2.175 - avgHeight) * 8));
        return baseScore + bonus;
      }

      // Điểm mềm cho các case còn lại
      const s17 = scoreHeight(h17, 2.30, 0.12);
      const s1730 = scoreHeight(h1730, 2.35, 0.12);
      const s18 = scoreHeight(h18, 2.45, 0.12);

      return s17 * 0.45 + s1730 * 0.40 + s18 * 0.15;
    }

    function scoreFallingFootball(h17, h1730, h18) {
      // Nước còn quá cao ở 17h và 17h30: không đá được
      if (h17 >= 3.10 && h1730 >= 3.00) return 0;

      // Case hiệu chuẩn 03/07:
      // 17h khoảng 2.8m, 17h30 khoảng 2.55m, 18h bắt đầu đẹp nhưng quá muộn
      if (h17 >= 2.75 && h1730 >= 2.50) return 20;

      // Vẫn hơi muộn, có thể đá ít nhưng không đẹp
      if (h17 >= 2.65 && h1730 >= 2.45) return 35;

      // Tạm được
      if (h17 >= 2.50 && h1730 >= 2.35) return 55;

      // Đẹp từ đầu khung
      if (h17 <= 2.40 && h1730 <= 2.30) {
        const baseScore = 90;
        const avgHeight = (h17 + h1730) / 2;
        const bonus = Math.max(0, Math.min(10, (2.35 - avgHeight) * 7));
        return baseScore + bonus;
      }

      // Điểm mềm cho các case còn lại
      const s17 = scoreHeight(h17, 2.45, 0.12);
      const s1730 = scoreHeight(h1730, 2.40, 0.12);
      const s18 = scoreHeight(h18, 2.50, 0.12);

      return s17 * 0.50 + s1730 * 0.35 + s18 * 0.15;
    }


export { parseTideCSV, scoreRisingFootball, scoreFallingFootball };
