// Deterministically generated numerical practice variants. Exact answers, stable question order/IDs.
// These drill computations, and do not imply 200 distinct theoretical concepts.
export const drillRows = [];
let counter = 0;
function add(topic, difficulty, prompt, correct, alternatives, explain, bn) {
  const answerText = String(correct);
  const values = [...new Set([answerText, ...alternatives.map(String)])];
  if (values.length < 4) throw new Error(`Ambiguous numerical drill: ${prompt}`);
  const options = values.slice(1, 4);
  const answer = (counter * 3 + 1) % 4;
  options.splice(answer, 0, answerText);
  drillRows.push([topic, difficulty, prompt, options, answer, explain, bn]);
  counter++;
}

for (let n = 18; n <= 62; n += 4) {
  const result = n.toString(2);
  add("Computer Architecture", "Easy", `Convert decimal ${n} to unsigned binary.`, result,
    [(n+1).toString(2), (n-1).toString(2), (n+2).toString(2)],
    `${n} in base ten has binary digits ${result}.`, `দশমিক ${n} কে বারবার ২ দিয়ে ভাগ করলে ${result} হয়।`);
}
for (let n = 19; n <= 59; n += 4) {
  const binary = n.toString(2);
  add("Computer Architecture", "Easy", `What is the decimal value of binary ${binary}?`, n,
    [n-1,n+2,n+4],
    `Sum the powers of 2 where ${binary} has 1-bits: ${n}.`, `বিটের স্থানমান ২-এর ঘাত ধরে যোগ করলে ${n}।`);
}
for (let n = 12; n <= 31; n += 2) {
  const hex = n.toString(16).toUpperCase();
  add("Computer Architecture", "Medium", `Convert hexadecimal 0x${hex} to decimal.`, n,
    [n+1,n+4,n-1],
    `Hexadecimal 0x${hex} equals ${n} in decimal.`, `Hex-এর স্থানমান ১৬ ধরে দশমিক ${n} হয়।`);
}
for (let n = 3; n <= 12; n++) {
  const result = (256-n).toString(2).padStart(8,"0");
  const wrong = [(n).toString(2).padStart(8,"0"), (255-n).toString(2).padStart(8,"0"), (257-n).toString(2).padStart(8,"0")];
  add("Computer Architecture", "Medium", `What is the 8-bit two's complement representation of -${n}?`, result, wrong,
    `An 8-bit signed -${n} is 256−${n}=${256-n}, or ${result}.`, `৮-bit two's complement-এ -${n} = ২৫৬−${n} = ${result}।`);
}
for (let i = 3; i <= 13; i++) {
  const j = i + 5;
  const result = i & j;
  add("Digital Logic", "Medium", `What is ${i} AND ${j} (bitwise, decimal result)?`, result,
    [result+1, result+2, result+3],
    `${i.toString(2)} AND ${j.toString(2)} = ${result.toString(2)} = ${result}.`, `দুই সংখ্যার সংশ্লিষ্ট bit-এ দুটো ১ হলেই AND-এর bit ১।`);
}
for (let n = 2; n <= 12; n++) {
  const a = (n*7+1)%13;
  const b = (n*11+3)%13;
  const result = a ^ b;
  add("Digital Logic", "Medium", `Compute ${a} XOR ${b} as a decimal integer.`, result,
    [result+1,result+2,result+4],
    `${a.toString(2)} XOR ${b.toString(2)} = ${result.toString(2)} = ${result}.`, `XOR-এ বিপরীত bit হলে ১; ফল ${result}।`);
}
for (let bits = 2; bits <= 10; bits++) {
  const result = 2 ** bits;
  add("Digital Logic", "Medium", `How many rows are in the truth table for ${bits} Boolean inputs?`, result,
    [result+1,result/2,result*2],
    `Every input has two states, so 2^${bits}=${result} combinations.`, `${bits}টি input-এর 2^${bits}=${result} combination।`);
}
for (let inputs = 8; inputs <= 64; inputs *= 2) {
  const result = Math.log2(inputs);
  add("Digital Logic", "Medium", `What is the minimum number of select lines for a ${inputs}-to-1 multiplexer?`, result,
    [result+1,result-1,result+2],
    `2^${result}=${inputs}, so ${result} select bits are needed.`, `2^${result}=${inputs}; তাই select line ${result}টি।`);
}
for (let height = 2; height <= 10; height++) {
  const count = 2 ** (height+1)-1;
  add("Data Structures", "Medium", `How many nodes are in a perfect binary tree of height ${height} edges?`, count,
    [count-1,count+1,2**height],
    `A perfect tree with height ${height} edges has 2^(${height}+1)−1=${count} nodes.`, `Height edge হিসেবে ধরলে মোট node = 2^(h+1)−1 = ${count}।`);
}
for (let n = 3; n <= 20; n++) {
  const parent = Math.floor((n-1)/2);
  add("Data Structures", "Easy", `In a zero-based binary heap array, what is the parent index of node at index ${n}?`, parent,
    [parent+1,n*2+1,n+1],
    `Parent index=floor((${n}−1)/2)=${parent}.`, `0-based heap-এ parent=floor((i−1)/2)=${parent}।`);
}
for (let n = 7; n <= 16; n++) {
  const count = 2**n-1;
  add("Algorithms", "Medium", `A perfect binary-search decision tree has ${count} candidate keys. What is its height in edges?`, n-1,
    [n,n+1,n-2],
    `2^${n}−1=${count} keys fill ${n} levels, which is ${n-1} edges high.`, `${n}টি level থাকলে edge-height ${n-1}।`);
}
for (let capacity = 11; capacity <= 31; capacity += 2) {
  const key = capacity*3+7;
  const result = key % capacity;
  add("Data Structures", "Easy", `A hash table has ${capacity} buckets and uses h(k)=k mod ${capacity}. Find h(${key}).`, result,
    [result+1,capacity-1,key],
    `The remainder after dividing ${key} by ${capacity} is ${result}.`, `ভাগশেষ h(${key}) = ${result}।`);
}
for (let a = 3; a <= 12; a++) {
  const b = a+4;
  const c = a+2;
  const result = a+b;
  add("Operating System", "Medium", `Three jobs arrive together at time 0 in FCFS order P1, P2, P3. Burst times are ${a}, ${b}, ${c} ms. Waiting time of P3?`, result,
    [a+b+c,a+c,b+c],
    `P3 waits for P1 and P2: ${a}+${b}=${result} ms.`, `P3-কে P1 ও P2 শেষ হওয়া পর্যন্ত ${result} ms অপেক্ষা করতে হয়।`);
}
for (let a = 3; a <= 12; a++) {
  const b = a+4;
  const c = a+2;
  const result = a+b+c;
  add("Operating System", "Medium", `FCFS: P1, P2, P3 all arrive at t=0. Bursts ${a}, ${b}, ${c} ms. Turnaround time of P3?`, result,
    [a+b,b+c,result+2],
    `Completion time ${result}, arrival time 0; turnaround=${result} ms.`, `Turnaround = completion−arrival = ${result}−0 = ${result} ms।`);
}
for (let prefix = 24; prefix <= 30; prefix++) {
  const hostBits = 32-prefix;
  const count = 2**hostBits-2;
  add("Networking", "Medium", `How many conventional usable IPv4 host addresses does a /${prefix} subnet provide?`, count,
    [count+2,count+1,2**(hostBits-1)-2],
    `32−${prefix}=${hostBits} host bits; 2^${hostBits}−2=${count}.`, `/`+`${prefix} এ ${hostBits} host bit; network/broadcast বাদে ${count}।`);
}
for (let bits = 1; bits <= 9; bits++) {
  const addresses = 2**bits;
  const prefix = 32-bits;
  add("Networking", "Medium", `What CIDR prefix gives ${addresses} total IPv4 addresses per subnet?`, `/${prefix}`,
    [`/${prefix-1}`,`/${prefix+1}`,`/${prefix-2}`],
    `${addresses}=2^${bits} leaves ${bits} host bits, so prefix /${prefix}.`, `${addresses}টি address মানে ${bits} host bit; CIDR /${prefix}।`);
}
for (let mb = 5; mb <= 40; mb += 5) {
  const result = mb*8/10;
  add("Networking", "Medium", `Ignoring overhead, how long does it take to transfer ${mb} MB over a 10 Mbps link? (1 MB=8 Mb)`, `${result} s`,
    [`${result+1} s`,`${result*2} s`,`${mb/10} s`],
    `${mb}×8/10=${result} seconds.`, `সময় = (${mb}×৮ Mb)÷১০ Mbps = ${result} সেকেন্ড।`);
}
for (let kbPower = 0; kbPower <= 9; kbPower++) {
  const kb = 2**kbPower;
  const bits = kbPower+10;
  add("Operating System", "Medium", `A virtual-memory system uses ${kb} KiB pages. How many page-offset bits are needed?`, bits,
    [bits+1,bits-1,kbPower],
    `${kb} KiB = 2^${bits} bytes, so ${bits} offset bits.`, `${kb} KiB = 2^${bits} byte; offset bit ${bits}।`);
}
for (let addressBits = 16; addressBits <= 24; addressBits++) {
  const pageBits = 12;
  const entries = 2**(addressBits-pageBits);
  add("Operating System", "Hard", `With ${addressBits}-bit virtual addresses and 4 KiB pages, how many virtual pages exist?`, entries,
    [entries*2,entries/2,entries+1],
    `Page offset=12 bits, page number=${addressBits}−12; count=2^(${addressBits}−12)=${entries}.`, `৪ KiB page = ১২ offset bit, তাই page count ${entries}।`);
}
for (let hit = 70; hit <= 95; hit += 5) {
  const amat = 1+(100-hit)/100*40;
  add("Computer Architecture", "Hard", `Cache hit time is 1 ns, miss penalty 40 ns and hit rate ${hit}%. Find AMAT.`, `${amat} ns`,
    [`${amat+1} ns`,`${amat+4} ns`,`${40-amat} ns`],
    `AMAT=1+(1−${hit}/100)×40=${amat} ns.`, `AMAT = hit time + miss rate×penalty = ${amat} ns।`);
}
for (let base = 120; base <= 300; base += 20) {
  const percent = 15;
  const result = base*percent/100;
  add("Mathematics", "Easy", `What is ${percent}% of ${base}?`, result,
    [result+5,result+10,result+20],
    `Multiply the base by 0.15 to get ${base}×0.15=${result}.`, `${base}-এর ১৫% = ${result}।`);
}
for (let n = 3; n <= 12; n++) {
  const first = n*3;
  const last = first+8;
  const result = first+4;
  add("Mathematics", "Easy", `Find the mean of five consecutive even-spaced values ${first}, ${first+2}, ${first+4}, ${first+6}, ${last}.`, result,
    [result+2,result-2,result+4],
    `The average of an arithmetic progression is the middle value: ${result}.`, `সমান্তর ধারার মাঝের সংখ্যা ${result}-ই গড়।`);
}
for (let principal = 2000; principal <= 12000; principal += 1000) {
  const result = principal*8*2/100;
  add("Mathematics", "Medium", `Find simple interest on Tk ${principal} for 2 years at 8% annually.`, `Tk ${result}`,
    [`Tk ${result+100}`,`Tk ${principal+result}`,`Tk ${principal*8/100}`],
    `I=PRT/100=${principal}×8×2/100=${result}.`, `সরল সুদ = PRT/100 = ${result} টাকা।`);
}
for (let n = 2; n <= 10; n++) {
  const result = n*(n+1)/2;
  add("Mathematics", "Medium", `What is the sum 1+2+...+${n}?`, result,
    [result+3,result-1,result+2],
    `n(n+1)/2=${n}×${n+1}/2=${result}.`, `প্রথম ${n}টি স্বাভাবিক সংখ্যার যোগফল ${result}।`);
}
