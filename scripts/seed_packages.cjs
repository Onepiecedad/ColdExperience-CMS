const { createClient } = require('@supabase/supabase-js');
const sb = createClient(
  'https://hpbeqrwwcmetbjjqvzsv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwYmVxcnd3Y21ldGJqanF2enN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjczMjEsImV4cCI6MjA4MTY0MzMyMX0.SKSZokoWMiabZeqmVtgwlZh5JNO6VBa-yIOSPIFjCug'
);

const ROWS = [
  // 7-day remaining (first 7 already done)
  ['package7day','pages.laplandHoliday.featured.package.description','Description','The ultimate winter adventure! From exciting snowmobile safaris to magical northern lights hunts and traditional husky dog sledding. Everything included for a worry-free experience.'],
  ['package7day','pages.laplandHoliday.featured.package.primaryCta','Primary Button','Book 7-Day Package'],
  ['package7day','pages.laplandHoliday.featured.package.secondaryCta','Secondary Button','Questions about package?'],
  ['package7day','pages.laplandHoliday.featured.package.includesTitle','Includes Title',"What's included:"],
  ['package7day','pages.laplandHoliday.featured.package.includes.0','Includes 1','6 nights in private apartment with full equipment'],
  ['package7day','pages.laplandHoliday.featured.package.includes.1','Includes 2','All meals including fresh coffee and tea'],
  ['package7day','pages.laplandHoliday.featured.package.includes.2','Includes 3','Snowmobile safari with certified guide and equipment'],
  ['package7day','pages.laplandHoliday.featured.package.includes.3','Includes 4','Husky dog sledding tours with professional mushers'],
  ['package7day','pages.laplandHoliday.featured.package.includes.4','Includes 5','Private northern lights hunts with photography'],
  ['package7day','pages.laplandHoliday.featured.package.includes.5','Includes 6','Ice fishing and winter fishing experiences'],
  ['package7day','pages.laplandHoliday.featured.package.includes.6','Includes 7','Visit to reindeer herders and Sami culture'],
  ['package7day','pages.laplandHoliday.featured.package.includes.7','Includes 8','Transport from/to Skellefteå airport'],
  ['package7day','pages.laplandHoliday.featured.package.includes.8','Includes 9','Warm winter clothes and safety equipment'],
  ['package7day','pages.laplandHoliday.featured.package.includes.9','Includes 10','24/7 support during entire stay'],
  ['package7day','pages.laplandHoliday.featured.galleryCaptions.0','Gallery Caption 1','Husky Dog Sledding'],
  ['package7day','pages.laplandHoliday.featured.galleryCaptions.1','Gallery Caption 2','Snowmobile Safari'],
  ['package7day','pages.laplandHoliday.featured.galleryCaptions.2','Gallery Caption 3','Northern Lights Hunt'],
  // 5-day
  ['package5day','pages.laplandHoliday.fiveDay.title','Section Title','Alternative: 5-Day Winter Package'],
  ['package5day','pages.laplandHoliday.fiveDay.subtitle','Section Subtitle','Perfect for those who want to experience the best of Lapland in less time'],
  ['package5day','pages.laplandHoliday.fiveDay.package.name','Package Name','5-Day Winter Package'],
  ['package5day','pages.laplandHoliday.fiveDay.package.duration','Duration','4 nights / 5 days intensive adventure'],
  ['package5day','pages.laplandHoliday.fiveDay.package.price','Price','€1,750'],
  ['package5day','pages.laplandHoliday.fiveDay.package.perPerson','Per Person','per person'],
  ['package5day','pages.laplandHoliday.fiveDay.package.description','Description','Compressed adventure with highlights from our 7-day package. Perfect for active travelers who want to maximize their experiences in limited time.'],
  ['package5day','pages.laplandHoliday.fiveDay.package.primaryCta','Primary Button','Book 5-Day Package'],
  ['package5day','pages.laplandHoliday.fiveDay.package.secondaryCta','Secondary Button','Compare Packages'],
  ['package5day','pages.laplandHoliday.fiveDay.package.includesTitle','Includes Title',"What's included:"],
  ['package5day','pages.laplandHoliday.fiveDay.package.includes.0','Includes 1','4 nights in private apartment with full equipment'],
  ['package5day','pages.laplandHoliday.fiveDay.package.includes.1','Includes 2','All meals including fresh coffee and tea'],
  ['package5day','pages.laplandHoliday.fiveDay.package.includes.2','Includes 3','Snowmobile safari with certified guide'],
  ['package5day','pages.laplandHoliday.fiveDay.package.includes.3','Includes 4','Husky dog sledding with Siberian huskies'],
  ['package5day','pages.laplandHoliday.fiveDay.package.includes.4','Includes 5','Northern lights hunt with photography'],
  ['package5day','pages.laplandHoliday.fiveDay.package.includes.5','Includes 6','Winter fishing and ice fishing'],
  ['package5day','pages.laplandHoliday.fiveDay.package.includes.6','Includes 7','Transport from/to Skellefteå airport'],
  ['package5day','pages.laplandHoliday.fiveDay.package.includes.7','Includes 8','Warm winter clothes and equipment'],
  ['package5day','pages.laplandHoliday.fiveDay.package.includes.8','Includes 9','Guide and support during entire stay'],
  // 3-day
  ['package3day','pages.laplandHoliday.threeDay.title','Section Title','Signature: 3-Day Lapland Escape'],
  ['package3day','pages.laplandHoliday.threeDay.subtitle','Section Subtitle','Designed for travellers who want our greatest hits packed into an extended weekend.'],
  ['package3day','pages.laplandHoliday.threeDay.package.name','Package Name','3-Day Lapland Escape'],
  ['package3day','pages.laplandHoliday.threeDay.package.duration','Duration','3 days / 2 nights curated adventure'],
  ['package3day','pages.laplandHoliday.threeDay.package.price','Price','€1,250'],
  ['package3day','pages.laplandHoliday.threeDay.package.perPerson','Per Person','per person'],
  ['package3day','pages.laplandHoliday.threeDay.package.description','Description','Snowmobile trails, husky sledding and evenings under the aurora — all bundled into one long weekend with Gustav and Julia as your local hosts.'],
  ['package3day','pages.laplandHoliday.threeDay.package.primaryCta','Primary Button','Book 3-Day Package'],
  ['package3day','pages.laplandHoliday.threeDay.package.secondaryCta','Secondary Button','Ask about availability'],
  ['package3day','pages.laplandHoliday.threeDay.package.includesTitle','Includes Title',"What's included:"],
  ['package3day','pages.laplandHoliday.threeDay.package.includes.0','Includes 1','Airport transfer from Lycksele or Skellefteå'],
  ['package3day','pages.laplandHoliday.threeDay.package.includes.1','Includes 2','2 nights in the historic Råstrand schoolhouse'],
  ['package3day','pages.laplandHoliday.threeDay.package.includes.2','Includes 3','Welcome dinner with seasonal Lapland flavours'],
  ['package3day','pages.laplandHoliday.threeDay.package.includes.3','Includes 4','Guided snowmobile safari with all equipment'],
  ['package3day','pages.laplandHoliday.threeDay.package.includes.4','Includes 5','Evening northern lights hunt with warm drinks'],
  ['package3day','pages.laplandHoliday.threeDay.package.includes.5','Includes 6','Husky sledding tour with professional mushers'],
  ['package3day','pages.laplandHoliday.threeDay.package.itineraryTitle','Itinerary Title','Sample itinerary:'],
  ['package3day','pages.laplandHoliday.threeDay.package.itinerary.0','Day 1','Day 1: Arrival, check-in, sauna evening and welcome dinner'],
  ['package3day','pages.laplandHoliday.threeDay.package.itinerary.1','Day 2','Day 2: Snowmobile adventure, wilderness lunch, husky sledding and aurora chase'],
  ['package3day','pages.laplandHoliday.threeDay.package.itinerary.2','Day 3','Day 3: Slow breakfast, optional local visit and departure'],
  ['package3day','pages.laplandHoliday.threeDay.package.addOnsTitle','Add-ons Title','Optional add-ons:'],
  ['package3day','pages.laplandHoliday.threeDay.package.addOns.0','Add-on 1','Private sauna & outdoor hot tub session'],
  ['package3day','pages.laplandHoliday.threeDay.package.addOns.1','Add-on 2','Ice fishing on our favourite frozen lake'],
  ['package3day','pages.laplandHoliday.threeDay.package.addOns.2','Add-on 3','Professional photo package from the weekend'],
  ['package3day','pages.laplandHoliday.threeDay.package.cancellationPolicy','Cancellation Policy','Flexible rescheduling up to 30 days before arrival.'],
  // 1-day
  ['package1day','pages.laplandHoliday.oneDay.title','Section Title','Try It: 1-Day Experience'],
  ['package1day','pages.laplandHoliday.oneDay.subtitle','Section Subtitle','Perfect for those who want a taste of the Lapland winter adventure'],
  ['package1day','pages.laplandHoliday.oneDay.package.name','Package Name','1-Day Taster'],
  ['package1day','pages.laplandHoliday.oneDay.package.duration','Duration','8 hours intensive adventure'],
  ['package1day','pages.laplandHoliday.oneDay.package.price','Price','€380'],
  ['package1day','pages.laplandHoliday.oneDay.package.perPerson','Per Person','per person'],
  ['package1day','pages.laplandHoliday.oneDay.package.description','Description','Want to try before committing to a longer stay? Our 1-day package gives you an authentic taste of Lapland winter with either snowmobile tour or husky dog sledding.'],
  ['package1day','pages.laplandHoliday.oneDay.package.primaryCta','Primary Button','Book Day Tour'],
  ['package1day','pages.laplandHoliday.oneDay.package.secondaryCta','Secondary Button','Questions about day tour?'],
  ['package1day','pages.laplandHoliday.oneDay.package.includesTitle','Includes Title',"What's included:"],
  ['package1day','pages.laplandHoliday.oneDay.package.includes.0','Includes 1','Full day activity 8am-4pm'],
  ['package1day','pages.laplandHoliday.oneDay.package.includes.1','Includes 2','Lunch and warm drinks'],
  ['package1day','pages.laplandHoliday.oneDay.package.includes.2','Includes 3','Professional guide'],
  ['package1day','pages.laplandHoliday.oneDay.package.includes.3','Includes 4','Safety equipment'],
  ['package1day','pages.laplandHoliday.oneDay.package.includes.4','Includes 5','Transport within area'],
  ['package1day','pages.laplandHoliday.oneDay.package.includes.5','Includes 6','Coffee break by the fire'],
  ['package1day','pages.laplandHoliday.oneDay.package.includes.6','Includes 7','Memory photography'],
];

(async () => {
  let inserted = 0, skipped = 0;
  for (const [s, k, l, v] of ROWS) {
    const { data } = await sb.from('cms_content')
      .select('id').eq('page_slug', 'packages').eq('field_key', k).limit(1);
    if (data?.length) { skipped++; continue; }
    const { error } = await sb.from('cms_content').insert({
      page_slug: 'packages', section_key: s,
      field_key: k, field_label: l, field_type: 'text', content_en: v
    });
    if (error) console.error('ERR:', k, error.message);
    else inserted++;
  }
  console.log(`Done: ${inserted} inserted, ${skipped} skipped`);
  process.exit(0);
})();
