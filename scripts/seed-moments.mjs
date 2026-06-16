import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
const supabaseUrl = 'https://raylgrxjvfdopvmsjixm.supabase.co';
const supabaseKey = readFileSync('.env.local', 'utf-8').match(/VITE_SUPABASE_ANON_KEY=(.+)/)?.[1];
if (!supabaseKey) { console.log('No anon key found'); process.exit(1); }
const supabase = createClient(supabaseUrl, supabaseKey);

// Seed moments data
const moments = [
  ['b0000000-0000-0000-0000-000000000001', 'https://picsum.photos/seed/luna-daily-1/400/400', '窗边晒太阳 🌤️', 'daily', '2025-06-10'],
  ['b0000000-0000-0000-0000-000000000001', 'https://picsum.photos/seed/luna-daily-2/400/400', '追逐蝴蝶 🦋', 'daily', '2025-06-11'],
  ['b0000000-0000-0000-0000-000000000001', 'https://picsum.photos/seed/luna-daily-3/400/400', '纸箱里打盹 📦', 'daily', '2025-06-12'],
  ['b0000000-0000-0000-0000-000000000001', 'https://picsum.photos/seed/luna-interact-1/600/450', '梳毛时光 🐱', 'interaction', '2025-06-08'],
  ['b0000000-0000-0000-0000-000000000001', 'https://picsum.photos/seed/luna-interact-2/600/450', '逗猫棒大战 🪄', 'interaction', '2025-06-05'],
  ['b0000000-0000-0000-0000-000000000001', 'https://picsum.photos/seed/luna-growth-1/400/500', '小猫到家第一天 🐣', 'growth', '2023-01-15'],
  ['b0000000-0000-0000-0000-000000000001', 'https://picsum.photos/seed/luna-growth-2/400/500', '一岁啦 🎂', 'growth', '2024-03-15'],
  ['b0000000-0000-0000-0000-000000000001', 'https://picsum.photos/seed/luna-growth-3/400/500', '现在的大美人 ✨', 'growth', '2025-06-01'],
  ['b0000000-0000-0000-0000-000000000002', 'https://picsum.photos/seed/max-daily-1/400/400', '公园狂奔 🐕', 'daily', '2025-06-12'],
  ['b0000000-0000-0000-0000-000000000002', 'https://picsum.photos/seed/max-daily-2/400/400', '叼着球回来 🎾', 'daily', '2025-06-11'],
  ['b0000000-0000-0000-0000-000000000002', 'https://picsum.photos/seed/max-daily-3/400/400', '雨中散步 🌧️', 'daily', '2025-06-09'],
  ['b0000000-0000-0000-0000-000000000002', 'https://picsum.photos/seed/max-interact-1/600/450', '飞盘接球 🥏', 'interaction', '2025-06-10'],
  ['b0000000-0000-0000-0000-000000000002', 'https://picsum.photos/seed/max-interact-2/600/450', '早晨拥抱 🤗', 'interaction', '2025-06-08'],
  ['b0000000-0000-0000-0000-000000000002', 'https://picsum.photos/seed/max-growth-1/400/500', '幼犬时期 🐶', 'growth', '2019-07-20'],
  ['b0000000-0000-0000-0000-000000000002', 'https://picsum.photos/seed/max-growth-2/400/500', '帅气一岁 🏆', 'growth', '2020-07-20'],
  ['b0000000-0000-0000-0000-000000000002', 'https://picsum.photos/seed/max-growth-3/400/500', '今天的Max 💪', 'growth', '2025-06-01'],
  ['b0000000-0000-0000-0000-000000000003', 'https://picsum.photos/seed/coco-daily-1/400/400', '美容后自恋 💇', 'daily', '2025-06-13'],
  ['b0000000-0000-0000-0000-000000000003', 'https://picsum.photos/seed/coco-daily-2/400/400', '小步快跑 🏃', 'daily', '2025-06-10'],
  ['b0000000-0000-0000-0000-000000000003', 'https://picsum.photos/seed/coco-daily-3/400/400', '玩具收藏 🧸', 'daily', '2025-06-08'],
  ['b0000000-0000-0000-0000-000000000003', 'https://picsum.photos/seed/coco-interact-1/600/450', '教新把戏 🎪', 'interaction', '2025-06-07'],
  ['b0000000-0000-0000-0000-000000000003', 'https://picsum.photos/seed/coco-interact-2/600/450', '沙发依偎 🛋️', 'interaction', '2025-06-05'],
  ['b0000000-0000-0000-0000-000000000003', 'https://picsum.photos/seed/coco-growth-1/400/500', '到家第一天 🏠', 'growth', '2022-11-05'],
  ['b0000000-0000-0000-0000-000000000003', 'https://picsum.photos/seed/coco-growth-2/400/500', '现在的Coco 🌟', 'growth', '2025-06-01'],
  ['b0000000-0000-0000-0000-000000000004', 'https://picsum.photos/seed/bella-daily-1/400/400', '爬架最高处 🐈', 'daily', '2025-06-12'],
  ['b0000000-0000-0000-0000-000000000004', 'https://picsum.photos/seed/bella-daily-2/400/400', '偷看窗外 👀', 'daily', '2025-06-11'],
  ['b0000000-0000-0000-0000-000000000004', 'https://picsum.photos/seed/bella-daily-3/400/400', '午睡三小时 💤', 'daily', '2025-06-09'],
  ['b0000000-0000-0000-0000-000000000004', 'https://picsum.photos/seed/bella-interact-1/600/450', '摸摸肚肚 🤲', 'interaction', '2025-06-06'],
  ['b0000000-0000-0000-0000-000000000004', 'https://picsum.photos/seed/bella-interact-2/600/450', '激光点追踪 🔴', 'interaction', '2025-06-04'],
  ['b0000000-0000-0000-0000-000000000004', 'https://picsum.photos/seed/bella-growth-1/400/500', '领养时的小可爱 🥺', 'growth', '2023-09-12'],
  ['b0000000-0000-0000-0000-000000000004', 'https://picsum.photos/seed/bella-growth-2/400/500', '半年后 😊', 'growth', '2024-03-12'],
  ['b0000000-0000-0000-0000-000000000004', 'https://picsum.photos/seed/bella-growth-3/400/500', '现在的女王 👑', 'growth', '2025-06-01'],
  ['b0000000-0000-0000-0000-000000000005', 'https://picsum.photos/seed/charlie-daily-1/400/400', '跑轮时间 ⚡', 'daily', '2025-06-12'],
  ['b0000000-0000-0000-0000-000000000005', 'https://picsum.photos/seed/charlie-daily-2/400/400', '藏食物 🥜', 'daily', '2025-06-10'],
  ['b0000000-0000-0000-0000-000000000005', 'https://picsum.photos/seed/charlie-daily-3/400/400', '钻木屑 🪵', 'daily', '2025-06-08'],
  ['b0000000-0000-0000-0000-000000000005', 'https://picsum.photos/seed/charlie-interact-1/600/450', '手心喂食 🖐️', 'interaction', '2025-06-07'],
  ['b0000000-0000-0000-0000-000000000005', 'https://picsum.photos/seed/charlie-interact-2/600/450', '探险时间 🧭', 'interaction', '2025-06-05'],
  ['b0000000-0000-0000-0000-000000000005', 'https://picsum.photos/seed/charlie-growth-1/400/500', '刚到家 🐹', 'growth', '2024-06-01'],
  ['b0000000-0000-0000-0000-000000000005', 'https://picsum.photos/seed/charlie-growth-2/400/500', '两个月后 🥰', 'growth', '2024-08-01'],
  ['b0000000-0000-0000-0000-000000000005', 'https://picsum.photos/seed/charlie-growth-3/400/500', '现在的Charlie 🏋️', 'growth', '2025-06-01'],
];

let inserted = 0;
for (const m of moments) {
  const { error } = await supabase
    .from('pet_moments')
    .insert({ pet_id: m[0], image_url: m[1], caption: m[2], moment_type: m[3], taken_at: m[4] });
  if (error) {
    console.log(`Insert error: ${error.message} for ${m[2]}`);
  } else {
    inserted++;
  }
}
console.log(`Inserted ${inserted}/${moments.length} moments`);
