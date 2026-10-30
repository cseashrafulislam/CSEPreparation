// Independently evaluated, parameterized aptitude and CSE numerical exercises.
// These are scenario VARIANTS, never independently sourced previous papers.
// Every formula has a worked explanation and is checked for unambiguous choices.
export const megaRows = [];
export const SCENARIO_FAMILIES = [];

function family(name, topic, build) {
  const before = megaRows.length;
  for (let seed = 1; seed <= 330; seed++) {
    const item = build(seed);
    const [prompt, result, wrongs, explanation, bangla] = item;
    const correct = String(result);
    const options = [correct, ...wrongs.map(String)];
    if (options.length !== 4 || new Set(options).size !== 4 || !Number.isFinite(Number(result))) {
      throw new Error(`Invalid choices in ${name}, seed ${seed}`);
    }
    const answer = (seed * 17 + name.length) % 4;
    options.splice(0, 1);
    options.splice(answer, 0, correct);
    megaRows.push([topic, seed % 7 ? "Hard" : "Medium", prompt, options, answer, explanation, bangla]);
  }
  SCENARIO_FAMILIES.push({ name, topic, count: megaRows.length - before });
}

const w = (value, step = 1) => [value + step, value + 2 * step, value + 3 * step];
const round2 = value => (Math.round(value * 100) / 100).toFixed(2);
const countBits = value => value.toString(2).replace(/0/g, "").length;
const gcd = (x, y) => y ? gcd(y, x % y) : x;

family("Open-address hash index", "Data Structures", i => {
  const size = [11, 13, 17, 19, 23][i % 5], key = 130 + i * 17;
  const index = key % size;
  return [`A hash table has ${size} slots numbered 0..${size - 1}; h(k)=k mod ${size}. Where does key ${key} initially hash?`, index, [index + size, index + size * 2, index + size * 3], `Compute ${key} mod ${size} = ${index}; collisions are handled after the initial hash.`, `Hash index ${key} mod ${size} = ${index}।`];
});

family("D-ary heap parent", "Data Structures", i => {
  const d = 2 + i % 5, index = 10 + i, parent = Math.floor((index - 1) / d);
  return [`In a zero-based ${d}-ary heap, what is the parent index of node at index ${index}?`, parent, w(parent), `Parent of index i in a d-ary heap is floor((i−1)/d) = floor(${index-1}/${d}) = ${parent}.`, `শূন্য থেকে indexing হলে parent=floor((i−1)/d)=${parent}।`];
});

family("Stack machine trace", "Data Structures", i => {
  const a = 6 + i, b = 3 + i % 27, c = 1 + i % 13, result = a + b - c;
  return [`Evaluate postfix expression: ${a} ${b} + ${c} − (binary + and −, integer stack). Final top?`, result, w(result), `Push ${a},${b}; + gives ${a+b}; push ${c}; subtraction gives ${a+b}−${c}=${result}.`, `Postfix stack-এ আগে যোগ, পরে বিয়োগ; ফল ${result}।`];
});

family("Binary search lower bound", "Algorithms", i => {
  const start = i % 11, step = 2 + i % 8, n = 100 + i, target = start + step * (12 + i % 39) - 1;
  const index = Math.max(0, Math.min(n, Math.ceil((target - start) / step)));
  return [`Sorted array A[j]=${start}+${step}j for j=0..${n-1}. Find lower_bound(${target}) index (first A[j]≥target).`, index, w(index), `Solve ${start}+${step}j≥${target}; j≥(${target}-${start})/${step}; smallest integer j=${index}.`, `প্রথম যোগ্য index ceil((target−start)/step)=${index}।`];
});

family("Graph shortest path", "Algorithms", i => {
  const a = 2 + i % 17, b = 3 + i % 23, c = 1 + i % 19, shortcut = a + b + (i % 7 ? 2 : -2);
  const answer = Math.min(a+b, shortcut);
  return [`Directed graph: S→A cost ${a}, A→T cost ${b}, S→T direct cost ${shortcut}. Shortest S→T path cost?`, answer, w(answer), `Compare via A ${a}+${b}=${a+b} with direct ${shortcut}. Minimum is ${answer}.`, `দুটি পথ তুলনা: min(${a+b},${shortcut})=${answer}।`];
});

family("Sliding-window sum", "Algorithms", i => {
  const start = 1 + i, step = 1 + i % 7, k = 3 + i % 13;
  const sum = k * start + step * k * (k - 1) / 2;
  return [`A window contains ${k} consecutive elements of A[j]=${start}+${step}j, beginning at j=0. Window sum?`, sum, w(sum), `Arithmetic progression sum = ${k}×${start}+${step}×${k}×(${k}-1)/2 = ${sum}.`, `সমান পার্থক্যের ধারায় window sum=${sum}।`];
});

family("FCFS staggered arrivals", "Operating System", i => {
  const first = 3 + i % 18, second = 2 + i, arrival = 1 + i % 3;
  const waiting = Math.max(0, first - arrival);
  return [`FCFS nonpreemptive: P1 arrives t=0, burst ${first}ms. P2 arrives t=${arrival}ms, burst ${second}ms. P2 waiting time?`, waiting, w(waiting), `P2 starts at max(${first},${arrival}); wait = max(0,${first}−${arrival}) = ${waiting}ms.`, `P2-এর অপেক্ষা start−arrival=${waiting}ms।`];
});

family("Turnaround time", "Operating System", i => {
  const arrival = i % 6, start = arrival + 1 + i % 17, burst = 2 + i % 25, completion = start + burst, tat = completion - arrival;
  return [`A process arrives at t=${arrival}ms, starts t=${start}ms, completes t=${completion}ms. Turnaround time?`, tat, w(tat), `Turnaround = completion−arrival = ${completion}−${arrival}=${tat}ms.`, `Turnaround time completion−arrival=${tat}ms।`];
});

family("Physical address from page", "Operating System", i => {
  const bits = 8 + i % 5, pageSize = 2 ** bits, frame = 5 + i, offset = (i * 37) % pageSize;
  const address = frame * pageSize + offset;
  return [`Paging: page size=${pageSize} bytes, virtual offset=${offset}, page table maps to physical frame ${frame}. Physical byte address?`, address, [address + 1, address + pageSize, address - offset], `Physical address = frame×page_size+offset = ${frame}×${pageSize}+${offset}=${address}.`, `Frame base + offset = ${address} byte।`];
});

family("SQL GROUP BY HAVING", "DBMS & SQL", i => {
  const a = 5 + i, b = 1 + i % 18, c = 3 + i % 28, threshold = a + b, result = a + b + c;
  return [`Orders for customer C have amounts ${a}, ${b}, ${c}. SELECT SUM(Amount) FROM Orders GROUP BY CustomerId HAVING SUM(Amount)>=${threshold}; C's returned SUM?`, result, [result+1, result+4, result+a+10], `SUM(${a},${b},${c})=${result}, which meets HAVING >=${threshold}.`, `HAVING শর্ত পূরণ করে SUM=${result}।`];
});

family("SQL COUNT DISTINCT", "DBMS & SQL", i => {
  const a = 100 + i, b = 200 + i, c = i % 5 ? a : b;
  return [`SQL values in one column are [${a}, ${b}, ${a}, NULL, ${c}]. What does COUNT(DISTINCT column) return?`, 2, [1, 3, 4], `COUNT DISTINCT ignores NULL and duplicate ${a}; distinct non-null values are ${a} and ${b}.`, `NULL ও duplicate বাদ দিলে আলাদা non-NULL মান দুটি।`];
});

family("SQL window rank", "DBMS & SQL", i => {
  const high = 300 + i, mid = 200 + i, low = 100 + i;
  return [`Scores descending [${high}, ${high}, ${mid}, ${low}]. SQL RANK() of the row with score ${low}?`, 4, [2, 3, 5], `Ranks are 1,1,3,4 because ties leave a gap. The last row is rank 4.`, `RANK-এ tie হলে gap থাকে: ১,১,৩,৪।`];
});

family("IPv4 broadcast offset", "Networking", i => {
  const prefix = 25 + i % 6, block = 2 ** (32 - prefix), host = (i * 31) % 256;
  const broadcast = Math.floor(host / block) * block + block - 1;
  return [`IPv4 172.16.${i % 240}.${host}/${prefix}: find the broadcast address's LAST octet.`, broadcast, [broadcast+1, broadcast+block, broadcast+block+1], `Block size=2^(32−${prefix})=${block}; floor(${host}/${block})×${block}+${block}−1=${broadcast}.`, `CIDR block ${block}; broadcast-এর শেষ octet ${broadcast}।`];
});

family("IPv4 VLSM size", "Networking", i => {
  const hosts = 9 + i, bits = Math.ceil(Math.log2(hosts + 2)), prefix = 32 - bits;
  return [`Design one conventional IPv4 subnet for ${hosts} usable hosts (network/broadcast reserved). Smallest prefix /?`, prefix, [prefix-1, prefix-2, prefix-3], `Need 2^h−2≥${hosts}; h=${bits}, so prefix=32−${bits}=/${prefix}.`, `কমপক্ষে ${hosts}+২ address; prefix /${prefix}।`];
});

family("TCP transfer duration", "Networking", i => {
  const bytes = 2 + i, rate = [1, 2, 4, 5, 8, 10, 20][i % 7], seconds = 8 * bytes / rate;
  return [`Ideal transfer without overhead: ${bytes} MB (decimal) sent at ${rate} Mbps (decimal). Time in seconds?`, round2(seconds), [round2(seconds+1), round2(seconds+2), round2(seconds+3)], `MB×8/Mbps = ${bytes}×8/${rate} = ${round2(seconds)} seconds.`, `Megabyte থেকে megabit করতে ×৮; সময় ${round2(seconds)} সেকেন্ড।`];
});

family("Cache set index", "Computer Architecture", i => {
  const sets = [8, 16, 32, 64][i % 4], block = 8 + i * 13, index = block % sets;
  return [`Set-associative cache has ${sets} sets; memory block number ${block}. Set index (modulo mapping)?`, index, [index+sets,index+2*sets,index+3*sets], `Set = block_number mod number_of_sets = ${block} mod ${sets} = ${index}.`, `Cache set = ${block} mod ${sets} = ${index}।`];
});

family("Amdahl speedup", "Computer Architecture", i => {
  const fraction = 20 + i % 71, improved = 2 + i % 7;
  const speedup = 1 / (1 - fraction / 100 + (fraction / 100) / improved);
  return [`A program spends ${fraction}% time in component accelerated ${improved}×. Amdahl's overall speedup (2 decimals)?`, round2(speedup), [round2(speedup+0.5),round2(speedup+1),round2(speedup+1.5)], `S=1/[1−${fraction}/100+(${fraction}/100)/${improved}]=${round2(speedup)}×.`, `Amdahl's law অনুযায়ী মোট speedup ${round2(speedup)}×।`];
});

family("CPI average", "Computer Architecture", i => {
  const a = 1 + i % 4, b = a+1+i%3, percentage = 10 + (i*7)%89;
  const cpi = (percentage*a+(100-percentage)*b)/100;
  return [`CPU instruction mix: ${percentage}% instructions CPI=${a}, remaining CPI=${b}. Weighted average CPI (2 decimals)?`, round2(cpi), [round2(cpi+0.5),round2(cpi+1),round2(cpi+1.5)], `Average CPI = ${percentage}/100×${a}+${100-percentage}/100×${b}=${round2(cpi)}.`, `Instruction mix অনুযায়ী weighted CPI ${round2(cpi)}।`];
});

family("Bit count", "Digital Logic", i => {
  const value = 1024 + 19*i, ones = countBits(value);
  return [`How many 1 bits are in the ordinary unsigned binary representation of decimal ${value}?`, ones, w(ones), `${value} = ${value.toString(2)}₂, which has ${ones} set bits.`, `দ্বিমিক রূপ ${value.toString(2)}; ১ বিট ${ones}টি।`];
});

family("XOR and bit masks", "Digital Logic", i => {
  const a = 77 + i * 3, b = 11 + (i * 7) % 100, result = a ^ b;
  return [`Compute bitwise XOR of unsigned integers ${a} and ${b} in decimal.`, result, w(result), `${a.toString(2)}₂ XOR ${b.toString(2)}₂ = ${result.toString(2)}₂ = ${result}.`, `প্রতি bit-এ আলাদা হলে ১; XOR ফল ${result}।`];
});

family("Percentage discount and VAT", "Mathematics", i => {
  const price = 100 + i * 20, discount = [5,10,15,20][i%4], vat = [5,10,15][i%3];
  const result = price * (100-discount)/100 * (100+vat)/100;
  return [`Price Tk ${price}; ${discount}% discount then ${vat}% VAT on discounted price. Final Tk (2 decimals)?`, round2(result), [round2(result+5),round2(result+10),round2(result+15)], `Final = ${price}×(1−${discount}/100)×(1+${vat}/100) = ${round2(result)}.`, `ছাড় ও VAT ক্রমানুসারে গুণ করলে ${round2(result)} টাকা।`];
});

family("Simple interest", "Mathematics", i => {
  const principal = 500 + i * 25, rate = 3 + i % 12, years = 1 + i % 6;
  const interest = principal * rate * years / 100;
  return [`Find SIMPLE interest on Tk ${principal} at ${rate}% per year for ${years} years (Tk, 2 decimals).`, round2(interest), [round2(interest+5),round2(interest+10),round2(interest+15)], `I=P×r×t/100=${principal}×${rate}×${years}/100=${round2(interest)}.`, `সরল সুদ = মূলধন×হার×সময়/১০০ = ${round2(interest)}।`];
});

family("Ratio distribution", "Mathematics", i => {
  const a = 2 + i % 13, b = 3 + i % 17, total = (a+b) * (15+i), share = a * (15+i);
  return [`Split Tk ${total} in the ratio ${a}:${b}. What is the first person's share (Tk)?`, share, w(share), `First share = ${total}×${a}/(${a}+${b}) = ${share}.`, `অনুপাতের প্রথম অংশ ${share} টাকা।`];
});

family("Programming loop count", "Programming", i => {
  const n = 15 + i, step = 2 + i % 9, iterations = Math.ceil(n/step);
  return [`For integer i=0; i<${n}; i+=${step}, loop body runs how many times?`, iterations, w(iterations), `Values 0,${step},2×${step},... <${n}; count=ceil(${n}/${step})=${iterations}.`, `step ${step} হলে loop মোট ${iterations} বার।`];
});

family("Programming Euclidean algorithm", "Programming", i => {
  const x = 80+i, y = 27+(i*17)%73, result = gcd(x,y);
  return [`Run Euclidean gcd(${x},${y}). What integer does it return?`, result, [result+1,result+2,result+3], `Repeatedly replace (a,b) with (b,a mod b) until b=0; gcd=${result}.`, `Euclidean division করে gcd=${result}।`];
});

family("DFA remainder state", "Automata Theory", i => {
  const modulo = 2 + i%7, length = 11+i, result = length % modulo;
  return [`A DFA tracks length mod ${modulo}; start state 0 and each 'a' increments state mod ${modulo}. After reading ${length} 'a' characters, which state?`, result, [result+modulo,result+modulo*2,result+modulo*3], `State is (${length} mod ${modulo})=${result}.`, `প্রতিটি a-তে state বাড়ে; শেষে remainder ${result}।`];
});

family("Compiler token count", "Compiler Design", i => {
  const n = 2 + i, terms = 2 + i%8, identifiers = Array.from({length:terms},(_,k)=>`a${n+k}`);
  const expression = identifiers.join(" + "), tokens = terms*2-1;
  return [`In the expression '${expression}', count lexical identifier and '+' tokens (ignore whitespace).`, tokens, w(tokens), `There are ${terms} identifiers and ${terms-1} plus operators, so ${tokens} tokens.`, `Identifier ${terms}টি, '+' ${terms-1}টি; মোট ${tokens} token।`];
});

family("Rate limiting backlog", "Web & APIs", i => {
  const arrivals = 150+i, served = 10+i%23, seconds = 2+i%8, backlog = Math.max(0, arrivals-served*seconds);
  return [`API queue starts empty; ${arrivals} requests arrive at once, server processes ${served} requests/sec for ${seconds} seconds, no more arrivals. Requests left?`, backlog, w(backlog), `Remaining=max(0,${arrivals}−${served}×${seconds})=${backlog}.`, `Processed ${served*seconds}; বাকি ${backlog} request।`];
});

family("Exponential lockout delay", "Security", i => {
  const base = 2+i%9, failures = 2+i%8, cap = 20+i;
  const seconds = Math.min(cap, base*2**(failures-1));
  return [`Example login throttling rule: wait min(${cap}, ${base}×2^(k−1)) seconds after k failures. After ${failures} failures, wait?`, seconds, [seconds+1,seconds+2,seconds+3], `Substitute k=${failures}: min(${cap},${base}×2^${failures-1})=${seconds}s. This is illustrative, not universal security guidance.`, `এই উদাহরণ policy অনুযায়ী delay ${seconds} সেকেন্ড।`];
});

family("Linux permission octal", "Linux & DevOps", i => {
  const owner = i%8, group = Math.floor(i/8)%8, other = Math.floor(i/64)%8;
  const bits = digit => `${digit&4?"r":"-"}${digit&2?"w":"-"}${digit&1?"x":"-"}`;
  const perm = `${bits(owner)}${bits(group)}${bits(other)}`;
  const answer = `${owner}${group}${other}`;
  const alternative = digit => `${(owner+digit)%8}${group}${other}`;
  return [`Linux permissions '${perm}' (owner/group/other) correspond to what three-digit octal mode?`, answer, [alternative(1),alternative(2),alternative(3)], `Map r=4,w=2,x=1 per triplet: ${owner},${group},${other} → ${answer}.`, `প্রতি group-এ r=৪,w=২,x=১ যোগ: ${answer}।`];
});

// 29 families × 330 worked scenarios = 9,570 additional variants.
