// tracking.jsx
// Pure functions for calculating completion logic

function getDominantCategory(blocks, activities) {
  const eligibleBlocks = blocks.filter(b => !b.locked && b.id && !b.id.startsWith('wake_'));
  if (eligibleBlocks.length === 0) return null;

  const catStats = {};

  eligibleBlocks.forEach(b => {
    let pctCompleted = 0;
    if (b.type === 'check') pctCompleted = b.done ? 100 : 0;
    else if (b.type === 'quant') pctCompleted = Math.min(100, (b.current / (b.goal || 1)) * 100);
    else if (b.type === 'progress') pctCompleted = b.pct || 0;

    const actIdMatch = b.id.match(/^act_(.*?)_\d{4}-\d{2}-\d{2}$/);
    const actId = actIdMatch ? actIdMatch[1] : null;
    const activity = activities.find(a => a.id === actId);
    const durationMin = activity?.frequency?.durationMin || 60;

    const timeInvested = durationMin * (pctCompleted / 100);

    if (!catStats[b.cat]) {
      catStats[b.cat] = { timeInvested: 0, sumPct: 0, count: 0 };
    }
    catStats[b.cat].timeInvested += timeInvested;
    catStats[b.cat].sumPct += pctCompleted;
    catStats[b.cat].count += 1;
  });

  let dominant = null;
  let maxTime = -1;
  let maxAvgPct = -1;

  for (const cat in catStats) {
    const stat = catStats[cat];
    const avgPct = stat.sumPct / stat.count;
    
    if (stat.timeInvested > maxTime) {
      maxTime = stat.timeInvested;
      maxAvgPct = avgPct;
      dominant = cat;
    } else if (stat.timeInvested === maxTime) {
      if (avgPct > maxAvgPct) {
        maxTime = stat.timeInvested;
        maxAvgPct = avgPct;
        dominant = cat;
      }
    }
  }

  // If time invested is zero for all (none started), return the one with most planned time
  if (maxTime === 0) {
    let maxPlanned = -1;
    for (const b of eligibleBlocks) {
      const actIdMatch = b.id.match(/^act_(.*?)_\d{4}-\d{2}-\d{2}$/);
      const actId = actIdMatch ? actIdMatch[1] : null;
      const activity = activities.find(a => a.id === actId);
      const durationMin = activity?.frequency?.durationMin || 60;
      if (durationMin > maxPlanned) {
        maxPlanned = durationMin;
        dominant = b.cat;
      }
    }
  }

  return dominant;
}

function calculateDayCompletion(blocks, activities, isFuture) {
  const eligibleBlocks = blocks.filter(b => !b.locked && b.id && !b.id.startsWith('wake_'));
  
  if (eligibleBlocks.length === 0) {
    return {
      percentage: 0,
      dominantCategory: null,
      totalTime: 0,
      completedTime: 0,
      planlessOrFree: true,
      isFuture
    };
  }

  let totalTime = 0;
  let completedTime = 0;

  eligibleBlocks.forEach(b => {
    let pctCompleted = 0;
    if (b.type === 'check') pctCompleted = b.done ? 100 : 0;
    else if (b.type === 'quant') pctCompleted = Math.min(100, (b.current / (b.goal || 1)) * 100);
    else if (b.type === 'progress') pctCompleted = b.pct || 0;

    const actIdMatch = b.id.match(/^act_(.*?)_\d{4}-\d{2}-\d{2}$/);
    const actId = actIdMatch ? actIdMatch[1] : null;
    const activity = activities.find(a => a.id === actId);
    const durationMin = activity?.frequency?.durationMin || 60;

    totalTime += durationMin;
    completedTime += durationMin * (pctCompleted / 100);
  });

  const percentage = totalTime > 0 ? (completedTime / totalTime) * 100 : 0;
  const dominantCategory = getDominantCategory(eligibleBlocks, activities);

  return {
    percentage,
    dominantCategory,
    totalTime,
    completedTime,
    planlessOrFree: false,
    isFuture
  };
}

function calculateWeekCompletion(daysDataList) {
  let totalWeekTime = 0;
  let totalWeekCompletedTime = 0;

  const dailyPcts = daysDataList.map(d => {
    if (d.planlessOrFree) {
      return { ...d, displayPct: 0 };
    }
    if (!d.isFuture) {
      totalWeekTime += d.totalTime;
      totalWeekCompletedTime += d.completedTime;
    }
    return { ...d, displayPct: Math.round(d.percentage) };
  });

  const weeklyPct = totalWeekTime > 0 ? (totalWeekCompletedTime / totalWeekTime) * 100 : 0;

  return {
    weeklyPct: Math.round(weeklyPct),
    dailyPcts,
    hasFutureDays: daysDataList.some(d => d.isFuture)
  };
}

window.trackingUtils = {
  getDominantCategory,
  calculateDayCompletion,
  calculateWeekCompletion
};
