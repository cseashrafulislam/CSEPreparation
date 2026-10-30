// Original, independently distinct general-subject practice facts and rule checks.
// These are not authenticated previous exam questions or live current-affairs claims.
// Each item is asked once; unlike the numerical bank, no altered-number variants are made.
export const generalPrepRows = [];

function optionsFor(answer, allAnswers, position, explicitDistractors = null) {
  const alternatives = [];
  if (explicitDistractors) {
    alternatives.push(...explicitDistractors);
  } else {
    for (let step = 1; step < allAnswers.length && alternatives.length < 3; step++) {
      const candidate = allAnswers[(position + step) % allAnswers.length];
      if (candidate !== answer && !alternatives.includes(candidate)) alternatives.push(candidate);
    }
  }
  if (alternatives.length !== 3 || new Set([answer, ...alternatives]).size !== 4) {
    throw new Error("General bank requires four distinct options");
  }
  const correctIndex = (position * 7 + 1) % 4;
  const options = [...alternatives];
  options.splice(correctIndex, 0, answer);
  return [options, correctIndex];
}

function addPairs(topic, subtopic, difficulty, question, explanation, banglaExplanation, pairs) {
  const answers = pairs.map(entry => entry[1]);
  pairs.forEach(([key, answer, wrongOptions], i) => {
    const [options, correctIndex] = optionsFor(answer, answers, i, wrongOptions);
    generalPrepRows.push([
      topic, difficulty, question(key), options, correctIndex,
      explanation(key, answer), banglaExplanation(key, answer), subtopic
    ]);
  });
}

function addDirect(topic, subtopic, entries) {
  entries.forEach(([difficulty, prompt, answer, a, b, c, en, bn], i) => {
    const options = [answer, a, b, c];
    if (new Set(options).size !== 4) throw new Error("Duplicate direct option: " + prompt);
    const correctIndex = (i + subtopic.length) % 4;
    options.splice(0, 1);
    options.splice(correctIndex, 0, answer);
    generalPrepRows.push([topic, difficulty, prompt, options, correctIndex, en, bn, subtopic]);
  });
}

addPairs("Bangla", "সমার্থক শব্দ", "Medium",
  word => "‘" + word + "’ শব্দের সমার্থক কোনটি?",
  (word, answer) => "In standard Bangla usage, ‘" + answer + "’ conveys the meaning of ‘" + word + "’.",
  (word, answer) => "‘" + word + "’ শব্দটির প্রচলিত সমার্থক শব্দ ‘" + answer + "’।",
  [
    ["অমল","নির্মল"],["অরণ্য","বন"],["অম্বু","জল"],["অনল","অগ্নি"],["অম্বুজ","পদ্ম"],
    ["অরুণ","লালিমা"],["অপূর্ব","অনন্য"],["অচল","স্থির"],["অতিথি","অভ্যাগত"],["অগ্রজ","জ্যেষ্ঠ"],
    ["অধম","নিকৃষ্ট"],["অন্তর","হৃদয়"],["অবনি","ধরণী"],["অপেক্ষা","প্রতীক্ষা"],["অভিলাষ","আকাঙ্ক্ষা"],
    ["আকাশ","গগন"],["আলোক","জ্যোতি"],["আনন্দ","হর্ষ"],["আত্মীয়","স্বজন"],["আশ্রয়","শরণ"],
    ["ইন্দু","চন্দ্র"],["উদ্যান","বাগান"],["উৎসাহ","উদ্দীপনা"],["উৎকর্ষ","উন্নতি"],["ঋজু","সরল"],
    ["কান্তি","দীপ্তি"],["কুসুম","পুষ্প"],["কুয়াশা","নীহারিকা"],["ক্ষুধা","বুভুক্ষা"],["গৃহ","আলয়"],
    ["গিরি","পর্বত"],["চরণ","পদ"],["জগৎ","বিশ্ব"],["জীবন","আয়ু"],["তরঙ্গ","ঢেউ"],
    ["দিবস","দিন"],["দুঃখ","বেদনা"],["ধন","সম্পদ"],["নদী","সরিতা"],["নিশীথ","মধ্যরাত্রি"],
    ["নৃপতি","রাজা"],["পবন","বায়ু"],["পল্লি","গ্রাম"],["পাষাণ","প্রস্তর"],["পুষ্করিণী","পুকুর"],
    ["প্রভাত","ভোর"],["বসুন্ধরা","পৃথিবী"],["বিহঙ্গ","পাখি"],["মেঘ","জলদ"],["রজনী","রাত"],
    ["রবি","সূর্য"],["সাগর","সমুদ্র"],["শশী","চাঁদ"],["শত্রু","বৈরী"],["হস্তী","গজ"],
    ["হিম","তুষার"],["মিত্র","সখা"],["দরিদ্র","নিঃস্ব"],["বিপদ","সংকট"],["নিয়তি","ভাগ্য"]
  ]);

addPairs("Bangla", "বিপরীত শব্দ", "Medium",
  word => "‘" + word + "’ শব্দের বিপরীতার্থক কোনটি?",
  (word, answer) => "‘" + answer + "’ expresses the opposite of ‘" + word + "’ in this context.",
  (word, answer) => "‘" + word + "’ শব্দটির বিপরীত অর্থ প্রকাশ করে ‘" + answer + "’।",
  [
    ["আলো","অন্ধকার"],["উন্নতি","অবনতি"],["সত্য","মিথ্যা"],["জয়","পরাজয়"],["শান্তি","অশান্তি"],
    ["আশা","নিরাশা"],["আদি","অন্ত"],["আগমন","প্রস্থান"],["জন্ম","মৃত্যু"],["উষ্ণ","শীতল"],
    ["আধুনিক","প্রাচীন"],["অনুকূল","প্রতিকূল"],["উদার","কৃপণ"],["স্বাধীন","পরাধীন"],["নতুন","পুরোনো"],
    ["আনন্দ","বিষাদ"],["উচিত","অনুচিত"],["লাভ","ক্ষতি"],["নির্মল","মলিন"],["উচ্চ","নিম্ন"],
    ["দীর্ঘ","হ্রস্ব"],["আবৃত","উন্মুক্ত"],["বৃদ্ধি","হ্রাস"],["বাহির","ভিতর"],["দ্রুত","ধীর"],
    ["উপস্থিত","অনুপস্থিত"],["ঐক্য","বিভেদ"],["প্রশংসা","নিন্দা"],["সাহসী","ভীরু"],["মুখ্য","গৌণ"],
    ["বিশ্বাস","অবিশ্বাস"],["সৃষ্টি","ধ্বংস"],["প্রকাশ","গোপন"],["আশীর্বাদ","অভিশাপ"],["সক্ষম","অক্ষম"],
    ["শুষ্ক","সিক্ত"],["সার্থক","ব্যর্থ"],["সজীব","নির্জীব"],["সৎ","অসৎ"],["মৌখিক","লিখিত"],
    ["সুগম","দুর্গম"],["সুবিচার","অবিচার"],["সংযম","অসংযম"],["স্বচ্ছ","অস্বচ্ছ"],["প্রবেশ","বহির্গমন"],
    ["পরিষ্কার","নোংরা"],["নম্র","উদ্ধত"],["লঘু","গুরু"],["স্থিতি","গতি"],["সূচনা","সমাপ্তি"],
    ["উত্তর","দক্ষিণ"],["পূর্ব","পশ্চিম"],["পূর্ণ","শূন্য"],["শুভ","অশুভ"],["জাগরণ","নিদ্রা"],
    ["সুন্দর","কুৎসিত"],["সুবাস","দুর্গন্ধ"],["অনুকরণ","মৌলিকতা"],["লৌকিক","অলৌকিক"],["সামান্য","অসামান্য"]
  ]);

addPairs("Bangla", "বাগধারা", "Hard",
  phrase => "‘" + phrase + "’ বাগধারাটির অর্থ কী?",
  (phrase, answer) => "The Bangla idiom ‘" + phrase + "’ figuratively means ‘" + answer + "’, not a literal action.",
  (phrase, answer) => "‘" + phrase + "’ বাগধারার রূপক অর্থ ‘" + answer + "’। আক্ষরিক অর্থে নেওয়া যাবে না।",
  [
    ["অরণ্যে রোদন","নিষ্ফল আবেদন"],["আকাশকুসুম","অবাস্তব কল্পনা"],["অন্ধের যষ্টি","একমাত্র অবলম্বন"],
    ["অমাবস্যার চাঁদ","অতি দুর্লভ ব্যক্তি"],["অগস্ত্যযাত্রা","চিরবিদায়"],["অন্তঃসারশূন্য","ভেতরে মূল্যহীন"],
    ["আদা জল খেয়ে লাগা","দৃঢ় সংকল্পে কাজ করা"],["আঙুল ফুলে কলাগাছ","হঠাৎ ধনী হওয়া"],["আড়ি পাতা","গোপনে শোনা"],
    ["ইঁদুর দৌড়","অর্থহীন প্রতিযোগিতা"],["উড়ো কথা","ভিত্তিহীন গুজব"],["উলুবনে মুক্তো ছড়ানো","অযোগ্য স্থানে মূল্যবান জিনিস ব্যয়"],
    ["এক ঢিলে দুই পাখি","এক কাজে দুই ফল"],["কান পাতলা","সহজে পরের কথা বিশ্বাস করে এমন"],
    ["কান ভারী করা","কারও বিরুদ্ধে কুপরামর্শ দেওয়া"],["কপাল পোড়া","দুর্ভাগা"],["কাঠখোট্টা","রুক্ষ স্বভাবের"],
    ["কুম্ভীরাশ্রু","মিথ্যা কান্না"],["গড্ডলিকা প্রবাহ","অন্ধ অনুকরণ"],["গলগ্রহ","বোঝাস্বরূপ ব্যক্তি"],
    ["চোখের বালি","বিরক্তির কারণ"],["চোখে ধুলো দেওয়া","প্রতারণা করা"],["চুলচেরা বিচার","অতি সূক্ষ্ম বিচার"],
    ["জলে কুমির ডাঙায় বাঘ","উভয় সংকট"],["তাসের ঘর","অস্থায়ী ভিত্তির ব্যবস্থা"],
    ["তিলকে তাল করা","তুচ্ছ বিষয় বড় করা"],["দাঁতে দাঁত চেপে","কষ্ট সহ্য করে"],["দুধের মাছি","সুসময়ের সঙ্গী"],
    ["ধরি মাছ না ছুঁই পানি","দায় এড়িয়ে কাজ উদ্ধার"],["নাক কাটা","সম্মানহানি"],["নাক উঁচু","অহংকারী"],
    ["পাকা ধানে মই দেওয়া","সুসম্পন্ন কাজে বাধা দেওয়া"],["পিলে চমকানো","ভয় পাইয়ে দেওয়া"],
    ["বালির বাঁধ","দুর্বল আশ্রয়"],["বিড়ালের ভাগ্যে শিকে ছেঁড়া","আকস্মিক সৌভাগ্য"],
    ["মাছের তেলে মাছ ভাজা","অন্যের সম্পদে নিজের কাজ করা"],["মেঘ না চাইতে জল","অপ্রত্যাশিত প্রাপ্তি"],
    ["রামরাজত্ব","আদর্শ শান্তিপূর্ণ শাসন"],["লেজ গুটানো","ভয়ে পিছু হটা"],["শাক দিয়ে মাছ ঢাকা","দোষ গোপন করা"],
    ["সাপে নেউলে","চরম শত্রুতা"],["সোনায় সোহাগা","উত্তমের সঙ্গে আরও উত্তম যোগ"],["হাত গুটিয়ে বসে থাকা","নিষ্ক্রিয় থাকা"],
    ["হাত পাকানো","দক্ষতা অর্জন করা"],["হাতের পাঁচ","শেষ সম্বল"],["হাড়ে হাড়ে টের পাওয়া","ভালোভাবে উপলব্ধি করা"]
  ]);

addDirect("Bangla", "ব্যাকরণ ও সাহিত্য", [
  ["Easy","বাংলা ভাষার মূল শব্দভান্ডারের একটি প্রধান উৎস কোনটি?","সংস্কৃত","জার্মান","রুশ","লাতিন","A major historical source of Bangla vocabulary is Sanskrit.","বাংলা শব্দভান্ডারে সংস্কৃতজাত তৎসম ও তদ্ভব শব্দের উল্লেখযোগ্য স্থান রয়েছে।"],
  ["Easy","‘সে বিদ্যালয়ে যায়’—এখানে ‘সে’ কোন পদ?","সর্বনাম","বিশেষণ","ক্রিয়া","অব্যয়","‘সে’ substitutes for a noun; it is a pronoun.","নামের পরিবর্তে ‘সে’ বসে, তাই সর্বনাম।"],
  ["Easy","‘সুন্দর ফুল’—‘সুন্দর’ কোন পদ?","বিশেষণ","ক্রিয়া","বিশেষ্য","সর্বনাম","‘সুন্দর’ modifies the noun ফুল; it is an adjective.","বিশেষ্যের গুণ বোঝায় বলে ‘সুন্দর’ বিশেষণ।"],
  ["Easy","‘পাখি উড়ছে’—‘উড়ছে’ কী বোঝায়?","ক্রিয়া","বিশেষ্য","অব্যয়","কারক","The word ‘উড়ছে’ expresses an action.","কাজ হওয়া বোঝায় বলে ‘উড়ছে’ ক্রিয়াপদ।"],
  ["Medium","‘অতি’ উপসর্গটি কোন শব্দে আছে?","অতিমানব","অভিমান","অধিকার","অনিবার্য","‘অতিমানব’ begins with the prefix অতি.","অতিমানব শব্দে ‘অতি’ উপসর্গ যোগ হয়েছে।"],
  ["Medium","‘অনুচিত’ শব্দে কোন উপসর্গ আছে?","অন্","উৎ","প্রতি","সম্","The negative prefix in অনুচিত is অন্.","উচিত শব্দের আগে নেতিবাচক ‘অন্’ উপসর্গ যুক্ত হয়েছে।"],
  ["Medium","‘অসাধারণ’ শব্দে উপসর্গ কোনটি?","অ","সাধ","রণ","আন","The negative/contrary prefix is অ.","‘সাধারণ’ শব্দের আগে ‘অ’ উপসর্গ ব্যবহৃত হয়েছে।"],
  ["Medium","‘পাঠক’ শব্দে কোন প্রত্যয় আছে?","অক","তা","ইয়া","অন","The agent noun পাঠক is formed with the -অক suffix.","পাঠ ধাতুর সঙ্গে ‘অক’ প্রত্যয় যোগে পাঠক।"],
  ["Medium","‘মানবতা’ শব্দে প্রত্যয় কোনটি?","তা","মান","অন","বতা","The suffix তা forms an abstract noun.","মানব শব্দে ‘তা’ যোগে মানবতা।"],
  ["Medium","‘দৈনিক’ শব্দের মূল শব্দ কোনটি?","দিন","দৈন","দন","ইনিক","দৈনিক is derived from দিন.","দিন থেকে দৈনিক শব্দটি গঠিত।"],
  ["Medium","সমাসে প্রধানত কী ঘটে?","একাধিক পদের সংক্ষেপে এক পদ গঠন","ধ্বনির বিকৃতি মাত্র","শব্দের শেষে যতিচিহ্ন","শুধু ক্রিয়ার পরিবর্তন","A compound condenses related words into one expression.","সমাসে পরস্পর সম্পর্কিত একাধিক পদ এক পদে সংক্ষিপ্ত হয়।"],
  ["Medium","সন্ধি বলতে মূলত কী বোঝায়?","সন্নিহিত ধ্বনির মিলন","বাক্যের বিরতি","শব্দের বিপরীত অর্থ","কবিতার ছন্দ","Sandhi concerns joining adjacent sounds.","সন্ধি হলো কাছাকাছি ধ্বনির মিলনে ধ্বনিগত পরিবর্তন।"],
  ["Medium","‘রাজপুত্র’ কোন সমাসের প্রচলিত উদাহরণ?","ষষ্ঠী তৎপুরুষ","দ্বন্দ্ব","বহুব্রীহি","অব্যয়ীভাব","রাজপুত্র means রাজার পুত্র, a genitive tatpurusha.","রাজার পুত্র—এখানে ষষ্ঠী তৎপুরুষ সমাস।"],
  ["Medium","‘মা-বাবা’ কোন সমাস?","দ্বন্দ্ব","কর্মধারয়","বহুব্রীহি","দ্বিগু","Both মা and বাবা retain equal semantic importance.","মা ও বাবা—দুই পদের সমান গুরুত্বে দ্বন্দ্ব সমাস।"],
  ["Medium","‘নীলকমল’ কোন সমাসের উদাহরণ?","কর্মধারয়","দ্বন্দ্ব","দ্বিগু","অব্যয়ীভাব","নীল যে কমল is a descriptive karmadharaya compound.","নীল বিশেষণের সঙ্গে কমল বিশেষ্যের মিলনে কর্মধারয় সমাস।"],
  ["Medium","‘দশানন’ শব্দটি রাবণ বোঝালে কোন সমাস?","বহুব্রীহি","দ্বন্দ্ব","দ্বিগু","অব্যয়ীভাব","It denotes someone possessing ten faces, not the faces themselves.","দশটি আনন যার—রাবণকে বোঝালে বহুব্রীহি।"],
  ["Medium","‘অধিকার’ শব্দের শুদ্ধ বানান কোনটি?","অধিকার","অধীকার","অধিকাড়","অধিকর","The accepted spelling is অধিকার.","শুদ্ধ বানান ‘অধিকার’; দীর্ঘ ঈ নয়।"],
  ["Medium","‘প্রয়োজন’ শব্দের শুদ্ধ বানান কোনটি?","প্রয়োজন","প্রয়জন","প্রযোজন","প্রয়োজন্","The standard spelling is প্রয়োজন.","‘প্রয়োজন’ শব্দে ‘য়ো’ এবং শেষের ‘ন’ যথাযথ।"],
  ["Easy","কাজ শুরু করার প্রচেষ্টা বোঝাতে কোন বানানটি শুদ্ধ?","উদ্যোগ","উদ্দ্যোগ","উদ্যগ","উদ্দোগ","The accepted spelling is উদ্যোগ.","শুদ্ধ বানান ‘উদ্যোগ’।"],
  ["Medium","অল্প সময়ের একটি ক্ষণ বোঝাতে কোন বানানটি শুদ্ধ?","মুহূর্ত","মূহূর্ত","মুহুর্ত","মূর্হুত","The word is spelled মুহূর্ত.","‘মুহূর্ত’ শব্দে দ্বিতীয় মাত্রা দীর্ঘ ঊ।"],
  ["Medium","কোনটি শুদ্ধ বানান?","দায়িত্ব","দায়ীত্ব","দায়িত্ত","দাইত্ব","The standard spelling is দায়িত্ব.","শুদ্ধ শব্দটি ‘দায়িত্ব’।"],
  ["Easy","বাক্যের শেষে পূর্ণচ্ছেদ কোনটি?","।","?",";","ঃ","Bangla uses the danda ‘।’ as a full stop.","বাংলা বাক্যের সমাপ্তিতে পূর্ণচ্ছেদ ‘।’ ব্যবহৃত হয়।"],
  ["Medium","‘রহিম কলম দিয়ে লেখে’—‘কলম দিয়ে’ কোন কারক বোঝায়?","করণ কারক","কর্তৃকারক","কর্মকারক","অধিকরণ কারক","The pen is the instrument used to write.","যার দ্বারা কাজ সম্পন্ন হয়, এখানে কলম—করণ কারক।"],
  ["Medium","‘সে বিদ্যালয়ে যায়’—‘বিদ্যালয়ে’ কোন কারক?","অধিকরণ কারক","কর্তৃকারক","কর্মকারক","অপাদান কারক","The locative form marks the destination/place in this school example.","‘বিদ্যালয়ে’ স্থানের সম্পর্ক বোঝায়—অধিকরণ কারক।"],
  ["Medium","‘শিক্ষক ছাত্রকে পড়ান’—‘ছাত্রকে’ কোন কারক?","কর্মকারক","কর্তৃকারক","করণ কারক","অপাদান কারক","The student receives the teacher's action.","শিক্ষক যাকে পড়ান, সেই ছাত্র কর্মকারক।"],
  ["Medium","‘গাছ থেকে ফল পড়ে’—‘গাছ থেকে’ কোন কারক?","অপাদান কারক","করণ কারক","কর্তৃকারক","সম্প্রদান কারক","The source of separation is the tree.","যেখান থেকে বিচ্যুতি বোঝায়, তা অপাদান কারক।"],
  ["Easy","‘আমরা’ কোন পুরুষের সর্বনাম?","উত্তম পুরুষ","মধ্যম পুরুষ","নাম পুরুষ","বিশেষণ","আমরা refers to the speaker and companions: first person.","বক্তাসহ অন্যদের বোঝায় বলে ‘আমরা’ উত্তম পুরুষ।"],
  ["Easy","‘তুমি’ কোন পুরুষ?","মধ্যম পুরুষ","উত্তম পুরুষ","নাম পুরুষ","অব্যয়","তুমি addresses the listener: second person.","যাকে সম্বোধন করা হয়, ‘তুমি’ মধ্যম পুরুষ।"],
  ["Medium","‘কিন্তু’ কোন পদ?","অব্যয়","বিশেষ্য","ক্রিয়া","বিশেষণ","কিন্তু functions as an indeclinable conjunction.","‘কিন্তু’ সংযোজক অব্যয়; এর রূপ বদলায় না।"],
  ["Medium","‘তবু’ কোন ধরনের অব্যয়?","সংযোজক অব্যয়","বিশেষ্য","সর্বনাম","ক্রিয়াবিশেষণ মাত্র","তবু can connect contrasting clauses.","বিপরীত/বাধা-সত্ত্বেও ভাব সংযোগে ‘তবু’ ব্যবহৃত হয়।"],
  ["Medium","‘সোনার তরী’ কাব্যগ্রন্থের রচয়িতা কে?","রবীন্দ্রনাথ ঠাকুর","কাজী নজরুল ইসলাম","জসীমউদ্দীন","মাইকেল মধুসূদন দত্ত","Rabindranath Tagore wrote Sonar Tori.","‘সোনার তরী’ রবীন্দ্রনাথ ঠাকুরের কাব্যগ্রন্থ।"],
  ["Medium","‘বিষাদ-সিন্ধু’ গ্রন্থের লেখক কে?","মীর মশাররফ হোসেন","বঙ্কিমচন্দ্র চট্টোপাধ্যায়","শরৎচন্দ্র চট্টোপাধ্যায়","সুকান্ত ভট্টাচার্য","Mir Mosharraf Hossain authored Bishad Sindhu.","‘বিষাদ-সিন্ধু’ মীর মশাররফ হোসেনের রচনা।"],
  ["Easy","‘বিদ্রোহী’ কবিতার কবি কে?","কাজী নজরুল ইসলাম","রবীন্দ্রনাথ ঠাকুর","জীবনানন্দ দাশ","জসীমউদ্দীন","Kazi Nazrul Islam wrote Bidrohi.","‘বিদ্রোহী’ কাজী নজরুল ইসলামের বিখ্যাত কবিতা।"],
  ["Medium","‘নকশী কাঁথার মাঠ’ কাব্যগ্রন্থের কবি কে?","জসীমউদ্দীন","সুফিয়া কামাল","শামসুর রাহমান","সুকান্ত ভট্টাচার্য","Jasimuddin wrote Nakshi Kanthar Math.","‘নকশী কাঁথার মাঠ’-এর কবি পল্লিকবি জসীমউদ্দীন।"],
  ["Medium","‘মেঘনাদবধ কাব্য’ কার রচনা?","মাইকেল মধুসূদন দত্ত","ঈশ্বরচন্দ্র বিদ্যাসাগর","বঙ্কিমচন্দ্র চট্টোপাধ্যায়","জীবনানন্দ দাশ","Michael Madhusudan Dutt composed Meghnad Badh Kavya.","‘মেঘনাদবধ কাব্য’ মাইকেল মধুসূদন দত্তের মহাকাব্য।"],
  ["Medium","‘পথের পাঁচালী’ উপন্যাসের লেখক কে?","বিভূতিভূষণ বন্দ্যোপাধ্যায়","মানিক বন্দ্যোপাধ্যায়","তারাশঙ্কর বন্দ্যোপাধ্যায়","প্রমথ চৌধুরী","Bibhutibhushan Bandyopadhyay wrote Pather Panchali.","‘পথের পাঁচালী’ বিভূতিভূষণ বন্দ্যোপাধ্যায়ের উপন্যাস।"],
  ["Medium","‘পদ্মা নদীর মাঝি’ উপন্যাসের লেখক কে?","মানিক বন্দ্যোপাধ্যায়","বিভূতিভূষণ বন্দ্যোপাধ্যায়","শরৎচন্দ্র চট্টোপাধ্যায়","আখতারুজ্জামান ইলিয়াস","Manik Bandyopadhyay wrote Padma Nadir Majhi.","‘পদ্মা নদীর মাঝি’ মানিক বন্দ্যোপাধ্যায়ের রচনা।"],
  ["Medium","‘আরণ্যক’ উপন্যাসের লেখক কে?","বিভূতিভূষণ বন্দ্যোপাধ্যায়","হুমায়ূন আহমেদ","সৈয়দ ওয়ালীউল্লাহ","মীর মশাররফ হোসেন","Aranyak is a novel by Bibhutibhushan Bandyopadhyay.","‘আরণ্যক’ বিভূতিভূষণ বন্দ্যোপাধ্যায়ের উপন্যাস।"],
  ["Medium","‘লালসালু’ উপন্যাসের রচয়িতা কে?","সৈয়দ ওয়ালীউল্লাহ","সেলিনা হোসেন","শওকত ওসমান","আহমদ ছফা","Syed Waliullah authored Lalsalu.","‘লালসালু’ সৈয়দ ওয়ালীউল্লাহর উপন্যাস।"],
  ["Medium","‘কবর’ নাটকের রচয়িতা কে?","মুনীর চৌধুরী","সৈয়দ শামসুল হক","সেলিম আল দীন","মমতাজউদদীন আহমদ","Munier Chowdhury wrote the play Kabar.","ভাষা আন্দোলনের প্রেক্ষাপটে ‘কবর’ নাটকটি মুনীর চৌধুরীর।"],
  ["Medium","‘হাজার বছর ধরে’ উপন্যাসের লেখক কে?","জহির রায়হান","শওকত আলী","হাসান আজিজুল হক","আবু ইসহাক","Zahir Raihan wrote Hajar Bachhar Dhore.","‘হাজার বছর ধরে’ জহির রায়হানের উপন্যাস।"],
  ["Medium","‘অগ্নিবীণা’ কাব্যগ্রন্থের কবি কে?","কাজী নজরুল ইসলাম","শামসুর রাহমান","জীবনানন্দ দাশ","জসীমউদ্দীন","Agnibeena is a collection by Kazi Nazrul Islam.","‘অগ্নিবীণা’ নজরুলের প্রথম কাব্যগ্রন্থ।"]
]);

addPairs("English", "Synonyms", "Medium",
  word => "Choose the closest meaning of '" + word + "'.",
  (word, answer) => "'" + answer + "' is a standard close synonym of '" + word + "' in ordinary English usage.",
  (word, answer) => "‘" + word + "’ শব্দের কাছাকাছি অর্থ ‘" + answer + "’।",
  [
    ["abandon","desert"],["abbreviate","shorten"],["abundant","plentiful"],["accurate","precise"],["adversity","hardship"],
    ["alleviate","relieve"],["amiable","friendly"],["ancient","old"],["arduous","difficult"],["authentic","genuine"],
    ["benevolent","kind"],["brisk","energetic"],["candid","frank"],["cautious","careful"],["cease","stop"],
    ["coherent","logical"],["compassion","sympathy"],["concur","agree"],["conspicuous","noticeable"],["contentious","controversial"],
    ["credible","believable"],["crucial","essential"],["deceive","mislead"],["deduce","infer"],["deficient","lacking"],
    ["deliberate","intentional"],["diligent","industrious"],["diminish","reduce"],["disclose","reveal"],["discreet","prudent"],
    ["elaborate","detailed"],["eloquent","articulate"],["eminent","distinguished"],["endure","tolerate"],["enhance","improve"],
    ["enormous","immense"],["evident","obvious"],["feasible","practicable"],["fragile","delicate"],["frugal","thrifty"],
    ["hinder","obstruct"],["hostile","unfriendly"],["impartial","unbiased"],["inevitable","unavoidable"],["ingenious","inventive"],
    ["integrity","honesty"],["lucid","clear"],["meticulous","thorough"],["obsolete","outdated"],["peril","danger"],
    ["persistent","tenacious"],["plausible","reasonable"],["profound","deep"],["reluctant","unwilling"],["resilient","adaptable"],
    ["rigorous","strict"],["scarce","rare"],["scrutinize","examine"],["substantial","significant"],["transparent","open"],
    ["tranquil","peaceful"],["vague","unclear"],["versatile","multitalented"],["vigilant","watchful"],["vital","necessary"],
    ["wary","suspicious"],["zealous","enthusiastic"],["abrupt","sudden"],["consolidate","unify"],["exemplary","outstanding"]
  ]);

addPairs("English", "Antonyms", "Medium",
  word => "Which option is opposite in meaning to '" + word + "'?",
  (word, answer) => "'" + answer + "' expresses an opposite meaning to '" + word + "'.",
  (word, answer) => "‘" + word + "’ শব্দের বিপরীতার্থক ‘" + answer + "’।",
  [
    ["accept","reject"],["active","inactive"],["advance","retreat"],["advantage","disadvantage"],["affluent","poor"],
    ["agree","disagree"],["ancient","modern"],["approve","disapprove"],["artificial","natural"],["ascend","descend"],
    ["attack","defend"],["attract","repel"],["augment","decrease"],["benevolent","malevolent"],["bold","timid"],
    ["borrow","lend"],["brief","lengthy"],["calm","agitated"],["capture","release"],["certain","uncertain"],
    ["clarity","confusion"],["complex","simple"],["conceal","expose"],["construct","demolish"],["courage","cowardice"],
    ["crude","refined"],["defeat","victory"],["dense","sparse"],["dependence","independence"],["despair","hope"],
    ["diligent","lazy"],["domestic","foreign"],["expand","contract"],["explicit","implicit"],["external","internal"],
    ["frequent","rare"],["generous","stingy"],["genuine","fake"],["graceful","awkward"],["harsh","gentle"],
    ["humble","arrogant"],["include","exclude"],["increase","reduce"],["innocent","guilty"],["intentional","accidental"],
    ["junior","senior"],["legal","illegal"],["liberty","captivity"],["loyal","disloyal"],["majority","minority"],
    ["optimistic","pessimistic"],["permanent","temporary"],["plentiful","scarce"],["private","public"],["profit","loss"],
    ["prosperity","poverty"],["rapid","slow"],["rigid","flexible"],["rural","urban"],["shallow","deep"],
    ["sincere","insincere"],["superior","inferior"],["transparent","opaque"],["triumph","failure"],["virtue","vice"]
  ]);

addPairs("English", "Idioms and Phrases", "Hard",
  phrase => "What does the expression '" + phrase + "' mean?",
  (phrase, answer) => "The idiomatic meaning of '" + phrase + "' is '" + answer + "', not its literal meaning.",
  (phrase, answer) => "‘" + phrase + "’ বাগধারার অর্থ ‘" + answer + "’। আক্ষরিক অর্থে নয়।",
  [
    ["a blessing in disguise","an apparent misfortune that brings benefit"],
    ["a piece of cake","a very easy task"],["at sixes and sevens","in confusion"],
    ["beat around the bush","avoid the main point"],["break the ice","make people feel comfortable"],
    ["burn the midnight oil","work or study late"],["by hook or by crook","by any means"],
    ["call it a day","stop working for now"],["cut corners","skip proper steps to save effort"],
    ["face the music","accept unpleasant consequences"],["get cold feet","become nervous and hesitant"],
    ["get the ball rolling","start an activity"],["give someone a hand","help someone"],
    ["go the extra mile","make additional effort"],["hit the nail on the head","describe exactly what is right"],
    ["in a nutshell","in very few words"],["in hot water","in trouble"],
    ["keep an eye on","watch carefully"],["leave no stone unturned","try every possible way"],
    ["let the cat out of the bag","reveal a secret"],["make ends meet","manage necessary expenses"],
    ["miss the boat","lose an opportunity"],["on cloud nine","extremely happy"],
    ["once in a blue moon","very rarely"],["out of the blue","without warning"],
    ["pull someone's leg","tease someone jokingly"],["put off","postpone"],
    ["read between the lines","understand an implied meaning"],["see eye to eye","agree fully"],
    ["spill the beans","disclose hidden information"],["take after","resemble a family member"],
    ["the ball is in your court","the next decision is yours"],["through thick and thin","in good times and bad"],
    ["turn a blind eye","deliberately ignore"],["under the weather","feeling unwell"],
    ["up in the air","not yet decided"],["weather the storm","survive a difficult period"],
    ["with flying colors","with great success"],["a storm in a teacup","exaggerated fuss over something small"],
    ["add fuel to the fire","make a conflict worse"],["back to square one","return to the starting position"],
    ["bite the bullet","face an unpleasant duty"],["cost an arm and a leg","be very expensive"],
    ["every cloud has a silver lining","a difficulty may contain some hope"],["hit the books","begin studying seriously"],
    ["jump to conclusions","decide without enough evidence"],["keep one's word","fulfil a promise"],
    ["on the same page","share an understanding"],["put one's foot down","insist firmly"],
    ["the last straw","the final problem one can tolerate"]
  ]);

addDirect("English", "Grammar and Usage", [
  ["Easy","Choose the correct form: She ___ to school every day.","goes","go","going","gone","Third-person singular present simple takes -s/-es.","Present simple-এ she-এর সঙ্গে goes হয়।"],
  ["Easy","Choose the correct form: They ___ playing football now.","are","is","am","be","The plural subject they takes are in the present continuous.","They বহুবচন; তাই are playing।"],
  ["Easy","Fill in: I have lived here ___ 2020.","since","for","from","during","Since introduces the starting point of a period.","নির্দিষ্ট শুরুর সময়ের আগে since।"],
  ["Easy","Fill in: I have studied for ___ hours.","three","third","thrice","threefold","A cardinal number counts hours.","সংখ্যা গণনার ক্ষেত্রে three hours ব্যবহার হয়।"],
  ["Medium","Which sentence correctly agrees with 'neither of'?","Neither of the answers is correct.","Neither of the answers are correct.","Neither answer are correct.","Neither of answers have correct.","Neither is grammatically singular in formal agreement.","Formal English-এ neither of-এর সঙ্গে singular is।"],
  ["Medium","Which sentence correctly uses 'one of my friends'?","One of my friends lives in Dhaka.","One of my friends live in Dhaka.","One of my friend lives in Dhaka.","One of friends are living Dhaka.","One of + plural noun takes a singular verb for one.","One of my friends (plural noun), কিন্তু one subject হওয়ায় lives।"],
  ["Medium","Fill in: The news ___ surprising.","is","are","were","have","News is uncountable and takes a singular verb.","News দেখতে plural মনে হলেও singular verb is লাগে।"],
  ["Medium","Fill in: Mathematics ___ my favourite subject.","is","are","were","have","The school subject mathematics takes singular agreement.","বিষয় হিসেবে Mathematics-এর পরে is।"],
  ["Easy","Fill in: She is ___ engineer.","an","a","the only","no article","Engineer begins with a vowel sound, so use an.","Engineer vowel sound দিয়ে শুরু হওয়ায় an।"],
  ["Easy","Fill in: He is ___ university student.","a","an","no article","an the","University starts with a /juː/ consonant sound.","University শব্দের শুরুতে ‘ইউ’ consonant sound; তাই a।"],
  ["Medium","Fill in: ___ European country.","a","an","the always","no article","European begins with /j/ sound, so use a.","European শব্দের উচ্চারণে /ইউ/ থাকায় a।"],
  ["Medium","Fill in: ___ hour is enough.","An","A","The only","No article","Hour has a silent h and begins with a vowel sound.","Hour-এর h নীরব; তাই An hour।"],
  ["Medium","Fill in: She is good ___ mathematics.","at","in","on","to","The idiomatic collocation is good at a subject.","কোনো বিষয়ে দক্ষতা বোঝাতে good at।"],
  ["Easy","Fill in: We are interested ___ research.","in","on","to","at","The fixed preposition is interested in.","Interested in সঠিক preposition।"],
  ["Medium","Fill in: He insisted ___ paying the bill.","on","to","at","in","The verb insist takes on before a gerund.","Insist on + verb-ing ব্যবহার হয়।"],
  ["Medium","Fill in: She is senior ___ me.","to","than","from","over","Senior is conventionally followed by to.","Senior to, senior than নয়।"],
  ["Medium","Fill in: He prefers tea ___ coffee.","to","than","over than","against","Prefer X to Y is a standard construction.","Prefer tea to coffee—than নয়।"],
  ["Medium","Fill in: He has been working ___ morning.","since","for","at","by","Since is used with a starting time or point.","Morning শুরুর সময় নির্দেশ করলে since।"],
  ["Medium","Fill in: If it rains, we ___ stay home.","will","would","had","have","First conditional uses if + present, then will + verb.","First conditional: If + present, will + verb।"],
  ["Hard","Fill in: If I had known, I ___ helped.","would have","will have","would","had","Third conditional result uses would have + past participle.","Third conditional-এ would have helped।"],
  ["Hard","Fill in: Had I known the answer, I ___ told you.","would have","will","am","had","Inverted third conditional still requires would have.","Had I known = If I had known; result would have।"],
  ["Medium","Select the passive voice of 'She writes letters'.","Letters are written by her.","Letters is written by her.","Letters were write by her.","Letters have write by her.","Present simple passive is am/is/are + past participle.","Letters plural; তাই are written।"],
  ["Medium","Select the passive voice of 'They are repairing the road'.","The road is being repaired.","The road has repaired.","The road is repairing.","The road were being repair.","Present continuous passive is is/are being + past participle.","Is being repaired হলো present continuous passive।"],
  ["Medium","Select the passive voice of 'Someone has stolen my bag'.","My bag has been stolen.","My bag have stolen.","My bag had stole.","My bag has stolen someone.","Present perfect passive uses has/have been + past participle.","Has been stolen হলো present perfect passive।"],
  ["Medium","Select the indirect speech: He said, 'I am tired'.","He said that he was tired.","He said that I am tired.","He told that he tired.","He said he will be tired.","In backshifted reporting, am changes to was.","Past reporting verb-এর পরে am → was হয়।"],
  ["Medium","Select indirect speech: She said, 'I have finished'.","She said that she had finished.","She said she has finish.","She says she had finish.","She said I finished tomorrow.","Reported present perfect commonly backshifts to past perfect.","Indirect speech-এ have finished → had finished।"],
  ["Easy","Choose the plural of 'criterion'.","criteria","criterions","criterias","criterium","Criterion has the irregular plural criteria.","Criterion-এর বহুবচন criteria।"],
  ["Easy","Choose the plural of 'phenomenon'.","phenomena","phenomenons","phenomenas","phenomenum","The standard plural of phenomenon is phenomena.","Phenomenon-এর plural phenomena।"],
  ["Medium","Choose the possessive: 'the books belonging to the children'.","the children's books","the childrens' books","the childrens books","the children book's","Children is already plural; add apostrophe-s.","Children irregular plural; possessive children's।"],
  ["Medium","Which word is an adverb in 'She spoke softly'?","softly","she","spoke","none","Softly describes the manner of speaking.","Softly ক্রিয়ার ধরন বোঝায়, তাই adverb।"],
  ["Medium","Fill in: Scarcely had he arrived ___ the rain began.","when","than","then","that","The correlative structure is scarcely/hardly ... when.","Scarcely ... when সঠিক জোড়া।"],
  ["Medium","Fill in: No sooner had I sat down ___ the phone rang.","than","when","then","that","No sooner is paired with than.","No sooner ... than ব্যবহার হয়।"],
  ["Medium","Fill in: He is one of the players who ___ selected.","were","was","is","has","Who refers to plural players; plural agreement follows.","Who-এর antecedent players, তাই were।"],
  ["Medium","Fill in: Either the teacher or the students ___ responsible.","are","is","was","has","With either...or, agreement generally follows the nearer subject students.","Nearest subject students plural; তাই are।"],
  ["Hard","Fill in: Neither the students nor the teacher ___ absent.","is","are","were","have","In neither...nor, the nearer singular subject teacher takes is.","Nearest subject teacher singular; তাই is।"],
  ["Medium","Fill in: He is accustomed ___ early.","to rising","to rise","for rising","at rising","Accustomed to is followed by a noun or -ing form.","Accustomed to + verb-ing: to rising।"],
  ["Medium","Fill in: The project needs ___ before submission.","reviewing","review","reviewed","to reviewing","Need + gerund can express a necessary passive action.","Needs reviewing = needs to be reviewed।"],
  ["Hard","Choose the correctly punctuated sentence.","However, the result was inconclusive.","However the result, was inconclusive.","However; the result was, inconclusive.","However the result was inconclusive,","Introductory however as a conjunctive adverb is followed by a comma.","শুরুর However-এর পরে comma বসে।"],
  ["Medium","Choose the correct comparative sentence.","This problem is easier than that one.","This problem is more easier than that one.","This problem is easiest than that one.","This problem easier from that one.","Do not double-mark the comparative with more easier.","Easier-এর আগে more দিলে double comparative হয়।"],
  ["Medium","Choose the correct superlative sentence.","She is the tallest in the class.","She is tallest than the class.","She is most tallest of all.","She is taller in the class.","The superlative is the tallest, not most tallest.","Superlative the tallest; most tallest ভুল।"],
  ["Medium","Fill in: The report must be submitted ___ Friday.","by","since","during","of","By marks a deadline no later than Friday.","Deadline নির্দেশে by Friday।"],
  ["Medium","Fill in: I look forward to ___ from you.","hearing","hear","heard","to hear","Look forward to takes an -ing form.","Look forward to + hearing।"],
  ["Medium","Fill in: Despite ___, they continued.","the rain","it was raining","of the rain","to rain","Despite takes a noun phrase or gerund, not 'of'.","Despite-এর পরে noun phrase the rain।"],
  ["Medium","Which 'unless' conditional avoids a double negative?","Unless you work hard, you will not succeed.","Unless you do not work hard, you will not succeed.","Unless you worked hard, you will succeed yesterday.","Unless you work hard, you would succeeded.","Unless means if not; do not add a second negative.","Unless নিজেই if not বোঝায়; double negative নয়।"],
  ["Hard","Identify the correctly parallel sentence.","She likes reading, writing, and swimming.","She likes reading, to write, and swimming.","She likes read, writing, and to swim.","She like reading, write, swimming.","Items in a list should have parallel grammatical forms.","Reading, writing, swimming একই grammatical form।"],
  ["Medium","Choose the correct relative pronoun: The woman ___ called is a doctor.","who","which","where","whose","Who refers to a person functioning as the subject of called.","ব্যক্তিকে subject হিসেবে নির্দেশে who।"],
  ["Medium","Choose the correct relative pronoun: The book ___ I bought is useful.","that","who","where","whose","That can introduce a restrictive relative clause for a thing.","বস্তুর defining clause-এ that ব্যবহৃত হয়।"],
  ["Medium","Fill in: He succeeded ___ solving the puzzle.","in","at","with","to","Succeed in is followed by a noun or gerund.","Succeed in + verb-ing।"],
  ["Medium","Fill in: This information ___ reliable.","is","are","were","have","Information is an uncountable singular noun.","Information uncountable; singular is।"],
  ["Medium","Choose the correct form: Each of us ___ a role.","has","have","are having","were","Each takes a singular verb in formal standard usage.","Each of us-এর সঙ্গে has।"]
]);

addPairs("General Knowledge", "বাংলাদেশের ইতিহাস", "Medium",
  prompt => prompt,
  (prompt, answer) => "For this Bangladesh history question, the established answer is " + answer + ". This is a historical fact, not a current office-holder claim.",
  (prompt, answer) => "ইতিহাসভিত্তিক প্রশ্নটির সঠিক উত্তর ‘" + answer + "’। ঘটনাটির সময় বা প্রেক্ষাপট মনে রাখুন।",
  [
    ["বাংলাদেশের স্বাধীনতা দিবস কবে?","২৬ মার্চ",["১৬ ডিসেম্বর","২১ ফেব্রুয়ারি","৭ মার্চ"]],
    ["বাংলাদেশের বিজয় দিবস কবে?","১৬ ডিসেম্বর",["২৬ মার্চ","১৭ এপ্রিল","২১ ফেব্রুয়ারি"]],
    ["আন্তর্জাতিক মাতৃভাষা দিবস কোন তারিখে পালিত হয়?","২১ ফেব্রুয়ারি",["২৬ মার্চ","১৬ ডিসেম্বর","১৪ ডিসেম্বর"]],
    ["বাংলাদেশের মুক্তিযুদ্ধ সংঘটিত হয় কোন সালে?","১৯৭১",["১৯৪৭","১৯৫২","১৯৭৫"]],
    ["ঐতিহাসিক ছয় দফা আন্দোলন উত্থাপিত হয় কোন সালে?","১৯৬৬",["১৯৫২","১৯৬৯","১৯৭০"]],
    ["ঊনসত্তরের গণঅভ্যুত্থান সংঘটিত হয় কোন সালে?","১৯৬৯",["১৯৬৬","১৯৭০","১৯৭১"]],
    ["পাকিস্তানের সাধারণ নির্বাচন, যা বাংলাদেশের স্বাধীনতার পথে গুরুত্বপূর্ণ, হয় কোন সালে?","১৯৭০",["১৯৬৬","১৯৬৯","১৯৭৩"]],
    ["বাংলা ভাষা আন্দোলনের গুরুত্বপূর্ণ শহীদ দিবসের ঘটনাগুলো কোন সালে ঘটে?","১৯৫২",["১৯৪৮","১৯৫৫","১৯৬২"]],
    ["বাংলাদেশের সংবিধান কার্যকর হয় কবে?","১৬ ডিসেম্বর ১৯৭২",["২৬ মার্চ ১৯৭১","৪ নভেম্বর ১৯৭২","৭ মার্চ ১৯৭৩"]],
    ["মুজিবনগর সরকার শপথ গ্রহণ করে কবে?","১৭ এপ্রিল ১৯৭১",["১০ এপ্রিল ১৯৭১","২৬ মার্চ ১৯৭১","১৬ ডিসেম্বর ১৯৭১"]],
    ["মুজিবনগর সরকার গঠিত হয় কবে?","১০ এপ্রিল ১৯৭১",["১৭ এপ্রিল ১৯৭১","৭ মার্চ ১৯৭১","২৫ মার্চ ১৯৭১"]],
    ["ঐতিহাসিক ৭ মার্চের ভাষণ দেওয়া হয় কবে?","৭ মার্চ ১৯৭১",["২৫ মার্চ ১৯৭১","১০ জানুয়ারি ১৯৭২","১৭ এপ্রিল ১৯৭১"]],
    ["অপারেশন সার্চলাইট শুরু হয় কোন রাতে?","২৫ মার্চ ১৯৭১",["৭ মার্চ ১৯৭১","১০ এপ্রিল ১৯৭১","১৬ ডিসেম্বর ১৯৭১"]],
    ["জাতিসংঘে বাংলাদেশ সদস্যপদ লাভ করে কবে?","১৭ সেপ্টেম্বর ১৯৭৪",["২৬ মার্চ ১৯৭১","১৬ ডিসেম্বর ১৯৭২","৭ মার্চ ১৯৭৩"]],
    ["বাংলা একাডেমি প্রতিষ্ঠিত হয় কবে?","৩ ডিসেম্বর ১৯৫৫",["২১ ফেব্রুয়ারি ১৯৫২","১৬ ডিসেম্বর ১৯৭২","২৬ মার্চ ১৯৭১"]],
    ["বাংলাদেশে প্রথম জাতীয় সংসদ নির্বাচন অনুষ্ঠিত হয় কবে?","৭ মার্চ ১৯৭৩",["৭ মার্চ ১৯৭১","২৬ মার্চ ১৯৭১","১৭ সেপ্টেম্বর ১৯৭৪"]],
    ["সার্ক (SAARC) প্রতিষ্ঠিত হয় কোন সালে?","১৯৮৫",["১৯৪৫","১৯৭১","১৯৯৫"]],
    ["বাংলাদেশের মুক্তিযুদ্ধকে কতটি সেক্টরে ভাগ করা হয়েছিল?","১১",["৭","৯","১২"]],
    ["ভাষা আন্দোলন স্মরণে UNESCO আন্তর্জাতিক মাতৃভাষা দিবস ঘোষণা করে কোন সালে?","১৯৯৯",["১৯৫২","১৯৭১","২০০০"]],
    ["বাংলাদেশের জাতীয় স্মৃতিসৌধের নকশাকার কে?","সৈয়দ মঈনুল হোসেন"],
    ["কেন্দ্রীয় শহীদ মিনারের মূল নকশাকার হিসেবে কে পরিচিত?","হামিদুর রহমান"],
    ["মুক্তিযুদ্ধকালীন অস্থায়ী সরকারের রাজধানী হিসেবে কোন স্থান পরিচিত?","মুজিবনগর"],
    ["বাংলাদেশের মুক্তিযুদ্ধের সর্বাধিনায়ক হিসেবে কে পরিচিত?","বঙ্গবন্ধু শেখ মুজিবুর রহমান"],
    ["বাংলাদেশ মুক্তিযুদ্ধে প্রধান সেনাপতি কে ছিলেন?","এম এ জি ওসমানী"],
    ["‘আমার ভাইয়ের রক্তে রাঙানো একুশে ফেব্রুয়ারি’ গানের রচয়িতা কে?","আবদুল গাফ্ফার চৌধুরী"]
  ]);

addPairs("General Knowledge", "বাংলাদেশের ভূগোল ও ঐতিহ্য", "Medium",
  prompt => prompt,
  (prompt, answer) => "The established geographical or cultural location/identity for this question is " + answer + ".",
  (prompt, answer) => "এটি বাংলাদেশের ভূগোল বা ঐতিহ্যসংক্রান্ত তথ্য; সঠিক উত্তর ‘" + answer + "’।",
  [
    ["বাংলাদেশের জাতীয় ফুল কোনটি?","শাপলা",["গোলাপ","জবা","বেলি"]],
    ["বাংলাদেশের জাতীয় ফল কোনটি?","কাঁঠাল",["আম","লিচু","কলা"]],
    ["বাংলাদেশের জাতীয় মাছ কোনটি?","ইলিশ",["রুই","কাতলা","পাঙাশ"]],
    ["বাংলাদেশের জাতীয় পাখি কোনটি?","দোয়েল",["ময়না","টিয়া","শালিক"]],
    ["বাংলাদেশের জাতীয় প্রাণী কোনটি?","রয়েল বেঙ্গল টাইগার",["হরিণ","হাতি","চিতাবাঘ"]],
    ["বাংলাদেশের জাতীয় বৃক্ষ কোনটি?","আমগাছ",["বটগাছ","কাঁঠালগাছ","নারকেলগাছ"]],
    ["বাংলাদেশের জাতীয় কবি কে?","কাজী নজরুল ইসলাম",["রবীন্দ্রনাথ ঠাকুর","জসীমউদ্দীন","জীবনানন্দ দাশ"]],
    ["বাংলাদেশের জাতীয় সংগীতের রচয়িতা কে?","রবীন্দ্রনাথ ঠাকুর",["কাজী নজরুল ইসলাম","দ্বিজেন্দ্রলাল রায়","অতুলপ্রসাদ সেন"]],
    ["বাংলাদেশের জাতীয় স্মৃতিসৌধ কোথায় অবস্থিত?","সাভার",["মিরপুর","টঙ্গী","গাজীপুর শহর"]],
    ["ষাট গম্বুজ মসজিদ কোন জেলায় অবস্থিত?","বাগেরহাট",["খুলনা","যশোর","সাতক্ষীরা"]],
    ["পাহাড়পুর বৌদ্ধবিহার কোন জেলায় অবস্থিত?","নওগাঁ",["বগুড়া","রাজশাহী","দিনাজপুর"]],
    ["মহাস্থানগড় কোন জেলায় অবস্থিত?","বগুড়া",["নওগাঁ","রংপুর","পাবনা"]],
    ["ময়নামতি প্রত্নস্থল কোন জেলায় অবস্থিত?","কুমিল্লা",["ব্রাহ্মণবাড়িয়া","নোয়াখালী","ফেনী"]],
    ["লালবাগ কেল্লা কোথায়?","ঢাকা",["নারায়ণগঞ্জ","মুন্সীগঞ্জ","কুমিল্লা"]],
    ["কাপ্তাই হ্রদ কোন জেলায় অবস্থিত?","রাঙামাটি",["বান্দরবান","খাগড়াছড়ি","চট্টগ্রাম"]],
    ["টাঙ্গুয়ার হাওর কোন জেলায় অবস্থিত?","সুনামগঞ্জ",["কিশোরগঞ্জ","নেত্রকোনা","হবিগঞ্জ"]],
    ["রাতারগুল জলাবন কোন জেলায়?","সিলেট",["মৌলভীবাজার","হবিগঞ্জ","সুনামগঞ্জ"]],
    ["মাধবকুণ্ড জলপ্রপাত কোন জেলায় অবস্থিত?","মৌলভীবাজার",["সিলেট","হবিগঞ্জ","সুনামগঞ্জ"]],
    ["কক্সবাজার সমুদ্রসৈকত কোন জেলায়?","কক্সবাজার",["চট্টগ্রাম","পটুয়াখালী","নোয়াখালী"]],
    ["আহসান মঞ্জিল কোথায় অবস্থিত?","পুরান ঢাকা",["নতুন বাজার","শেরেবাংলা নগর","উত্তরা"]],
    ["জাতীয় সংসদ ভবন ঢাকার কোন এলাকায়?","শেরেবাংলা নগর",["মতিঝিল","রমনা","মিরপুর"]],
    ["জামদানি বুননের ঐতিহ্যবাহী কেন্দ্র সোনারগাঁও কোন জেলায়?","নারায়ণগঞ্জ",["নরসিংদী","গাজীপুর","মুন্সীগঞ্জ"]],
    ["সুন্দরবন কোন ধরনের বন?","ম্যানগ্রোভ বন",["শালবন","চিরসবুজ পাহাড়ি বন","পত্রঝরা বন"]],
    ["বাংলাদেশের দক্ষিণে কোন সমুদ্র অবস্থিত?","বঙ্গোপসাগর",["আরব সাগর","লোহিত সাগর","ভূমধ্যসাগর"]],
    ["কর্ণফুলী নদীর তীরে প্রধান সমুদ্রবন্দর কোনটি?","চট্টগ্রাম বন্দর",["মোংলা বন্দর","পায়রা বন্দর","আশুগঞ্জ বন্দর"]],
    ["হার্ডিঞ্জ ব্রিজ কোন নদীর উপর নির্মিত?","পদ্মা",["যমুনা","মেঘনা","তিস্তা"]],
    ["যমুনা বহুমুখী সেতু কোন নদীর উপর?","যমুনা",["পদ্মা","মেঘনা","কর্ণফুলী"]],
    ["বাংলাদেশের কাপ্তাই জলবিদ্যুৎকেন্দ্র কোন নদীর সঙ্গে যুক্ত?","কর্ণফুলী",["সাঙ্গু","তিস্তা","সুরমা"]],
    ["বাংলাদেশের সর্ববৃহৎ জেলা (আয়তনে) কোনটি?","রাঙামাটি"],
    ["বাংলাদেশের একমাত্র প্রবালদ্বীপ হিসেবে কোনটি পরিচিত?","সেন্ট মার্টিন দ্বীপ"]
  ]);

addPairs("General Knowledge", "রাষ্ট্র ও প্রতিষ্ঠান", "Hard",
  prompt => prompt,
  (prompt, answer) => "The correct constitutional, public-administration or institutional concept is " + answer + ".",
  (prompt, answer) => "রাষ্ট্রব্যবস্থা ও প্রতিষ্ঠানের প্রচলিত সংজ্ঞা অনুযায়ী সঠিক উত্তর ‘" + answer + "’।",
  [
    ["বাংলাদেশের রাষ্ট্রভাষা কী?","বাংলা"],
    ["বাংলাদেশের জাতীয় আইনসভার নাম কী?","জাতীয় সংসদ"],
    ["বাংলাদেশের সর্বোচ্চ আইন কোনটি?","সংবিধান"],
    ["বাংলাদেশের সংবিধানের কোন ভাগে মৌলিক অধিকার বর্ণিত?","তৃতীয় ভাগ"],
    ["বাংলাদেশের সংবিধানে রাষ্ট্রভাষা কোন অনুচ্ছেদে?","অনুচ্ছেদ ৩"],
    ["আইনের দৃষ্টিতে সমতার বিধান কোন অনুচ্ছেদে?","অনুচ্ছেদ ২৭"],
    ["বাংলাদেশের সর্বোচ্চ আদালত কোনটি?","সুপ্রিম কোর্ট"],
    ["বাংলাদেশ সুপ্রিম কোর্টের একটি বিভাগ কোনটি?","হাইকোর্ট বিভাগ"],
    ["বাংলাদেশ সুপ্রিম কোর্টের অন্য বিভাগ কোনটি?","আপিল বিভাগ"],
    ["বাংলাদেশের কেন্দ্রীয় ব্যাংক কোনটি?","বাংলাদেশ ব্যাংক"],
    ["সরকারি চাকরিতে প্রার্থীদের নির্বাচনে সাংবিধানিক কমিশন কোনটি?","বাংলাদেশ সরকারি কর্ম কমিশন"],
    ["নির্বাচন পরিচালনার সাংবিধানিক প্রতিষ্ঠান কোনটি?","নির্বাচন কমিশন"],
    ["রাষ্ট্রের সরকারি হিসাব নিরীক্ষার সাংবিধানিক পদ কোনটি?","মহাহিসাব নিরীক্ষক ও নিয়ন্ত্রক"],
    ["বাংলাদেশের জাতীয় পরিসংখ্যান সংস্থা কোনটি?","বাংলাদেশ পরিসংখ্যান ব্যুরো"],
    ["বাংলাদেশে রাজস্ব ও কর প্রশাসনের প্রধান সংস্থা কোনটি?","জাতীয় রাজস্ব বোর্ড"],
    ["বাংলাদেশে টেলিযোগাযোগ খাত নিয়ন্ত্রণকারী কমিশন কোনটি?","বিটিআরসি"],
    ["বাংলাদেশে সরকারি পর্যায়ে কম্পিউটার ও ICT সক্ষমতা উন্নয়নে কোন সংস্থা কাজ করে?","বাংলাদেশ কম্পিউটার কাউন্সিল"],
    ["রপ্তানি প্রক্রিয়াকরণ অঞ্চল পরিচালনার সঙ্গে কোন কর্তৃপক্ষ যুক্ত?","বেপজা"],
    ["বাংলাদেশে স্থানীয় সরকার প্রকৌশল অবকাঠামোর জন্য পরিচিত অধিদপ্তর কোনটি?","এলজিইডি"],
    ["সরকারি বিদ্যুৎ উন্নয়ন কার্যক্রমের পরিচিত বোর্ড কোনটি?","বাংলাদেশ বিদ্যুৎ উন্নয়ন বোর্ড"],
    ["বাংলাদেশের পরমাণু শক্তি গবেষণায় প্রধান সরকারি কমিশন কোনটি?","বাংলাদেশ পরমাণু শক্তি কমিশন"],
    ["দুর্নীতি দমন ও অনুসন্ধানের জন্য বাংলাদেশে কোন কমিশন রয়েছে?","দুর্নীতি দমন কমিশন"],
    ["দারিদ্র্য বিমোচনে অংশীদার সংস্থার মাধ্যমে অর্থায়নকারী পরিচিত ফাউন্ডেশন কোনটি?","পল্লী কর্ম-সহায়ক ফাউন্ডেশন"],
    ["সরকারি ও বেসরকারি রপ্তানির প্রচারে পরিচিত ব্যুরো কোনটি?","রপ্তানি উন্নয়ন ব্যুরো"],
    ["বাংলাদেশের সংসদীয় ব্যবস্থায় সাধারণ নির্বাচন সাধারণত কত বছর পরপর হয়?","৫ বছর"]
  ]);

addPairs("General Knowledge", "আন্তর্জাতিক সংস্থা", "Medium",
  name => name + " সংস্থার প্রধান কার্যালয় কোথায়?",
  (name, answer) => "The headquarters of " + name + " is in " + answer + ".",
  (name, answer) => name + " সংস্থার প্রধান কার্যালয় " + answer + "-এ অবস্থিত।",
  [
    ["United Nations (UN)","নিউইয়র্ক"],
    ["UNESCO","প্যারিস"],
    ["World Health Organization (WHO)","জেনেভা"],
    ["International Labour Organization (ILO)","জেনেভা"],
    ["Food and Agriculture Organization (FAO)","রোম"],
    ["World Food Programme (WFP)","রোম"],
    ["UNICEF","নিউইয়র্ক"],
    ["UNHCR","জেনেভা"],
    ["International Civil Aviation Organization (ICAO)","মন্ট্রিয়ল"],
    ["International Maritime Organization (IMO)","লন্ডন"],
    ["International Telecommunication Union (ITU)","জেনেভা"],
    ["Universal Postal Union (UPU)","বার্ন"],
    ["International Atomic Energy Agency (IAEA)","ভিয়েনা"],
    ["United Nations Industrial Development Organization (UNIDO)","ভিয়েনা"],
    ["World Bank","ওয়াশিংটন ডিসি"],
    ["International Monetary Fund (IMF)","ওয়াশিংটন ডিসি"],
    ["ASEAN Secretariat","জাকার্তা"],
    ["SAARC Secretariat","কাঠমান্ডু"],
    ["Organisation of Islamic Cooperation (OIC)","জেদ্দা"],
    ["BIMSTEC Secretariat","ঢাকা"],
    ["Asian Development Bank (ADB)","ম্যানিলা"],
    ["Asian Infrastructure Investment Bank (AIIB)","বেইজিং"],
    ["INTERPOL","লিয়ঁ"],
    ["World Trade Organization (WTO)","জেনেভা"],
    ["International Court of Justice (ICJ)","দ্য হেগ"],
    ["International Criminal Court (ICC)","দ্য হেগ"],
    ["United Nations Environment Programme (UNEP)","নাইরোবি"],
    ["Commonwealth Secretariat","লন্ডন"],
    ["APEC Secretariat","সিঙ্গাপুর"],
    ["Shanghai Cooperation Organisation (SCO) Secretariat","বেইজিং"]
  ]);

addDirect("General Knowledge", "বিশ্ব ও বিজ্ঞান", [
  ["Easy","পৃথিবীর বৃহত্তম মহাসাগর কোনটি?","প্রশান্ত মহাসাগর","আটলান্টিক মহাসাগর","ভারত মহাসাগর","আর্কটিক মহাসাগর","The Pacific Ocean is the largest ocean by area.","আয়তনে প্রশান্ত মহাসাগর বৃহত্তম।"],
  ["Easy","পৃথিবীর সর্বোচ্চ পর্বতশৃঙ্গ কোনটি?","এভারেস্ট","কাঞ্চনজঙ্ঘা","কে-টু","মাকালু","Mount Everest has the highest elevation above sea level.","সমুদ্রপৃষ্ঠ থেকে উচ্চতায় মাউন্ট এভারেস্ট প্রথম।"],
  ["Easy","পৃথিবীর বৃহত্তম উষ্ণ মরুভূমি কোনটি?","সাহারা","গোবি","কালাহারি","থর","The Sahara is the largest hot desert.","উষ্ণ মরুভূমির মধ্যে সাহারা সবচেয়ে বড়।"],
  ["Easy","সৌরজগতের সবচেয়ে বড় গ্রহ কোনটি?","বৃহস্পতি","শনি","পৃথিবী","মঙ্গল","Jupiter is the largest planet by diameter and mass.","সৌরজগতের বৃহত্তম গ্রহ বৃহস্পতি।"],
  ["Easy","পৃথিবীর নিকটতম নক্ষত্র কোনটি?","সূর্য","সিরিয়াস","প্রক্সিমা সেন্টোরি","ভেগা","The Sun is Earth's own nearest star.","পৃথিবীর নিকটতম নক্ষত্র সূর্য; প্রক্সিমা সেন্টোরি পরের নিকটতম।"],
  ["Easy","পানির রাসায়নিক সংকেত কী?","H₂O","CO₂","O₂","NaCl","A water molecule has two hydrogen atoms and one oxygen atom.","পানি দুইটি হাইড্রোজেন ও একটি অক্সিজেন পরমাণু নিয়ে গঠিত।"],
  ["Easy","সাধারণ খাবার লবণের রাসায়নিক সংকেত কী?","NaCl","KClO₃","HCl","H₂SO₄","Table salt is sodium chloride, NaCl.","খাবার লবণ সোডিয়াম ক্লোরাইড—NaCl।"],
  ["Easy","তড়িৎ প্রবাহের SI একক কী?","অ্যাম্পিয়ার","ভোল্ট","ওহম","ওয়াট","Electric current is measured in amperes.","তড়িৎ প্রবাহের SI একক অ্যাম্পিয়ার।"],
  ["Easy","বলের SI একক কী?","নিউটন","জুল","ওয়াট","পাসকেল","Force is measured in newtons.","বলের SI একক নিউটন।"],
  ["Easy","শক্তির SI একক কী?","জুল","ওয়াট","হার্টজ","ওহম","Energy is measured in joules.","শক্তির SI একক জুল।"],
  ["Easy","ক্ষমতার SI একক কী?","ওয়াট","জুল","অ্যাম্পিয়ার","কেলভিন","Power is the rate of energy transfer and is measured in watts.","ক্ষমতা/Power-এর SI একক ওয়াট।"],
  ["Easy","কম্পাঙ্কের SI একক কী?","হার্টজ","টেসলা","নিউটন","পাসকেল","Frequency is measured in hertz.","কম্পাঙ্কের SI একক হার্টজ।"],
  ["Medium","ওহমের সূত্র কোনটি?","V = IR","P = VI²","F = ma²","E = mc","Ohm's law relates voltage, current and resistance as V=IR.","ওহমের সূত্র: বিভব পার্থক্য = প্রবাহ × রোধ।"],
  ["Medium","শূন্যস্থানে আলোর বেগ আনুমানিক কত?","৩ × ১০⁸ মিটার/সেকেন্ড","৩ × ১০⁶ মিটার/সেকেন্ড","৩ × ১০⁴ মিটার/সেকেন্ড","৩ × ১০¹⁰ মিটার/সেকেন্ড","The speed of light in vacuum is about 299,792,458 m/s.","শূন্যস্থানে আলোর বেগ প্রায় ৩ × ১০⁸ মিটার/সেকেন্ড।"],
  ["Easy","সাধারণত মানবদেহে অক্সিজেন পরিবহনে কোন রক্তকণিকা প্রধান ভূমিকা রাখে?","লোহিত রক্তকণিকা","শ্বেত রক্তকণিকা","অণুচক্রিকা","প্লাজমা শুধু","Red blood cells carry oxygen using haemoglobin.","হিমোগ্লোবিনযুক্ত লোহিত রক্তকণিকা অক্সিজেন বহন করে।"],
  ["Medium","মানবদেহের বংশগত তথ্য মূলত কোন অণুতে থাকে?","DNA","ATP","গ্লুকোজ","ইনসুলিন","DNA stores the genetic sequence in human cells.","DNA-তে মানুষের বংশগত তথ্য সঞ্চিত থাকে।"],
  ["Medium","উদ্ভিদের সালোকসংশ্লেষণে কোন রঞ্জক গুরুত্বপূর্ণ?","ক্লোরোফিল","হিমোগ্লোবিন","কেরাটিন","মেলানিন","Chlorophyll captures light energy for photosynthesis.","সালোকসংশ্লেষণে ক্লোরোফিল আলো শোষণ করে।"],
  ["Medium","বায়ুমণ্ডলে আয়তন হিসেবে সর্বাধিক গ্যাস কোনটি?","নাইট্রোজেন","অক্সিজেন","কার্বন ডাই-অক্সাইড","আর্গন","Dry air consists of roughly 78% nitrogen by volume.","বায়ুর প্রায় ৭৮ শতাংশ নাইট্রোজেন।"],
  ["Medium","পৃথিবীর ঘূর্ণনের প্রধান দৈনিক ফল কোনটি?","দিন ও রাত","ঋতু পরিবর্তন","ভূমিকম্প","জোয়ার সব সময় একই হওয়া","Day and night follow from Earth's rotation about its axis.","নিজ অক্ষে পৃথিবীর ঘূর্ণনে দিন-রাত হয়।"],
  ["Medium","পৃথিবীর সূর্যকে একবার প্রদক্ষিণে আনুমানিক কত সময় লাগে?","৩৬৫.২৫ দিন","২৪ ঘণ্টা","৩০ দিন","১৮০ দিন","A tropical year is approximately 365.24 days.","পৃথিবীর বার্ষিক পরিক্রমণ প্রায় ৩৬৫.২৫ দিন।"],
  ["Easy","কম্পিউটারে RAM-এর প্রকৃতি সাধারণত কী?","ভোলাটাইল মেমরি","স্থায়ী চৌম্বক ডিস্ক","অপটিক্যাল ডিস্ক","শুধু আউটপুট ডিভাইস","Ordinary RAM loses its stored data when power is removed.","বিদ্যুৎ না থাকলে সাধারণ RAM-এর তথ্য হারিয়ে যায়।"],
  ["Easy","CPU-এর পূর্ণরূপ কী?","Central Processing Unit","Computer Program Utility","Central Peripheral Unit","Control Program User","CPU stands for Central Processing Unit.","CPU অর্থ Central Processing Unit।"],
  ["Easy","DNS-এর প্রধান কাজ কী?","ডোমেইন নামকে IP ঠিকানার সঙ্গে মেলানো","ফাইল কমপ্রেস করা","স্ক্রিন আঁকা","বিদ্যুৎ সরবরাহ করা","DNS resolves domain names to address records.","DNS ডোমেইন নাম থেকে প্রাসঙ্গিক IP রেকর্ড খুঁজে দেয়।"],
  ["Medium","IPv4 address কত বিটের?","৩২ বিট","১৬ বিট","৬৪ বিট","১২৮ বিট","An IPv4 address contains 32 bits.","IPv4 ঠিকানা ৩২ বিট দীর্ঘ।"],
  ["Medium","IPv6 address কত বিটের?","১২৮ বিট","৩২ বিট","৪৮ বিট","২৫৬ বিট","An IPv6 address is 128 bits long.","IPv6 ঠিকানা ১২৮ বিট দীর্ঘ।"],
  ["Medium","HTTPS সাধারণত HTTP ট্রাফিক সুরক্ষায় কোন প্রোটোকল ব্যবহার করে?","TLS","FTP","SMTP","ARP","HTTPS uses TLS for transport encryption and authentication.","HTTPS সংযোগের নিরাপত্তায় TLS ব্যবহার করে।"],
  ["Easy","HTML মূলত কী কাজে ব্যবহৃত হয়?","ওয়েব পেজের কাঠামো নির্ধারণ","শুধু ডেটাবেজ ব্যাকআপ","শুধু ছবি সম্পাদনা","বিদ্যুৎ মাপা","HTML defines structured web content.","ওয়েব কনটেন্টের কাঠামো তৈরি করে HTML।"],
  ["Easy","CSS প্রধানত কোন কাজ করে?","ওয়েব পেজের উপস্থাপন ও স্টাইল","ডোমেইন রেজল্যুশন","হার্ডডিস্ক পার্টিশন","SQL transaction","CSS controls presentation such as layout, spacing and typography.","CSS ওয়েব পেজের রং, ফন্ট, layout ও style নিয়ন্ত্রণ করে।"],
  ["Medium","বাইনারি সংখ্যা পদ্ধতির ভিত্তি কত?","২","৮","১০","১৬","Binary uses two digit symbols and base 2.","বাইনারি সংখ্যা পদ্ধতির ভিত্তি ২।"],
  ["Medium","হেক্সাডেসিমাল সংখ্যা পদ্ধতির ভিত্তি কত?","১৬","২","৮","১২","Hexadecimal is a base-16 system.","হেক্সাডেসিমাল সংখ্যা পদ্ধতির ভিত্তি ১৬।"]
]);
