/* Kairos — Intelligent block generator (Scheduler) */

window.scheduler = {
  generateWeek: () => {
    const state = window.storeActions.getState();
    const { activities, obligations, settings } = state;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentDayOfWeek = today.getDay();
    const diffToMonday = today.getDate() - currentDayOfWeek + (currentDayOfWeek === 0 ? -6 : 1);
    const startOfWeek = new Date(today.setDate(diffToMonday));
    startOfWeek.setHours(0, 0, 0, 0);

    const generatedDays = {};

    // Spread each activity evenly across 7 days based on perWeek
    function shouldPlaceActivity(act, dayIndex) {
      const perWeek = act.frequency?.perWeek || 3;
      if (perWeek >= 7) return true;
      const step = 7 / perWeek;
      for (let k = 0; k < perWeek; k++) {
        if (Math.round(k * step) === dayIndex) return true;
      }
      return false;
    }

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];

      // Day encoding alignment:
      // JS getDay(): 0=Sun, 1=Mon … 6=Sat
      // OnbStep2 encoding: 0=Lun, 1=Mar … 5=Sáb, 6=Dom
      const jsDay = d.getDay();
      const kairosDay = jsDay === 0 ? 6 : jsDay - 1;

      const blocks = [];

      // 1. Wake-up block
      blocks.push({
        id: 'wake_' + dateStr,
        time: settings.wakeTime || '06:30',
        name: 'Despertar y rutina',
        cat: 'otro',
        type: 'check',
        done: false,
      });

      // 2. Obligations for this day
      obligations.forEach(ob => {
        if (ob.days && ob.days.includes(kairosDay)) {
          blocks.push({
            id: 'ob_' + ob.id + '_' + dateStr,
            time: ob.startTime,
            timeEnd: ob.endTime,
            name: ob.name,
            cat: ob.categoryId || 'otro',
            locked: true,
          });
        }
      });

      // 3. Activities spread across week
      activities.forEach(act => {
        if (shouldPlaceActivity(act, i)) {
          const tracking = act.tracking || 'check';
          const block = {
            id: 'act_' + act.id + '_' + dateStr,
            time: 'Flexible',
            name: act.name,
            cat: act.categoryId || 'otro',
            type: tracking,
            skipped: false,
          };
          if (tracking === 'check')    { block.done = false; }
          if (tracking === 'quant')    { block.current = 0; block.goal = act.goal || 1; block.unit = act.unit || 'ses.'; }
          if (tracking === 'progress') { block.pct = 0; }
          blocks.push(block);
        }
      });

      // 4. Sort: wake first, then obligations by time, then flexible
      const wakeBlocks    = blocks.filter(b => b.id && b.id.startsWith('wake_'));
      const lockedBlocks  = blocks.filter(b => b.locked).sort((a, b) => a.time.localeCompare(b.time));
      const flexBlocks    = blocks.filter(b => !b.locked && b.time === 'Flexible');
      const sorted = [...wakeBlocks, ...lockedBlocks, ...flexBlocks];

      generatedDays[dateStr] = { blocks: sorted, checkin: null };
    }

    window.storeActions.setDays(generatedDays);
    console.log('[Kairos Scheduler] Semana generada:', Object.keys(generatedDays));
  }
};
