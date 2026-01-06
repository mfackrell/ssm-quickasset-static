import { Storage } from '@google-cloud/storage';

const storage = new Storage();
const bucketName = process.env.GCS_BUCKET_NAME;
const stateFile = 'daily_run_state.json';

// Get today's date string in CST (e.g., "01/06/2026")
function getTodayCST() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(now); 
}

// Calculate which 15-minute slot we are in (0 to 24)
function getCurrentSlotInfo() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false
  });

  const parts = formatter.formatToParts(now);
  const hourPart = parts.find(p => p.type === 'hour');
  const minutePart = parts.find(p => p.type === 'minute');

  const hour = parseInt(hourPart.value, 10);
  const minute = parseInt(minutePart.value, 10);

  // Slots start at 9:00 AM. 
  // (Hour - 9) * 4 slots per hour + (Minute / 15)
  const slotIndex = ((hour - 9) * 4) + Math.floor(minute / 15);
  const totalSlots = 24; // 6 hours (9-3) * 4 slots/hour = 24 slots

  return { slotIndex, totalSlots };
}

export async function shouldRunToday() {
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(stateFile);
  const today = getTodayCST();

  let lastRunDate = null;

  try {
    const [contents] = await file.download();
    lastRunDate = JSON.parse(contents.toString()).lastRunDate;
  } catch (err) {
    // If file doesn't exist (first run ever), that's fine.
    if (err.code !== 404) console.warn("Could not read state file:", err.message);
  }

  // 1. Check if already ran today
  if (lastRunDate === today) {
    return { shouldRun: false, reason: 'already_ran_today' };
  }

  // 2. Calculate Probability
  const { slotIndex, totalSlots } = getCurrentSlotInfo();
  
  // If we are past 3:00 PM (slotIndex >= totalSlots), force run if it hasn't happened.
  // remainingSlots is at least 1 to avoid division by zero.
  const remainingSlots = Math.max(totalSlots - slotIndex, 1);

  // The probability increases as the day goes on.
  // At 9:00 AM (24 slots left) -> 1/24 chance (~4%)
  // At 2:45 PM (1 slot left) -> 1/1 chance (100%)
  const probability = 1 / remainingSlots;
  const roll = Math.random();

  console.log(`Slot: ${slotIndex}/${totalSlots} | Remaining: ${remainingSlots} | Prob: ${probability.toFixed(2)} | Roll: ${roll.toFixed(2)}`);

  if (roll > probability) {
    return {
      shouldRun: false,
      reason: 'dice_roll_failed',
      roll,
      probability
    };
  }

  return { shouldRun: true, probability, roll };
}

export async function markRunComplete() {
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(stateFile);
  const today = getTodayCST();

  console.log(`Marking job as complete for: ${today}`);

  await file.save(
    JSON.stringify({ lastRunDate: today }),
    {
      contentType: 'application/json',
      resumable: false
    }
  );
}
